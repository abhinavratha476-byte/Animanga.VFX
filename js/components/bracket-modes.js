/**
 * Match Grid Maker - 3 Distinct Tournament Bracket Modes
 * Mode 1: Normal Grid (Single Elimination)
 * Mode 2: "COMPARTMENTS" Grid (Main Bracket + Losers Redemption Bracket + Grand Finals)
 * Mode 3: Visual Node Grid Maker (Coding/Node-Graph Style with Draggable Nodes & Bezier Wires)
 */

class BracketModesComponent {
  // Mode Selector Header (Admin control & Viewer toggle)
  static renderModeSelector(tournament, isAdmin) {
    const activeMode = tournament.gridMode || 'mode2_compartments';

    return `
      <div class="glass-panel p-4 rounded-xl border border-violet-500/30 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-400">Match Grid Engine</span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <h3 class="font-display font-black text-xl text-white tracking-wide">
            Interactive Bracket Matrix
          </h3>
        </div>

        <!-- Mode Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <button 
            onclick="window.app.setTournamentGridMode('${tournament.id}', 'mode1_normal')" 
            class="px-3 py-2 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1.5 ${activeMode === 'mode1_normal' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/60'}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
            </svg>
            <span>Mode 1: Normal Grid</span>
          </button>

          <button 
            onclick="window.app.setTournamentGridMode('${tournament.id}', 'mode2_compartments')" 
            class="px-3.5 py-2 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1.5 ${activeMode === 'mode2_compartments' ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/60'}"
          >
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Mode 2: COMPARTMENTS</span>
          </button>

          <button 
            onclick="window.app.setTournamentGridMode('${tournament.id}', 'mode3_node')" 
            class="px-3 py-2 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1.5 ${activeMode === 'mode3_node' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/60'}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>Mode 3: Node Graph</span>
          </button>

          ${isAdmin ? `
            <div class="h-6 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
            <button 
              onclick="window.app.quickMatchTournament('${tournament.id}')" 
              class="cyber-btn cyber-btn-cyan text-xs py-2 px-3 shadow-md"
              title="Automatically shuffle and seed all registered participants into 1v1 matchups"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Quick Match</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     MODE 1: NORMAL GRID (Single Elimination)
     ========================================================================== */
  static renderMode1Normal(tournament, isAdmin) {
    const matches = tournament.matches || [];
    const r1Matches = matches.filter(m => m.bracket === 'NORMAL' && m.round === 1);
    const r2Matches = matches.filter(m => m.bracket === 'NORMAL' && m.round === 2);
    const r3Matches = matches.filter(m => m.bracket === 'NORMAL' && m.round === 3);

    if (matches.length === 0 || r1Matches.length === 0) {
      return this.renderEmptyBracketState(tournament, isAdmin, 'mode1_normal');
    }

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between pb-2 border-b border-violet-500/20">
          <div>
            <span class="text-xs font-mono text-violet-400">Single Elimination Hierarchy</span>
            <h4 class="font-display font-black text-lg text-white">Classic 1v1 Elimination Tree</h4>
          </div>
          <span class="text-xs px-2.5 py-1 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
            Standard Knockout
          </span>
        </div>

        <!-- Mobile Swipe Guide -->
        <div class="md:hidden flex items-center justify-between text-[11px] font-mono text-cyan-400 bg-cyan-950/40 p-2 px-3 rounded-lg border border-cyan-500/20">
          <span>📱 Mobile Bracket View</span>
          <span>Swipe horizontally for Semis & Finals ➔</span>
        </div>

        <div class="touch-scroll flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 pt-1">
          <!-- Round 1: Quarterfinals -->
          <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4">
            <div class="flex items-center justify-between px-2">
              <span class="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                Round 1 · Quarterfinals
              </span>
              <span class="text-[10px] font-mono text-cyan-400">4 Matches</span>
            </div>
            <div class="space-y-4">
              ${r1Matches.map(m => this.renderMatchCard(tournament, m, isAdmin)).join('')}
            </div>
          </div>

          <!-- Round 2: Semifinals -->
          <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-12">
            <div class="flex items-center justify-between px-2">
              <span class="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                Round 2 · Semifinals
              </span>
              <span class="text-[10px] font-mono text-violet-400">2 Matches</span>
            </div>
            <div class="space-y-6">
              ${r2Matches.map(m => this.renderMatchCard(tournament, m, isAdmin)).join('')}
            </div>
          </div>

          <!-- Round 3: Finals -->
          <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-24">
            <div class="flex items-center justify-between px-2">
              <span class="font-display font-bold text-xs uppercase tracking-wider text-amber-400">
                🏆 Championship Final
              </span>
              <span class="text-[10px] font-mono text-amber-300">1 Match</span>
            </div>
            <div class="space-y-4">
              ${r3Matches.map(m => this.renderMatchCard(tournament, m, isAdmin, true)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     MODE 2: "COMPARTMENTS" GRID (Main Bracket + Redemption Compartments)
     ========================================================================== */
  static renderMode2Compartments(tournament, isAdmin) {
    const matches = tournament.matches || [];
    const mainR1 = matches.filter(m => m.bracket === 'MAIN' && m.round === 1);
    const mainR2 = matches.filter(m => m.bracket === 'MAIN' && m.round === 2);
    const mainFinal = matches.filter(m => m.bracket === 'MAIN' && m.round === 3);

    const compR1 = matches.filter(m => m.bracket === 'COMPARTMENTS' && m.round === 1);
    const compR2 = matches.filter(m => m.bracket === 'COMPARTMENTS' && m.round === 2);
    const compFinal = matches.filter(m => m.bracket === 'COMPARTMENTS' && m.round === 3);

    const grandFinal = matches.find(m => m.bracket === 'GRAND_FINALS');

    if (matches.length === 0 || mainR1.length === 0) {
      return this.renderEmptyBracketState(tournament, isAdmin, 'mode2_compartments');
    }

    return `
      <div class="space-y-8">
        <!-- ZONE 1: MAIN MATCH BRACKET (Electric Violet Glow) -->
        <section class="glass-panel p-5 md:p-6 rounded-2xl border-2 border-violet-500/40 relative overflow-hidden shadow-2xl">
          <div class="absolute -top-16 -left-16 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-violet-500/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-400 font-black font-display text-lg shadow-inner">
                ⚡
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono tracking-widest text-violet-400 uppercase">Primary Bracket</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">Undefeated Ladder</span>
                </div>
                <h4 class="font-display font-black text-xl text-white tracking-wide gradient-text-esports">
                  MAIN MATCH BRACKET
                </h4>
              </div>
            </div>

            <div class="text-xs text-slate-400 max-w-sm">
              Winners advance to Main Finals. <strong class="text-rose-400">Any player who loses drops immediately into the COMPARTMENTS Section</strong> below for a second chance!
            </div>
          </div>

          <!-- Mobile Swipe Guide -->
          <div class="md:hidden flex items-center justify-between text-[10px] font-mono text-violet-300 bg-violet-950/40 p-2 px-3 rounded-lg border border-violet-500/20 mb-3">
            <span>⚡ Main Bracket</span>
            <span>Swipe for Semis & Final ➔</span>
          </div>

          <!-- Main Bracket Rounds Grid -->
          <div class="touch-scroll flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-3">
            <!-- Main Round 1 -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-violet-300">
                  Round 1 (Main)
                </span>
                <span class="text-[10px] font-mono text-slate-400">4 1v1s</span>
              </div>
              <div class="space-y-4">
                ${mainR1.map(m => this.renderMatchCard(tournament, m, isAdmin)).join('')}
              </div>
            </div>

            <!-- Main Round 2 (Semifinals) -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-10">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-violet-300">
                  Round 2 · Main Semis
                </span>
                <span class="text-[10px] font-mono text-slate-400">2 1v1s</span>
              </div>
              <div class="space-y-6">
                ${mainR2.map(m => this.renderMatchCard(tournament, m, isAdmin)).join('')}
              </div>
            </div>

            <!-- Main Final -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-20">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-cyan-300">
                  Main Undefeated Final
                </span>
                <span class="text-[10px] font-mono text-cyan-400">Qualifies for Grand Final</span>
              </div>
              <div class="space-y-4">
                ${mainFinal.map(m => this.renderMatchCard(tournament, m, isAdmin)).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- ZONE 2: "COMPARTMENTS" SECTION (Crimson / Amber Glow) -->
        <section class="glass-panel p-5 md:p-6 rounded-2xl border-2 border-rose-500/40 relative overflow-hidden shadow-2xl">
          <div class="absolute -top-16 -right-16 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-rose-500/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400 font-black font-display text-lg shadow-inner">
                🔥
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono tracking-widest text-rose-400 uppercase">Losers Redemption Bracket</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">Survival Grid</span>
                </div>
                <h4 class="font-display font-black text-xl text-white tracking-wide gradient-text-crimson">
                  "COMPARTMENTS" SECTION
                </h4>
              </div>
            </div>

            <div class="text-xs text-slate-300 max-w-sm">
              <strong class="text-amber-300">The Redemption Battleground:</strong> Eliminated Main Bracket players clash here. One loss in COMPARTMENTS = Permanent Knockout! The sole survivor climbs to Grand Finals.
            </div>
          </div>

          <!-- Mobile Swipe Guide -->
          <div class="md:hidden flex items-center justify-between text-[10px] font-mono text-rose-300 bg-rose-950/40 p-2 px-3 rounded-lg border border-rose-500/20 mb-3">
            <span>🔥 Compartments Ladder</span>
            <span>Swipe for Semis & Final ➔</span>
          </div>

          <!-- Compartments Rounds Grid -->
          <div class="touch-scroll flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-3">
            <!-- Compartments R1 -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-rose-300">
                  Compartments R1
                </span>
                <span class="text-[10px] font-mono text-slate-400">R1 Drops</span>
              </div>
              <div class="space-y-4">
                ${compR1.map(m => this.renderMatchCard(tournament, m, isAdmin, false, true)).join('')}
              </div>
            </div>

            <!-- Compartments R2 -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-10">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-amber-300">
                  Compartments R2
                </span>
                <span class="text-[10px] font-mono text-slate-400">Semis Drops</span>
              </div>
              <div class="space-y-4">
                ${compR2.map(m => this.renderMatchCard(tournament, m, isAdmin, false, true)).join('')}
              </div>
            </div>

            <!-- Compartments Final -->
            <div class="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 touch-snap-card space-y-4 md:pt-20">
              <div class="flex items-center justify-between px-1">
                <span class="font-display font-bold text-xs uppercase tracking-wider text-rose-300">
                  Compartments Final
                </span>
                <span class="text-[10px] font-mono text-amber-400">Redemption King</span>
              </div>
              <div class="space-y-4">
                ${compFinal.map(m => this.renderMatchCard(tournament, m, isAdmin, false, true)).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- ZONE 3: ULTIMATE GRAND FINALS 1v1 (Main Undefeated vs Compartments King) -->
        <section class="glass-panel p-6 md:p-8 rounded-2xl border-2 border-amber-500/50 relative overflow-hidden shadow-2xl text-center">
          <div class="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-amber-500/10 to-rose-600/10 pointer-events-none"></div>

          <div class="relative z-10 max-w-xl mx-auto space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-display font-bold uppercase tracking-widest">
              👑 Crown of the Arena
            </div>

            <h3 class="font-display font-black text-2xl md:text-3xl text-white tracking-wide gradient-text-gold">
              GRAND FINALS 1v1 CLASH
            </h3>
            <p class="text-xs md:text-sm text-slate-300">
              The Undefeated Main Bracket Champion meets the Resurrected COMPARTMENTS Survivor. Only one takes the Grand Trophy & the Secret Prize Vault!
            </p>

            <div class="pt-2">
              ${grandFinal ? this.renderMatchCard(tournament, grandFinal, isAdmin, true, false, true) : `
                <div class="p-6 rounded-xl border border-dashed border-amber-500/30 bg-slate-900/60 text-slate-400 text-xs">
                  Awaiting Main Bracket & Compartments Section Finalists...
                </div>
              `}
            </div>

            <!-- Winner Podium / Secret Prize link display if tournament is completed -->
            ${tournament.champion ? `
              <div class="mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-500/20 via-violet-600/20 to-rose-600/20 border-2 border-amber-400 animate-pulse-slow">
                <div class="text-3xl mb-2">🏆</div>
                <span class="text-xs font-mono uppercase tracking-widest text-amber-300">Tournament Champion Crowned</span>
                <h2 class="font-display font-black text-2xl md:text-4xl text-white mt-1">
                  ${tournament.champion}
                </h2>

                <div class="mt-4 pt-4 border-t border-amber-500/30">
                  <div class="text-xs text-slate-300 mb-2">
                    Secret Winner Prize Link has been unlocked for <strong class="text-amber-300">${tournament.champion}</strong>!
                  </div>
                  <a 
                    href="${tournament.secretPrizeLink}" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="cyber-btn cyber-btn-violet text-xs py-2 px-5 inline-flex items-center gap-2"
                  >
                    <span>Open Secret Prize Vault</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            ` : ''}
          </div>
        </section>
      </div>
    `;
  }

  /* ==========================================================================
     MODE 3: VISUAL NODE GRID MAKER (Coding / Node-Graph Style)
     ========================================================================== */
  static renderMode3NodeGraph(tournament, isAdmin) {
    const participants = tournament.participants || [];

    return `
      <div class="space-y-4">
        <!-- Controls Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="font-mono text-cyan-300 font-bold uppercase tracking-wider">Node Graph Sandbox</span>
            <span class="text-slate-500">|</span>
            <span class="text-slate-400">Drag player nodes & connect glowing bezier wires to pair 1v1 matchups</span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="window.app.autoWireNodeGraph('${tournament.id}')" 
              class="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-display font-bold transition-all"
            >
              ⚡ Auto-Wire Pairs
            </button>
            <button 
              onclick="window.app.resetNodeGraphWires('${tournament.id}')" 
              class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white font-display font-bold transition-all"
            >
              Reset Wires
            </button>
          </div>
        </div>

        <!-- Mobile Touch Guide for Node Graph -->
        <div class="md:hidden flex items-center justify-between text-[11px] font-mono text-cyan-400 bg-cyan-950/40 p-2 px-3 rounded-lg border border-cyan-500/20">
          <span>📱 Node Canvas</span>
          <span>Swipe horizontally to view match ports ➔</span>
        </div>

        <!-- Node Canvas Container with horizontal scroll wrapper -->
        <div class="overflow-x-auto touch-scroll pb-4 -mx-1 px-1">
          <div id="nodeCanvasContainer" class="node-canvas-container relative min-w-[680px]">
            <!-- SVG Layer for Glowing Bezier Curves -->
            <svg id="nodeSvgLayer" class="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#8B5CF6" />
                  <stop offset="50%" stop-color="#06B6D4" />
                  <stop offset="100%" stop-color="#F43F5E" />
                </linearGradient>
                <filter id="wireGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <!-- Wires will be dynamically injected here -->
            </svg>

            <!-- Interactive Node Elements -->
            <div id="nodesWorkspace" class="absolute inset-0 w-full h-full min-w-[680px]">
            <!-- Left Column: Player Nodes -->
            <div class="absolute left-6 top-6 space-y-4">
              <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block px-1">
                Participant Nodes (${participants.length})
              </span>
              <div class="space-y-3" id="playerNodesList">
                ${participants.map((p, idx) => `
                  <div 
                    class="node-item glass-card p-3 rounded-xl border border-violet-500/40 w-56 flex items-center justify-between shadow-xl"
                    id="node_player_${p.username}"
                    data-username="${p.username}"
                    style="transform: translate(0px, ${idx * 6}px);"
                  >
                    <div class="flex items-center gap-2.5 overflow-hidden">
                      <div class="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/50 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                        ${p.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div class="overflow-hidden">
                        <div class="text-xs font-bold text-white truncate font-display">${p.username}</div>
                        <div class="text-[10px] text-slate-400 font-mono">
                          ${p.submittedLink ? '🟢 Edit Ready' : '🟡 Pending'}
                        </div>
                      </div>
                    </div>

                    <!-- Glowing Output Port -->
                    <div 
                      class="node-port output-port" 
                      data-node-type="player" 
                      data-username="${p.username}"
                      title="Drag wire to a Match Slot"
                      onclick="window.app.handlePortClick(this)"
                    ></div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right Column: 1v1 Match Containers -->
            <div class="absolute right-6 top-6 space-y-4">
              <span class="text-[10px] font-mono uppercase tracking-widest text-violet-400 block px-1">
                Match Nodes (1v1 Containers)
              </span>
              <div class="space-y-4" id="matchNodesList">
                ${[1, 2, 3, 4].map(idx => `
                  <div 
                    class="node-item glass-card p-3.5 rounded-xl border border-cyan-500/40 w-64 shadow-xl"
                    id="node_match_${idx}"
                  >
                    <div class="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
                      <span class="text-xs font-display font-bold text-cyan-300">1v1 Match #${idx}</span>
                      <span class="text-[9px] font-mono text-slate-400">Node Pair</span>
                    </div>

                    <div class="space-y-2">
                      <!-- Slot 1 -->
                      <div class="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-700/60">
                        <div 
                          class="node-port input-port mr-2" 
                          data-match-idx="${idx}" 
                          data-slot="1" 
                          title="Connect Player 1 here"
                          onclick="window.app.handlePortClick(this)"
                        ></div>
                        <span class="text-xs font-mono text-slate-300 truncate" id="slot_${idx}_1_label">Empty Slot 1</span>
                      </div>

                      <!-- VS Separator -->
                      <div class="text-center text-[10px] font-display font-black text-violet-400">VS</div>

                      <!-- Slot 2 -->
                      <div class="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-700/60">
                        <div 
                          class="node-port input-port mr-2" 
                          data-match-idx="${idx}" 
                          data-slot="2" 
                          title="Connect Player 2 here"
                          onclick="window.app.handlePortClick(this)"
                        ></div>
                        <span class="text-xs font-mono text-slate-300 truncate" id="slot_${idx}_2_label">Empty Slot 2</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     MATCHUP CARD RENDERER
     ========================================================================== */
  static renderMatchCard(tournament, match, isAdmin, isFinal = false, isCompartment = false, isGrandFinal = false) {
    const isCompleted = match.status === 'COMPLETED';
    const isReady = match.player1 && match.player2 && !isCompleted;

    const p1Score = match.score1 !== null ? Number(match.score1).toFixed(1) : '-';
    const p2Score = match.score2 !== null ? Number(match.score2).toFixed(1) : '-';

    const p1Won = isCompleted && match.winner === match.player1;
    const p2Won = isCompleted && match.winner === match.player2;

    const cardBorderClass = isGrandFinal 
      ? 'border-amber-400/80 shadow-amber-500/20' 
      : (isCompartment ? 'compartment-match' : 'border-violet-500/30');

    return `
      <div class="matchup-card p-3.5 rounded-xl border ${cardBorderClass} ${isReady ? 'active-match' : ''} bg-slate-900/80 shadow-lg">
        <!-- Match Header -->
        <div class="flex items-center justify-between text-[11px] mb-2.5 pb-2 border-b border-slate-800">
          <span class="font-mono text-slate-400">
            ${match.bracket === 'GRAND_FINALS' ? '🏆 GRAND FINALS' : (isCompartment ? '🔥 COMPARTMENTS' : '⚡ 1v1 MATCH')}
          </span>
          <span class="px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : (isReady ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' : 'bg-slate-800 text-slate-400')}">
            ${isCompleted ? 'Judged' : (isReady ? 'Ready to Judge' : 'Waiting')}
          </span>
        </div>

        <!-- Participants Rows -->
        <div class="space-y-2">
          <!-- Player 1 -->
          <div class="flex items-center justify-between p-2 rounded-lg ${p1Won ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-slate-950/60 border border-slate-800/80'}">
            <div class="flex items-center gap-2 overflow-hidden">
              <div class="w-7 h-7 rounded-md bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-display font-bold text-[11px] text-white flex-shrink-0">
                ${match.player1 ? match.player1.substring(0, 2).toUpperCase() : '?'}
              </div>
              <span class="font-display font-bold text-xs truncate ${p1Won ? 'text-emerald-300' : (match.player1 ? 'text-slate-200' : 'text-slate-500 italic')}">
                ${match.player1 || 'TBD (Waiting)'}
              </span>
            </div>

            <!-- Score / Winner Pill -->
            <div class="flex items-center gap-2 flex-shrink-0">
              ${p1Won ? '<span class="text-xs">👑</span>' : ''}
              <span class="font-mono font-bold text-xs px-2 py-0.5 rounded ${p1Won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">
                ${p1Score}
              </span>
            </div>
          </div>

          <!-- Player 2 -->
          <div class="flex items-center justify-between p-2 rounded-lg ${p2Won ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-slate-950/60 border border-slate-800/80'}">
            <div class="flex items-center gap-2 overflow-hidden">
              <div class="w-7 h-7 rounded-md bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center font-display font-bold text-[11px] text-white flex-shrink-0">
                ${match.player2 ? match.player2.substring(0, 2).toUpperCase() : '?'}
              </div>
              <span class="font-display font-bold text-xs truncate ${p2Won ? 'text-emerald-300' : (match.player2 ? 'text-slate-200' : 'text-slate-500 italic')}">
                ${match.player2 || 'TBD (Waiting)'}
              </span>
            </div>

            <!-- Score / Winner Pill -->
            <div class="flex items-center gap-2 flex-shrink-0">
              ${p2Won ? '<span class="text-xs">👑</span>' : ''}
              <span class="font-mono font-bold text-xs px-2 py-0.5 rounded ${p2Won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">
                ${p2Score}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          ${isCompleted ? `
            <div class="text-[10px] text-slate-400 truncate">
              Judged by <strong class="text-violet-300">${match.judgedBy || 'Admin'}</strong>
            </div>
          ` : `
            <div class="text-[10px] text-slate-500">
              ${isReady ? 'Both editors paired' : 'Awaiting opponents'}
            </div>
          `}

          <div class="flex items-center gap-1.5">
            ${isReady || isCompleted ? `
              <button 
                onclick="window.app.openBattleModal('${tournament.id}', '${match.id}')" 
                class="px-2.5 py-1 text-xs font-display font-bold rounded ${isAdmin && isReady ? 'cyber-btn-violet text-white' : 'bg-slate-800 text-slate-300 hover:text-white'} transition-all"
              >
                ${isAdmin && isReady ? '⚖️ Judge Battle' : '👁️ Watch Edits'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static renderEmptyBracketState(tournament, isAdmin, mode) {
    return `
      <div class="p-8 rounded-2xl glass-card border border-dashed border-violet-500/30 text-center space-y-4">
        <div class="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto text-xl">
          🎲
        </div>
        <h4 class="font-display font-black text-lg text-white">No Match Grid Initialized</h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Registered participants have not been seeded into brackets yet. Admins can click "Quick Match" to automatically pair participants!
        </p>
        ${isAdmin ? `
          <button 
            onclick="window.app.quickMatchTournament('${tournament.id}')" 
            class="cyber-btn cyber-btn-violet text-xs py-2 px-5 inline-flex items-center gap-2"
          >
            <span>Auto-Seed Quick Match</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }
}

window.BracketModesComponent = BracketModesComponent;
