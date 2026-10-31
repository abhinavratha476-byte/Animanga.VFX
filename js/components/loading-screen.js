/**
 * 10-Second Cyber-Anime Splash / Loading Screen Component
 * Displays App Name & "Made By NAXIMAX STUDIOS / Abhinav"
 * Runs for exactly 10.0 seconds with smooth progress bar & countdown
 */

class LoadingScreenComponent {
  static render() {
    return `
      <div id="loadingSplashOverlay" class="splash-overlay cyber-grid-bg">
        <!-- Ambient anime lighting orbs -->
        <div class="absolute w-96 h-96 bg-violet-600/25 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
        <div class="absolute w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

        <!-- Optional Skip Button in corner -->
        <button 
          onclick="window.LoadingScreenComponent.skip()" 
          class="absolute top-6 right-6 text-[11px] font-mono tracking-widest text-slate-500 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 transition-all z-20"
        >
          SKIP INTRO [ESC]
        </button>

        <div class="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-6 space-y-6">
          <!-- Animated Cyber Esports Logo Crest -->
          <div class="relative group">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-violet-600 via-rose-500 to-cyan-400 p-[3px] splash-logo-glow shadow-2xl">
              <div class="w-full h-full bg-[#07080E] rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <!-- Inner rotating grid accent -->
                <div class="absolute inset-0 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                <span class="font-display font-black text-5xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-300 to-cyan-400 select-none">
                  A
                </span>
              </div>
            </div>

            <!-- Pulsing ring -->
            <div class="absolute -inset-3 rounded-3xl border border-violet-500/30 animate-ping pointer-events-none opacity-40"></div>
          </div>

          <!-- App Title -->
          <div class="space-y-1">
            <h1 class="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-wider text-white">
              ANIMANGA<span class="text-violet-400">.</span>VFX
            </h1>
            <span class="text-xs sm:text-sm font-mono tracking-[0.3em] text-cyan-400 uppercase font-bold block">
              Esports Edit Tournament Arena
            </span>
          </div>

          <!-- MADE BY NAXIMAX STUDIOS / ABHINAV BRANDING PILL -->
          <div class="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600/25 via-pink-600/25 to-cyan-500/25 border-2 border-violet-400/50 shadow-xl shadow-violet-500/30 backdrop-blur-md">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span class="text-xs sm:text-sm font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-pink-300 to-cyan-300 uppercase">
                Made By NAXIMAX STUDIOS / Abhinav
              </span>
            </div>
          </div>

          <!-- 10-Second Progress Bar & Real-Time Countdown -->
          <div class="w-full max-w-md pt-4 space-y-2.5">
            <div class="flex items-center justify-between text-xs font-mono">
              <span id="splashStatusText" class="text-slate-400 truncate tracking-wide text-[11px]">
                INITIALIZING ARENA MATRIX...
              </span>
              <span id="splashCountdownTimer" class="text-cyan-400 font-bold ml-2 flex-shrink-0">
                10.0s
              </span>
            </div>

            <!-- Progress Track -->
            <div class="w-full h-2 rounded-full bg-slate-900 border border-violet-500/30 overflow-hidden p-[1px] shadow-inner">
              <div 
                id="splashProgressBar" 
                class="h-full rounded-full bg-gradient-to-r from-violet-500 via-rose-500 to-cyan-400 transition-all duration-75"
                style="width: 0%;"
              ></div>
            </div>

            <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>SYSTEM BOOT</span>
              <span id="splashPercentageText">0%</span>
              <span>60 FPS READY</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static start() {
    const overlay = document.getElementById('loadingSplashOverlay');
    if (!overlay) return;

    const progressBar = document.getElementById('splashProgressBar');
    const timerText = document.getElementById('splashCountdownTimer');
    const statusText = document.getElementById('splashStatusText');
    const percentageText = document.getElementById('splashPercentageText');

    const TOTAL_DURATION_MS = 10000; // Exactly 10.0 seconds
    const startTime = performance.now();

    const statusSteps = [
      { at: 0, text: 'INITIALIZING CORE ANIMANGA MATRIX...' },
      { at: 2000, text: 'CALIBRATING 60FPS COMPOSITING SHADERS...' },
      { at: 4000, text: 'POWERED BY NAXIMAX STUDIOS / ABHINAV...' },
      { at: 6000, text: 'CONNECTING ARENA STORAGE & BROADCAST SYNC...' },
      { at: 8000, text: 'COMPARTMENTS REDEMPTION GRID ONLINE...' },
      { at: 9400, text: 'WELCOME TO THE ARENA!' }
    ];

    // Keyboard ESC to skip
    const escListener = (e) => {
      if (e.key === 'Escape') {
        LoadingScreenComponent.skip();
      }
    };
    window.addEventListener('keydown', escListener);

    function frame(now) {
      if (LoadingScreenComponent._hasSkipped) {
        window.removeEventListener('keydown', escListener);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / TOTAL_DURATION_MS);
      const remainingSecs = Math.max(0, (TOTAL_DURATION_MS - elapsed) / 1000).toFixed(1);
      const percentage = Math.min(100, Math.floor(progress * 100));

      if (progressBar) progressBar.style.width = `${percentage}%`;
      if (timerText) timerText.textContent = `${remainingSecs}s`;
      if (percentageText) percentageText.textContent = `${percentage}%`;

      // Update status text
      const currentStep = statusSteps.filter(s => elapsed >= s.at).pop();
      if (currentStep && statusText && statusText.textContent !== currentStep.text) {
        statusText.textContent = currentStep.text;
      }

      if (elapsed < TOTAL_DURATION_MS) {
        requestAnimationFrame(frame);
      } else {
        window.removeEventListener('keydown', escListener);
        LoadingScreenComponent.finish();
      }
    }

    requestAnimationFrame(frame);
  }

  static finish() {
    if (this._hasFinished) return;
    this._hasFinished = true;

    const overlay = document.getElementById('loadingSplashOverlay');
    if (overlay) {
      overlay.classList.add('splash-hidden');
      setTimeout(() => {
        overlay.remove();
      }, 900);
    }

    // Play welcome victory fanfare / sound
    if (window.soundEngine) {
      window.soundEngine.playConnect();
    }

    // Prompt user to Sign In or Register on first visit if not logged in
    if (!window.esportsStore?.getCurrentUser() && window.app) {
      setTimeout(() => {
        window.app.openAuthModal();
      }, 350);
    }
  }

  static skip() {
    this._hasSkipped = true;
    this.finish();
  }
}

window.LoadingScreenComponent = LoadingScreenComponent;
