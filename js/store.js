/**
 * Animanga Esports Tournaments - Browser Storage & Data Engine
 * Powered by localStorage + IndexedDB + BroadcastChannel (Multi-tab real-time sync)
 */

class EsportsStore {
  constructor() {
    this.STORAGE_KEY_USERS = 'animanga_users_v3';
    this.STORAGE_KEY_TOURNAMENTS = 'animanga_tournaments_v3';
    this.STORAGE_KEY_CHATS = 'animanga_chats_v3';
    this.STORAGE_KEY_SESSION = 'animanga_session_v4';
    this.STORAGE_KEY_SETTINGS = 'animanga_settings_v3';

    // Clear legacy auto-login sessions
    try {
      localStorage.removeItem('animanga_session_v2');
      localStorage.removeItem('animanga_session_v3');
    } catch (e) {}

    this.channel = null;
    this.initBroadcastChannel();
    this.initDatabase();
    this.initSupabaseCloudListeners();
  }

  initBroadcastChannel() {
    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('animanga_esports_sync');
        this.channel.onmessage = (event) => {
          if (event && event.data) {
            window.dispatchEvent(new CustomEvent('app:remote-sync', { detail: event.data }));
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }

  broadcast(type, payload = {}) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (e) {}
    }
    // Also dispatch locally for active tab listeners
    window.dispatchEvent(new CustomEvent('app:local-sync', { detail: { type, payload } }));
  }

  initSupabaseCloudListeners() {
    window.addEventListener('supabase:chat-sync', (e) => {
      const payload = e.detail;
      if (!payload || !payload.new) return;
      const newRow = payload.new;
      const channelId = newRow.tournament_id || 'general';
      const chats = this.getChats();
      if (!chats[channelId]) chats[channelId] = [];

      const rawMsg = typeof newRow.message === 'string' ? newRow.message : '';
      const isAnn = Boolean(newRow.is_announcement) || rawMsg.startsWith('[ANNOUNCEMENT]');
      const cleanMsg = rawMsg.replace(/^\[ANNOUNCEMENT\]\s*/, '');

      // Avoid duplicates
      const exists = chats[channelId].some(m => 
        (m.id && newRow.id && m.id === newRow.id) ||
        (m.sender === newRow.username && m.text === cleanMsg)
      );
      if (!exists) {
        chats[channelId].push({
          id: newRow.id || ('msg_cloud_' + Date.now()),
          sender: newRow.username,
          text: cleanMsg,
          timestamp: new Date(newRow.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          isAnnouncement: isAnn
        });
        localStorage.setItem(this.STORAGE_KEY_CHATS, JSON.stringify(chats));
        this.broadcast('CHATS_UPDATED');
      }
    });

    window.addEventListener('supabase:tournament-sync', (e) => {
      const payload = e.detail;
      if (!payload || !payload.new) return;
      this.syncTournamentsFromCloud();
    });

    window.addEventListener('supabase:match-sync', (e) => {
      const payload = e.detail;
      if (!payload || !payload.new) return;
      this.broadcast('MATCH_SCORED', payload.new);
    });

    window.addEventListener('supabase:profile-sync', (e) => {
      this.syncProfilesFromCloud();
    });

    // Auto-sync initial data from Supabase Cloud on boot
    setTimeout(() => {
      this.syncAllCloudData();
    }, 100);
  }

  /* ==========================================================================
     Cloud Synchronization (Supabase PostgreSQL Two-Way Sync)
     ========================================================================== */
  async syncAllCloudData() {
    await this.syncProfilesFromCloud();
    await this.syncTournamentsFromCloud();
    await this.syncChatsFromCloud('general');
  }

  async syncChatsFromCloud(channelId = 'general') {
    if (!window.supabaseClientEngine || !window.supabaseClientEngine.isConnected) return;
    try {
      const client = window.supabaseClientEngine.getClient();
      if (!client) return;

      const { data, error } = await client
        .from('chats')
        .select('*')
        .eq('tournament_id', channelId)
        .order('created_at', { ascending: true })
        .limit(150);

      if (error) {
        console.warn('Could not sync cloud chats:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const chats = this.getChats();
        if (!chats[channelId]) chats[channelId] = [];

        let added = false;
        data.forEach(row => {
          const rawMsg = typeof row.message === 'string' ? row.message : '';
          const isAnn = Boolean(row.is_announcement) || rawMsg.startsWith('[ANNOUNCEMENT]');
          const cleanText = rawMsg.replace(/^\[ANNOUNCEMENT\]\s*/, '');

          const exists = chats[channelId].some(m => 
            (m.id && row.id && m.id === row.id) ||
            (m.sender === row.username && m.text === cleanText)
          );

          if (!exists) {
            chats[channelId].push({
              id: row.id,
              sender: row.username,
              text: cleanText,
              timestamp: new Date(row.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: 'Today',
              isAnnouncement: isAnn
            });
            added = true;
          }
        });

        if (added) {
          localStorage.setItem(this.STORAGE_KEY_CHATS, JSON.stringify(chats));
          this.broadcast('CHATS_UPDATED');
        }
      }
    } catch (e) {
      console.warn('Sync cloud chats error:', e);
    }
  }

  async syncTournamentsFromCloud() {
    if (!window.supabaseClientEngine || !window.supabaseClientEngine.isConnected) return;
    try {
      const client = window.supabaseClientEngine.getClient();
      if (!client) return;

      const { data, error } = await client.from('tournaments').select('*');
      if (error || !data) return;

      let localTournaments = this.getTournaments();
      let changed = false;

      if (data.length > 0) {
        data.forEach(cloudTourn => {
          const idx = localTournaments.findIndex(t => t.id === cloudTourn.id);
          const mapped = {
            id: cloudTourn.id,
            title: cloudTourn.title,
            description: cloudTourn.description || '',
            rules: Array.isArray(cloudTourn.rules) ? cloudTourn.rules : ['Must be 9:16 or 16:9 vertical format', 'Duration: 15s to 60s max'],
            banner: cloudTourn.banner_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&h=900&fit=crop&q=80',
            pfp: cloudTourn.pfp_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80',
            deadline: cloudTourn.deadline || new Date(Date.now() + 48 * 3600000).toISOString(),
            secretPrizeLink: cloudTourn.prize_link || '',
            gridMode: cloudTourn.grid_mode === 'normal' ? 'mode1_normal' : (cloudTourn.grid_mode === 'node' ? 'mode3_node' : 'mode2_compartments'),
            status: cloudTourn.status === 'completed' ? 'COMPLETED' : 'REGISTRATION_OPEN',
            participants: Array.isArray(cloudTourn.participants) ? cloudTourn.participants : [],
            matches: [],
            nodeCanvasState: { zoom: 1, panX: 0, panY: 0, connections: [] },
            createdAt: cloudTourn.created_at || new Date().toISOString()
          };

          if (idx !== -1) {
            localTournaments[idx] = { ...localTournaments[idx], ...mapped };
          } else {
            localTournaments.unshift(mapped);
          }
          changed = true;
        });

        if (changed) {
          localStorage.setItem(this.STORAGE_KEY_TOURNAMENTS, JSON.stringify(localTournaments));
          this.broadcast('TOURNAMENT_UPDATED');
        }
      } else if (localTournaments.length > 0) {
        // Seed initial local tournaments to Supabase Cloud
        for (const lt of localTournaments) {
          await client.from('tournaments').upsert([{
            id: lt.id,
            title: lt.title,
            description: lt.description,
            rules: lt.rules,
            banner_url: lt.banner,
            pfp_url: lt.pfp,
            deadline: lt.deadline,
            prize_link: lt.secretPrizeLink,
            grid_mode: lt.gridMode === 'mode1_normal' ? 'normal' : (lt.gridMode === 'mode3_node' ? 'node' : 'compartments'),
            status: lt.status === 'COMPLETED' ? 'completed' : 'registration',
            participants: lt.participants,
            created_by: 'Administrator1'
          }], { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.warn('Sync cloud tournaments error:', e);
    }
  }

  async syncProfilesFromCloud() {
    if (!window.supabaseClientEngine || !window.supabaseClientEngine.isConnected) return;
    try {
      const client = window.supabaseClientEngine.getClient();
      if (!client) return;

      const { data, error } = await client.from('profiles').select('*');
      if (error || !data) return;

      const localUsers = this.getUsers();
      let changed = false;

      data.forEach(cloudUser => {
        const idx = localUsers.findIndex(u => u.username.toLowerCase() === cloudUser.username.toLowerCase());
        const mappedRole = cloudUser.role === 'owner' ? 'Owner / President' : (cloudUser.role === 'admin' ? 'Admin' : 'Participant');

        if (idx !== -1) {
          if (localUsers[idx].role !== mappedRole) {
            localUsers[idx].role = mappedRole;
            changed = true;
          }
          if (cloudUser.display_name && localUsers[idx].name !== cloudUser.display_name) {
            localUsers[idx].name = cloudUser.display_name;
            changed = true;
          }
          if (cloudUser.pfp_url && localUsers[idx].avatar !== cloudUser.pfp_url) {
            localUsers[idx].avatar = cloudUser.pfp_url;
            changed = true;
          }
        } else {
          localUsers.push({
            id: cloudUser.id || ('usr_' + Date.now()),
            username: cloudUser.username,
            password: cloudUser.password_hash,
            name: cloudUser.display_name || cloudUser.username,
            role: mappedRole,
            avatar: cloudUser.pfp_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cloudUser.username)}`,
            bio: cloudUser.bio || 'Animanga video editor active in tournament battles.',
            editingApp: cloudUser.editing_software || 'After Effects',
            favAnime: cloudUser.favorite_anime || 'Jujutsu Kaisen',
            stats: {
              joined: Number(cloudUser.stats_tournaments_joined) || 0,
              won: Number(cloudUser.stats_matches_won) || 0,
              avgScore: Number(cloudUser.stats_avg_score) || 0.0
            },
            unlockedPrizes: Array.isArray(cloudUser.unlocked_prizes) ? cloudUser.unlocked_prizes : [],
            createdAt: cloudUser.created_at || new Date().toISOString()
          });
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(localUsers));
      }
    } catch (e) {
      console.warn('Sync cloud profiles error:', e);
    }
  }

  initDatabase(forceReset = false) {
    if (forceReset || !localStorage.getItem(this.STORAGE_KEY_USERS)) {
      this.seedDefaultUsers();
    }
    if (forceReset || !localStorage.getItem(this.STORAGE_KEY_TOURNAMENTS)) {
      this.seedDefaultTournaments();
    }
    if (forceReset || !localStorage.getItem(this.STORAGE_KEY_CHATS)) {
      this.seedDefaultChats();
    }
    if (!localStorage.getItem(this.STORAGE_KEY_SETTINGS)) {
      this.saveSettings({
        theme: 'dark',
        sound: true,
        reducedMotion: false
      });
    }
  }

  /* ==========================================================================
     Pre-Seeded Accounts (Admins Only - Zero Pre-Seeded Participants)
     ========================================================================== */
  seedDefaultUsers() {
    const defaultUsers = [
      // 1. Super Administrator (Owner / President)
      {
        id: 'user_admin_super',
        name: 'Administrator',
        username: 'Administrator1',
        password: 'Moon#Drive476',
        role: 'Owner / President', // Exclusive title & privileges
        avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop&q=80',
        bio: 'Supreme Tournament Architect & Guild President. Managing elite Animanga edit clashes.',
        favAnime: 'Jujutsu Kaisen & Cyberpunk Edgerunners',
        editingApp: 'After Effects',
        stats: {
          tournamentsJoined: 0,
          matchesWon: 0,
          championships: 0,
          avgScore: 0.0
        },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      },

      // 2. 5 Default Admins (Admin)
      {
        id: 'user_admin_1',
        name: 'Admin 1',
        username: 'admin1',
        password: 'MoonDrive',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=300&fit=crop&q=80',
        bio: 'Senior Judge & AMV Flow Inspector. Specializing in 60fps velocity curves.',
        favAnime: 'Demon Slayer',
        editingApp: 'After Effects',
        stats: { tournamentsJoined: 0, matchesWon: 0, championships: 0, avgScore: 0.0 },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_admin_2',
        name: 'Admin 2',
        username: 'admin2',
        password: 'MoonDrive',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop&q=80',
        bio: 'Esports Bracket Specialist & Audio Sync Referee.',
        favAnime: 'Attack on Titan',
        editingApp: 'Premiere Pro',
        stats: { tournamentsJoined: 0, matchesWon: 0, championships: 0, avgScore: 0.0 },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_admin_3',
        name: 'Admin 3',
        username: 'admin3',
        password: 'MoonDrive',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=300&fit=crop&q=80',
        bio: '3D Compositing & Impact Frame Master Judge.',
        favAnime: 'Bleach: TYBW',
        editingApp: 'Blender',
        stats: { tournamentsJoined: 0, matchesWon: 0, championships: 0, avgScore: 0.0 },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_admin_4',
        name: 'Admin 4',
        username: 'admin4',
        password: 'MoonDrive',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&q=80',
        bio: 'Color Grading & Particle Effects Specialist.',
        favAnime: 'Chainsaw Man',
        editingApp: 'Alight Motion',
        stats: { tournamentsJoined: 0, matchesWon: 0, championships: 0, avgScore: 0.0 },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_admin_5',
        name: 'Admin 5',
        username: 'admin5',
        password: 'MoonDrive',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=300&fit=crop&q=80',
        bio: 'Typography & Motion Graphics Judge.',
        favAnime: 'Hunter x Hunter',
        editingApp: 'DaVinci Resolve',
        stats: { tournamentsJoined: 0, matchesWon: 0, championships: 0, avgScore: 0.0 },
        wonPrizes: [],
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
  }

  /* ==========================================================================
     Pre-Loaded Tournament ("COMPARTMENTS" Grid Mode — Open for Registrations)
     ========================================================================== */
  seedDefaultTournaments() {
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + 48); // 48 hours remaining

    const defaultTournaments = [
      {
        id: 'tourn_zenith_demo',
        title: 'ZENITH CLASH 2026: Animanga Hyper-Flow Championship',
        category: 'Velocity & Impact AMV (60 FPS)',
        banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&h=900&fit=crop&q=80',
        pfp: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80',
        description: 'The underground 1v1 battle arena for velocity, impact frames, sound sync, and compositing mastery. Editors clash through the Main Bracket and the ruthless COMPARTMENTS redemption grid. Winner takes all.',
        rules: [
          'Frame Rate: Strictly 60 FPS render required (no 30fps interpolation allowed).',
          'Watermark: Editor handle must be visibly positioned in the top-left or bottom-right corner throughout the clip.',
          'Audio & Sync: Free track choice; must feature at least one high-impact velocity drop/sync beat.',
          'Duration: Between 15 seconds (minimum) and 45 seconds (maximum).',
          'Hosting: All video submissions must be uploaded via AnonMP4.to (watch link or direct embed).'
        ],
        deadline: deadlineDate.toISOString(),
        secretPrizeLink: 'https://mega.nz/folder/zenith-2026-vip-secret-editing-pack-4k-overlays-project-files',
        gridMode: 'mode2_compartments',
        status: 'REGISTRATION_OPEN',
        participants: [],
        matches: [],
        nodeCanvasState: {
          zoom: 1,
          panX: 0,
          panY: 0,
          connections: []
        },
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem(this.STORAGE_KEY_TOURNAMENTS, JSON.stringify(defaultTournaments));
  }

  /* ==========================================================================
     Pre-Loaded Discord-Style Chats
     ========================================================================== */
  seedDefaultChats() {
    const defaultChats = {
      // General Server Channel
      'general': [
        {
          id: 'chat_gen_1',
          sender: 'Administrator1',
          text: 'Welcome to the Animanga Video Edit Tournament Network! All brackets are managed locally with zero cloud lag.',
          timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          isAnnouncement: true
        },
        {
          id: 'chat_gen_2',
          sender: 'admin1',
          text: 'Reminder to all registered editors: verify your 60fps renders and test your AnonMP4.to link before deadline!',
          timestamp: new Date(Date.now() - 3600000 * 6).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          isAnnouncement: false
        }
      ],

      // Dedicated Tournament Channel
      'tourn_zenith_demo': [
        {
          id: 'chat_zen_1',
          sender: 'Administrator1',
          text: '🔥 ZENITH CLASH 2026 is officially OPEN for registrations. Join the tournament, submit your AnonMP4 edit, and prepare for the 1v1 bracket clash!',
          timestamp: new Date(Date.now() - 3600000 * 8).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          isAnnouncement: true
        },
        {
          id: 'chat_zen_2',
          sender: 'admin1',
          text: 'Judging rubric is live: marks are strictly out of 10.0 based on flow, audio sync, and color grading. Good luck to all editors entering the grid!',
          timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          isAnnouncement: false
        }
      ]
    };

    localStorage.setItem(this.STORAGE_KEY_CHATS, JSON.stringify(defaultChats));
  }

  /* ==========================================================================
     User Management & Auth API
     ========================================================================== */
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_USERS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    this.broadcast('USERS_UPDATED');
  }

  getUserByUsername(username) {
    if (!username) return null;
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase().trim());
  }

  async login(username, password) {
    const cleanUsername = username ? username.trim() : '';
    if (!cleanUsername) {
      return { success: false, message: 'Please enter a valid username.' };
    }

    // 1. Try Supabase Cloud Login if connected
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          const { data, error } = await client
            .from('profiles')
            .select('*')
            .ilike('username', cleanUsername)
            .maybeSingle();

          if (data && !error) {
            if (data.password_hash !== password) {
              return { success: false, message: 'Incorrect password.' };
            }
            let mappedRole = 'Participant';
            if (data.role === 'owner') mappedRole = 'Owner / President';
            else if (data.role === 'admin') mappedRole = 'Admin';

            const userObj = {
              id: data.id || ('user_' + data.username),
              name: data.display_name || data.username,
              username: data.username,
              password: password,
              role: mappedRole,
              avatar: data.pfp_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(data.username)}`,
              bio: data.bio || 'Animanga video editor active in tournament battles.',
              favAnime: data.favorite_anime || 'Anime & Manga',
              editingApp: data.editing_software || 'After Effects',
              stats: {
                tournamentsJoined: Number(data.stats_tournaments_joined || 0),
                matchesWon: Number(data.stats_matches_won || 0),
                avgScore: Number(data.stats_avg_score || 0.0)
              },
              wonPrizes: Array.isArray(data.unlocked_prizes) ? data.unlocked_prizes : [],
              createdAt: data.created_at || new Date().toISOString()
            };

            const users = this.getUsers();
            const existingIdx = users.findIndex(u => u.username.toLowerCase() === userObj.username.toLowerCase());
            if (existingIdx >= 0) {
              users[existingIdx] = { ...users[existingIdx], ...userObj };
            } else {
              users.push(userObj);
            }
            this.saveUsers(users);
            this.setCurrentUser(userObj);
            return { success: true, user: userObj };
          }
        }
      } catch (cloudErr) {
        console.warn('Supabase cloud login fallback to local', cloudErr);
      }
    }

    // 2. Standalone Local Fallback Login
    const user = this.getUserByUsername(cleanUsername);
    if (!user) {
      return { success: false, message: 'Username not found. Register a new account or check credentials.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  async register(username, password) {
    const cleanUsername = username ? username.trim() : '';
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    // 1. If Supabase is connected, check cloud uniqueness and register to Supabase
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          const { data: existingUser } = await client
            .from('profiles')
            .select('username')
            .ilike('username', cleanUsername)
            .maybeSingle();

          if (existingUser) {
            return { success: false, message: 'This username is already taken in the cloud database. Please choose another.' };
          }

          const { error: insError } = await client.from('profiles').insert([{
            username: cleanUsername.toLowerCase(),
            password_hash: password,
            display_name: cleanUsername,
            role: 'participant',
            pfp_url: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanUsername)}`,
            bio: 'Animanga Video Editor ready for tournament battles.',
            editing_software: 'After Effects',
            favorite_anime: 'Anime & Manga'
          }]);

          if (insError && insError.code === '23505') {
            return { success: false, message: 'This username is already taken. Please choose another.' };
          }
        }
      } catch (cloudErr) {
        console.warn('Supabase register error, saving to local store', cloudErr);
      }
    }

    if (this.getUserByUsername(cleanUsername)) {
      return { success: false, message: 'This username is already taken. Please choose another.' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: cleanUsername,
      username: cleanUsername,
      password: password,
      role: 'Participant', // Normal default role
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanUsername)}`,
      bio: 'Animanga Video Editor ready for tournament battles.',
      favAnime: 'Anime & Manga',
      editingApp: 'After Effects',
      stats: {
        tournamentsJoined: 0,
        matchesWon: 0,
        championships: 0,
        avgScore: 0.0
      },
      wonPrizes: [],
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  getCurrentUser() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SESSION);
      if (!data) return null;
      const session = JSON.parse(data);
      // Refresh current user data from users list
      return this.getUserByUsername(session.username) || session;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(this.STORAGE_KEY_SESSION);
    } else {
      localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(user));
    }
    this.broadcast('AUTH_STATE_CHANGED', { user });
  }

  logout() {
    this.setCurrentUser(null);
  }

  /**
   * Edit Profile: Supports updating Name, Username, Password, Avatar, Bio, App, & Anime
   * Cascades username updates across all tournament rosters, matches, and chats!
   */
  updateUserProfile(oldUsername, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === oldUsername.toLowerCase().trim());
    if (idx === -1) {
      return { success: false, message: 'User not found.' };
    }

    const currentUserRecord = users[idx];
    let newUsername = oldUsername;

    // 1. Username Update Check
    if (updates.username && updates.username.trim().toLowerCase() !== oldUsername.toLowerCase().trim()) {
      const cleanUsername = updates.username.trim();
      if (cleanUsername.length < 3) {
        return { success: false, message: 'Username must be at least 3 characters.' };
      }
      // Check if username taken by another user
      const taken = users.some(u => u.id !== currentUserRecord.id && u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (taken) {
        return { success: false, message: `The username "${cleanUsername}" is already taken. Please choose another.` };
      }
      newUsername = cleanUsername;
      updates.username = newUsername;

      // Cascade update username in Tournaments (roster and matches)
      const tournaments = this.getTournaments();
      let tournUpdated = false;
      tournaments.forEach(tourn => {
        if (tourn.participants) {
          tourn.participants.forEach(p => {
            if (p.username.toLowerCase() === oldUsername.toLowerCase()) {
              p.username = newUsername;
              tournUpdated = true;
            }
          });
        }
        if (tourn.matches) {
          tourn.matches.forEach(m => {
            if (m.player1 && m.player1.toLowerCase() === oldUsername.toLowerCase()) { m.player1 = newUsername; tournUpdated = true; }
            if (m.player2 && m.player2.toLowerCase() === oldUsername.toLowerCase()) { m.player2 = newUsername; tournUpdated = true; }
            if (m.winner && m.winner.toLowerCase() === oldUsername.toLowerCase()) { m.winner = newUsername; tournUpdated = true; }
            if (m.loser && m.loser.toLowerCase() === oldUsername.toLowerCase()) { m.loser = newUsername; tournUpdated = true; }
            if (m.judgedBy && m.judgedBy.toLowerCase() === oldUsername.toLowerCase()) { m.judgedBy = newUsername; tournUpdated = true; }
          });
        }
        if (tourn.champion && tourn.champion.toLowerCase() === oldUsername.toLowerCase()) {
          tourn.champion = newUsername;
          tournUpdated = true;
        }
      });
      if (tournUpdated) {
        this.saveTournaments(tournaments);
      }

      // Cascade update username in Chats
      const chats = this.getChats();
      let chatsUpdated = false;
      Object.keys(chats).forEach(channelId => {
        chats[channelId].forEach(msg => {
          if (msg.sender && msg.sender.toLowerCase() === oldUsername.toLowerCase()) {
            msg.sender = newUsername;
            chatsUpdated = true;
          }
        });
      });
      if (chatsUpdated) {
        this.saveChats(chats);
      }
    }

    // 2. Password Update Check
    if (updates.password !== undefined) {
      const cleanPass = updates.password.trim();
      if (cleanPass.length === 0) {
        delete updates.password; // Don't overwrite if left blank
      } else if (cleanPass.length < 4) {
        return { success: false, message: 'Password must be at least 4 characters.' };
      } else {
        updates.password = cleanPass;
      }
    }

    // 3. Name (Display Name) Update
    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    // Apply updates
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);

    // Update active session
    const activeSession = this.getCurrentUser();
    if (activeSession && (activeSession.username.toLowerCase() === oldUsername.toLowerCase() || activeSession.username.toLowerCase() === newUsername.toLowerCase())) {
      this.setCurrentUser(users[idx]);
    }

    // Sync profile updates to Supabase Cloud if connected
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          const profilePayload = {
            display_name: users[idx].name,
            pfp_url: users[idx].avatar,
            bio: users[idx].bio,
            editing_software: users[idx].editingApp,
            favorite_anime: users[idx].favAnime,
            updated_at: new Date().toISOString()
          };
          if (updates.password) {
            profilePayload.password_hash = updates.password;
          }
          if (newUsername !== oldUsername) {
            profilePayload.username = newUsername.toLowerCase();
          }
          client.from('profiles').update(profilePayload).ilike('username', oldUsername).then();
        }
      } catch (e) {
        console.warn('Supabase profile update sync error', e);
      }
    }

    return { success: true, user: users[idx] };
  }

  // Admin Role Manager (Exclusive for Administrator1 / Owner)
  updateUserRole(targetUsername, newRole) {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'Owner / President') {
      return { success: false, message: 'Permission denied: Only Owner / President can manage roles.' };
    }
    if (targetUsername.toLowerCase() === 'administrator1') {
      return { success: false, message: 'Super Administrator cannot be modified.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    user.role = newRole; // 'Admin' or 'Participant'
    this.saveUsers(users);

    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.username.toLowerCase() === targetUsername.toLowerCase()) {
      this.setCurrentUser(user);
    }

    this.broadcast('ROLE_CHANGED', { username: targetUsername, newRole });

    // Sync role update to Supabase Cloud if connected
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          const cloudRole = newRole.toLowerCase() === 'admin' ? 'admin' : 'participant';
          client.from('profiles').update({ role: cloudRole }).ilike('username', targetUsername).then();
        }
      } catch (e) {}
    }

    return { success: true, user };
  }

  /* ==========================================================================
     Tournament API
     ========================================================================== */
  getTournaments() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_TOURNAMENTS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveTournaments(tournaments) {
    localStorage.setItem(this.STORAGE_KEY_TOURNAMENTS, JSON.stringify(tournaments));
    this.broadcast('TOURNAMENTS_UPDATED');
  }

  getTournamentById(id) {
    return this.getTournaments().find(t => t.id === id);
  }

  createTournament(data) {
    const tournaments = this.getTournaments();
    const newTournament = {
      id: 'tourn_' + Date.now(),
      title: data.title,
      category: data.category || 'AMV 1v1 Battle',
      banner: data.banner || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&h=900&fit=crop&q=80',
      pfp: data.pfp || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80',
      description: data.description || '',
      rules: data.rules || [
        '60 FPS locked render',
        'Watermark in corner required',
        'Must host edit on AnonMP4.to'
      ],
      deadline: data.deadline || new Date(Date.now() + 48 * 3600000).toISOString(),
      secretPrizeLink: data.secretPrizeLink || '',
      gridMode: data.gridMode || 'mode2_compartments',
      status: 'REGISTRATION_OPEN',
      participants: data.participants || [],
      matches: [],
      nodeCanvasState: { zoom: 1, panX: 0, panY: 0, connections: [] },
      createdAt: new Date().toISOString()
    };

    tournaments.unshift(newTournament);
    this.saveTournaments(tournaments);

    // Auto-create dedicated chat channel
    const chats = this.getChats();
    chats[newTournament.id] = [
      {
        id: 'chat_' + Date.now(),
        sender: 'Administrator1',
        text: `Welcome to the official tournament chat for ${newTournament.title}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        isAnnouncement: true
      }
    ];
    this.saveChats(chats);

    // Push new tournament to Supabase Cloud
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          client.from('tournaments').insert([{
            id: newTournament.id,
            title: newTournament.title,
            description: newTournament.description,
            rules: newTournament.rules,
            banner_url: newTournament.banner,
            pfp_url: newTournament.pfp,
            deadline: newTournament.deadline,
            prize_link: newTournament.secretPrizeLink,
            grid_mode: newTournament.gridMode === 'mode1_normal' ? 'normal' : (newTournament.gridMode === 'mode3_node' ? 'node' : 'compartments'),
            status: 'registration',
            participants: newTournament.participants,
            created_by: 'Administrator1'
          }]).then();
        }
      } catch (e) {}
    }

    return newTournament;
  }

  updateTournament(id, updates) {
    const tournaments = this.getTournaments();
    const idx = tournaments.findIndex(t => t.id === id);
    if (idx !== -1) {
      tournaments[idx] = { ...tournaments[idx], ...updates };
      this.saveTournaments(tournaments);

      if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
        try {
          const client = window.supabaseClientEngine.getClient();
          if (client) {
            client.from('tournaments').update({
              title: tournaments[idx].title,
              description: tournaments[idx].description,
              rules: tournaments[idx].rules,
              banner_url: tournaments[idx].banner,
              pfp_url: tournaments[idx].pfp,
              deadline: tournaments[idx].deadline,
              prize_link: tournaments[idx].secretPrizeLink,
              status: tournaments[idx].status === 'COMPLETED' ? 'completed' : 'registration',
              participants: tournaments[idx].participants
            }).eq('id', id).then();
          }
        } catch (e) {}
      }

      return tournaments[idx];
    }
    return null;
  }

  deleteTournament(id) {
    let tournaments = this.getTournaments();
    tournaments = tournaments.filter(t => t.id !== id);
    this.saveTournaments(tournaments);

    const chats = this.getChats();
    delete chats[id];
    this.saveChats(chats);

    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          client.from('tournaments').delete().eq('id', id).then();
          client.from('chats').delete().eq('tournament_id', id).then();
        }
      } catch (e) {}
    }
  }

  /* ==========================================================================
     Participant Roster & Edit Submission API
     ========================================================================== */
  registerParticipant(tournamentId, username) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return { success: false, message: 'Tournament not found' };

    const exists = tourn.participants.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'User is already registered for this tournament.' };
    }

    tourn.participants.push({
      username: username,
      submittedLink: null,
      submittedAt: null
    });

    this.updateTournament(tournamentId, { participants: tourn.participants });
    return { success: true, tournament: tourn };
  }

  removeParticipant(tournamentId, username) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return { success: false, message: 'Tournament not found' };

    tourn.participants = tourn.participants.filter(p => p.username.toLowerCase() !== username.toLowerCase());
    this.updateTournament(tournamentId, { participants: tourn.participants });
    return { success: true, tournament: tourn };
  }

  submitEditLink(tournamentId, username, link) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return { success: false, message: 'Tournament not found' };

    // Check if deadline passed
    if (new Date() > new Date(tourn.deadline)) {
      return { success: false, message: 'Submission deadline has passed. Edits are locked.' };
    }

    const cleanLink = link.trim();
    if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
      return { success: false, message: 'Please provide a valid web link (https://...)' };
    }

    const p = tourn.participants.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (!p) {
      return { success: false, message: 'You must register for this tournament first.' };
    }

    p.submittedLink = cleanLink;
    p.submittedAt = new Date().toISOString();

    this.updateTournament(tournamentId, { participants: tourn.participants });
    return { success: true, participant: p };
  }

  /* ==========================================================================
     Judging & Bracket Generation Engine
     ========================================================================== */
  // Quick Match generator for Mode 1 (Normal Single Elimination)
  generateNormalBracket(tournamentId) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return;

    const participants = [...tourn.participants].sort(() => Math.random() - 0.5);
    const matches = [];

    // Pair into Round 1
    for (let i = 0; i < participants.length; i += 2) {
      const p1 = participants[i] ? participants[i].username : null;
      const p2 = participants[i + 1] ? participants[i + 1].username : null;
      matches.push({
        id: `m_norm_r1_${i / 2 + 1}`,
        bracket: 'NORMAL',
        round: 1,
        matchNumber: i / 2 + 1,
        player1: p1,
        player2: p2,
        score1: null,
        score2: null,
        winner: null,
        loser: null,
        status: p1 && p2 ? 'READY' : 'WAITING'
      });
    }

    // Placeholders for Semifinals (Round 2)
    const semiCount = Math.max(1, Math.ceil(matches.length / 2));
    for (let i = 0; i < semiCount; i++) {
      matches.push({
        id: `m_norm_r2_${i + 1}`,
        bracket: 'NORMAL',
        round: 2,
        matchNumber: i + 1,
        player1: null,
        player2: null,
        score1: null,
        score2: null,
        winner: null,
        loser: null,
        status: 'WAITING'
      });
    }

    // Finals (Round 3)
    matches.push({
      id: `m_norm_r3_1`,
      bracket: 'NORMAL',
      round: 3,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      winner: null,
      loser: null,
      status: 'WAITING'
    });

    this.updateTournament(tournamentId, { matches, gridMode: 'mode1_normal', status: 'IN_PROGRESS' });
    return matches;
  }

  // Quick Match generator for Mode 2 ("COMPARTMENTS" Grid)
  generateCompartmentsBracket(tournamentId) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return;

    const participants = [...tourn.participants].sort(() => Math.random() - 0.5);
    const matches = [];

    // Main Bracket Round 1 (4 matches for up to 8 participants)
    const matchCount = Math.max(2, Math.ceil(participants.length / 2));
    for (let i = 0; i < matchCount; i++) {
      const p1 = participants[i * 2] ? participants[i * 2].username : null;
      const p2 = participants[i * 2 + 1] ? participants[i * 2 + 1].username : null;
      matches.push({
        id: `m_main_r1_${i + 1}`,
        bracket: 'MAIN',
        round: 1,
        matchNumber: i + 1,
        player1: p1,
        player2: p2,
        score1: null,
        score2: null,
        winner: null,
        loser: null,
        status: p1 && p2 ? 'READY' : 'WAITING'
      });
    }

    // Main Bracket Round 2 (Semifinals: 2 matches)
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: `m_main_r2_${i + 1}`,
        bracket: 'MAIN',
        round: 2,
        matchNumber: i + 1,
        player1: null,
        player2: null,
        score1: null,
        score2: null,
        winner: null,
        loser: null,
        status: 'WAITING'
      });
    }

    // Main Bracket Round 3 (Main Final)
    matches.push({
      id: `m_main_final`,
      bracket: 'MAIN',
      round: 3,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      winner: null,
      loser: null,
      status: 'WAITING'
    });

    // COMPARTMENTS Section R1 (2 matches)
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: `m_comp_r1_${i + 1}`,
        bracket: 'COMPARTMENTS',
        round: 1,
        matchNumber: i + 1,
        player1: null,
        player2: null,
        score1: null,
        score2: null,
        winner: null,
        loser: null,
        status: 'WAITING'
      });
    }

    // COMPARTMENTS Section R2 (1 match)
    matches.push({
      id: `m_comp_r2_1`,
      bracket: 'COMPARTMENTS',
      round: 2,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      winner: null,
      loser: null,
      status: 'WAITING'
    });

    // COMPARTMENTS Final (1 match)
    matches.push({
      id: `m_comp_final`,
      bracket: 'COMPARTMENTS',
      round: 3,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      winner: null,
      loser: null,
      status: 'WAITING'
    });

    // ULTIMATE GRAND FINALS 1v1
    matches.push({
      id: `m_grand_final`,
      bracket: 'GRAND_FINALS',
      round: 4,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      winner: null,
      loser: null,
      status: 'WAITING'
    });

    this.updateTournament(tournamentId, { matches, gridMode: 'mode2_compartments', status: 'IN_PROGRESS' });
    return matches;
  }

  // Judge & Score a Match (Marks out of 10)
  scoreMatch(tournamentId, matchId, score1, score2, judgeUsername, judgeNotes) {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return { success: false, message: 'Tournament not found' };

    const matches = tourn.matches;
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, message: 'Match not found' };

    const s1 = parseFloat(score1);
    const s2 = parseFloat(score2);

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s1 > 10 || s2 < 0 || s2 > 10) {
      return { success: false, message: 'Scores must be valid numbers between 0.0 and 10.0' };
    }

    if (s1 === s2) {
      return { success: false, message: 'Tie scores not allowed in 1v1 animanga edit battles. Assign decimal advantage!' };
    }

    const winner = s1 > s2 ? match.player1 : match.player2;
    const loser = s1 > s2 ? match.player2 : match.player1;

    match.score1 = s1;
    match.score2 = s2;
    match.winner = winner;
    match.loser = loser;
    match.judgedBy = judgeUsername;
    match.notes = judgeNotes || '';
    match.status = 'COMPLETED';

    // Propagation logic based on Bracket Mode
    if (tourn.gridMode === 'mode2_compartments') {
      this.propagateCompartmentsProgression(matches, match);
    } else {
      this.propagateNormalProgression(matches, match);
    }

    // Check if Grand Finals / Tournament Completed
    let grandWinner = null;
    if (tourn.gridMode === 'mode2_compartments') {
      const gf = matches.find(m => m.bracket === 'GRAND_FINALS');
      if (gf && gf.winner) {
        grandWinner = gf.winner;
        tourn.status = 'COMPLETED';
        tourn.champion = grandWinner;
      }
    } else {
      const normalFinal = matches.find(m => m.bracket === 'NORMAL' && m.round === 3);
      if (normalFinal && normalFinal.winner) {
        grandWinner = normalFinal.winner;
        tourn.status = 'COMPLETED';
        tourn.champion = grandWinner;
      }
    }

    // Update tournament
    this.updateTournament(tournamentId, { matches, status: tourn.status, champion: tourn.champion });

    // If there is a tournament champion, unlock secret prize link into winner's profile!
    if (grandWinner) {
      this.awardSecretPrizeToWinner(grandWinner, tourn);
    }

    this.broadcast('MATCH_SCORED', { tournamentId, matchId, winner, loser });
    return { success: true, match, grandWinner };
  }

  // Automatic Compartments Progression
  propagateCompartmentsProgression(matches, completedMatch) {
    const { id, bracket, round, matchNumber, winner, loser } = completedMatch;

    if (bracket === 'MAIN') {
      if (round === 1) {
        // Winner goes to Main R2
        const nextMainMatch = matches.find(m => m.bracket === 'MAIN' && m.round === 2 && m.matchNumber === Math.ceil(matchNumber / 2));
        if (nextMainMatch) {
          if (matchNumber % 2 === 1) nextMainMatch.player1 = winner;
          else nextMainMatch.player2 = winner;
          if (nextMainMatch.player1 && nextMainMatch.player2) nextMainMatch.status = 'READY';
        }

        // COMPARTMENTS RULE: Loser automatically drops to COMPARTMENTS Section!
        const compR1Match = matches.find(m => m.bracket === 'COMPARTMENTS' && m.round === 1 && m.matchNumber === Math.ceil(matchNumber / 2));
        if (compR1Match) {
          if (matchNumber % 2 === 1) compR1Match.player1 = loser;
          else compR1Match.player2 = loser;
          if (compR1Match.player1 && compR1Match.player2) compR1Match.status = 'READY';
        }
      } else if (round === 2) {
        // Winner goes to Main Final
        const mainFinal = matches.find(m => m.bracket === 'MAIN' && m.round === 3);
        if (mainFinal) {
          if (matchNumber === 1) mainFinal.player1 = winner;
          else mainFinal.player2 = winner;
          if (mainFinal.player1 && mainFinal.player2) mainFinal.status = 'READY';
        }
        // Loser drops to Compartments R2!
        const compR2 = matches.find(m => m.bracket === 'COMPARTMENTS' && m.round === 2);
        if (compR2) {
          if (!compR2.player2) compR2.player2 = loser;
          if (compR2.player1 && compR2.player2) compR2.status = 'READY';
        }
      } else if (round === 3) {
        // Main Final Winner goes to Grand Finals 1v1
        const grandFinal = matches.find(m => m.bracket === 'GRAND_FINALS');
        if (grandFinal) {
          grandFinal.player1 = winner;
          if (grandFinal.player1 && grandFinal.player2) grandFinal.status = 'READY';
        }
        // Loser drops to Compartments Final to face surviving redemption challenger
        const compFinal = matches.find(m => m.bracket === 'COMPARTMENTS' && m.round === 3);
        if (compFinal) {
          compFinal.player2 = loser;
          if (compFinal.player1 && compFinal.player2) compFinal.status = 'READY';
        }
      }
    } else if (bracket === 'COMPARTMENTS') {
      if (round === 1) {
        const compR2 = matches.find(m => m.bracket === 'COMPARTMENTS' && m.round === 2);
        if (compR2) {
          if (!compR2.player1) compR2.player1 = winner;
          else compR2.player2 = winner;
          if (compR2.player1 && compR2.player2) compR2.status = 'READY';
        }
      } else if (round === 2) {
        const compFinal = matches.find(m => m.bracket === 'COMPARTMENTS' && m.round === 3);
        if (compFinal) {
          compFinal.player1 = winner;
          if (compFinal.player1 && compFinal.player2) compFinal.status = 'READY';
        }
      } else if (round === 3) {
        // Surviving Compartments Winner advances to GRAND FINALS 1v1!
        const grandFinal = matches.find(m => m.bracket === 'GRAND_FINALS');
        if (grandFinal) {
          grandFinal.player2 = winner;
          if (grandFinal.player1 && grandFinal.player2) grandFinal.status = 'READY';
        }
      }
    }
  }

  // Normal Progression
  propagateNormalProgression(matches, completedMatch) {
    const { round, matchNumber, winner } = completedMatch;
    if (round === 1) {
      const nextMatch = matches.find(m => m.bracket === 'NORMAL' && m.round === 2 && m.matchNumber === Math.ceil(matchNumber / 2));
      if (nextMatch) {
        if (matchNumber % 2 === 1) nextMatch.player1 = winner;
        else nextMatch.player2 = winner;
        if (nextMatch.player1 && nextMatch.player2) nextMatch.status = 'READY';
      }
    } else if (round === 2) {
      const finalMatch = matches.find(m => m.bracket === 'NORMAL' && m.round === 3);
      if (finalMatch) {
        if (matchNumber === 1) finalMatch.player1 = winner;
        else finalMatch.player2 = winner;
        if (finalMatch.player1 && finalMatch.player2) finalMatch.status = 'READY';
      }
    }
  }

  // Secret Winner Prize link unlocking
  awardSecretPrizeToWinner(winnerUsername, tournament) {
    if (!tournament.secretPrizeLink) return;

    const users = this.getUsers();
    const winnerUser = users.find(u => u.username.toLowerCase() === winnerUsername.toLowerCase());
    if (winnerUser) {
      if (!winnerUser.wonPrizes) winnerUser.wonPrizes = [];
      const alreadyHas = winnerUser.wonPrizes.some(p => p.tournamentId === tournament.id);
      if (!alreadyHas) {
        winnerUser.wonPrizes.unshift({
          tournamentId: tournament.id,
          title: tournament.title,
          prizeLink: tournament.secretPrizeLink,
          dateWon: new Date().toISOString()
        });
        if (winnerUser.stats) {
          winnerUser.stats.championships = (winnerUser.stats.championships || 0) + 1;
        }
        this.saveUsers(users);
      }
    }
  }

  /* ==========================================================================
     Discord-Style Chats API
     ========================================================================== */
  getChats() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_CHATS)) || {};
    } catch (e) {
      return {};
    }
  }

  saveChats(chats) {
    localStorage.setItem(this.STORAGE_KEY_CHATS, JSON.stringify(chats));
    this.broadcast('CHATS_UPDATED');
  }

  getChannelMessages(channelId) {
    const chats = this.getChats();
    return chats[channelId] || [];
  }

  sendMessage(channelId, senderUsername, text, isAnnouncement = false) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const chats = this.getChats();
    if (!chats[channelId]) {
      chats[channelId] = [];
    }

    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const newMessage = {
      id: messageId,
      sender: senderUsername,
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isAnnouncement: Boolean(isAnnouncement)
    };

    chats[channelId].push(newMessage);
    this.saveChats(chats);

    // If connected to Supabase Cloud, push to Supabase PostgreSQL chats table
    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          const currentUser = this.getCurrentUser();
          const cloudText = isAnnouncement ? `[ANNOUNCEMENT] ${cleanText}` : cleanText;
          const cloudPayload = {
            id: messageId,
            tournament_id: channelId,
            user_id: currentUser?.id ? String(currentUser.id) : null,
            username: senderUsername,
            user_pfp: currentUser?.avatar || null,
            user_role: currentUser?.role || 'participant',
            message: cloudText
          };

          client.from('chats').insert([cloudPayload]).then(({ error }) => {
            if (error) console.warn('Supabase chat sync notice:', error.message);
          }).catch(err => console.warn('Supabase chat send error:', err));
        }
      } catch (e) {
        console.warn('Supabase cloud push error', e);
      }
    }

    return newMessage;
  }

  deleteMessage(channelId, messageId) {
    const chats = this.getChats();
    if (!chats[channelId]) return;

    chats[channelId] = chats[channelId].filter(m => m.id !== messageId);
    this.saveChats(chats);

    if (window.supabaseClientEngine && window.supabaseClientEngine.isConnected) {
      try {
        const client = window.supabaseClientEngine.getClient();
        if (client) {
          client.from('chats').delete().eq('id', messageId).then();
        }
      } catch (e) {}
    }
  }

  /* ==========================================================================
     Settings & Preferences API
     ========================================================================== */
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_SETTINGS)) || { theme: 'dark', sound: true };
    } catch (e) {
      return { theme: 'dark', sound: true };
    }
  }

  saveSettings(settings) {
    localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    this.applyTheme(settings.theme);
    if (window.soundEngine) {
      window.soundEngine.toggleSound(settings.sound !== false);
    }
    this.broadcast('SETTINGS_UPDATED', settings);
  }

  applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }
}

window.esportsStore = new EsportsStore();
