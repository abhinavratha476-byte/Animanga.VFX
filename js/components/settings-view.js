/**
 * Settings & Admin Role Manager Component
 * Theme Toggle (Dark/Light), Sound FX, Database Reset, &
 * Exclusive "Admin Role Manager" (Strictly for Administrator1 / Owner)
 */

class SettingsViewComponent {
  static render(currentUser) {
    const settings = window.esportsStore.getSettings();
    const isOwner = currentUser?.role === 'Owner / President';
    const users = window.esportsStore.getUsers();

    return `
      <div class="space-y-8 max-w-4xl mx-auto pb-12">
        <!-- Settings Header -->
        <div class="pb-4 border-b border-violet-500/20">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-xs font-mono tracking-widest text-cyan-400 uppercase">System Preferences</span>
          </div>
          <h2 class="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
            Settings & Control Center
          </h2>
        </div>

        <!-- Visual Theme & Audio Preferences Card -->
        <div class="glass-card p-4 sm:p-6 rounded-2xl border border-violet-500/30 space-y-5 sm:space-y-6">
          <h3 class="font-display font-black text-lg text-white flex items-center gap-2">
            <span>🎨</span> Interface & Theme Engine
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Dark Theme Selection -->
            <div 
              onclick="window.app.setTheme('dark')" 
              class="p-4 rounded-xl border cursor-pointer transition-all ${settings.theme === 'dark' ? 'border-violet-500 bg-violet-600/20 shadow-lg shadow-violet-500/20' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-display font-bold text-sm text-white">Dark Theme (Default)</span>
                ${settings.theme === 'dark' ? '<span class="text-violet-400 text-xs">✓ Active</span>' : ''}
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Obsidian background (#08090E), frosted glass, neon violet, crimson & cyan cyber accents.
              </p>
            </div>

            <!-- Light Theme Selection -->
            <div 
              onclick="window.app.setTheme('light')" 
              class="p-4 rounded-xl border cursor-pointer transition-all ${settings.theme === 'light' ? 'border-violet-500 bg-violet-600/20 shadow-lg shadow-violet-500/20' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-display font-bold text-sm text-white">Light Theme</span>
                ${settings.theme === 'light' ? '<span class="text-violet-400 text-xs">✓ Active</span>' : ''}
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Clean alabaster (#F8FAFC), crisp white elevated cards, deep slate text & crisp contrast.
              </p>
            </div>
          </div>

          <!-- Audio & Sound Effects Switch -->
          <div class="pt-4 border-t border-violet-500/20 flex items-center justify-between">
            <div>
              <span class="font-display font-bold text-sm text-white block">Esports Audio Synthesizer</span>
              <span class="text-xs text-slate-400">Web Audio API sound effects for button clicks, bracket judging, and fanfare</span>
            </div>
            <button 
              onclick="window.app.toggleAudio()" 
              class="cyber-btn cyber-btn-ghost text-xs py-1.5 px-3 font-mono"
            >
              ${window.soundEngine?.enabled ? '🔊 SOUND ON' : '🔇 MUTED'}
            </button>
          </div>
        </div>

        <!-- EXCLUSIVE ADMIN ROLE MANAGER (OWNER / PRESIDENT ONLY) -->
        ${isOwner ? `
          <div class="glass-panel p-4 sm:p-7 rounded-2xl border-2 border-amber-500/50 relative overflow-hidden shadow-2xl">
            <div class="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-500/30">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-xl flex-shrink-0">
                  👑
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">Exclusive Owner Privilege</span>
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">Supreme Access</span>
                  </div>
                  <h3 class="font-display font-black text-xl text-white tracking-wide">
                    Admin Role Manager
                  </h3>
                </div>
              </div>

              <div class="text-xs text-slate-300 font-mono">
                Active Super Admin: <strong class="text-amber-300">${currentUser.username}</strong>
              </div>
            </div>

            <p class="text-xs text-slate-300 mb-5 leading-relaxed">
              As <strong class="text-amber-300">Owner / President</strong>, you possess ultimate administrative authority. Promote any registered user to <strong class="text-violet-300">Admin</strong> or demote existing Admin accounts back to <strong class="text-emerald-300">Participant</strong> instantly.
            </p>

            <!-- Users Table / Cards -->
            <div class="space-y-2.5">
              ${users.map(u => {
                const isSuperAdmin = u.username.toLowerCase() === 'administrator1';
                const isUserAdmin = u.role === 'Admin';
                const roleBadge = isSuperAdmin ? 'badge-owner' : (isUserAdmin ? 'badge-admin' : 'badge-participant');

                return `
                  <div class="p-3.5 rounded-xl bg-slate-900/80 border ${isSuperAdmin ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3 overflow-hidden">
                      <img 
                        src="${u.avatar}" 
                        alt="${u.username}" 
                        class="w-10 h-10 avatar-square border border-slate-700 flex-shrink-0"
                      />
                      <div class="overflow-hidden">
                        <div class="flex items-center gap-2">
                          <span class="font-display font-bold text-sm text-white truncate">${u.username}</span>
                          <span class="rank-badge ${roleBadge} text-[9px] py-0.5 px-2">
                            ${u.role}
                          </span>
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono truncate">
                          ${u.editingApp || 'After Effects'} · Joined ${new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <!-- Role Modification Action -->
                    <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      ${isSuperAdmin ? `
                        <span class="text-[11px] font-mono text-amber-400/80 italic px-2">
                          Cannot be modified
                        </span>
                      ` : `
                        ${isUserAdmin ? `
                          <button 
                            onclick="window.app.demoteUser('${u.username}')" 
                            class="px-3 py-1.5 rounded-lg text-xs font-display font-bold text-rose-400 hover:bg-rose-500/20 border border-rose-500/40 transition-all"
                          >
                            Demote to Participant
                          </button>
                        ` : `
                          <button 
                            onclick="window.app.promoteUser('${u.username}')" 
                            class="px-3 py-1.5 rounded-lg text-xs font-display font-bold text-violet-300 hover:bg-violet-600/30 border border-violet-500/40 transition-all"
                          >
                            + Promote to Admin
                          </button>
                        `}
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <!-- Information notice for non-owners -->
          <div class="p-5 rounded-2xl glass-card border border-slate-800 text-xs text-slate-400">
            <span class="text-amber-400 font-bold block mb-1">Notice on Admin Role Manager:</span>
            The "Admin Role Manager" panel is strictly reserved for the <strong class="text-amber-300">Owner / President</strong> (<code class="text-white">Administrator1</code>). Log in as <code class="text-amber-300">Administrator1</code> to assign and modify admin roles.
          </div>
        `}

        <!-- Supabase Cloud Architecture Status Card (Active & Synchronized) -->
        <div class="glass-card p-4 sm:p-6 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
            <div class="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold font-mono text-lg flex-shrink-0">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Cloud Architecture</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${window.supabaseClientEngine?.isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                  ${window.supabaseClientEngine?.isConnected ? '🟢 Cloud Active' : '🔴 Offline Mode'}
                </span>
              </div>
              <h3 class="font-display font-black text-lg text-white">
                Supabase PostgreSQL & Realtime Engine
              </h3>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            All user profiles, tournaments, match brackets, and live Discord-style chats are automatically synchronized in real time across all devices via Supabase Cloud.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-slate-500 font-mono block">DATABASE</span>
              <span class="text-cyan-300 font-bold font-display text-sm">PostgreSQL (Cloud)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-slate-500 font-mono block">LIVE STREAMING</span>
              <span class="text-emerald-400 font-bold font-display text-sm">Supabase Realtime</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-slate-500 font-mono block">VIDEO HOSTING</span>
              <span class="text-violet-300 font-bold font-display text-sm">AnonMP4 (Free 0-Cost)</span>
            </div>
          </div>
        </div>

        <!-- Database Engine & Storage Management Card -->
        <div class="glass-card p-4 sm:p-6 rounded-2xl border border-violet-500/30 space-y-4">
          <h3 class="font-display font-black text-lg text-white flex items-center gap-2">
            <span>💾</span> Local Storage Engine (100% Standalone)
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            All data runs natively in your browser using <strong class="text-violet-300">localStorage</strong>, <strong class="text-cyan-300">IndexedDB</strong>, and <strong class="text-emerald-300">BroadcastChannel</strong> for real-time synchronization between browser tabs with zero external cloud dependencies.
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <button 
              onclick="window.app.resetDemoData()" 
              class="cyber-btn cyber-btn-crimson text-xs py-2 px-4 shadow-md"
            >
              Reset & Re-Seed Default Database
            </button>
            <span class="text-[11px] text-slate-500 font-mono">Restores pre-seeded accounts & Zenith demo tournament</span>
          </div>
        </div>
      </div>
    `;
  }
}

window.SettingsViewComponent = SettingsViewComponent;
