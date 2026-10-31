/**
 * 1v1 Battle Comparison & Admin Judging Modal
 * Side-by-Side AnonMP4 Players + 10-Point Score Inputs & Criteria Breakdown
 */

class JudgingModalComponent {
  static render() {
    return `
      <div id="judgingModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 modal-overlay hidden">
        <div class="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto glass-card rounded-2xl border-2 border-violet-500/50 p-4 sm:p-7 shadow-2xl">
          <!-- Close button -->
          <button 
            onclick="window.app.closeBattleModal()" 
            class="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 z-20"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="mb-5 pb-3 border-b border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase tracking-wider text-cyan-400">1v1 Esports Matchup</span>
                <span id="judgeModalBracketBadge" class="text-[10px] px-2 py-0.5 rounded bg-violet-600/30 text-violet-300 font-bold border border-violet-500/40">
                  MAIN BRACKET
                </span>
              </div>
              <h3 class="font-display font-black text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
                Battle Comparison & Scoring
              </h3>
            </div>

            <div class="text-xs font-mono text-slate-400">
              Scoring Scale: <strong class="text-cyan-400">0.0 to 10.0 Marks</strong>
            </div>
          </div>

          <!-- Mobile Tab Switcher for Videos -->
          <div class="md:hidden flex p-1 rounded-xl bg-slate-900 border border-violet-500/30 mb-3 gap-1">
            <button 
              type="button" 
              onclick="window.app.switchMobileBattleTab('p1')" 
              id="mobileBattleTabP1"
              class="flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-violet-600 text-white shadow-md text-center"
            >
              🎬 Player 1
            </button>
            <button 
              type="button" 
              onclick="window.app.switchMobileBattleTab('p2')" 
              id="mobileBattleTabP2"
              class="flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center"
            >
              🎬 Player 2
            </button>
            <button 
              type="button" 
              onclick="window.app.switchMobileBattleTab('both')" 
              id="mobileBattleTabBoth"
              class="py-1.5 px-3 text-xs font-display font-bold rounded-lg transition-all text-slate-400 hover:text-white text-center"
            >
              ⊞ Both
            </button>
          </div>

          <!-- Side-by-Side 1v1 Video Arena -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5 sm:mb-6">
            <!-- PLAYER 1 ARENA -->
            <div id="judgeP1ArenaWrapper" class="space-y-3 p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/30 flex flex-col justify-between">
              <!-- Player 1 Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-violet-600/30 border border-violet-500/50 flex items-center justify-center font-display font-bold text-xs sm:text-sm text-white" id="judgeP1Avatar">
                    P1
                  </div>
                  <div>
                    <h4 class="font-display font-black text-sm sm:text-base text-white" id="judgeP1Username">Player 1</h4>
                    <span class="text-[10px] text-cyan-400 font-mono" id="judgeP1App">After Effects</span>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-[9px] sm:text-[10px] font-mono text-slate-400 block">CURRENT MARK</span>
                  <span class="font-display font-black text-base sm:text-lg text-violet-300" id="judgeP1ScoreDisplay">-- / 10</span>
                </div>
              </div>

              <!-- Player 1 Video Player Container -->
              <div id="judgeP1PlayerContainer" class="w-full my-1.5 sm:my-2">
                <!-- Injected AnonMP4 player -->
              </div>
            </div>

            <!-- PLAYER 2 ARENA -->
            <div id="judgeP2ArenaWrapper" class="hidden md:flex space-y-3 p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex-col justify-between">
              <!-- Player 2 Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center font-display font-bold text-xs sm:text-sm text-white" id="judgeP2Avatar">
                    P2
                  </div>
                  <div>
                    <h4 class="font-display font-black text-sm sm:text-base text-white" id="judgeP2Username">Player 2</h4>
                    <span class="text-[10px] text-cyan-400 font-mono" id="judgeP2App">Alight Motion</span>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-[9px] sm:text-[10px] font-mono text-slate-400 block">CURRENT MARK</span>
                  <span class="font-display font-black text-base sm:text-lg text-cyan-300" id="judgeP2ScoreDisplay">-- / 10</span>
                </div>
              </div>

              <!-- Player 2 Video Player Container -->
              <div id="judgeP2PlayerContainer" class="w-full my-1.5 sm:my-2">
                <!-- Injected AnonMP4 player -->
              </div>
            </div>
          </div>

          <!-- ADMIN JUDGE SCORING PANEL (Admin Only) -->
          <div id="judgeAdminControlPanel" class="p-5 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-cyan-950/40 border-2 border-violet-500/50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></span>
                <span class="font-display font-black text-sm uppercase tracking-wider text-white">
                  Official Admin Judge Panel (Score Out of 10)
                </span>
              </div>
              <span class="text-xs text-slate-400 font-mono">Higher score advances</span>
            </div>

            <form onsubmit="window.app.submitJudgeScores(event)" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Score Input P1 -->
                <div class="p-3.5 rounded-xl bg-slate-900/90 border border-violet-500/40">
                  <label class="block text-xs font-display font-bold uppercase tracking-wider text-violet-300 mb-2">
                    <span id="judgeP1InputLabel">Player 1</span> Mark (/10)
                  </label>
                  <div class="flex items-center gap-3">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      required 
                      id="judgeScoreInput1" 
                      placeholder="e.g. 9.4"
                      class="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/40 text-white font-mono font-bold text-lg focus:outline-none focus:border-violet-400"
                    />
                    <div class="flex flex-col gap-1">
                      <button 
                        type="button" 
                        onclick="window.app.stepScore(1, 0.1)" 
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                      >▲</button>
                      <button 
                        type="button" 
                        onclick="window.app.stepScore(1, -0.1)" 
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                      >▼</button>
                    </div>
                  </div>
                </div>

                <!-- Score Input P2 -->
                <div class="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                  <label class="block text-xs font-display font-bold uppercase tracking-wider text-cyan-300 mb-2">
                    <span id="judgeP2InputLabel">Player 2</span> Mark (/10)
                  </label>
                  <div class="flex items-center gap-3">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      required 
                      id="judgeScoreInput2" 
                      placeholder="e.g. 8.8"
                      class="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-cyan-500/40 text-white font-mono font-bold text-lg focus:outline-none focus:border-cyan-400"
                    />
                    <div class="flex flex-col gap-1">
                      <button 
                        type="button" 
                        onclick="window.app.stepScore(2, 0.1)" 
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                      >▲</button>
                      <button 
                        type="button" 
                        onclick="window.app.stepScore(2, -0.1)" 
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                      >▼</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Judge Notes / Feedback -->
              <div>
                <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Judge Feedback & Critique
                </label>
                <textarea 
                  id="judgeNotesInput" 
                  rows="2" 
                  placeholder="Critique transition flow, velocity curves, audio sync beats, or color grading..."
                  class="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span class="text-amber-400">⚠️</span>
                  <span>Confirming will immediately advance the winner and route the loser per bracket rules.</span>
                </div>

                <button 
                  type="submit" 
                  class="cyber-btn cyber-btn-violet py-2.5 px-6 text-sm font-display font-bold shadow-lg shadow-violet-600/40 w-full sm:w-auto"
                >
                  Confirm & Lock Marks
                </button>
              </div>
            </form>
          </div>

          <!-- Non-Admin Read-Only Notice -->
          <div id="judgeSpectatorNotice" class="hidden p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            You are viewing this matchup as a spectator. Only appointed Tournament Judges (<strong class="text-violet-300">Admin</strong> and <strong class="text-amber-300">Owner</strong>) can record scores out of 10.
          </div>
        </div>
      </div>
    `;
  }
}

window.JudgingModalComponent = JudgingModalComponent;
