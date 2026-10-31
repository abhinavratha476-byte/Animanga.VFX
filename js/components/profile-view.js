/**
 * User Profile View Component
 * 1:1 Aspect Ratio PFP, Bio, Anime/Manga, Editing App Tag, Stats, & "My Won Prizes" Vault
 * Allows editing Name, Username, and Password with real-time propagation!
 */

class ProfileViewComponent {
  static render(user) {
    if (!user) {
      return `
        <div class="p-12 text-center glass-card rounded-2xl border border-violet-500/30 max-w-lg mx-auto">
          <div class="text-4xl mb-3">⚡</div>
          <h3 class="font-display font-black text-xl text-white">Sign In to View Profile</h3>
          <p class="text-xs text-slate-400 mt-1 mb-5">Access your tournament stats, 1:1 avatar customization, and won prize vault.</p>
          <button onclick="window.app.openAuthModal()" class="cyber-btn cyber-btn-violet text-xs py-2.5 px-6">
            Sign In / Register
          </button>
        </div>
      `;
    }

    const isOwner = user.role === 'Owner / President';
    const isAdmin = user.role === 'Admin';
    const roleBadgeClass = isOwner ? 'badge-owner' : (isAdmin ? 'badge-admin' : 'badge-participant');
    const roleIcon = isOwner ? '👑' : (isAdmin ? '🛡️' : '⚡');

    const stats = user.stats || {
      tournamentsJoined: 0,
      matchesWon: 0,
      championships: 0,
      avgScore: 0.0
    };

    const wonPrizes = user.wonPrizes || [];
    const displayName = user.name || user.username;

    return `
      <div class="space-y-8 max-w-4xl mx-auto pb-12">
        <!-- Profile Identity Hero Card -->
        <div class="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl border border-violet-500/40 relative overflow-hidden shadow-2xl">
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <!-- 1:1 Aspect Ratio Avatar -->
            <div class="relative group flex-shrink-0">
              <img 
                src="${user.avatar || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop&q=80'}" 
                alt="${user.username}" 
                id="profileAvatarPreview"
                class="w-28 h-28 sm:w-32 sm:h-32 avatar-square border-3 ${isOwner ? 'border-amber-400 shadow-xl shadow-amber-500/30' : 'border-violet-500'} bg-slate-900 object-cover"
              />
              <button 
                onclick="window.app.openAvatarPrompt()" 
                class="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-display font-bold transition-opacity"
              >
                <span>Change PFP</span>
                <span class="text-[9px] text-cyan-400 font-mono">1:1 Square</span>
              </button>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center sm:text-left space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                  <div>
                    <h2 class="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
                      ${displayName}
                    </h2>
                    <span class="text-xs font-mono text-cyan-400 block sm:inline">@${user.username}</span>
                  </div>
                  <span class="rank-badge ${roleBadgeClass} text-[10px] py-0.5 px-2.5 self-center sm:self-auto">
                    ${roleIcon} ${user.role}
                  </span>
                </div>

                <button 
                  onclick="window.app.toggleEditProfileForm()" 
                  class="cyber-btn cyber-btn-ghost text-xs py-1.5 px-3 self-center sm:self-auto flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  <span>Edit Profile</span>
                </button>
              </div>

              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
                ${user.bio || 'Animanga video editor active in 1v1 tournament battles.'}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 border border-violet-500/30 text-xs text-violet-300">
                  <span>🎬 App:</span>
                  <strong class="font-display">${user.editingApp || 'After Effects'}</strong>
                </div>

                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-xs text-cyan-300">
                  <span>✨ Fav Anime:</span>
                  <strong class="font-display">${user.favAnime || 'Jujutsu Kaisen'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form (Expanded on demand) -->
        <div id="profileEditSection" class="glass-card p-6 sm:p-7 rounded-2xl border-2 border-violet-500/40 hidden space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-violet-500/20">
            <div>
              <h3 class="font-display font-black text-lg text-white">Account & Profile Settings</h3>
              <p class="text-xs text-slate-400">Update your public name, unique login username, credentials, and visual identity.</p>
            </div>
            <button 
              type="button" 
              onclick="window.app.toggleEditProfileForm()" 
              class="text-slate-400 hover:text-white text-xs font-mono p-1"
            >✕ Close</button>
          </div>

          <form onsubmit="window.app.handleSaveProfile(event)" class="space-y-4">
            <!-- Name & Username Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Display / Full Name
                </label>
                <input 
                  type="text" 
                  id="editProfileNameInput" 
                  value="${user.name || user.username || ''}"
                  placeholder="e.g. Master Editor" 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Login Username (Handle)
                </label>
                <input 
                  type="text" 
                  required 
                  minlength="3"
                  id="editProfileUsernameInput" 
                  value="${user.username || ''}"
                  placeholder="e.g. Administrator1" 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
                />
                <span class="text-[10px] text-cyan-400/80 mt-1 block font-mono">
                  Changing username updates your login and syncs across all tournament records and chats.
                </span>
              </div>
            </div>

            <!-- Password & Avatar Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Change Password
                </label>
                <input 
                  type="password" 
                  id="editProfilePasswordInput" 
                  autocomplete="new-password"
                  placeholder="Leave blank to keep current password" 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-violet-500"
                />
                <span class="text-[10px] text-slate-400 mt-1 block">
                  Only type if you wish to change your current password (min 4 characters).
                </span>
              </div>

              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1:1 PFP Avatar Image URL
                </label>
                <input 
                  type="url" 
                  id="editProfileAvatarInput" 
                  value="${user.avatar || ''}"
                  placeholder="https://images.unsplash.com/..." 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <!-- Editing App & Anime Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Primary Editing Software / App
                </label>
                <select 
                  id="editProfileAppInput" 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-display focus:outline-none focus:border-violet-500"
                >
                  <option value="After Effects" ${user.editingApp === 'After Effects' ? 'selected' : ''}>After Effects</option>
                  <option value="Alight Motion" ${user.editingApp === 'Alight Motion' ? 'selected' : ''}>Alight Motion</option>
                  <option value="Premiere Pro" ${user.editingApp === 'Premiere Pro' ? 'selected' : ''}>Premiere Pro</option>
                  <option value="CapCut PC" ${user.editingApp === 'CapCut PC' ? 'selected' : ''}>CapCut PC</option>
                  <option value="Blender" ${user.editingApp === 'Blender' ? 'selected' : ''}>Blender</option>
                  <option value="DaVinci Resolve" ${user.editingApp === 'DaVinci Resolve' ? 'selected' : ''}>DaVinci Resolve</option>
                  <option value="Motion Ninja" ${user.editingApp === 'Motion Ninja' ? 'selected' : ''}>Motion Ninja</option>
                  <option value="Kdenlive" ${user.editingApp === 'Kdenlive' ? 'selected' : ''}>Kdenlive</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Favorite Anime / Manga
                </label>
                <input 
                  type="text" 
                  id="editProfileAnimeInput" 
                  value="${user.favAnime || ''}"
                  placeholder="e.g. Demon Slayer, Jujutsu Kaisen" 
                  class="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <!-- Bio -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Bio & Editing Philosophy
              </label>
              <textarea 
                id="editProfileBioInput" 
                rows="2" 
                class="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs focus:outline-none focus:border-violet-500"
              >${user.bio || ''}</textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-violet-500/20">
              <button 
                type="button" 
                onclick="window.app.toggleEditProfileForm()" 
                class="px-4 py-2 rounded-lg text-xs font-display font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="cyber-btn cyber-btn-violet text-xs py-2 px-6 shadow-md shadow-violet-600/40"
              >
                Save All Profile Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Career Esports Stats Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div class="p-3 sm:p-4 rounded-xl glass-card border border-violet-500/20 text-center space-y-1">
            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">Tournaments</span>
            <div class="font-display font-black text-xl sm:text-2xl text-white">${stats.tournamentsJoined}</div>
            <span class="text-[9px] sm:text-[10px] text-violet-400">Enrolled Battles</span>
          </div>

          <div class="p-3 sm:p-4 rounded-xl glass-card border border-cyan-500/20 text-center space-y-1">
            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">1v1 Wins</span>
            <div class="font-display font-black text-xl sm:text-2xl text-cyan-300">${stats.matchesWon}</div>
            <span class="text-[9px] sm:text-[10px] text-cyan-400">Matchups Won</span>
          </div>

          <div class="p-3 sm:p-4 rounded-xl glass-card border border-amber-500/20 text-center space-y-1">
            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">Championships</span>
            <div class="font-display font-black text-xl sm:text-2xl text-amber-300">${stats.championships}</div>
            <span class="text-[9px] sm:text-[10px] text-amber-400">Grand Finals</span>
          </div>

          <div class="p-3 sm:p-4 rounded-xl glass-card border border-rose-500/20 text-center space-y-1">
            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">Avg Judge Mark</span>
            <div class="font-display font-black text-xl sm:text-2xl text-rose-300">${stats.avgScore ? Number(stats.avgScore).toFixed(1) : '0.0'}</div>
            <span class="text-[9px] sm:text-[10px] text-rose-400">Out of 10.0</span>
          </div>
        </div>

        <!-- "My Won Prizes" Vault (Displaying Unlocked Tournament Prize Links) -->
        <div class="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🏆</span>
              <div>
                <h3 class="font-display font-black text-lg text-white">My Won Prizes Vault</h3>
                <p class="text-xs text-slate-400">Exclusive editing packs & reward links unlocked by winning Grand Finals.</p>
              </div>
            </div>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ${wonPrizes.length} Unlocked
            </span>
          </div>

          ${wonPrizes.length === 0 ? `
            <div class="p-8 text-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 space-y-2">
              <span class="text-2xl">🔒</span>
              <p class="text-xs text-slate-400 font-mono">No tournament prizes won yet.</p>
              <p class="text-[11px] text-slate-500">Climb to victory in the Grand Finals of any tournament to unlock its secret prize link!</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${wonPrizes.map(p => `
                <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="space-y-1 overflow-hidden">
                    <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">CHAMPION REWARD</span>
                    <h4 class="font-display font-bold text-sm text-white truncate">${p.title}</h4>
                    <p class="text-[11px] font-mono text-slate-400 truncate">${p.prizeLink}</p>
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onclick="navigator.clipboard.writeText('${p.prizeLink}'); alert('Prize Link copied to clipboard!');" 
                      class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-colors"
                    >
                      Copy Link
                    </button>
                    <a 
                      href="${p.prizeLink}" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="cyber-btn cyber-btn-violet text-xs py-1.5 px-3.5"
                    >
                      <span>Open Prize ↗</span>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }
}

window.ProfileViewComponent = ProfileViewComponent;
