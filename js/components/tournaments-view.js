/**
 * Tournaments View Component
 * Tournament Roster, Banner (16:9), PFP (1:1), Live Countdown, AnonMP4 Submission, & Creation
 */

class TournamentsViewComponent {
  static renderList(tournaments, currentUser) {
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Owner / President';

    return `
      <div class="space-y-6">
        <!-- Tournaments Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-500/20">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="text-xs font-mono tracking-widest text-cyan-400 uppercase">Arena Tournaments</span>
            </div>
            <h2 class="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
              Active Edit Championships
            </h2>
          </div>

          ${isAdmin ? `
            <button 
              onclick="window.app.openCreateTournamentModal()" 
              class="cyber-btn cyber-btn-violet text-xs py-2.5 px-4 shadow-lg shadow-violet-600/30 self-start sm:self-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Create Tournament</span>
            </button>
          ` : ''}
        </div>

        <!-- Tournaments Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          ${tournaments.map(t => this.renderTournamentCard(t, currentUser)).join('')}
        </div>
      </div>
    `;
  }

  static renderTournamentCard(t, currentUser) {
    const isRegistered = t.participants.some(p => p.username.toLowerCase() === currentUser?.username.toLowerCase());
    const deadlinePassed = new Date() > new Date(t.deadline);

    return `
      <div class="glass-card rounded-2xl border border-violet-500/30 overflow-hidden flex flex-col justify-between group">
        <!-- 16:9 Wide Tournament Banner -->
        <div class="relative w-full aspect-video overflow-hidden bg-slate-950">
          <img 
            src="${t.banner}" 
            alt="${t.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#08090E] via-transparent to-black/40"></div>

          <!-- Top Badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
              ${t.category}
            </span>

            <!-- Live Countdown Badge -->
            <div class="countdown-badge" data-deadline="${t.deadline}">
              <span>⏳</span>
              <span class="countdown-timer font-mono text-xs">CALCULATING...</span>
            </div>
          </div>

          <!-- PFP Badge (1:1 Aspect Ratio) -->
          <div class="absolute -bottom-4 left-5 flex items-end gap-3">
            <img 
              src="${t.pfp}" 
              alt="${t.title}" 
              class="w-16 h-16 avatar-square border-2 border-violet-400 bg-slate-900 shadow-xl"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 pt-7 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-mono uppercase tracking-wider text-violet-400">
                ${t.gridMode === 'mode2_compartments' ? 'Mode 2: COMPARTMENTS' : (t.gridMode === 'mode3_node' ? 'Mode 3: Node Graph' : 'Mode 1: Normal Grid')}
              </span>
              <span class="text-slate-600">·</span>
              <span class="text-[10px] font-mono text-slate-400">${t.participants.length} Editors Enrolled</span>
            </div>

            <h3 class="font-display font-black text-xl text-white group-hover:text-violet-300 transition-colors">
              ${t.title}
            </h3>

            <p class="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              ${t.description}
            </p>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-violet-500/20 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              ${isRegistered ? `
                <span class="text-[11px] font-display font-bold text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Enrolled
                </span>
              ` : `
                <span class="text-[11px] font-mono text-slate-400">
                  ${deadlinePassed ? 'Registration Closed' : 'Open Entry'}
                </span>
              `}
            </div>

            <button 
              onclick="window.app.openTournamentDetail('${t.id}')" 
              class="cyber-btn cyber-btn-violet text-xs py-2 px-4 shadow-md"
            >
              <span>Enter Arena</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     TOURNAMENT DETAIL VIEW
     ========================================================================== */
  static renderDetail(tournament, currentUser) {
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Owner / President';
    const isRegistered = tournament.participants.some(p => p.username.toLowerCase() === currentUser?.username.toLowerCase());
    const userParticipant = tournament.participants.find(p => p.username.toLowerCase() === currentUser?.username.toLowerCase());
    const deadlinePassed = new Date() > new Date(tournament.deadline);

    return `
      <div class="space-y-8 pb-12">
        <!-- Back Navigation & Quick Admin Controls -->
        <div class="flex items-center justify-between">
          <button 
            onclick="window.app.switchTab('tournaments')" 
            class="inline-flex items-center gap-2 text-xs font-display font-bold text-slate-400 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back to All Tournaments</span>
          </button>

          ${isAdmin ? `
            <div class="flex items-center gap-2">
              <button 
                onclick="window.app.deleteTournament('${tournament.id}')" 
                class="px-3 py-1.5 rounded-lg text-xs font-display font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all"
              >
                Delete Tournament
              </button>
            </div>
          ` : ''}
        </div>

        <!-- 16:9 Wide Tournament Banner & Identity Header -->
        <div class="relative w-full rounded-2xl overflow-hidden border border-violet-500/40 bg-slate-950 shadow-2xl">
          <div class="w-full aspect-[21/9] sm:aspect-[16/7] relative overflow-hidden">
            <img src="${tournament.banner}" alt="${tournament.title}" class="w-full h-full object-cover"/>
            <div class="absolute inset-0 bg-gradient-to-t from-[#08090E] via-slate-950/60 to-transparent"></div>
          </div>

          <!-- Identity overlay banner -->
          <div class="p-4 sm:p-6 md:p-8 -mt-12 sm:-mt-20 md:-mt-28 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div class="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5">
              <!-- 1:1 Square PFP -->
              <img 
                src="${tournament.pfp}" 
                alt="${tournament.title}" 
                class="w-20 h-20 sm:w-28 sm:h-28 avatar-square border-3 border-violet-400 bg-slate-900 shadow-2xl flex-shrink-0"
              />

              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ${tournament.category}
                  </span>
                  <div class="countdown-badge text-[11px] sm:text-xs" data-deadline="${tournament.deadline}">
                    <span>⏳ DEADLINE:</span>
                    <span class="countdown-timer font-mono text-xs">CALCULATING...</span>
                  </div>
                </div>

                <h1 class="font-display font-black text-xl sm:text-3xl md:text-4xl text-white tracking-wide">
                  ${tournament.title}
                </h1>
              </div>
            </div>

            <!-- Join / Status button -->
            <div class="flex items-center gap-3 w-full sm:w-auto">
              ${!isRegistered && !deadlinePassed ? `
                <button 
                  onclick="window.app.registerForTournament('${tournament.id}')" 
                  class="w-full sm:w-auto cyber-btn cyber-btn-violet text-sm py-2.5 px-6 shadow-xl text-center justify-center"
                >
                  Join Tournament
                </button>
              ` : ''}

              ${isRegistered ? `
                <button 
                  onclick="window.app.scrollToSubmission()" 
                  class="w-full sm:w-auto cyber-btn cyber-btn-cyan text-sm py-2.5 px-5 shadow-xl text-center justify-center"
                >
                  ${userParticipant?.submittedLink ? 'Edit Your Submission' : 'Submit Your Edit'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Description & Formatted Rules & Regulations Panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Description Card -->
          <div class="lg:col-span-2 glass-card p-6 rounded-2xl border border-violet-500/30 space-y-4">
            <h3 class="font-display font-black text-lg text-white flex items-center gap-2">
              <span>📖</span> Tournament Brief
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed">
              ${tournament.description}
            </p>

            <div class="pt-4 border-t border-violet-500/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-slate-500 font-mono block">PARTICIPANTS</span>
                <span class="text-white font-bold font-display text-sm">${tournament.participants.length} Editors</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-slate-500 font-mono block">FORMAT</span>
                <span class="text-cyan-400 font-bold font-display text-sm">1v1 Battles</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-slate-500 font-mono block">STATUS</span>
                <span class="text-emerald-400 font-bold font-display text-sm">${tournament.status}</span>
              </div>
            </div>
          </div>

          <!-- Formatted Rules & Regulations Panel -->
          <div class="glass-card p-6 rounded-2xl border border-violet-500/30 space-y-4">
            <h3 class="font-display font-black text-lg text-white flex items-center gap-2">
              <span>⚖️</span> Rules & Regulations
            </h3>
            <ul class="space-y-2.5 text-xs text-slate-300">
              ${(tournament.rules || []).map(r => `
                <li class="flex items-start gap-2">
                  <span class="text-violet-400 font-bold font-mono">▸</span>
                  <span class="leading-relaxed">${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Participant AnonMP4 Edit Submission Section -->
        ${isRegistered ? `
          <div id="participantSubmissionSection" class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 class="font-display font-black text-xl text-white">Your Tournament Edit Submission</h3>
            </div>

            <!-- Built-In "How to Host Your Edit on AnonMP4" Step-by-Step Guide Card -->
            ${window.AnonPlayerSystem.renderGuideCardHTML()}

            <!-- Edit Link Input Box -->
            <div class="glass-panel p-5 rounded-2xl border-2 border-violet-500/40">
              <form onsubmit="window.app.handleEditSubmission(event, '${tournament.id}')" class="space-y-3">
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300">
                  AnonMP4 Edit Link (Watch URL or Embed URL)
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <input 
                    type="url" 
                    required 
                    id="userEditLinkInput"
                    value="${userParticipant?.submittedLink || ''}"
                    placeholder="https://anonmp4.to/watch/your_edit_code or direct .mp4 URL" 
                    class="flex-1 w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/40 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
                    ${deadlinePassed ? 'disabled' : ''}
                  />
                  <button 
                    type="submit" 
                    class="cyber-btn cyber-btn-violet py-2.5 px-6 text-xs sm:text-sm font-display font-bold shadow-lg w-full sm:w-auto flex-shrink-0"
                    ${deadlinePassed ? 'disabled' : ''}
                  >
                    ${userParticipant?.submittedLink ? 'Update Submission' : 'Submit Edit'}
                  </button>
                </div>
                ${deadlinePassed ? `
                  <p class="text-xs text-rose-400 font-mono">⚠️ Submissions locked: The tournament deadline has passed.</p>
                ` : `
                  <p class="text-[11px] text-slate-400 font-mono">
                    Accepts <code class="text-cyan-300">https://anonmp4.to/watch/...</code>, <code class="text-cyan-300">https://anonmp4.to/embed/...</code>, or direct <code class="text-cyan-300">.mp4</code> URLs.
                  </p>
                `}
              </form>

              <!-- Live Player Preview if already submitted -->
              ${userParticipant?.submittedLink ? `
                <div class="mt-4 pt-4 border-t border-violet-500/20">
                  <span class="text-xs font-mono text-emerald-400 font-bold block mb-2">
                    ✓ Your Submitted Edit Preview:
                  </span>
                  <div class="max-w-md">
                    ${window.AnonPlayerSystem.renderPlayerHTML({ 
                      url: userParticipant.submittedLink, 
                      title: `${currentUser.username}'s Edit` 
                    })}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Participant Roster & Management (Admins can kick or add users) -->
        <div class="glass-card p-6 rounded-2xl border border-violet-500/30 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-display font-black text-lg text-white flex items-center gap-2">
                <span>👥</span> Participant Roster (${tournament.participants.length} Editors)
              </h3>
              <p class="text-xs text-slate-400">All registered editors competing in this tournament.</p>
            </div>

            ${isAdmin ? `
              <div class="flex items-center gap-2">
                <button 
                  onclick="window.app.openAddParticipantModal('${tournament.id}')" 
                  class="cyber-btn cyber-btn-cyan text-xs py-1.5 px-3"
                >
                  + Add User to Roster
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Roster Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${tournament.participants.map(p => `
              <div class="p-3 rounded-xl bg-slate-900/70 border border-violet-500/20 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 overflow-hidden">
                  <div class="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                    ${p.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div class="overflow-hidden">
                    <div class="text-xs font-bold text-white truncate font-display">${p.username}</div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      ${p.submittedLink ? '🟢 Edit Submitted' : '🟡 Awaiting Link'}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  ${p.submittedLink ? `
                    <button 
                      onclick="window.app.previewEditLink('${p.submittedLink}', '${p.username}')" 
                      class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs"
                      title="Preview Edit"
                    >
                      ▶
                    </button>
                  ` : ''}

                  ${isAdmin ? `
                    <button 
                      onclick="window.app.removeParticipantFromTournament('${tournament.id}', '${p.username}')" 
                      class="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs"
                      title="Disqualify / Remove User"
                    >
                      ✕
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3-Mode Match Grid Maker -->
        <div id="tournamentBracketSection" class="space-y-4">
          ${window.BracketModesComponent.renderModeSelector(tournament, isAdmin)}

          <!-- Mode Active View -->
          <div id="activeBracketModeContainer">
            ${tournament.gridMode === 'mode1_normal' 
              ? window.BracketModesComponent.renderMode1Normal(tournament, isAdmin)
              : (tournament.gridMode === 'mode3_node'
                  ? window.BracketModesComponent.renderMode3NodeGraph(tournament, isAdmin)
                  : window.BracketModesComponent.renderMode2Compartments(tournament, isAdmin)
                )
            }
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     CREATE TOURNAMENT MODAL (Admin Only)
     ========================================================================== */
  static renderCreateModal() {
    return `
      <div id="createTournamentModal" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 modal-overlay hidden">
        <div class="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto glass-card rounded-2xl border-2 border-violet-500/50 p-4 sm:p-6 md:p-8 shadow-2xl">
          <!-- Close button -->
          <button 
            onclick="window.app.closeCreateTournamentModal()" 
            class="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Header -->
          <div class="mb-6">
            <h3 class="font-display font-black text-2xl text-white tracking-wide">
              Create Animanga Edit Tournament
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Set banner (16:9), PFP (1:1), rules, submission countdown deadline, and secret prize link.
            </p>
          </div>

          <form onsubmit="window.app.handleCreateTournamentSubmit(event)" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tournament Title
              </label>
              <input 
                type="text" 
                required 
                id="createTournTitle" 
                placeholder="e.g. HYPER-FLOW 2026: 60fps Velocity AMV Battle" 
                class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <!-- Category / Game Format -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category & Edit Style
              </label>
              <input 
                type="text" 
                required 
                id="createTournCategory" 
                placeholder="e.g. Velocity / 3D Compositing / Raw Impact" 
                class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <!-- Banner URL (16:9) & Presets -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tournament Banner (16:9 Wide Image URL)
              </label>
              <input 
                type="url" 
                required 
                id="createTournBanner" 
                value="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&h=900&fit=crop&q=80"
                class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              />
              <div class="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                <span>Presets:</span>
                <button type="button" onclick="document.getElementById('createTournBanner').value='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&h=900&fit=crop&q=80'" class="hover:text-cyan-400">Cyber Anime</button>
                <span>·</span>
                <button type="button" onclick="document.getElementById('createTournBanner').value='https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&h=900&fit=crop&q=80'" class="hover:text-cyan-400">Night Neon</button>
                <span>·</span>
                <button type="button" onclick="document.getElementById('createTournBanner').value='https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&h=900&fit=crop&q=80'" class="hover:text-cyan-400">VFX Blade</button>
              </div>
            </div>

            <!-- Tournament PFP (1:1 Aspect Ratio) -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tournament Crest / PFP (Strictly 1:1 Square)
              </label>
              <input 
                type="url" 
                required 
                id="createTournPfp" 
                value="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80"
                class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Description
              </label>
              <textarea 
                id="createTournDesc" 
                rows="3" 
                placeholder="Describe tournament narrative, expectations, and stakes..." 
                class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs focus:outline-none focus:border-violet-500"
              ></textarea>
            </div>

            <!-- Rules & Regulations (one per line) -->
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Rules & Regulations (One rule per line)
              </label>
              <textarea 
                id="createTournRules" 
                rows="3" 
                class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              >Strict 60 FPS render required
Watermark in corner required
Duration: 15s to 45s
Must host edit on AnonMP4.to</textarea>
            </div>

            <!-- Deadline & Bracket Mode -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Submission Deadline (Date & Time)
                </label>
                <input 
                  type="datetime-local" 
                  required 
                  id="createTournDeadline" 
                  class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Default Match Grid Mode
                </label>
                <select 
                  id="createTournMode" 
                  class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white text-xs font-display focus:outline-none focus:border-violet-500"
                >
                  <option value="mode2_compartments">Mode 2: "COMPARTMENTS" Grid (Recommended)</option>
                  <option value="mode1_normal">Mode 1: Normal Single Elimination</option>
                  <option value="mode3_node">Mode 3: Visual Node Graph</option>
                </select>
              </div>
            </div>

            <!-- Secret Winner Prize Link -->
            <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                🔒 Secret Winner Prize Link (Hidden from Participants)
              </label>
              <input 
                type="url" 
                id="createTournPrizeLink" 
                placeholder="https://mega.nz/folder/editing-pack-secret-download" 
                class="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-amber-500/40 text-amber-200 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <span class="text-[10px] text-amber-400/80 mt-1 block">
                This link remains secret and will ONLY be revealed to the user who wins the Grand Finals 1v1!
              </span>
            </div>

            <button 
              type="submit" 
              class="w-full cyber-btn cyber-btn-violet py-2.5 text-sm font-display font-bold shadow-lg shadow-violet-600/40 mt-2"
            >
              Publish Tournament
            </button>
          </form>
        </div>
      </div>
    `;
  }
}

window.TournamentsViewComponent = TournamentsViewComponent;
