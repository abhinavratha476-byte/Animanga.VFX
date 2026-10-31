/**
 * Supabase Client Cloud Architecture Engine (Browser JavaScript)
 * Handles Cloud PostgreSQL Sync, Supabase Realtime, and Fallback State
 */

class SupabaseClientEngine {
  constructor() {
    this.configKey = 'animanga_supabase_config_v1';
    this.client = null;
    this.isConnected = false;
    this.realtimeChannel = null;
    this.initClient();
  }

  getConfig() {
    try {
      const stored = localStorage.getItem(this.configKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Default Supabase Cloud Production Credentials (Zero Setup Required for Visitors)
    return {
      url: 'https://oqjqeizeronlwrorrcpm.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xanFlaXplcm9ubHdyb3JyY3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzU3OTcsImV4cCI6MjEwOTAxMTc5N30.mOmZ7rXZ2XHj0uyY57bsS68sZ6mFZnG7MQQkMApxYHo'
    };
  }

  saveConfig(url, anonKey) {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    if (!cleanUrl.startsWith('http')) return false;

    localStorage.setItem(this.configKey, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    return this.initClient();
  }

  clearConfig() {
    localStorage.removeItem(this.configKey);
    this.client = null;
    this.isConnected = false;
    if (this.realtimeChannel) {
      try { this.realtimeChannel.unsubscribe(); } catch (e) {}
    }
  }

  initClient() {
    const conf = this.getConfig();
    if (!conf || !conf.url || !conf.anonKey) {
      this.client = null;
      this.isConnected = false;
      return false;
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        this.client = window.supabase.createClient(conf.url, conf.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true },
          realtime: { params: { eventsPerSecond: 15 } }
        });
        this.isConnected = true;
        this.initRealtimeSubscriptions();
        this.autoSeedAdmins();
        return true;
      }
    } catch (e) {
      console.warn('Supabase initialization error', e);
    }
    return false;
  }

  getClient() {
    if (!this.client) this.initClient();
    return this.client;
  }

  // Realtime multi-user streaming for chats, matches, & tournaments
  initRealtimeSubscriptions() {
    if (!this.client) return;

    try {
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
      }

      this.realtimeChannel = this.client
        .channel('animanga_cloud_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
          window.dispatchEvent(new CustomEvent('supabase:chat-sync', { detail: payload }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
          window.dispatchEvent(new CustomEvent('supabase:match-sync', { detail: payload }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, (payload) => {
          window.dispatchEvent(new CustomEvent('supabase:tournament-sync', { detail: payload }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          window.dispatchEvent(new CustomEvent('supabase:profile-sync', { detail: payload }));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Cloud Realtime Connected!');
          }
        });
    } catch (e) {
      console.warn('Realtime subscription warning', e);
    }
  }

  // Test Supabase Connection & Table Access
  async testConnection() {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client not initialized. Check your URL & Key.' };
    }

    try {
      const { data, error } = await client.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Connected to Supabase project, but tables are not yet created! Run the provided SQL migration in your Supabase SQL Editor.'
          };
        }
        return { success: false, message: `Supabase Error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase Cloud Database & Tables!' };
    } catch (e) {
      return { success: false, message: e.message || 'Connection test failed.' };
    }
  }

  // Auto-seed pre-seeded Admins into Supabase if missing
  async autoSeedAdmins() {
    const client = this.getClient();
    if (!client) return;

    try {
      const { data } = await client.from('profiles').select('username').eq('username', 'administrator1').maybeSingle();
      if (!data) {
        const defaultAdmins = [
          {
            username: 'administrator1',
            password_hash: 'Moon#Drive476',
            display_name: 'Administrator',
            role: 'owner',
            pfp_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop&q=80',
            bio: 'Supreme Tournament Architect & Guild President.'
          },
          {
            username: 'admin1',
            password_hash: 'MoonDrive',
            display_name: 'Admin 1',
            role: 'admin',
            pfp_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=300&fit=crop&q=80',
            bio: 'Senior Judge & AMV Flow Inspector.'
          },
          {
            username: 'admin2',
            password_hash: 'MoonDrive',
            display_name: 'Admin 2',
            role: 'admin',
            pfp_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop&q=80',
            bio: 'Esports Bracket Specialist & Audio Sync Referee.'
          },
          {
            username: 'admin3',
            password_hash: 'MoonDrive',
            display_name: 'Admin 3',
            role: 'admin',
            pfp_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=300&fit=crop&q=80',
            bio: '3D Compositing & Impact Frame Master Judge.'
          },
          {
            username: 'admin4',
            password_hash: 'MoonDrive',
            display_name: 'Admin 4',
            role: 'admin',
            pfp_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&q=80',
            bio: 'Color Grading & Particle Effects Specialist.'
          },
          {
            username: 'admin5',
            password_hash: 'MoonDrive',
            display_name: 'Admin 5',
            role: 'admin',
            pfp_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=300&fit=crop&q=80',
            bio: 'Typography & Motion Graphics Judge.'
          }
        ];
        await client.from('profiles').upsert(defaultAdmins, { onConflict: 'username' });
      }
    } catch (e) {}
  }
}

window.supabaseClientEngine = new SupabaseClientEngine();
