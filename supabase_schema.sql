-- ==========================================================================
-- ANIMANGA.VFX · Supabase Cloud PostgreSQL Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==========================================================================

-- 1. PROFILES TABLE (User Accounts & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('owner', 'admin', 'participant')),
  pfp_url TEXT DEFAULT 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop&q=80',
  bio TEXT DEFAULT 'Animanga video editor active in tournament battles.',
  editing_software TEXT DEFAULT 'After Effects',
  favorite_anime TEXT DEFAULT 'Jujutsu Kaisen',
  stats_tournaments_joined NUMERIC DEFAULT 0,
  stats_matches_won NUMERIC DEFAULT 0,
  stats_avg_score NUMERIC DEFAULT 0.0,
  unlocked_prizes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY DEFAULT ('tourn_' || replace(gen_random_uuid()::text, '-', '')),
  title TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&h=900&fit=crop&q=80',
  pfp_url TEXT DEFAULT 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80',
  deadline TIMESTAMPTZ,
  prize_link TEXT,
  grid_mode TEXT DEFAULT 'compartments' CHECK (grid_mode IN ('normal', 'compartments', 'node')),
  status TEXT DEFAULT 'registration' CHECK (status IN ('registration', 'active', 'completed')),
  participants JSONB DEFAULT '[]'::jsonb,
  winner_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBMISSIONS TABLE (AnonMP4 Video Edit Links)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  anonmp4_link TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATCHES TABLE (All 3 Grid Modes: Normal, Compartments, Node)
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  bracket_section TEXT NOT NULL DEFAULT 'main' CHECK (bracket_section IN ('main', 'compartments', 'grand_finals', 'normal')),
  match_number INTEGER NOT NULL DEFAULT 1,
  player1_id TEXT,
  player2_id TEXT,
  player1_score NUMERIC,
  player2_score NUMERIC,
  winner_id TEXT,
  loser_id TEXT,
  next_match_win TEXT,
  next_match_lose TEXT,
  node_position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
  judged_by TEXT,
  notes TEXT,
  status TEXT DEFAULT 'WAITING',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHATS TABLE (Discord-Style Realtime Messages)
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

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable public read/write access for simplicity, or tailor with auth rules
-- ==========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all users via Anon Key
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read on tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tournaments" ON public.tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tournaments" ON public.tournaments FOR DELETE USING (true);

CREATE POLICY "Allow public read on submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on submissions" ON public.submissions FOR UPDATE USING (true);

CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Allow public read on chats" ON public.chats FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chats" ON public.chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on chats" ON public.chats FOR DELETE USING (true);

-- ==========================================================================
-- ENABLE REALTIME FOR CHATS, MATCHES & TOURNAMENTS
-- ==========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==========================================================================
-- PRE-SEEDED ADMIN ACCOUNTS (Auto-Seeded if Not Existing)
-- ==========================================================================
INSERT INTO public.profiles (username, password_hash, display_name, role, pfp_url, bio)
VALUES 
  ('administrator1', 'Moon#Drive476', 'Administrator', 'owner', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop&q=80', 'Supreme Tournament Architect & Guild President.'),
  ('admin1', 'MoonDrive', 'Admin 1', 'admin', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=300&fit=crop&q=80', 'Senior Judge & AMV Flow Inspector.'),
  ('admin2', 'MoonDrive', 'Admin 2', 'admin', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop&q=80', 'Esports Bracket Specialist & Audio Sync Referee.'),
  ('admin3', 'MoonDrive', 'Admin 3', 'admin', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=300&fit=crop&q=80', '3D Compositing & Impact Frame Master Judge.'),
  ('admin4', 'MoonDrive', 'Admin 4', 'admin', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&q=80', 'Color Grading & Particle Effects Specialist.'),
  ('admin5', 'MoonDrive', 'Admin 5', 'admin', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=300&fit=crop&q=80', 'Typography & Motion Graphics Judge.')
ON CONFLICT (username) DO NOTHING;
