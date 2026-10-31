# ANIMANGA.VFX · Animanga Video Edit Tournaments Web Application

A complete, production-ready, standalone, and responsive web application designed for hosting **Animanga Video Edit Tournaments** (Instagram Reels, TikTok, and AMV style edits).

Built with a **Cyber-Anime Esports aesthetic**, running **100% standalone with ZERO external cloud backend setup** (no Supabase or Firebase required). Powered by a persistent browser storage engine (`localStorage` + `IndexedDB` + `BroadcastChannel` for real-time multi-tab syncing) and an **AnonMP4 Link Submission & Embedded Player System**.

---

## 🎬 Cinematic 10-Second Loading Screen
On app startup, an anime-cyber intro screen runs for **exactly 10.0 seconds**:
- **App Title**: `ANIMANGA.VFX · Esports Edit Tournament Arena`
- **Branding**: **`Made By NAXIMAX STUDIOS / Abhinav`** with a glowing cyberpunk badge
- **Real-Time Countdown & Progress Bar**: Smooth 60fps countdown (`10.0s -> 0.0s`) and percentage counter (`0% -> 100%`)
- **System Initialization Ticker**: Displays real-time boot status messages (Matrix boot, 60fps shaders, NAXIMAX STUDIOS protocols, Compartments grid) before smoothly fading into the main application.

---

## ⚡ Quick Start

### Option 1: Direct File Launch
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
You can serve the application locally with Python:
```bash
python -m http.server 8080
```
Then visit: `http://localhost:8080/`

---

## 👑 Authentication & Pre-Seeded Accounts

The application implements a strict **Username + Password** authentication system with **no email, phone number, or verification required**.

### Pre-Seeded Accounts & Credentials

| Role / Title | Username | Password | Key Permissions |
| :--- | :--- | :--- | :--- |
| **Super Administrator (`Owner / President`)** | `Administrator1` | `Moon#Drive476` | **Supreme Authority**: Exclusive **"Admin Role Manager"** panel in `SETTINGS` to promote any registered user to `Admin` or demote/remove existing `Admin` accounts back to `Participant`. Full control over all tournaments, brackets, and judging. |
| **Default Admin 1** | `admin1` | `MoonDrive` | Create/edit/delete tournaments, kick/add participants, control all 3 Match Grid modes, judge edits out of 10, moderate chats. |
| **Default Admin 2** | `admin2` | `MoonDrive` | Same admin powers as Admin 1. |
| **Default Admin 3** | `admin3` | `MoonDrive` | Same admin powers as Admin 1. |
| **Default Admin 4** | `admin4` | `MoonDrive` | Same admin powers as Admin 1. |
| **Default Admin 5** | `admin5` | `MoonDrive` | Same admin powers as Admin 1. |

> 👤 **Participants**: Participants can self-register anytime in seconds with a unique username and password.

### ⚙️ Profile Customization (Name, Username & Password Editing)
Every user (Admins and Participants alike) can edit their profile at any time in the `PROFILE` tab:
- **Display / Full Name**
- **Login Username (Handle)** — with automatic validation and real-time cascading across all tournament brackets and chats
- **Password** — secure in-app credential updates
- **1:1 Square Avatar Image URL**
- **Primary Editing Software / App** (After Effects, Alight Motion, Premiere Pro, CapCut PC, Blender, DaVinci Resolve, Motion Ninja, Kdenlive)
- **Favorite Anime / Manga**
- **Bio & Editing Philosophy**

---

## 🎮 Core Features & Architecture

### 1. Functional Cyber-Anime UI & Themes
- **Dark Theme (Default):** Deep obsidian background (`#08090E`), translucent frosted-glass cards (`backdrop-filter: blur(14px)`, `rgba(17, 20, 30, 0.85)`), subtle glowing borders (`rgba(139, 92, 246, 0.25)`), electric violet (`#8B5CF6`), cyber crimson (`#F43F5E`), and neon cyan (`#06B6D4`) accents.
- **Light Theme (Toggle in Settings):** Clean alabaster background (`#F8FAFC`), crisp white elevated cards (`#FFFFFF`), deep slate text (`#0F172A`), and vibrant badge accents.
- **Typography:** Bold esports display font (`Space Grotesk` / `Rajdhani`) for tournament headers, bracket titles, and scores; clean geometric sans (`Inter`) for chat and rules.
- **Sound FX Engine:** Built-in procedural Web Audio API synthesizer for futuristic button clicks, whooshes, match start tones, judge lock chimes, and victory fanfare (with sound mute toggle).
- **Cross-Device Layout:**
  - **PC / Desktop:** Sleek collapsible Left Sidebar with active user status card, brand header, navigation tabs, and sound controls.
  - **Mobile:** Floating Glass Bottom Navigation Bar with 4 Core Tabs: `TOURNAMENTS`, `PROFILE`, `CHATS`, and `SETTINGS`.

### 2. Tournament Creation & Management (Admin Only)
- **16:9 Wide Banner:** Upload or paste banner image with cyber anime presets.
- **1:1 Square Tournament Crest (PFP):** Strictly enforced 1:1 square aspect ratio.
- **Formatted Rules & Regulations Panel:** 60fps locked render, watermark required, audio sync rules, duration restrictions.
- **Live Countdown Badge:** Real-time ticker badge (`DD:HH:MM:SS`) that locks edit submissions automatically once expired.
- **Secret Winner Prize Link:** Hidden from all participants; only unlocks inside the winner's dashboard and tournament podium upon winning the Grand Finals.
- **Participant Roster Manager:** Admins can manually add registered users to a tournament or kick/disqualify participants.

### 3. AnonMP4 Link Submission & Embedded Player System
- **Edit Link Input Box:** Supports `anonmp4.to` watch links, embed links (`https://www.anonmp4.to/embed/...`), and direct `.mp4`/`.webm` URLs.
- **"How to Host Your Edit on AnonMP4" Step-by-Step Guide Card:**
  1. **Step 1:** Click **"Open AnonMP4.to"** (100% free, anonymous, up to 20 GB).
  2. **Step 2:** Drag & drop finished Animanga Edit video into upload zone.
  3. **Step 3:** Copy the generated Watch Link or Embed URL.
  4. **Step 4:** Paste into submission box and click "Submit Edit".
- **Embedded Player & Quick Watch Button:** In every tournament roster and 1v1 bracket matchup card, provides both an **In-App Embedded Video Player** and a prominent **"Watch Edit on AnonMP4 ↗"** quick-open button.

### 4. The 3-Mode Match Grid Maker (Admin Control)
- **Mode 1: Normal Grid (Single Elimination):**
  - Classic 1v1 knockout bracket (Quarterfinals -> Semifinals -> Finals).
  - "Quick Match" button to shuffle and pair all participants in one click.
- **Mode 2: "COMPARTMENTS" Grid (Main Bracket + Losers Redemption):**
  - Visually divided into two color-coded zones: **MAIN MATCH BRACKET** (Violet glow) and **"COMPARTMENTS" SECTION** (Crimson/Amber glow).
  - **The COMPARTMENTS Rule:** Any player who loses a 1v1 match in the Main Bracket is automatically sent to the **"COMPARTMENTS"** section.
  - Inside COMPARTMENTS, losers battle to climb to the top. Losing in Compartments permanently eliminates that player.
  - **Grand Finals 1v1:** Undefeated Main Winner vs Surviving COMPARTMENTS Winner face off for the Championship and Secret Prize Link!
- **Mode 3: Visual Node Grid Maker (Coding / Node-Graph Style):**
  - Interactive visual node canvas with draggable Player Nodes and Match Nodes.
  - Glowing bezier curves dynamically rendered in SVG.
  - "Auto-Wire Pairs" and "Reset Wires" buttons.

### 5. Admin Judging & Scoring System (Marks out of 10)
- 1v1 Battle Comparison Modal with side-by-side AnonMP4 players.
- Admin Judge scoring box with numeric inputs, stepper buttons, and critique notes.
- Higher mark wins and advances; lower mark drops to COMPARTMENTS (in Mode 2) or is eliminated.
- Grand Finals winner unlocks the tournament's **Secret Prize Link** into their permanent profile vault with fanfare.

### 6. Discord-Style Tournament Chats (`CHATS` Tab)
- Channel list featuring `#general-chat` and dedicated channels for every created tournament (e.g. `#zenith-clash-2026`).
- Sender's **1:1 PFP**, **Username**, **Timestamp**, and glowing **Rank Badge**:
  - `Administrator1`: **`Owner / President`** (Gold/Crimson animated badge)
  - `admin1`–`admin5`: **`Admin`** (Neon Violet/Cyan badge)
  - Normal users: **`Participant`** (Emerald/Slate badge)
- Admins/Owner can delete individual messages or post pinned announcements.

### 7. User Profiles (`PROFILE` Tab)
- 1:1 Aspect Ratio PFP customizer.
- Bio, Favorite Anime/Manga, and Editing App tag selector (After Effects, Alight Motion, Premiere Pro, CapCut PC, Blender, DaVinci Resolve, Motion Ninja).
- Career stats (Tournaments Joined, 1v1 Wins, Average Judge Mark, Championships).
- **"My Won Prizes"** Vault displaying unlocked tournament Prize Links.

### 8. Admin Role Manager (`SETTINGS` Tab — Owner Only)
- Exclusive to `Administrator1` (`Owner / President`).
- Displays all registered users with 1-click **Promote to Admin** or **Demote to Participant** actions.
- Real-time instant updates synchronized across all tabs via `BroadcastChannel`.

---

## 📁 Project Structure

```
├── index.html                   # Main application shell & layout
├── css/
│   └── cyber-anime.css          # Theme engine, glassmorphism, glows, rank badges, node styles
├── js/
│   ├── app.js                   # Application controller, routing, wiring, & live timers
│   ├── audio.js                 # Web Audio API procedural sound synthesizer
│   ├── store.js                 # LocalStorage + IndexedDB + BroadcastChannel sync
│   └── components/
│       ├── navbar.js            # Desktop left sidebar & mobile floating glass bottom bar
│       ├── auth-modal.js        # Username + Password auth modal with 1-click quick fill
│       ├── video-player.js      # AnonMP4 video player & step-by-step tutorial card
│       ├── bracket-modes.js     # Mode 1 (Normal), Mode 2 (COMPARTMENTS), Mode 3 (Node Graph)
│       ├── judging-modal.js     # 1v1 Battle comparison & 10-point scoring modal
│       ├── supabase-modal.js    # In-app Supabase Connection Setup Modal & SQL Schema copier
│       ├── tournaments-view.js  # Tournament roster, creation modal, countdown & detail view
│       ├── chats-view.js        # Discord-style chat channels & moderation
│       ├── profile-view.js      # 1:1 PFP, stats, editing app, & won prizes vault
│       └── settings-view.js     # Dark/Light theme, sound FX, & Admin Role Manager
├── supabaseClient.ts            # TypeScript definitions & Supabase Cloud architecture
├── supabase_schema.sql          # Complete PostgreSQL schema & Realtime publications
└── README.md                    # Full documentation & credential guide
```

---

## ⚡ Supabase Cloud Architecture & Setup (Optional Cloud Sync)

The application supports a **hybrid dual-engine architecture**:
1. **Cloud Mode (Supabase PostgreSQL + Realtime)**:
   - When configured, all users across different devices share the exact same tournaments, match brackets, user profiles, and real-time chat rooms via Supabase Cloud.
   - **How to connect in 1 minute**:
     1. Open the application.
     2. Click the **"CLOUD SYNC"** pill in the left sidebar (or top bar on mobile) or go to **SETTINGS -> Connect Supabase Cloud**.
     3. Enter your **Supabase Project URL** (`https://xyz.supabase.co`) and **Supabase Anon Key**.
     4. Click **"Save & Connect to Cloud"**.
     5. Run the provided `supabase_schema.sql` (or click **"Copy SQL Schema"** inside the modal) inside your **Supabase Dashboard -> SQL Editor** to automatically provision all 5 PostgreSQL tables and Realtime channels.
2. **Standalone Local Fallback Mode (100% Offline / Zero Setup)**:
   - If Supabase credentials are not provided or if offline, the app operates 100% standalone using your browser's persistent `localStorage`, `IndexedDB`, and multi-tab `BroadcastChannel` syncing. Zero external setup is mandatory.

---

## 🛡️ Pre-Loaded Demo Tournament
On first launch, the app automatically pre-loads:
- **Tournament**: `ZENITH CLASH 2026: Animanga Hyper-Flow Championship`
- **Format**: `Mode 2: COMPARTMENTS Grid` with 8 elite animanga editor participants (`ZenitsuEdits`, `GojoVFX`, `SukunaCuts`, `LeviMotion`, `MakimaFlow`, `KilluaSync`, `ErenTitanFX`, `TojiBando`).
- **AnonMP4 Links**: Pre-configured sample links for all 8 editors.
- **Active Matches**: Round 1 ready for testing, with Match 1 pre-judged to immediately demonstrate the Main vs. Compartments bracket progression!
