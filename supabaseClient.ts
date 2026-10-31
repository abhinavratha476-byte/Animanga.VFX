/**
 * Supabase Client Configuration & Cloud Architecture Engine
 * Handles PostgreSQL operations, Realtime subscriptions, and auto-seeding.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ProfileRecord {
  id?: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: 'owner' | 'admin' | 'participant';
  pfp_url: string;
  bio?: string;
  editing_software?: string;
  favorite_anime?: string;
  stats_tournaments_joined?: number;
  stats_matches_won?: number;
  stats_avg_score?: number;
  unlocked_prizes?: any[];
}

export interface TournamentRecord {
  id: string;
  title: string;
  description: string;
  rules: string[];
  banner_url: string;
  pfp_url: string;
  deadline: string;
  prize_link: string;
  grid_mode: 'normal' | 'compartments' | 'node';
  status: 'registration' | 'active' | 'completed';
  participants: any[];
  winner_id?: string;
  created_by?: string;
}

export interface MatchRecord {
  id: string;
  tournament_id: string;
  round_number: number;
  bracket_section: 'main' | 'compartments' | 'grand_finals' | 'normal';
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  player1_score?: number;
  player2_score?: number;
  winner_id?: string;
  loser_id?: string;
  next_match_win?: string;
  next_match_lose?: string;
  node_position?: { x: number; y: number };
  judged_by?: string;
  notes?: string;
  status: string;
}

export interface ChatRecord {
  id?: string;
  tournament_id: string;
  user_id?: string;
  username: string;
  user_pfp?: string;
  user_role: string;
  message: string;
  is_announcement?: boolean;
  created_at?: string;
}

declare global {
  interface Window {
    supabase?: any;
    supabaseClientEngine?: any;
  }
}

export class SupabaseClientEngine {
  private client: any = null;
  private configKey = 'animanga_supabase_config_v1';
  public isConnected = false;
  private realtimeChannel: any = null;

  constructor() {
    this.initClient();
  }

  public getConfig(): SupabaseConfig | null {
    try {
      const stored = localStorage.getItem(this.configKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Check Vite environment variables if available
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const envUrl = (import.meta as any).env.VITE_SUPABASE_URL;
      const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
      if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
    }
    // Default Supabase Cloud Production Credentials (Zero Setup Required for Visitors)
    return {
      url: 'https://oqjqeizeronlwrorrcpm.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xanFlaXplcm9ubHdyb3JyY3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzU3OTcsImV4cCI6MjEwOTAxMTc5N30.mOmZ7rXZ2XHj0uyY57bsS68sZ6mFZnG7MQQkMApxYHo'
    };
  }

  public saveConfig(url: string, anonKey: string): boolean {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    if (!cleanUrl.startsWith('http')) return false;

    localStorage.setItem(this.configKey, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    return this.initClient();
  }

  public clearConfig(): void {
    localStorage.removeItem(this.configKey);
    this.client = null;
    this.isConnected = false;
    if (this.realtimeChannel) {
      try { this.realtimeChannel.unsubscribe(); } catch (e) {}
    }
  }

  public initClient(): boolean {
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

  public getClient() {
    if (!this.client) this.initClient();
    return this.client;
  }

  // Realtime multi-user streaming for chats, matches, & tournaments
  private initRealtimeSubscriptions() {
    if (!this.client) return;

    try {
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
      }

      this.realtimeChannel = this.client
        .channel('animanga_cloud_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload: any) => {
          window.dispatchEvent(new CustomEvent('supabase:chat-sync', { detail: payload }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload: any) => {
          window.dispatchEvent(new CustomEvent('supabase:match-sync', { detail: payload }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, (payload: any) => {
          window.dispatchEvent(new CustomEvent('supabase:tournament-sync', { detail: payload }));
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Cloud Realtime Connected!');
          }
        });
    } catch (e) {
      console.warn('Realtime subscription warning', e);
    }
  }

  // Test Supabase Connection & Table Access
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client not initialized. Check your URL & Key.' };
    }

    try {
      const { data, error } = await client.from('profiles').select('username').limit(1);
      if (error) {
        // Table might not exist yet; explain clearly
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Connected to Supabase project, but tables are not yet created! Click "Copy SQL Schema" and run it in your Supabase SQL Editor.'
          };
        }
        return { success: false, message: `Supabase Error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase Cloud Database & Tables!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection test failed.' };
    }
  }

  // Auto-seed pre-seeded Admins into Supabase if missing
  public async autoSeedAdmins(): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      const { data } = await client.from('profiles').select('username').eq('username', 'administrator1').maybeSingle();
      if (!data) {
        const defaultAdmins: ProfileRecord[] = [
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

export const supabaseEngine = new SupabaseClientEngine();
if (typeof window !== 'undefined') {
  window.supabaseClientEngine = supabaseEngine;
}
