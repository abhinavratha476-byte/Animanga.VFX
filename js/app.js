/**
 * Main Application Orchestrator
 * Coordinates Navigation, Modals, Bracket Engines, Node Graph Wiring,
 * Judging System, Live Countdowns, and Real-time BroadcastChannel Sync.
 */

class EsportsApp {
  constructor() {
    this.activeTab = 'tournaments'; // 'tournaments', 'profile', 'chats', 'settings'
    this.selectedTournamentId = 'tourn_zenith_demo'; // default active tournament
    this.activeChatChannel = 'general';
    this.activeMatchId = null;
    this.authMode = 'signin'; // 'signin' or 'register'

    // Node graph interactive state
    this.nodeWiringState = {
      selectedPort: null,
      connections: []
    };

    // Countdown timer interval
    this.countdownInterval = null;

    this.init();
  }

  init() {
    // Set theme on launch
    const settings = window.esportsStore.getSettings();
    window.esportsStore.applyTheme(settings.theme);

    // Setup event listeners for local and remote BroadcastChannel sync
    window.addEventListener('app:local-sync', (e) => this.handleSyncEvent(e.detail));
    window.addEventListener('app:remote-sync', (e) => this.handleSyncEvent(e.detail));

    // Initial render
    this.render();

    // Start live countdown updater
    this.startCountdownLoop();

    // Start background Supabase cloud sync loop
    this.startCloudSyncLoop();

    // Initialize network online/offline listeners
    this.initNetworkListeners();

    // If not logged in and splash screen is not present, prompt login immediately
    if (!window.esportsStore.getCurrentUser() && !document.getElementById('loadingSplashOverlay')) {
      setTimeout(() => this.openAuthModal(), 200);
    }
  }

  handleSyncEvent(detail) {
    // Audio trigger on score or chat if received remotely
    if (detail?.type === 'MATCH_SCORED' && window.soundEngine) {
      window.soundEngine.playScoreLock();
    }

    // Re-render UI to stay perfectly reactive across all tabs
    this.render();
  }

  /* ==========================================================================
     Navigation & Routing
     ========================================================================== */
  switchTab(tabName) {
    if (this.activeTab !== tabName) {
      this.activeTab = tabName;
      if (window.soundEngine) window.soundEngine.playWhoosh();
      if (tabName === 'chats') {
        window.esportsStore.syncChatsFromCloud(this.activeChatChannel);
      } else if (tabName === 'tournaments') {
        window.esportsStore.syncTournamentsFromCloud();
      }
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (tabName === 'chats') {
        setTimeout(() => {
          const hist = document.getElementById('chatMessageHistory');
          if (hist) hist.scrollTop = hist.scrollHeight;
        }, 50);
      }
    }
  }

  openTournamentDetail(tournamentId) {
    this.selectedTournamentId = tournamentId;
    this.activeTab = 'tournament_detail';
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchChatChannel(channelId) {
    this.activeChatChannel = channelId;
    if (window.soundEngine) window.soundEngine.playClick();
    window.esportsStore.syncChatsFromCloud(channelId);
    this.render();
    setTimeout(() => {
      const hist = document.getElementById('chatMessageHistory');
      if (hist) hist.scrollTop = hist.scrollHeight;
    }, 50);
  }

  startCloudSyncLoop() {
    setInterval(() => {
      if (this.activeTab === 'chats') {
        window.esportsStore.syncChatsFromCloud(this.activeChatChannel);
      }
    }, 4000);
  }

  /* ==========================================================================
     Main Render Loop
     ========================================================================== */
  render() {
    const currentUser = window.esportsStore.getCurrentUser();
    const tournaments = window.esportsStore.getTournaments();

    // Render Desktop Sidebar
    const desktopNavContainer = document.getElementById('desktopSidebarContainer');
    if (desktopNavContainer) {
      desktopNavContainer.innerHTML = window.NavbarComponent.renderDesktopSidebar(this.activeTab, currentUser);
    }

    // Render Mobile Bars
    const mobileTopBarContainer = document.getElementById('mobileTopBarContainer');
    if (mobileTopBarContainer) {
      mobileTopBarContainer.innerHTML = window.NavbarComponent.renderMobileTopBar(currentUser);
    }

    const mobileBottomBarContainer = document.getElementById('mobileBottomBarContainer');
    if (mobileBottomBarContainer) {
      mobileBottomBarContainer.innerHTML = window.NavbarComponent.renderMobileBottomBar(this.activeTab);
    }

    // Render Main Content View
    const mainContentArea = document.getElementById('mainContentArea');
    if (!mainContentArea) return;

    if (this.activeTab === 'tournaments') {
      mainContentArea.innerHTML = window.TournamentsViewComponent.renderList(tournaments, currentUser);
    } else if (this.activeTab === 'tournament_detail') {
      const tourn = window.esportsStore.getTournamentById(this.selectedTournamentId) || tournaments[0];
      if (tourn) {
        mainContentArea.innerHTML = window.TournamentsViewComponent.renderDetail(tourn, currentUser);
        // If in Node Graph mode, render interactive wires
        if (tourn.gridMode === 'mode3_node') {
          setTimeout(() => this.drawNodeGraphWires(tourn), 50);
        }
      } else {
        this.switchTab('tournaments');
      }
    } else if (this.activeTab === 'chats') {
      mainContentArea.innerHTML = window.ChatsViewComponent.render(this.activeChatChannel, tournaments, currentUser);
      // Auto-scroll chat to bottom
      setTimeout(() => {
        const hist = document.getElementById('chatMessageHistory');
        if (hist) hist.scrollTop = hist.scrollHeight;
      }, 50);
    } else if (this.activeTab === 'profile') {
      mainContentArea.innerHTML = window.ProfileViewComponent.render(currentUser);
    } else if (this.activeTab === 'settings') {
      mainContentArea.innerHTML = window.SettingsViewComponent.render(currentUser);
    }

    this.updateCountdowns();
  }

  /* ==========================================================================
     Live Countdown Timer System (DD:HH:MM:SS)
     ========================================================================== */
  startCountdownLoop() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.updateCountdowns();
    }, 1000);
  }

  updateCountdowns() {
    const badges = document.querySelectorAll('.countdown-badge');
    badges.forEach(badge => {
      const deadlineStr = badge.getAttribute('data-deadline');
      const timerSpan = badge.querySelector('.countdown-timer');
      if (!deadlineStr || !timerSpan) return;

      const diff = new Date(deadlineStr) - new Date();
      if (diff <= 0) {
        timerSpan.textContent = 'LOCKED (EXPIRED)';
        badge.classList.remove('text-rose-300');
        badge.classList.add('text-slate-500');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const pad = n => String(n).padStart(2, '0');
        timerSpan.textContent = `${pad(days)}D:${pad(hours)}H:${pad(mins)}M:${pad(secs)}S`;
      }
    });
  }

  /* ==========================================================================
     Authentication & Quick-Fill Logic
     ========================================================================== */
  openAuthModal() {
    if (window.soundEngine) window.soundEngine.playClick();
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
  }

  switchAuthMode(mode) {
    this.authMode = mode;
    const btnSignIn = document.getElementById('authTabSignIn');
    const btnRegister = document.getElementById('authTabRegister');
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const alertBox = document.getElementById('authAlert');
    if (alertBox) alertBox.classList.add('hidden');

    if (mode === 'signin') {
      btnSignIn.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-violet-600 text-white shadow-md shadow-violet-600/40';
      btnRegister.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg text-slate-400 hover:text-white transition-all';
      title.textContent = 'Sign In to Arena';
      submitBtn.textContent = 'Sign In';
    } else {
      btnRegister.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-violet-600 text-white shadow-md shadow-violet-600/40';
      btnSignIn.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg text-slate-400 hover:text-white transition-all';
      title.textContent = 'Create Editor Account';
      submitBtn.textContent = 'Register Account';
    }
  }

  quickFillLogin(username, password) {
    document.getElementById('authUsername').value = username;
    document.getElementById('authPassword').value = password;
    this.switchAuthMode('signin');
    this.executeLogin(username, password);
  }

  handleAuthSubmit(e) {
    e.preventDefault();
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();

    if (this.authMode === 'signin') {
      this.executeLogin(u, p);
    } else {
      this.executeRegister(u, p);
    }
  }

  async executeLogin(username, password) {
    const submitBtn = document.getElementById('authSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying...';
    }
    const alertBox = document.getElementById('authAlert');

    try {
      const res = await window.esportsStore.login(username, password);
      if (res.success) {
        if (window.soundEngine) window.soundEngine.playConnect();
        this.closeAuthModal();
        this.render();
      } else {
        if (alertBox) {
          alertBox.textContent = res.message;
          alertBox.className = 'p-3 rounded-lg mb-4 text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 block';
        }
      }
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Login error occurred.';
        alertBox.className = 'p-3 rounded-lg mb-4 text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = this.authMode === 'signin' ? 'Sign In' : 'Register Account';
      }
    }
  }

  async executeRegister(username, password) {
    const submitBtn = document.getElementById('authSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }
    const alertBox = document.getElementById('authAlert');

    try {
      const res = await window.esportsStore.register(username, password);
      if (res.success) {
        if (window.soundEngine) window.soundEngine.playConnect();
        this.closeAuthModal();
        this.render();
      } else {
        if (alertBox) {
          alertBox.textContent = res.message;
          alertBox.className = 'p-3 rounded-lg mb-4 text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 block';
        }
      }
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Registration error occurred.';
        alertBox.className = 'p-3 rounded-lg mb-4 text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = this.authMode === 'signin' ? 'Sign In' : 'Register Account';
      }
    }
  }

  logout() {
    window.esportsStore.logout();
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  }

  /* ==========================================================================
     Network Offline / Online Status System & Reconnection Popups
     ========================================================================== */
  initNetworkListeners() {
    window.addEventListener('offline', () => this.handleNetworkChange(false));
    window.addEventListener('online', () => this.handleNetworkChange(true));

    if (!navigator.onLine) {
      setTimeout(() => this.handleNetworkChange(false), 900);
    }
  }

  handleNetworkChange(isOnline) {
    const overlay = document.getElementById('offlinePopupOverlay');
    if (!overlay) return;

    if (!isOnline) {
      if (window.soundEngine) window.soundEngine.playWhoosh();
      overlay.innerHTML = `
        <div class="glass-card rounded-2xl border-2 border-rose-500/80 bg-[#0e070c]/95 p-3.5 sm:p-4 shadow-2xl shadow-rose-600/40 backdrop-blur-xl pointer-events-auto flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400 text-lg flex-shrink-0 animate-pulse">
            📡
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="font-display font-black text-xs text-white uppercase tracking-wider">
                Offline Mode Active
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                NO INTERNET
              </span>
            </div>
            <p class="text-[11px] text-slate-300 leading-snug">
              Internet connection lost. App is currently running in offline mode.
            </p>
            <div class="mt-2.5 flex items-center gap-2">
              <button 
                type="button" 
                onclick="window.app.retryConnection()" 
                class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-[10px] transition-all active:scale-95 shadow-md shadow-rose-600/40"
              >
                Retry Connection
              </button>
              <button 
                type="button" 
                onclick="window.app.dismissOfflinePopup()" 
                class="px-2 py-1 text-[10px] text-slate-400 hover:text-white font-mono"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      `;
      overlay.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
      overlay.classList.add('translate-y-0', 'opacity-100');
    } else {
      if (window.soundEngine) window.soundEngine.playConnect();
      overlay.innerHTML = `
        <div class="glass-card rounded-2xl border-2 border-emerald-500/80 bg-[#07130d]/95 p-3.5 sm:p-4 shadow-2xl shadow-emerald-600/40 backdrop-blur-xl pointer-events-auto flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-lg flex-shrink-0 animate-pulse">
            ⚡
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="font-display font-black text-xs text-white uppercase tracking-wider">
                Back Online!
              </span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>
            <p class="text-[11px] text-slate-300 leading-snug">
              Connected to Supabase Cloud. Real-time tournament & chat sync restored.
            </p>
          </div>
        </div>
      `;
      overlay.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
      overlay.classList.add('translate-y-0', 'opacity-100');

      if (window.supabaseClientEngine) {
        window.supabaseClientEngine.initClient();
      }
      setTimeout(() => this.dismissOfflinePopup(), 2800);
    }

    this.render();
  }

  dismissOfflinePopup() {
    const overlay = document.getElementById('offlinePopupOverlay');
    if (overlay) {
      overlay.classList.remove('translate-y-0', 'opacity-100');
      overlay.classList.add('-translate-y-24', 'opacity-0', 'pointer-events-none');
    }
  }

  async retryConnection() {
    const overlay = document.getElementById('offlinePopupOverlay');
    if (!navigator.onLine) {
      if (overlay) {
        const btn = overlay.querySelector('button');
        if (btn) btn.textContent = 'Still Offline...';
        setTimeout(() => { if (btn) btn.textContent = 'Retry Connection'; }, 1500);
      }
      return;
    }

    if (window.supabaseClientEngine) {
      const res = await window.supabaseClientEngine.testConnection();
      if (res.success) {
        this.handleNetworkChange(true);
      } else {
        if (overlay) {
          const btn = overlay.querySelector('button');
          if (btn) btn.textContent = 'Connection Failed';
          setTimeout(() => { if (btn) btn.textContent = 'Retry Connection'; }, 1500);
        }
      }
    }
  }

  openSupabaseModal() {
    // Zero-config cloud mode: visitors are automatically connected.
  }

  closeSupabaseModal() {
    // No-op
  }

  /* ==========================================================================
     Tournament Management & AnonMP4 Submission
     ========================================================================== */
  openCreateTournamentModal() {
    const modal = document.getElementById('createTournamentModal');
    if (modal) {
      modal.classList.remove('hidden');
      // Set default deadline to 48 hours from now
      const d = new Date(Date.now() + 48 * 3600000);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const deadlineInput = document.getElementById('createTournDeadline');
      if (deadlineInput) deadlineInput.value = d.toISOString().slice(0, 16);
    }
  }

  closeCreateTournamentModal() {
    const modal = document.getElementById('createTournamentModal');
    if (modal) modal.classList.add('hidden');
  }

  handleCreateTournamentSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('createTournTitle').value.trim();
    const category = document.getElementById('createTournCategory').value.trim();
    const banner = document.getElementById('createTournBanner').value.trim();
    const pfp = document.getElementById('createTournPfp').value.trim();
    const desc = document.getElementById('createTournDesc').value.trim();
    const rulesText = document.getElementById('createTournRules').value.trim();
    const deadline = document.getElementById('createTournDeadline').value;
    const gridMode = document.getElementById('createTournMode').value;
    const secretPrize = document.getElementById('createTournPrizeLink').value.trim();

    const rules = rulesText.split('\n').map(r => r.trim()).filter(Boolean);

    const currentUser = window.esportsStore.getCurrentUser();
    const newTourn = window.esportsStore.createTournament({
      title,
      category,
      banner,
      pfp,
      description: desc,
      rules,
      deadline: new Date(deadline).toISOString(),
      gridMode,
      secretPrizeLink: secretPrize,
      participants: [
        { username: currentUser.username, submittedLink: null, submittedAt: null }
      ]
    });

    if (window.soundEngine) window.soundEngine.playConnect();
    this.closeCreateTournamentModal();
    this.openTournamentDetail(newTourn.id);
  }

  deleteTournament(tournamentId) {
    if (confirm('Are you sure you want to delete this tournament and its channels?')) {
      window.esportsStore.deleteTournament(tournamentId);
      if (window.soundEngine) window.soundEngine.playClick();
      this.switchTab('tournaments');
    }
  }

  registerForTournament(tournamentId) {
    const currentUser = window.esportsStore.getCurrentUser();
    if (!currentUser) {
      this.openAuthModal();
      return;
    }
    const res = window.esportsStore.registerParticipant(tournamentId, currentUser.username);
    if (res.success) {
      if (window.soundEngine) window.soundEngine.playConnect();
      this.render();
    } else {
      alert(res.message);
    }
  }

  removeParticipantFromTournament(tournamentId, username) {
    if (confirm(`Remove/Kick ${username} from tournament roster?`)) {
      window.esportsStore.removeParticipant(tournamentId, username);
      if (window.soundEngine) window.soundEngine.playClick();
      this.render();
    }
  }

  openAddParticipantModal(tournamentId) {
    const users = window.esportsStore.getUsers();
    const tourn = window.esportsStore.getTournamentById(tournamentId);
    const existing = new Set(tourn.participants.map(p => p.username.toLowerCase()));
    const available = users.filter(u => !existing.has(u.username.toLowerCase()));

    if (available.length === 0) {
      alert('All registered users are already in this tournament!');
      return;
    }

    const selectHtml = available.map(u => `<option value="${u.username}">${u.username} (${u.role})</option>`).join('');
    const promptUsername = prompt(`Select registered user to add:\nAvailable: ${available.map(u => u.username).join(', ')}`);
    if (promptUsername && promptUsername.trim()) {
      window.esportsStore.registerParticipant(tournamentId, promptUsername.trim());
      if (window.soundEngine) window.soundEngine.playConnect();
      this.render();
    }
  }

  scrollToSubmission() {
    const sec = document.getElementById('participantSubmissionSection');
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleEditSubmission(e, tournamentId) {
    e.preventDefault();
    const currentUser = window.esportsStore.getCurrentUser();
    if (!currentUser) return;

    const link = document.getElementById('userEditLinkInput').value.trim();
    const res = window.esportsStore.submitEditLink(tournamentId, currentUser.username, link);

    if (res.success) {
      if (window.soundEngine) window.soundEngine.playScoreLock();
      alert('Your AnonMP4 Edit link has been submitted successfully!');
      this.render();
    } else {
      alert(res.message);
    }
  }

  previewEditLink(link, username) {
    const playerHtml = window.AnonPlayerSystem.renderPlayerHTML({ url: link, title: `${username}'s Edit Preview` });
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay';
    modal.innerHTML = `
      <div class="relative w-full max-w-2xl glass-card rounded-2xl border border-violet-500/50 p-6 shadow-2xl">
        <button onclick="this.closest('.modal-overlay').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          ✕
        </button>
        <h4 class="font-display font-black text-lg text-white mb-4">Edit Preview · ${username}</h4>
        ${playerHtml}
      </div>
    `;
    document.body.appendChild(modal);
  }

  /* ==========================================================================
     Bracket Modes & Quick Match
     ========================================================================== */
  setTournamentGridMode(tournamentId, mode) {
    window.esportsStore.updateTournament(tournamentId, { gridMode: mode });
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  }

  quickMatchTournament(tournamentId) {
    const tourn = window.esportsStore.getTournamentById(tournamentId);
    if (!tourn) return;

    if (tourn.participants.length < 2) {
      alert('Need at least 2 participants in roster to generate matchups.');
      return;
    }

    if (tourn.gridMode === 'mode2_compartments') {
      window.esportsStore.generateCompartmentsBracket(tournamentId);
    } else {
      window.esportsStore.generateNormalBracket(tournamentId);
    }

    if (window.soundEngine) window.soundEngine.playConnect();
    this.render();
  }

  /* ==========================================================================
     1v1 Battle Comparison & Admin Judging System (Marks out of 10)
     ========================================================================== */
  openBattleModal(tournamentId, matchId) {
    this.selectedTournamentId = tournamentId;
    this.activeMatchId = matchId;

    const tourn = window.esportsStore.getTournamentById(tournamentId);
    const match = tourn?.matches.find(m => m.id === matchId);
    if (!match) return;

    const modal = document.getElementById('judgingModal');
    if (!modal) return;

    const currentUser = window.esportsStore.getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Owner / President';

    // Badge
    const badge = document.getElementById('judgeModalBracketBadge');
    if (badge) {
      badge.textContent = match.bracket === 'GRAND_FINALS' 
        ? 'GRAND FINALS 1v1' 
        : (match.bracket === 'COMPARTMENTS' ? 'COMPARTMENTS REDEMPTION' : 'MAIN BRACKET');
    }

    // Player 1 Info
    const p1User = window.esportsStore.getUserByUsername(match.player1);
    const p1Part = tourn.participants.find(p => p.username === match.player1);
    document.getElementById('judgeP1Username').textContent = match.player1 || 'TBD';
    document.getElementById('judgeP1App').textContent = p1User?.editingApp || 'Animanga Editor';
    document.getElementById('judgeP1Avatar').innerHTML = match.player1 ? match.player1.substring(0, 2).toUpperCase() : '?';
    document.getElementById('judgeP1ScoreDisplay').textContent = match.score1 !== null ? `${match.score1} / 10` : '-- / 10';
    document.getElementById('judgeP1InputLabel').textContent = match.player1 || 'Player 1';

    // Player 2 Info
    const p2User = window.esportsStore.getUserByUsername(match.player2);
    const p2Part = tourn.participants.find(p => p.username === match.player2);
    document.getElementById('judgeP2Username').textContent = match.player2 || 'TBD';
    document.getElementById('judgeP2App').textContent = p2User?.editingApp || 'Animanga Editor';
    document.getElementById('judgeP2Avatar').innerHTML = match.player2 ? match.player2.substring(0, 2).toUpperCase() : '?';
    document.getElementById('judgeP2ScoreDisplay').textContent = match.score2 !== null ? `${match.score2} / 10` : '-- / 10';
    document.getElementById('judgeP2InputLabel').textContent = match.player2 || 'Player 2';

    // Render Video Players
    const p1PlayerContainer = document.getElementById('judgeP1PlayerContainer');
    p1PlayerContainer.innerHTML = window.AnonPlayerSystem.renderPlayerHTML({
      url: p1Part?.submittedLink,
      title: `${match.player1}'s Edit`
    });

    const p2PlayerContainer = document.getElementById('judgeP2PlayerContainer');
    p2PlayerContainer.innerHTML = window.AnonPlayerSystem.renderPlayerHTML({
      url: p2Part?.submittedLink,
      title: `${match.player2}'s Edit`
    });

    // Score inputs
    document.getElementById('judgeScoreInput1').value = match.score1 !== null ? match.score1 : '';
    document.getElementById('judgeScoreInput2').value = match.score2 !== null ? match.score2 : '';
    document.getElementById('judgeNotesInput').value = match.notes || '';

    // Admin vs Spectator panel visibility
    const adminPanel = document.getElementById('judgeAdminControlPanel');
    const spectatorNotice = document.getElementById('judgeSpectatorNotice');

    if (isAdmin) {
      adminPanel.classList.remove('hidden');
      spectatorNotice.classList.add('hidden');
    } else {
      adminPanel.classList.add('hidden');
      spectatorNotice.classList.remove('hidden');
    }

    // Initialize mobile video tab to Player 1 on mobile
    this.switchMobileBattleTab('p1');

    modal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeBattleModal() {
    const modal = document.getElementById('judgingModal');
    if (modal) modal.classList.add('hidden');
  }

  switchMobileBattleTab(tab) {
    const p1 = document.getElementById('judgeP1ArenaWrapper');
    const p2 = document.getElementById('judgeP2ArenaWrapper');
    const b1 = document.getElementById('mobileBattleTabP1');
    const b2 = document.getElementById('mobileBattleTabP2');
    const bBoth = document.getElementById('mobileBattleTabBoth');

    if (!p1 || !p2) return;

    if (tab === 'p1') {
      p1.classList.remove('hidden');
      p2.classList.add('hidden');
      if (b1) b1.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-violet-600 text-white shadow-md text-center';
      if (b2) b2.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
      if (bBoth) bBoth.className = 'py-1.5 px-3 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
    } else if (tab === 'p2') {
      p1.classList.add('hidden');
      p2.classList.remove('hidden');
      if (b2) b2.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-cyan-600 text-white shadow-md text-center';
      if (b1) b1.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
      if (bBoth) bBoth.className = 'py-1.5 px-3 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
    } else {
      p1.classList.remove('hidden');
      p2.classList.remove('hidden');
      if (bBoth) bBoth.className = 'py-1.5 px-3 text-xs font-display font-bold rounded-lg transition-all bg-slate-700 text-white shadow-md text-center';
      if (b1) b1.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
      if (b2) b2.className = 'flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center';
    }
  }

  stepScore(playerNum, delta) {
    const input = document.getElementById(`judgeScoreInput${playerNum}`);
    if (input) {
      let val = parseFloat(input.value) || 0;
      val = Math.max(0, Math.min(10, Math.round((val + delta) * 10) / 10));
      input.value = val.toFixed(1);
    }
  }

  submitJudgeScores(e) {
    e.preventDefault();
    const currentUser = window.esportsStore.getCurrentUser();
    if (!currentUser) return;

    const s1 = document.getElementById('judgeScoreInput1').value;
    const s2 = document.getElementById('judgeScoreInput2').value;
    const notes = document.getElementById('judgeNotesInput').value;

    const res = window.esportsStore.scoreMatch(
      this.selectedTournamentId,
      this.activeMatchId,
      s1,
      s2,
      currentUser.username,
      notes
    );

    if (res.success) {
      this.closeBattleModal();

      if (res.grandWinner) {
        // Grand Finals Winner Fanfare!
        if (window.soundEngine) window.soundEngine.playChampionFanfare();
        alert(`🏆 TOURNAMENT CHAMPION CROWNED: ${res.grandWinner} has won the Grand Finals! The Secret Prize Link is now unlocked!`);
      } else {
        if (window.soundEngine) window.soundEngine.playScoreLock();
      }

      this.render();
    } else {
      alert(res.message);
    }
  }

  /* ==========================================================================
     Mode 3: Interactive Node Graph Wiring Engine
     ========================================================================== */
  handlePortClick(portEl) {
    const isInput = portEl.classList.contains('input-port');
    const isOutput = portEl.classList.contains('output-port');

    if (isOutput) {
      // Select source player port
      if (this.nodeWiringState.selectedPort) {
        this.nodeWiringState.selectedPort.classList.remove('connecting');
      }
      this.nodeWiringState.selectedPort = portEl;
      portEl.classList.add('connecting');
      if (window.soundEngine) window.soundEngine.playClick();
    } else if (isInput && this.nodeWiringState.selectedPort) {
      // Connect source player to this match slot
      const username = this.nodeWiringState.selectedPort.getAttribute('data-username');
      const matchIdx = portEl.getAttribute('data-match-idx');
      const slot = portEl.getAttribute('data-slot');

      const label = document.getElementById(`slot_${matchIdx}_${slot}_label`);
      if (label) {
        label.textContent = username;
        label.classList.add('text-cyan-300', 'font-bold');
      }

      this.nodeWiringState.selectedPort.classList.remove('connecting');
      this.nodeWiringState.selectedPort = null;

      if (window.soundEngine) window.soundEngine.playConnect();
      this.drawNodeGraphWires();
    }
  }

  autoWireNodeGraph(tournamentId) {
    const tourn = window.esportsStore.getTournamentById(tournamentId);
    if (!tourn || !tourn.participants) return;

    tourn.participants.slice(0, 8).forEach((p, idx) => {
      const matchIdx = Math.floor(idx / 2) + 1;
      const slot = (idx % 2) + 1;
      const label = document.getElementById(`slot_${matchIdx}_${slot}_label`);
      if (label) {
        label.textContent = p.username;
        label.classList.add('text-cyan-300', 'font-bold');
      }
    });

    if (window.soundEngine) window.soundEngine.playConnect();
    this.drawNodeGraphWires();
  }

  resetNodeGraphWires(tournamentId) {
    [1, 2, 3, 4].forEach(idx => {
      [1, 2].forEach(slot => {
        const label = document.getElementById(`slot_${idx}_${slot}_label`);
        if (label) {
          label.textContent = `Empty Slot ${slot}`;
          label.classList.remove('text-cyan-300', 'font-bold');
        }
      });
    });

    const svg = document.getElementById('nodeSvgLayer');
    if (svg) {
      const paths = svg.querySelectorAll('.node-bezier-wire');
      paths.forEach(p => p.remove());
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  drawNodeGraphWires() {
    const svg = document.getElementById('nodeSvgLayer');
    const container = document.getElementById('nodeCanvasContainer');
    if (!svg || !container) return;

    // Remove existing wire paths
    const oldWires = svg.querySelectorAll('.node-bezier-wire');
    oldWires.forEach(w => w.remove());

    const containerRect = container.getBoundingClientRect();

    [1, 2, 3, 4].forEach(idx => {
      [1, 2].forEach(slot => {
        const label = document.getElementById(`slot_${idx}_${slot}_label`);
        if (label && !label.textContent.startsWith('Empty Slot')) {
          const username = label.textContent.trim();
          const playerNode = document.getElementById(`node_player_${username}`);
          const matchPort = document.querySelector(`.input-port[data-match-idx="${idx}"][data-slot="${slot}"]`);

          if (playerNode && matchPort) {
            const pPort = playerNode.querySelector('.output-port');
            if (pPort) {
              const pRect = pPort.getBoundingClientRect();
              const mRect = matchPort.getBoundingClientRect();

              const startX = pRect.right - containerRect.left;
              const startY = pRect.top + pRect.height / 2 - containerRect.top;
              const endX = mRect.left - containerRect.left;
              const endY = mRect.top + mRect.height / 2 - containerRect.top;

              const cX1 = startX + (endX - startX) * 0.5;
              const cY1 = startY;
              const cX2 = startX + (endX - startX) * 0.5;
              const cY2 = endY;

              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', `M ${startX} ${startY} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${endX} ${endY}`);
              path.setAttribute('stroke', 'url(#wireGradient)');
              path.setAttribute('stroke-width', '3');
              path.setAttribute('fill', 'none');
              path.setAttribute('filter', 'url(#wireGlow)');
              path.setAttribute('class', 'node-bezier-wire');

              svg.appendChild(path);
            }
          }
        }
      });
    });
  }

  /* ==========================================================================
     Discord-Style Chats
     ========================================================================== */
  handleSendMessage(e, channelId) {
    e.preventDefault();
    const currentUser = window.esportsStore.getCurrentUser();
    if (!currentUser) {
      this.openAuthModal();
      return;
    }

    const input = document.getElementById('chatInputText');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const announcementCheckbox = document.getElementById('chatAnnouncementCheckbox');
    const isAnnouncement = announcementCheckbox ? announcementCheckbox.checked : false;

    window.esportsStore.sendMessage(channelId, currentUser.username, text, isAnnouncement);
    input.value = '';
    if (announcementCheckbox) announcementCheckbox.checked = false;

    if (window.soundEngine) window.soundEngine.playClick();
    this.render();

    setTimeout(() => {
      const hist = document.getElementById('chatMessageHistory');
      if (hist) hist.scrollTop = hist.scrollHeight;
      const newInput = document.getElementById('chatInputText');
      if (newInput) newInput.focus();
    }, 40);
  }

  deleteChatMessage(messageId) {
    if (confirm('Delete this message?')) {
      window.esportsStore.deleteMessage(this.activeChatChannel, messageId);
      if (window.soundEngine) window.soundEngine.playClick();
      this.render();
    }
  }

  /* ==========================================================================
     User Profile Management
     ========================================================================== */
  toggleEditProfileForm() {
    const sec = document.getElementById('profileEditSection');
    if (sec) {
      sec.classList.toggle('hidden');
    }
  }

  openAvatarPrompt() {
    const newAvatar = prompt('Enter 1:1 Aspect Ratio Avatar Image URL:');
    if (newAvatar && newAvatar.trim()) {
      const currentUser = window.esportsStore.getCurrentUser();
      if (currentUser) {
        window.esportsStore.updateUserProfile(currentUser.username, { avatar: newAvatar.trim() });
        this.render();
      }
    }
  }

  handleSaveProfile(e) {
    e.preventDefault();
    const currentUser = window.esportsStore.getCurrentUser();
    if (!currentUser) return;

    const name = document.getElementById('editProfileNameInput')?.value.trim();
    const username = document.getElementById('editProfileUsernameInput')?.value.trim();
    const password = document.getElementById('editProfilePasswordInput')?.value;
    const avatar = document.getElementById('editProfileAvatarInput')?.value.trim();
    const app = document.getElementById('editProfileAppInput')?.value;
    const bio = document.getElementById('editProfileBioInput')?.value.trim();
    const anime = document.getElementById('editProfileAnimeInput')?.value.trim();

    const updates = {
      name: name || currentUser.name || username,
      avatar: avatar || currentUser.avatar,
      editingApp: app,
      bio,
      favAnime: anime
    };

    if (username) {
      updates.username = username;
    }

    if (password && password.trim().length > 0) {
      updates.password = password;
    }

    const res = window.esportsStore.updateUserProfile(currentUser.username, updates);

    if (res.success) {
      if (window.soundEngine) window.soundEngine.playScoreLock();
      alert('Profile, credentials, and settings updated successfully!');
      this.render();
    } else {
      alert(res.message || 'Failed to update profile.');
    }
  }

  /* ==========================================================================
     Admin Role Manager (Exclusive for Administrator1 / Owner)
     ========================================================================== */
  promoteUser(username) {
    const res = window.esportsStore.updateUserRole(username, 'Admin');
    if (res.success) {
      if (window.soundEngine) window.soundEngine.playScoreLock();
      alert(`User ${username} has been successfully promoted to Admin!`);
      this.render();
    } else {
      alert(res.message);
    }
  }

  demoteUser(username) {
    const res = window.esportsStore.updateUserRole(username, 'Participant');
    if (res.success) {
      if (window.soundEngine) window.soundEngine.playScoreLock();
      alert(`Admin ${username} has been demoted back to Participant.`);
      this.render();
    } else {
      alert(res.message);
    }
  }

  /* ==========================================================================
     Theme & Settings
     ========================================================================== */
  setTheme(themeName) {
    const settings = window.esportsStore.getSettings();
    settings.theme = themeName;
    window.esportsStore.saveSettings(settings);
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  }

  toggleAudio() {
    if (window.soundEngine) {
      const isEnabled = window.soundEngine.toggleSound();
      const settings = window.esportsStore.getSettings();
      settings.sound = isEnabled;
      window.esportsStore.saveSettings(settings);
      this.render();
    }
  }

  resetDemoData() {
    if (confirm('Reset database to default pre-seeded accounts & demo tournament?')) {
      window.esportsStore.initDatabase(true);
      if (window.soundEngine) window.soundEngine.playConnect();
      alert('Database restored successfully!');
      this.render();
    }
  }
}

// Bootstrap Application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new EsportsApp();
});
