/**
 * Discord-Style Tournament Chats Component
 * Channel Sidebar (#general-chat + #<tournament>)
 * Glowing Rank Badges: Owner / President, Admin, Participant
 * Pinned Announcements, Delete Moderation & Multi-tab Sync
 */

class ChatsViewComponent {
  static render(activeChannelId, tournaments, currentUser) {
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Owner / President';
    const chats = window.esportsStore.getChats();
    const messages = chats[activeChannelId] || [];

    // Derive channel title
    let channelTitle = '#general-chat';
    let channelTopic = 'Animanga community lounge, editing discussions, and technique showcase.';
    if (activeChannelId !== 'general') {
      const tourn = tournaments.find(t => t.id === activeChannelId);
      if (tourn) {
        channelTitle = `#${tourn.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;
        channelTopic = `Official discussion, bracket announcements, and scoring logs for ${tourn.title}`;
      }
    }

    const pinnedAnnouncement = messages.find(m => m.isAnnouncement);

    return `
      <div class="h-[calc(100dvh-170px)] min-h-[480px] md:h-[calc(100vh-60px)] flex flex-col md:flex-row rounded-2xl glass-panel border border-violet-500/30 overflow-hidden shadow-2xl">
        <!-- Discord-style Channel List (Desktop Left Column) -->
        <div class="hidden md:flex w-64 lg:w-72 bg-slate-950/80 border-r border-violet-500/20 flex-col justify-between flex-shrink-0">
          <div>
            <!-- Header -->
            <div class="p-3.5 border-b border-violet-500/20 flex items-center justify-between">
              <span class="font-display font-black text-xs uppercase tracking-wider text-slate-300">
                Tournament Channels
              </span>
              <span class="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                VOICE / CHAT
              </span>
            </div>

            <!-- Channels Nav -->
            <div class="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
              <!-- General Channel -->
              <button 
                onclick="window.app.switchChatChannel('general')" 
                class="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-display font-bold transition-all ${activeChannelId === 'general' ? 'bg-violet-600/30 text-white border border-violet-500/50' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}"
              >
                <div class="flex items-center gap-2 truncate">
                  <span class="text-violet-400 font-mono text-sm">#</span>
                  <span class="truncate">general-chat</span>
                </div>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>

              <!-- Tournament Channels Section -->
              <div class="pt-3 pb-1 px-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Live Tournaments
              </div>

              ${tournaments.map(t => {
                const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18);
                const isActive = activeChannelId === t.id;
                return `
                  <button 
                    onclick="window.app.switchChatChannel('${t.id}')" 
                    class="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-display font-bold transition-all ${isActive ? 'bg-violet-600/30 text-white border border-violet-500/50' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="text-cyan-400 font-mono text-sm">#</span>
                      <span class="truncate">${slug}</span>
                    </div>
                    <span class="text-[9px] font-mono text-slate-500">${t.participants.length}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Online Status Pill -->
          <div class="p-3 border-t border-violet-500/20 bg-slate-900/60 flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-slate-400 text-[11px] font-mono">Realtime Sync Active</span>
          </div>
        </div>

        <!-- Chat Main Room Area (Right Column) -->
        <div class="flex-1 flex flex-col bg-slate-900/40 relative min-w-0 h-full">
          <!-- Mobile Horizontal Channel Selector Carousel (Phone Only) -->
          <div class="md:hidden p-2 px-3 bg-slate-950/90 border-b border-violet-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            <span class="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0">CHANNELS:</span>
            <button 
              onclick="window.app.switchChatChannel('general')" 
              class="px-2.5 py-1 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${activeChannelId === 'general' ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'}"
            >
              <span class="text-violet-400 font-mono">#</span>
              <span>general-chat</span>
            </button>
            ${tournaments.map(t => {
              const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 16);
              const isActive = activeChannelId === t.id;
              return `
                <button 
                  onclick="window.app.switchChatChannel('${t.id}')" 
                  class="px-2.5 py-1 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'}"
                >
                  <span class="text-cyan-400 font-mono">#</span>
                  <span>${slug}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Room Header -->
          <div class="p-3 sm:p-3.5 px-3 sm:px-5 border-b border-violet-500/20 flex items-center justify-between bg-slate-950/40 flex-shrink-0">
            <div class="flex items-center gap-2 min-w-0 overflow-hidden">
              <span class="text-violet-400 font-mono text-base font-bold">#</span>
              <div class="overflow-hidden">
                <h3 class="font-display font-bold text-xs sm:text-sm text-white truncate">${channelTitle}</h3>
                <p class="text-[10px] sm:text-[11px] text-slate-400 truncate">${channelTopic}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-[9px] sm:text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                ${messages.length} msgs
              </span>
            </div>
          </div>

          <!-- Pinned Announcement (If any) -->
          ${pinnedAnnouncement ? `
            <div class="p-2.5 px-4 bg-gradient-to-r from-amber-500/15 via-violet-600/10 to-transparent border-b border-amber-500/30 flex items-center justify-between text-xs flex-shrink-0">
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-amber-400 text-sm">📌</span>
                <span class="text-slate-300 truncate">
                  <strong class="text-amber-300 font-display">PINNED:</strong> ${pinnedAnnouncement.text}
                </span>
              </div>
              <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${pinnedAnnouncement.timestamp}</span>
            </div>
          ` : ''}

          <!-- Message History -->
          <div id="chatMessageHistory" class="flex-1 p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto min-h-0">
            ${messages.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-8">
                <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span class="text-xs font-mono">No messages in this channel yet. Say hi to fellow editors!</span>
              </div>
            ` : messages.map(m => this.renderMessage(m, isAdmin)).join('')}
          </div>

          <!-- Message Input Bar -->
          <div class="p-2.5 sm:p-3.5 border-t border-violet-500/20 bg-slate-950/90 flex-shrink-0">
            <form onsubmit="window.app.handleSendMessage(event, '${activeChannelId}')" class="space-y-2">
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  id="chatInputText" 
                  required 
                  autocomplete="off"
                  placeholder="Message ${channelTitle}..." 
                  class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[var(--bg-input)] border border-violet-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-violet-400 min-h-[42px]"
                />

                <button 
                  type="submit" 
                  class="cyber-btn cyber-btn-violet py-2 px-3.5 sm:px-4 text-xs font-display font-bold shadow-md flex-shrink-0 min-h-[42px] flex items-center justify-center active:scale-95"
                >
                  <span class="hidden xs:inline">Send</span>
                  <svg class="w-4 h-4 xs:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </div>

              ${isAdmin ? `
                <div class="flex items-center gap-2 px-1">
                  <label class="flex items-center gap-1.5 text-[11px] text-amber-300 cursor-pointer">
                    <input type="checkbox" id="chatAnnouncementCheckbox" class="rounded bg-slate-800 text-violet-500"/>
                    <span>Post as Official Pinned Announcement 📌</span>
                  </label>
                </div>
              ` : ''}
            </form>
          </div>
        </div>
      </div>
    `;
  }

  static renderMessage(msg, isAdmin) {
    const sender = window.esportsStore.getUserByUsername(msg.sender) || {
      username: msg.sender,
      role: 'Participant',
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(msg.sender)}`
    };

    const isOwner = sender.role === 'Owner / President';
    const isSenderAdmin = sender.role === 'Admin';

    const roleBadgeClass = isOwner 
      ? 'badge-owner' 
      : (isSenderAdmin ? 'badge-admin' : 'badge-participant');

    const roleIcon = isOwner ? '👑' : (isSenderAdmin ? '🛡️' : '⚡');

    return `
      <div class="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-800/30 transition-colors group relative">
        <!-- 1:1 Avatar -->
        <img 
          src="${sender.avatar}" 
          alt="${sender.username}" 
          class="w-10 h-10 avatar-square border ${isOwner ? 'border-amber-400 shadow-md shadow-amber-500/30' : (isSenderAdmin ? 'border-violet-400' : 'border-slate-700')} flex-shrink-0 mt-0.5"
        />

        <div class="flex-1 overflow-hidden">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-display font-bold text-xs sm:text-sm text-slate-100">${sender.name || sender.username}</span>
            ${sender.name ? `<span class="text-[10px] font-mono text-cyan-400">@${sender.username}</span>` : ''}

            <!-- Glowing Rank Badge -->
            <span class="rank-badge ${roleBadgeClass} text-[8px] py-0.5 px-2">
              ${roleIcon} ${sender.role}
            </span>

            <span class="text-[10px] font-mono text-slate-500">${msg.timestamp}</span>

            ${msg.isAnnouncement ? `
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ANNOUNCEMENT
              </span>
            ` : ''}
          </div>

          <p class="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed break-words font-sans">
            ${msg.text}
          </p>
        </div>

        <!-- Admin Delete Button -->
        ${isAdmin ? `
          <button 
            onclick="window.app.deleteChatMessage('${msg.id}')" 
            class="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
            title="Delete Message"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }
}

window.ChatsViewComponent = ChatsViewComponent;
