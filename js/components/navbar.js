/**
 * Responsive Navigation Component
 * Desktop Collapsible Left Sidebar + Mobile Floating Glass Bottom Bar
 * Tabs: TOURNAMENTS, PROFILE, CHATS, SETTINGS
 */

class NavbarComponent {
  static renderDesktopSidebar(activeTab, currentUser) {
    const roleBadgeClass = currentUser?.role === 'Owner / President' 
      ? 'badge-owner' 
      : (currentUser?.role === 'Admin' ? 'badge-admin' : 'badge-participant');

    const roleIcon = currentUser?.role === 'Owner / President'
      ? '👑'
      : (currentUser?.role === 'Admin' ? '🛡️' : '⚡');

    return `
      <aside class="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-[var(--bg-secondary)] backdrop-blur-xl border-r border-[var(--border-subtle)] z-40 select-none transition-all duration-300">
        <!-- Brand Header -->
        <div class="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 p-[2px] shadow-lg shadow-violet-500/30 flex-shrink-0">
              <div class="w-full h-full bg-[#08090E] rounded-[10px] flex items-center justify-center font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                A
              </div>
            </div>
            <div>
              <h1 class="font-display font-black text-lg tracking-wider text-white leading-none">
                ANIMANGA<span class="text-violet-400">.</span>VFX
              </h1>
              <span class="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Esports Edit Arena</span>
            </div>
          </div>
        </div>

        <!-- Supabase Cloud Sync Pill (Automatic Cloud Connection) -->
        <div class="mx-3 mt-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono select-none shadow-sm">
          <div class="flex items-center gap-1.5 text-slate-300">
            <span class="text-cyan-400">⚡</span>
            <span>CLOUD SYNC</span>
          </div>
          <span class="flex items-center gap-1.5 font-bold ${window.supabaseClientEngine?.isConnected ? 'text-emerald-400' : 'text-amber-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${window.supabaseClientEngine?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
            ${window.supabaseClientEngine?.isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <!-- Current User Status Card -->
        <div class="p-4 mx-3 my-3 rounded-xl bg-slate-900/50 border border-violet-500/20">
          ${currentUser ? `
            <div class="flex items-center gap-3">
              <img 
                src="${currentUser.avatar || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop&q=80'}" 
                alt="${currentUser.username}" 
                class="w-11 h-11 avatar-square border-2 border-violet-500/40"
              />
              <div class="overflow-hidden flex-1">
                <div class="flex flex-col">
                  <span class="font-display font-bold text-sm text-slate-100 truncate">${currentUser.name || currentUser.username}</span>
                  <span class="text-[10px] font-mono text-cyan-400 truncate">@${currentUser.username}</span>
                </div>
                <div class="mt-1">
                  <span class="rank-badge ${roleBadgeClass} text-[9px] py-0.5 px-2">
                    ${roleIcon} ${currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          ` : `
            <div class="text-center py-1">
              <button onclick="window.app.openAuthModal()" class="w-full cyber-btn cyber-btn-violet text-xs py-2">
                Sign In / Register
              </button>
            </div>
          `}
        </div>

        <!-- Navigation Tabs (Desktop) -->
        <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <button 
            onclick="window.app.switchTab('tournaments')" 
            class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${activeTab === 'tournaments' ? 'bg-violet-600/25 text-white border border-violet-500/50 shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}"
          >
            <svg class="w-5 h-5 ${activeTab === 'tournaments' ? 'text-violet-400' : 'text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>TOURNAMENTS</span>
          </button>

          <button 
            onclick="window.app.switchTab('chats')" 
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${activeTab === 'chats' ? 'bg-violet-600/25 text-white border border-violet-500/50 shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}"
          >
            <div class="flex items-center gap-3.5">
              <svg class="w-5 h-5 ${activeTab === 'chats' ? 'text-violet-400' : 'text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span>CHATS</span>
            </div>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button 
            onclick="window.app.switchTab('profile')" 
            class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${activeTab === 'profile' ? 'bg-violet-600/25 text-white border border-violet-500/50 shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}"
          >
            <svg class="w-5 h-5 ${activeTab === 'profile' ? 'text-violet-400' : 'text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>PROFILE</span>
          </button>

          <button 
            onclick="window.app.switchTab('settings')" 
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${activeTab === 'settings' ? 'bg-violet-600/25 text-white border border-violet-500/50 shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}"
          >
            <div class="flex items-center gap-3.5">
              <svg class="w-5 h-5 ${activeTab === 'settings' ? 'text-violet-400' : 'text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>SETTINGS</span>
            </div>
            ${currentUser?.role === 'Owner / President' ? `
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ROLE MGR
              </span>
            ` : ''}
          </button>
        </nav>

        <!-- Sidebar Footer Controls -->
        <div class="p-4 border-t border-[var(--border-subtle)] space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-400 px-1">
            <span class="font-mono">AUDIO SFX</span>
            <button 
              onclick="window.app.toggleAudio()" 
              class="px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:text-white font-mono text-[11px]"
              id="desktopAudioToggleBtn"
            >
              ${window.soundEngine?.enabled ? '🔊 ON' : '🔇 OFF'}
            </button>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button 
              onclick="window.app.openAuthModal()" 
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-display font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-center"
            >
              Switch Account
            </button>
            ${currentUser ? `
              <button 
                onclick="window.app.logout()" 
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-all"
                title="Sign Out"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
      </aside>
    `;
  }

  static renderMobileBottomBar(activeTab) {
    return `
      <!-- Floating Glass Bottom Bar (Mobile Only) -->
      <nav class="md:hidden fixed bottom-3 left-3 right-3 h-16 rounded-2xl glass-panel border border-violet-500/40 flex items-center justify-around px-2 z-50 shadow-2xl safe-bottom backdrop-blur-2xl bg-[#0b0d16]/90">
        <button 
          onclick="window.app.switchTab('tournaments')" 
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all active:scale-95 ${activeTab === 'tournaments' ? 'text-violet-400 font-bold' : 'text-slate-400'}"
        >
          <div class="relative p-1">
            <svg class="w-5 h-5 ${activeTab === 'tournaments' ? 'text-violet-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            ${activeTab === 'tournaments' ? '<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400"></span>' : ''}
          </div>
          <span class="text-[10px] font-display tracking-tight mt-0.5">Tourneys</span>
        </button>

        <button 
          onclick="window.app.switchTab('chats')" 
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all active:scale-95 relative ${activeTab === 'chats' ? 'text-violet-400 font-bold' : 'text-slate-400'}"
        >
          <div class="relative p-1">
            <svg class="w-5 h-5 ${activeTab === 'chats' ? 'text-violet-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ${activeTab === 'chats' ? '<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400"></span>' : ''}
          </div>
          <span class="text-[10px] font-display tracking-tight mt-0.5">Chats</span>
        </button>

        <button 
          onclick="window.app.switchTab('profile')" 
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all active:scale-95 ${activeTab === 'profile' ? 'text-violet-400 font-bold' : 'text-slate-400'}"
        >
          <div class="relative p-1">
            <svg class="w-5 h-5 ${activeTab === 'profile' ? 'text-violet-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            ${activeTab === 'profile' ? '<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400"></span>' : ''}
          </div>
          <span class="text-[10px] font-display tracking-tight mt-0.5">Profile</span>
        </button>

        <button 
          onclick="window.app.switchTab('settings')" 
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all active:scale-95 ${activeTab === 'settings' ? 'text-violet-400 font-bold' : 'text-slate-400'}"
        >
          <div class="relative p-1">
            <svg class="w-5 h-5 ${activeTab === 'settings' ? 'text-violet-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            ${activeTab === 'settings' ? '<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400"></span>' : ''}
          </div>
          <span class="text-[10px] font-display tracking-tight mt-0.5">Settings</span>
        </button>
      </nav>
    `;
  }

  static renderMobileTopBar(currentUser) {
    const roleBadgeClass = currentUser?.role === 'Owner / President' 
      ? 'badge-owner' 
      : (currentUser?.role === 'Admin' ? 'badge-admin' : 'badge-participant');

    const roleIcon = currentUser?.role === 'Owner / President' ? '👑' : (currentUser?.role === 'Admin' ? '🛡️' : '⚡');

    return `
      <!-- Mobile Top Bar -->
      <header class="md:hidden sticky top-0 w-full h-14 bg-[#08090E]/90 backdrop-blur-xl border-b border-violet-500/20 flex items-center justify-between px-3 sm:px-4 z-40 safe-top">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1.5px] flex-shrink-0">
            <div class="w-full h-full bg-[#08090E] rounded-[6px] flex items-center justify-center font-display font-black text-xs text-violet-400">
              A
            </div>
          </div>
          <span class="font-display font-black text-sm tracking-wide text-white truncate">
            ANIMANGA<span class="text-violet-400">.</span>VFX
          </span>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Mobile Cloud Sync Pill -->
          <div 
            class="px-2 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 flex items-center gap-1.5 text-[10px] font-mono select-none ${window.supabaseClientEngine?.isConnected ? 'text-emerald-400' : 'text-amber-400'}"
            title="Cloud Database Sync Status"
          >
            <span class="w-1.5 h-1.5 rounded-full ${window.supabaseClientEngine?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
            <span>${window.supabaseClientEngine?.isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          ${currentUser ? `
            <div onclick="window.app.openAuthModal()" class="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform" title="Switch Account">
              <span class="rank-badge ${roleBadgeClass} text-[8px] py-0.5 px-1.5 hidden xs:inline-block">
                ${roleIcon} ${currentUser.role}
              </span>
              <img 
                src="${currentUser.avatar || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop&q=80'}" 
                alt="${currentUser.username}" 
                class="w-8 h-8 avatar-square border border-violet-500/40"
              />
            </div>
          ` : `
            <button onclick="window.app.openAuthModal()" class="cyber-btn cyber-btn-violet text-xs py-1 px-3">
              Sign In
            </button>
          `}
        </div>
      </header>
    `;
  }
}

window.NavbarComponent = NavbarComponent;
