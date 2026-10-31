/**
 * Supabase Connection Setup Modal Component
 * In-App Cloud Configuration, Connection Testing, and 1-Click SQL Schema Copy
 */

class SupabaseModalComponent {
  static render() {
    const conf = window.supabaseClientEngine?.getConfig() || { url: '', anonKey: '' };
    const isConnected = window.supabaseClientEngine?.isConnected;

    return `
      <div id="supabaseSetupModal" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 modal-overlay hidden">
        <div class="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto glass-card rounded-2xl border-2 border-cyan-500/50 p-4 sm:p-6 md:p-8 shadow-2xl">
          <!-- Close button -->
          <button 
            onclick="window.app.closeSupabaseModal()" 
            class="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
            <div class="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 text-xl font-bold font-mono">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Cloud Architecture</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                  ${isConnected ? '🟢 Cloud Active' : '🟡 Local Fallback Mode'}
                </span>
              </div>
              <h3 class="font-display font-black text-2xl text-white tracking-wide">
                Supabase Cloud Connection
              </h3>
            </div>
          </div>

          <p class="text-xs text-slate-300 mb-5 leading-relaxed">
            Connect this app to your <strong>Supabase Project</strong> to enable cloud database synchronization (PostgreSQL) and live multi-device chat streaming via <strong>Supabase Realtime</strong>. If not connected, the app runs 100% standalone using your browser's persistent local storage.
          </p>

          <!-- Connection Form -->
          <form onsubmit="window.app.handleSaveSupabaseConfig(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <input 
                type="url" 
                id="supabaseUrlInput" 
                required 
                value="${conf.url || ''}"
                placeholder="https://your-project-id.supabase.co" 
                class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">
                Found in your Supabase Dashboard under <strong>Project Settings -> API -> Project URL</strong>.
              </span>
            </div>

            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Supabase Anon / Public API Key
              </label>
              <textarea 
                id="supabaseAnonKeyInput" 
                required 
                rows="2" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-cyan-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 break-all"
              >${conf.anonKey || ''}</textarea>
              <span class="text-[10px] text-slate-400 mt-1 block">
                Found under <strong>Project Settings -> API -> Project API keys -> anon public</strong>.
              </span>
            </div>

            <!-- Test Feedback Alert -->
            <div id="supabaseConnectionAlert" class="hidden p-3 rounded-lg text-xs font-mono font-medium"></div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  type="submit" 
                  class="cyber-btn cyber-btn-cyan text-xs py-2 px-5 flex-1 sm:flex-none shadow-md"
                >
                  Save & Connect to Cloud
                </button>
                <button 
                  type="button" 
                  onclick="window.app.testSupabaseConnection()" 
                  class="cyber-btn cyber-btn-ghost text-xs py-2 px-3 border border-slate-700"
                >
                  Test Connection
                </button>
              </div>

              ${isConnected ? `
                <button 
                  type="button" 
                  onclick="window.app.disconnectSupabase()" 
                  class="text-xs text-rose-400 hover:text-rose-300 underline font-mono"
                >
                  Disconnect (Use Local Storage)
                </button>
              ` : ''}
            </div>
          </form>

          <!-- SQL Schema Copy Card -->
          <div class="mt-6 pt-5 border-t border-cyan-500/20 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-display font-bold text-white block">PostgreSQL Database Schema</span>
                <span class="text-[10px] text-slate-400">Run this SQL in your Supabase Dashboard to create all 5 tables & enable Realtime.</span>
              </div>
              <button 
                type="button" 
                onclick="window.app.copySupabaseSchema()" 
                class="cyber-btn cyber-btn-violet text-[11px] py-1.5 px-3"
              >
                Copy SQL Schema
              </button>
            </div>

            <details class="text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <summary class="cursor-pointer text-cyan-400 font-mono text-[11px] select-none">
                Preview SQL Migration Script (Click to Expand)
              </summary>
              <pre class="mt-2 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-48 p-2 bg-black/60 rounded">-- 5 Tables: profiles, tournaments, submissions, matches, chats
-- Run in Supabase Dashboard -> SQL Editor
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'participant',
  pfp_url TEXT,
  bio TEXT,
  editing_software TEXT,
  favorite_anime TEXT,
  stats_tournaments_joined NUMERIC DEFAULT 0,
  stats_matches_won NUMERIC DEFAULT 0,
  stats_avg_score NUMERIC DEFAULT 0.0,
  unlocked_prizes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  banner_url TEXT,
  pfp_url TEXT,
  deadline TIMESTAMPTZ,
  prize_link TEXT,
  grid_mode TEXT DEFAULT 'compartments',
  status TEXT DEFAULT 'registration',
  participants JSONB DEFAULT '[]'::jsonb,
  winner_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  anonmp4_link TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  bracket_section TEXT NOT NULL DEFAULT 'main',
  match_number INTEGER NOT NULL DEFAULT 1,
  player1_id TEXT,
  player2_id TEXT,
  player1_score NUMERIC,
  player2_score NUMERIC,
  winner_id TEXT,
  loser_id TEXT,
  node_position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
  judged_by TEXT,
  notes TEXT,
  status TEXT DEFAULT 'WAITING',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL DEFAULT 'general',
  user_id TEXT,
  username TEXT NOT NULL,
  user_pfp TEXT,
  user_role TEXT NOT NULL DEFAULT 'participant',
  message TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;</pre>
            </details>
          </div>
        </div>
      </div>
    `;
  }
}

window.SupabaseModalComponent = SupabaseModalComponent;
