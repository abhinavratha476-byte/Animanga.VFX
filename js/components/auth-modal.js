/**
 * Authentication Modal Component
 * Strictly Username + Password Only (No email or phone required)
 */

class AuthModalComponent {
  static render() {
    return `
      <div id="authModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-overlay hidden">
        <div class="relative w-full max-w-md max-h-[92dvh] overflow-y-auto glass-card rounded-2xl border border-violet-500/40 p-5 sm:p-7 md:p-8 shadow-2xl">
          <!-- Close button -->
          <button 
            onclick="window.app.closeAuthModal()" 
            class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Header -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="font-display font-black text-2xl text-white tracking-wide" id="authModalTitle">
              Sign In to Arena
            </h3>
            <p class="text-xs text-slate-400 mt-1">Username + Password only. Zero cloud signup needed.</p>
          </div>

          <!-- Auth Tab Switcher (Sign In vs Register) -->
          <div class="flex p-1 rounded-xl bg-slate-900/80 border border-violet-500/20 mb-5">
            <button 
              id="authTabSignIn" 
              onclick="window.app.switchAuthMode('signin')" 
              class="flex-1 py-1.5 text-xs font-display font-bold rounded-lg transition-all bg-violet-600 text-white shadow-md shadow-violet-600/40"
            >
              Sign In
            </button>
            <button 
              id="authTabRegister" 
              onclick="window.app.switchAuthMode('register')" 
              class="flex-1 py-1.5 text-xs font-display font-bold rounded-lg text-slate-400 hover:text-white transition-all"
            >
              New Register
            </button>
          </div>

          <!-- Feedback message -->
          <div id="authAlert" class="hidden p-3 rounded-lg mb-4 text-xs font-medium"></div>

          <!-- Form -->
          <form id="authForm" onsubmit="window.app.handleAuthSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  id="authUsername" 
                  required 
                  autocomplete="username"
                  placeholder="Username" 
                  class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div class="relative">
                <input 
                  type="password" 
                  id="authPassword" 
                  required 
                  autocomplete="current-password"
                  placeholder="••••••••••••" 
                  class="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-violet-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
                />
              </div>
            </div>

            <button 
              type="submit" 
              id="authSubmitBtn" 
              class="w-full cyber-btn cyber-btn-violet py-2.5 text-sm font-display font-bold shadow-lg shadow-violet-500/30"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    `;
  }
}

window.AuthModalComponent = AuthModalComponent;
