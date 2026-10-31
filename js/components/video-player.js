/**
 * AnonMP4 Video Player & Link Converter System
 * Handles anonmp4.to watch links, embed links, direct video URLs, and side-by-side comparison
 */

class AnonPlayerSystem {
  // Parse AnonMP4 link into watch and embed URLs
  static parseAnonLink(url) {
    if (!url || typeof url !== 'string') return null;

    const clean = url.trim();
    // Regular expressions for anonmp4 variants
    const anonMatch = clean.match(/anonmp4\.to\/(?:watch\/|embed\/)?([a-zA-Z0-9_\-]+)/i);
    if (anonMatch && anonMatch[1]) {
      const videoId = anonMatch[1];
      return {
        type: 'anonmp4',
        videoId: videoId,
        watchUrl: `https://anonmp4.to/watch/${videoId}`,
        embedUrl: `https://www.anonmp4.to/embed/${videoId}`,
        originalUrl: clean
      };
    }

    // Direct MP4 / WebM / Video file
    if (clean.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) {
      return {
        type: 'direct_video',
        videoId: null,
        watchUrl: clean,
        embedUrl: clean,
        originalUrl: clean
      };
    }

    // Fallback URL
    return {
      type: 'generic_link',
      videoId: null,
      watchUrl: clean,
      embedUrl: clean,
      originalUrl: clean
    };
  }

  // Sample Anime AMV video clips for instant testing / demo preview
  static getSampleVideo(key) {
    const samples = {
      zenitsu: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      gojo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    };
    return samples[key] || samples.default;
  }

  // Render a responsive Embedded Player with "Watch on AnonMP4" quick button
  static renderPlayerHTML({ url, title = 'Video Edit', autoplay = false, height = '260px' }) {
    const parsed = this.parseAnonLink(url);
    if (!parsed) {
      return `
        <div class="w-full flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-lg border border-dashed border-violet-500/20 text-center text-slate-400">
          <svg class="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">No Edit Submitted Yet</span>
        </div>
      `;
    }

    const isDirect = parsed.type === 'direct_video';
    const isAnon = parsed.type === 'anonmp4';

    return `
      <div class="relative w-full rounded-lg overflow-hidden border border-violet-500/30 bg-black/90 group shadow-lg">
        <div class="relative w-full aspect-video bg-black flex items-center justify-center">
          ${isDirect ? `
            <video 
              src="${parsed.watchUrl}" 
              controls 
              ${autoplay ? 'autoplay' : ''} 
              class="w-full h-full object-contain"
              playsinline
              preload="metadata"
            >
              Your browser does not support HTML5 video.
            </video>
          ` : `
            <iframe 
              src="${parsed.embedUrl}" 
              class="w-full h-full border-0" 
              allowfullscreen 
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              title="${title}"
            ></iframe>
          `}
        </div>

        <!-- Video Footer with Quick External Open Button -->
        <div class="p-2.5 px-3 flex items-center justify-between bg-slate-900/90 border-t border-violet-500/20">
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
            <span class="text-xs font-mono text-slate-300 truncate">${title}</span>
          </div>

          <a 
            href="${parsed.watchUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-display rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all hover:scale-105 flex-shrink-0"
            title="Open full video directly on AnonMP4"
          >
            <span>Watch on AnonMP4</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      </div>
    `;
  }

  // Render the "How to Host Your Edit on AnonMP4" Step-by-Step Guide Card
  static renderGuideCardHTML() {
    return `
      <div class="glass-card rounded-xl p-5 border border-violet-500/30 relative overflow-hidden">
        <!-- Ambient glow corner -->
        <div class="absolute -top-10 -right-10 w-28 h-28 bg-violet-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-violet-500/20">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-display font-bold text-base text-white tracking-wide flex items-center gap-2">
                How to Host Your Edit on AnonMP4
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Free & Anonymous</span>
              </h4>
              <p class="text-xs text-slate-400">Zero account required. Max file size: 20 GB. Instant high-speed streaming.</p>
            </div>
          </div>

          <!-- Direct Open Button -->
          <a 
            href="https://anonmp4.to" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="cyber-btn cyber-btn-cyan text-xs py-2 px-4 shadow-sm"
          >
            <span>Open AnonMP4.to</span>
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>

        <!-- 4 Steps Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <!-- Step 1 -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-violet-500/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold font-display text-[11px]">1</span>
                <span class="font-bold text-slate-200">Open Website</span>
              </div>
              <p class="text-slate-400 leading-relaxed">
                Click <strong class="text-cyan-400">"Open AnonMP4.to"</strong>. No sign-up, email, or verification needed.
              </p>
            </div>
            <span class="mt-2 text-[10px] text-slate-500">100% Free & Unlimited</span>
          </div>

          <!-- Step 2 -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-violet-500/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold font-display text-[11px]">2</span>
                <span class="font-bold text-slate-200">Upload Video</span>
              </div>
              <p class="text-slate-400 leading-relaxed">
                Drag & drop your finished Animanga Edit (<code class="text-violet-300">MP4</code>, <code class="text-violet-300">MOV</code>, <code class="text-violet-300">WebM</code>).
              </p>
            </div>
            <span class="mt-2 text-[10px] text-slate-500">Wait for 100% processing</span>
          </div>

          <!-- Step 3 -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-violet-500/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold font-display text-[11px]">3</span>
                <span class="font-bold text-slate-200">Copy Link</span>
              </div>
              <p class="text-slate-400 leading-relaxed">
                Copy your generated <strong class="text-violet-300">Watch Link</strong> or <code class="text-cyan-300">https://anonmp4.to/embed/...</code>
              </p>
            </div>
            <span class="mt-2 text-[10px] text-slate-500">Save your private delete token</span>
          </div>

          <!-- Step 4 -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-violet-500/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold font-display text-[11px]">4</span>
                <span class="font-bold text-slate-200">Paste & Submit</span>
              </div>
              <p class="text-slate-400 leading-relaxed">
                Paste the URL below and click <strong class="text-emerald-400">"Submit Edit"</strong> before the timer expires!
              </p>
            </div>
            <span class="mt-2 text-[10px] text-emerald-400/80">Ready for Admin Judging</span>
          </div>
        </div>
      </div>
    `;
  }
}

window.AnonPlayerSystem = AnonPlayerSystem;
