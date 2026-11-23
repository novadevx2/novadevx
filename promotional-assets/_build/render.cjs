// Renders AuroraBeat promotional artwork from authentic app screenshots.
// Run: node promotional-assets/_build/render.cjs
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const sharp = require("sharp");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const SHOTS = path.join(ROOT, "screenshots");
const OUT = ROOT;
const PAGES = path.join(__dirname, "pages");
fs.mkdirSync(PAGES, { recursive: true });

const fileUrl = (p) => pathToFileURL(p).href;
const shot = {
  home: fileUrl(path.join(SHOTS, "app-home.png")),
  library: fileUrl(path.join(SHOTS, "app-library-playing.png")),
  playlists: fileUrl(path.join(SHOTS, "app-playlists.png")),
  playlistDetail: fileUrl(path.join(SHOTS, "app-playlist-detail.png")),
  queue: fileUrl(path.join(SHOTS, "app-queue-drawer.png")),
  settings: fileUrl(path.join(SHOTS, "app-settings.png")),
  settingsBehavior: fileUrl(path.join(SHOTS, "app-settings-behavior.png")),
  mini: fileUrl(path.join(SHOTS, "native-mini", "app-mini-player.png")),
  icon: fileUrl(path.join(ROOT, "..", "assets", "app-icon.png")),
};

const BRAND_MARK = `
<svg class="mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="mk" x1="8" y1="58" x2="56" y2="6" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5b21b6"/><stop offset="0.45" stop-color="#8b5cf6"/>
      <stop offset="0.8" stop-color="#b97cff"/><stop offset="1" stop-color="#e9d5ff"/>
    </linearGradient>
    <linearGradient id="mn" x1="32" y1="4" x2="40" y2="38" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.32"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="mc"><rect width="64" height="64" fill="white"/>
      <path d="M32 15.2 49 51.2h-9.5l-3.1-7.7h-8.8l-3.1 7.7H15L32 15.2Zm0 11.4-2.8 9.6h5.6L32 26.6Z" fill="black"/>
    </mask>
  </defs>
  <g mask="url(#mc)">
    <path d="M32 3.2c3.1 0 6 1.7 7.5 4.4l20.2 35.2c3.1 5.5-.8 12.3-7.1 12.3H11.4C5.1 55.1 1.2 48.3 4.3 42.8L24.5 7.6A8.6 8.6 0 0 1 32 3.2Z" fill="url(#mk)"/>
    <path d="M32 3.2c3.1 0 6 1.7 7.5 4.4l20.2 35.2c3.1 5.5-.8 12.3-7.1 12.3H11.4C5.1 55.1 1.2 48.3 4.3 42.8L24.5 7.6A8.6 8.6 0 0 1 32 3.2Z" fill="url(#mn)"/>
  </g>
</svg>`;

const C = {
  bg: "#07080f",
  text: "#f5f4fa",
  soft: "#b9b6c9",
  muted: "#8b8da2",
  violet: "#a78bfa",
};

const baseCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: ${C.bg}; }
  body {
    font-family: "Segoe UI Variable Display", "Segoe UI Variable Text", "Segoe UI", Inter, system-ui, sans-serif;
    color: ${C.text};
    -webkit-font-smoothing: antialiased;
  }
  .scene { position: relative; overflow: hidden; width: 100%; height: 100%; }
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(1400px 1000px at 82% 14%, rgba(124,58,237,0.26), transparent 62%),
      radial-gradient(1000px 800px at 8% 92%, rgba(76,29,149,0.22), transparent 66%),
      radial-gradient(900px 600px at 42% -10%, rgba(168,85,247,0.10), transparent 70%),
      linear-gradient(155deg, #0b0c18 0%, #07080f 48%, #05060b 100%);
  }
  .aurora { position: absolute; border-radius: 50%; filter: blur(150px); pointer-events: none; }
  .a1 { background: rgba(124,58,237,0.30); }
  .a2 { background: rgba(56,189,248,0.10); }
  .a3 { background: rgba(168,85,247,0.18); }
  .grain {
    position: absolute; inset: 0; opacity: 0.05; mix-blend-mode: overlay; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .vignette {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.38) 100%);
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand .mark { display: block; }
  .brand-name { font-weight: 620; letter-spacing: -0.025em; color: #fbfaff; }
  .frame {
    border-radius: 18px; overflow: hidden; background: #0a0b14;
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 60px 130px rgba(0,0,0,0.66), 0 10px 30px rgba(0,0,0,0.5), 0 0 90px rgba(124,58,237,0.16);
  }
  .frame img { display: block; width: 100%; }
  .eyebrow {
    font-size: 24px; font-weight: 600; letter-spacing: 0.30em; text-transform: uppercase;
    color: #a78bfa;
  }
  .grad {
    background: linear-gradient(112deg, #e9d5ff 0%, #c084fc 38%, #a855f7 72%, #7c3aed 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .chip {
    display: inline-flex; align-items: center; gap: 12px;
    border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.035);
    border-radius: 999px; color: #d6d3e6;
  }
  .chip .dot { width: 8px; height: 8px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 14px rgba(167,139,250,0.9); }
  .caption { color: #7f8196; letter-spacing: 0.02em; }
`;

function htmlDoc(body, w, h, extra = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html, body { width: ${w}px; height: ${h}px; }
    ${baseCSS}
    ${extra}
  </style></head><body>${body}</body></html>`;
}

function brand(size = 56, nameSize = 38) {
  return `<div class="brand"><svg class="mark" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="mk" x1="8" y1="58" x2="56" y2="6" gradientUnits="userSpaceOnUse">
        <stop stop-color="#5b21b6"/><stop offset="0.45" stop-color="#8b5cf6"/>
        <stop offset="0.8" stop-color="#b97cff"/><stop offset="1" stop-color="#e9d5ff"/>
      </linearGradient>
      <linearGradient id="mn" x1="32" y1="4" x2="40" y2="38" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffffff" stop-opacity="0.32"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <mask id="mc"><rect width="64" height="64" fill="white"/>
        <path d="M32 15.2 49 51.2h-9.5l-3.1-7.7h-8.8l-3.1 7.7H15L32 15.2Zm0 11.4-2.8 9.6h5.6L32 26.6Z" fill="black"/>
      </mask>
    </defs>
    <g mask="url(#mc)">
      <path d="M32 3.2c3.1 0 6 1.7 7.5 4.4l20.2 35.2c3.1 5.5-.8 12.3-7.1 12.3H11.4C5.1 55.1 1.2 48.3 4.3 42.8L24.5 7.6A8.6 8.6 0 0 1 32 3.2Z" fill="url(#mk)"/>
      <path d="M32 3.2c3.1 0 6 1.7 7.5 4.4l20.2 35.2c3.1 5.5-.8 12.3-7.1 12.3H11.4C5.1 55.1 1.2 48.3 4.3 42.8L24.5 7.6A8.6 8.6 0 0 1 32 3.2Z" fill="url(#mn)"/>
    </g></svg><span class="brand-name" style="font-size:${nameSize}px">AuroraBeat</span></div>`;
}

/* ---------------------------------- HERO ---------------------------------- */

function heroHTML() {
  return `
  <div class="scene">
    <div class="bg"></div>
    <div class="aurora a1" style="width:1200px;height:1100px;right:-160px;top:120px"></div>
    <div class="aurora a2" style="width:900px;height:700px;right:280px;bottom:-220px"></div>
    <div class="aurora a3" style="width:700px;height:700px;left:-260px;top:-260px"></div>
    <div class="grain"></div>
    <div class="vignette"></div>

    <header style="position:absolute;left:220px;top:150px;right:220px;display:flex;align-items:center;justify-content:space-between">
      ${brand(62, 42)}
      <div class="chip" style="padding:16px 30px;font-size:24px;letter-spacing:0.12em;text-transform:uppercase">
        <span class="dot"></span>Version 1.0.0
      </div>
    </header>

    <div style="position:absolute;left:220px;top:620px;width:1260px">
      <p class="eyebrow">Local-first music player for Windows</p>
      <h1 style="font-size:186px;line-height:0.97;letter-spacing:-0.045em;font-weight:650;margin-top:30px">
        Your music.<br><span class="grad">Your way.</span>
      </h1>
      <p style="margin-top:58px;font-size:36px;line-height:1.52;color:#b9b6c9;width:1000px;letter-spacing:-0.005em">
        A lightweight, offline music player that keeps your library, playlists,
        and listening history on your device.
      </p>
      <div style="display:flex;gap:18px;margin-top:56px">
        <span class="chip" style="padding:16px 28px;font-size:23px"><span class="dot"></span>Fully offline</span>
        <span class="chip" style="padding:16px 28px;font-size:23px"><span class="dot"></span>8 audio formats</span>
        <span class="chip" style="padding:16px 28px;font-size:23px"><span class="dot"></span>No accounts</span>
      </div>
    </div>

    <div style="position:absolute;left:1420px;top:470px;width:2420px;height:1460px">
      <div style="position:absolute;left:100px;right:80px;top:120px;bottom:180px;background:radial-gradient(closest-side,rgba(124,58,237,0.34),transparent 72%);filter:blur(50px)"></div>
      <div class="frame" style="position:absolute;left:60px;top:60px;width:2260px;transform:perspective(3600px) rotateY(-6deg) rotateX(2.5deg) rotate(-1.2deg);transform-origin:60% 50%">
        <img src="${shot.home}" width="2260" alt="">
      </div>
      <div class="caption" style="position:absolute;left:104px;top:1352px;font-size:21px;letter-spacing:0.04em">
        Actual application screenshot &nbsp;·&nbsp; AuroraBeat 1.0.0 on Windows
      </div>
    </div>

    <div style="position:absolute;left:220px;bottom:118px;display:flex;align-items:center;gap:26px">
      <span style="font-size:22px;color:#6f7189;letter-spacing:0.30em;text-transform:uppercase;font-weight:600">Plays</span>
      <span style="font-size:25px;color:#9b9db4;letter-spacing:0.06em">MP3 &nbsp;·&nbsp; WAV &nbsp;·&nbsp; FLAC &nbsp;·&nbsp; AAC &nbsp;·&nbsp; M4A &nbsp;·&nbsp; OGG &nbsp;·&nbsp; OPUS &nbsp;·&nbsp; WMA</span>
    </div>
  </div>`;
}

/* ------------------------------ APP SHOWCASE ------------------------------ */

function showcaseHTML() {
  return `
  <div class="scene">
    <div class="bg"></div>
    <div class="aurora a1" style="width:1600px;height:900px;left:50%;top:600px;transform:translateX(-50%)"></div>
    <div class="aurora a2" style="width:800px;height:600px;right:0;top:-100px"></div>
    <div class="grain"></div>
    <div class="vignette"></div>

    <header style="position:absolute;left:200px;top:150px;right:200px;display:flex;align-items:center;justify-content:space-between">
      ${brand(56, 36)}
      <span style="font-size:22px;letter-spacing:0.24em;text-transform:uppercase;color:#8b8da2">AuroraBeat 1.0.0 · Windows x64</span>
    </header>

    <div style="position:absolute;left:0;right:0;top:286px;text-align:center">
      <p class="eyebrow" style="font-size:22px">The desktop application</p>
      <h2 style="font-size:84px;line-height:1.02;letter-spacing:-0.04em;font-weight:640;margin-top:22px">
        The whole player, <span class="grad">in one quiet place.</span>
      </h2>
    </div>

    <div style="position:absolute;left:470px;top:462px;width:2900px">
      <div style="position:absolute;left:120px;right:120px;top:180px;bottom:40px;background:radial-gradient(closest-side,rgba(124,58,237,0.30),transparent 70%);filter:blur(60px)"></div>
      <div class="frame" style="position:relative;border-radius:20px">
        <img src="${shot.home}" width="2900" alt="">
      </div>
    </div>

    <div class="caption" style="position:absolute;left:0;right:0;bottom:30px;text-align:center;font-size:20px;letter-spacing:0.14em;text-transform:uppercase">
      Actual application screenshot &nbsp;·&nbsp; AuroraBeat 1.0.0 &nbsp;·&nbsp; Home
    </div>
  </div>`;
}

/* ----------------------------- FEATURE BANNERS ---------------------------- */

const FEATURES = {
  library: {
    index: "01",
    kicker: "Library",
    title: "Your library,<br><span class='grad'>indexed locally.</span>",
    body: "Point AuroraBeat at your music folders once. It reads tags, durations, years, and artwork, then keeps the index on your device.",
    bullets: [
      "Import files, folders, or dropped paths",
      "MP3, WAV, FLAC, AAC, M4A, OGG, OPUS, and WMA",
      "Search, sort, rescan, and edit metadata",
    ],
    image: shot.library,
  },
  playback: {
    index: "02",
    kicker: "Playback & queue",
    title: "Playback that<br><span class='grad'>stays out of the way.</span>",
    body: "Seekable audio, a full transport, and a queue you can shape while you listen. Your queue and history are saved between sessions.",
    bullets: [
      "Play, pause, previous, next, seek, and volume",
      "Shuffle and repeat modes",
      "Play next, add to queue, and listening history",
    ],
    image: shot.queue,
  },
  playlists: {
    index: "03",
    kicker: "Playlists",
    title: "A playlist<br><span class='grad'>for every mood.</span>",
    body: "Build playlists from your own library and star the tracks you keep coming back to. Everything stays local.",
    bullets: [
      "Create, rename, reorder, and delete playlists",
      "Add or remove tracks from any song row",
      "Favorites in a dedicated collection",
    ],
    image: shot.playlists,
  },
  "mini-player": {
    index: "04",
    kicker: "Mini player",
    title: "Small window.<br><span class='grad'>Full control.</span>",
    body: "Collapse AuroraBeat into a compact 460 × 188 player. Artwork, transport, seek, and window controls stay right where you need them.",
    bullets: [
      "Compact 460 × 188 desktop window",
      "Favorite, expand, minimize, and close controls",
      "System tray and global media keys",
    ],
    image: shot.mini,
    isMini: true,
  },
  settings: {
    index: "05",
    kicker: "Settings",
    title: "Settings that<br><span class='grad'>actually stick.</span>",
    body: "Tune the look and behavior of the player once. Themes, accent colors, playback fades, and tray preferences persist across restarts.",
    bullets: [
      "Dark, light, and system themes",
      "Six accent presets and two interface densities",
      "Fades, preload, scan-on-launch, and tray behavior",
    ],
    image: shot.settings,
  },
};

function featureHTML(key) {
  const f = FEATURES[key];
  const bullets = f.bullets
    .map(
      (b) => `<li style="display:flex;gap:18px;align-items:flex-start;font-size:25px;color:#c3c1d2;line-height:1.45">
        <span style="flex:none;width:9px;height:9px;border-radius:50%;background:#8b5cf6;margin-top:12px;box-shadow:0 0 16px rgba(139,92,246,0.9)"></span>
        <span>${b}</span></li>`,
    )
    .join("");

  const imageBlock = f.isMini
    ? `<div style="position:absolute;left:1040px;top:386px;width:1450px;height:820px;display:flex;align-items:center;justify-content:center">
         <div style="position:absolute;width:1100px;height:560px;background:radial-gradient(closest-side,rgba(124,58,237,0.36),transparent 72%);filter:blur(30px)"></div>
         <div class="frame" style="position:relative;width:1200px;border-radius:22px">
           <img src="${f.image}" width="1200" alt="">
         </div>
       </div>`
    : `      <div style="position:absolute;left:1020px;top:310px;width:1420px">
         <div style="position:absolute;left:80px;right:80px;top:160px;bottom:0;background:radial-gradient(closest-side,rgba(124,58,237,0.30),transparent 70%);filter:blur(50px)"></div>
         <div class="frame" style="position:relative;border-radius:16px">
           <img src="${f.image}" width="1420" alt="">
         </div>
       </div>`;

  return `
  <div class="scene">
    <div class="bg"></div>
    <div class="aurora a1" style="width:1000px;height:900px;right:-100px;top:60px"></div>
    <div class="aurora a3" style="width:600px;height:600px;left:-240px;bottom:-200px"></div>
    <div class="grain"></div>
    <div class="vignette"></div>

    <header style="position:absolute;left:120px;top:104px;right:120px;display:flex;align-items:center;justify-content:space-between">
      ${brand(44, 30)}
      <div style="display:flex;align-items:center;gap:20px">
        <span style="font-size:20px;letter-spacing:0.30em;text-transform:uppercase;color:#a78bfa;font-weight:600">${f.kicker}</span>
        <span style="width:44px;height:1px;background:rgba(255,255,255,0.22)"></span>
        <span style="font-size:20px;letter-spacing:0.16em;color:#6f7189">${f.index} / 05</span>
      </div>
    </header>

    <div style="position:absolute;left:120px;top:428px;width:880px">
      <h2 style="font-size:98px;line-height:1.03;letter-spacing:-0.042em;font-weight:640">${f.title}</h2>
      <p style="margin-top:40px;font-size:28px;line-height:1.55;color:#a9a7bb;width:800px">${f.body}</p>
      <ul style="list-style:none;margin-top:54px;display:flex;flex-direction:column;gap:24px">${bullets}</ul>
    </div>

    ${imageBlock}

    <div class="caption" style="position:absolute;left:120px;bottom:64px;font-size:19px;letter-spacing:0.04em">
      AuroraBeat 1.0.0 &nbsp;·&nbsp; actual application screenshot
    </div>
    <div class="caption" style="position:absolute;right:120px;bottom:64px;font-size:19px;letter-spacing:0.10em;text-transform:uppercase">
      Local-first · Windows
    </div>
  </div>`;
}

/* ------------------------------ PRODUCT CARDS ----------------------------- */

const CARDS = {
  library: {
    kicker: "Library",
    title: "Local library",
    body: "Folders, tags, artwork, durations, and eight audio formats — indexed and kept on your device.",
    image: shot.library,
    alt: "AuroraBeat library view",
  },
  playback: {
    kicker: "Playback",
    title: "Built for listening",
    body: "Seekable audio, shuffle, repeat, volume, and a queue with history that survives restarts.",
    image: shot.queue,
    alt: "AuroraBeat playback queue",
  },
  playlists: {
    kicker: "Playlists",
    title: "Made by you",
    body: "Create, rename, reorder, and fill local playlists. Star favorites in one click.",
    image: shot.playlists,
    alt: "AuroraBeat playlists view",
  },
  mini: {
    kicker: "Mini player",
    title: "Full control",
    body: "460 × 188 pixels of full control — artwork, seek, transport, and window buttons.",
    image: shot.mini,
    alt: "AuroraBeat mini player",
    isMini: true,
  },
  settings: {
    kicker: "Settings",
    title: "Yours to tune",
    body: "Dark, light, or system theme, six accents, density, fades, and tray behavior.",
    image: shot.settings,
    alt: "AuroraBeat settings view",
  },
};

function cardHTML(key) {
  const c = CARDS[key];
  const media = c.isMini
    ? `<div style="position:relative;width:1380px;height:790px;border-radius:22px;background:radial-gradient(70% 60% at 50% 45%, rgba(124,58,237,0.24), rgba(10,11,20,0.0) 75%);
          border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;overflow:hidden">
         <div style="position:absolute;width:900px;height:480px;background:radial-gradient(closest-side,rgba(124,58,237,0.35),transparent 72%);filter:blur(30px)"></div>
         <div class="frame" style="position:relative;width:1120px;border-radius:20px"><img src="${c.image}" width="1120" alt=""></div>
       </div>`
    : `<div class="frame" style="width:1380px;border-radius:18px"><img src="${c.image}" width="1380" alt=""></div>`;

  return `
  <div class="scene" style="background:
      radial-gradient(900px 700px at 88% 2%, rgba(124,58,237,0.24), transparent 62%),
      radial-gradient(700px 600px at 4% 100%, rgba(76,29,149,0.20), transparent 66%),
      linear-gradient(160deg,#0b0c17 0%,#07080f 55%,#05060b 100%)">
    <div class="grain"></div>
    <div style="position:absolute;inset:0;border:1px solid rgba(255,255,255,0.07);border-radius:0"></div>
    <div style="position:absolute;left:110px;top:104px;right:110px;display:flex;align-items:center;justify-content:space-between">
      ${brand(40, 27)}
      <span style="font-size:18px;letter-spacing:0.26em;text-transform:uppercase;color:#8b8da2">1.0.0 · Windows</span>
    </div>

    <div style="position:absolute;left:110px;top:212px;width:1380px">
      <p style="font-size:20px;letter-spacing:0.30em;text-transform:uppercase;color:#a78bfa;font-weight:600">${c.kicker}</p>
      <h3 style="font-size:82px;line-height:1.04;letter-spacing:-0.04em;font-weight:640;margin-top:16px">${c.title}</h3>
      <p style="margin-top:20px;font-size:28px;line-height:1.5;color:#a9a7bb;width:1240px">${c.body}</p>
    </div>

    <div style="position:absolute;left:110px;top:${c.isMini ? 566 : 560}px">${media}</div>

    <div style="position:absolute;left:110px;bottom:70px;display:flex;align-items:center;gap:16px">
      <span style="font-size:18px;letter-spacing:0.10em;text-transform:uppercase;color:#6f7189">AuroraBeat</span>
      <span style="width:5px;height:5px;border-radius:50%;background:#565873"></span>
      <span style="font-size:18px;color:#6f7189">Actual application screenshot</span>
    </div>
  </div>`;
}

/* ----------------------------- DOWNLOAD PAGE ------------------------------ */

function downloadHTML() {
  return `
  <div class="scene">
    <div class="bg"></div>
    <div class="aurora a1" style="width:1200px;height:900px;right:-120px;top:220px"></div>
    <div class="aurora a3" style="width:700px;height:700px;left:-260px;bottom:-260px"></div>
    <div class="grain"></div>
    <div class="vignette"></div>

    <header style="position:absolute;left:120px;top:104px;right:120px;display:flex;align-items:center;justify-content:space-between">
      ${brand(46, 31)}
      <span style="font-size:20px;letter-spacing:0.28em;text-transform:uppercase;color:#8b8da2">AuroraBeat 1.0.0</span>
    </header>

    <div style="position:absolute;left:120px;top:336px;width:880px">
      <p class="eyebrow" style="font-size:22px">Download</p>
      <h1 style="font-size:124px;line-height:0.99;letter-spacing:-0.045em;font-weight:650;margin-top:26px">
        AuroraBeat<br><span class="grad">for Windows</span>
      </h1>
      <p style="margin-top:40px;font-size:30px;line-height:1.55;color:#b3b0c4;width:800px">
        A local-first music player for Windows.
        Your library and listening history stay on your device.
      </p>

      <div style="display:flex;gap:14px;margin-top:38px">
        <span class="chip" style="padding:13px 24px;font-size:20px"><span class="dot"></span>Local-first</span>
        <span class="chip" style="padding:13px 24px;font-size:20px">No account required</span>
        <span class="chip" style="padding:13px 24px;font-size:20px">Fully offline</span>
      </div>

      <div style="margin-top:58px;width:800px;border-top:1px solid rgba(255,255,255,0.09)">
        ${[
          ["Version", "1.0.0"],
          ["Platform", "Windows · x64"],
          ["Package", "Installer + portable executable"],
        ]
          .map(
            ([k, v]) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:22px 0;border-bottom:1px solid rgba(255,255,255,0.07)">
              <span style="font-size:20px;letter-spacing:0.20em;text-transform:uppercase;color:#777990">${k}</span>
              <span style="font-size:25px;color:#e6e4f0">${v}</span>
            </div>`,
          )
          .join("")}
      </div>
    </div>

    <div style="position:absolute;left:1110px;top:286px;width:1340px">
      <div style="position:absolute;left:60px;right:60px;top:150px;bottom:0;background:radial-gradient(closest-side,rgba(124,58,237,0.32),transparent 72%);filter:blur(50px)"></div>
      <div class="frame" style="position:relative;border-radius:18px">
        <img src="${shot.home}" width="1340" alt="">
      </div>
      <div class="caption" style="margin-top:22px;text-align:center;font-size:19px;letter-spacing:0.04em">
        Actual application screenshot &nbsp;·&nbsp; AuroraBeat 1.0.0
      </div>
    </div>

    <div class="caption" style="position:absolute;left:120px;bottom:72px;font-size:19px;letter-spacing:0.02em">
      Installer includes the offline WebView2 runtime.
    </div>
    <div class="caption" style="position:absolute;right:120px;bottom:72px;font-size:19px;letter-spacing:0.16em;text-transform:uppercase">
      No cloud · No network calls
    </div>
  </div>`;
}

/* --------------------------- APP ICON PRESENTATION ------------------------ */

function iconHTML() {
  return `
  <div class="scene" style="background:
      radial-gradient(1000px 800px at 50% 30%, rgba(124,58,237,0.30), transparent 65%),
      radial-gradient(800px 700px at 18% 86%, rgba(76,29,149,0.22), transparent 70%),
      linear-gradient(165deg,#0b0c17 0%,#07080f 55%,#05060b 100%)">
    <div class="grain"></div>
    <div class="vignette"></div>

    <div style="position:absolute;left:50%;top:760px;width:1900px;height:1900px;transform:translate(-50%,-50%)">
      <div style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,0.055)"></div>
      <div style="position:absolute;inset:150px;border-radius:50%;border:1px solid rgba(255,255,255,0.045)"></div>
      <div style="position:absolute;inset:300px;border-radius:50%;border:1px solid rgba(255,255,255,0.035)"></div>
      <div style="position:absolute;inset:380px;border-radius:50%;background:radial-gradient(closest-side,rgba(124,58,237,0.34),transparent 70%);filter:blur(50px)"></div>
    </div>

    <div style="position:absolute;left:50%;top:430px;transform:translateX(-50%)">
      <img src="${shot.icon}" width="1024" height="1024" style="display:block;filter:drop-shadow(0 60px 120px rgba(0,0,0,0.65)) drop-shadow(0 0 70px rgba(124,58,237,0.28))" alt="AuroraBeat app icon">
    </div>

    <div style="position:absolute;left:0;right:0;top:1548px;text-align:center">
      <div style="font-size:118px;line-height:1;letter-spacing:-0.045em;font-weight:650">AuroraBeat</div>
      <div style="margin-top:28px;font-size:36px;color:#a9a7bb;letter-spacing:-0.005em">Version 1.0.0 &nbsp;·&nbsp; Local-first music player for Windows</div>
      <div style="margin-top:46px;display:flex;justify-content:center;gap:16px">
        <span class="chip" style="padding:16px 30px;font-size:22px"><span class="dot"></span>Local-first</span>
        <span class="chip" style="padding:16px 30px;font-size:22px">Fully offline</span>
        <span class="chip" style="padding:16px 30px;font-size:22px">Windows x64</span>
      </div>
      <div style="margin-top:94px;font-size:46px;letter-spacing:-0.02em;color:#8f8ca6;font-weight:560">Your music. <span style="color:#b9a6ff">Your way.</span></div>
    </div>

    <div class="caption" style="position:absolute;left:0;right:0;bottom:82px;text-align:center;font-size:19px;letter-spacing:0.26em;text-transform:uppercase">
      App icon · 1024 × 1024 source
    </div>
  </div>`;
}

/* ------------------------------- CONTACT SHEET ---------------------------- */

const SHEET_ITEMS = [
  ["hero-main-3840x2160", "Main hero banner", "3840 × 2160"],
  ["app-showcase-3840x2160", "Application showcase", "3840 × 2160"],
  ["download-page-2560x1440", "Download page", "2560 × 1440"],
  ["app-icon-presentation-2400x2400", "App icon presentation", "2400 × 2400"],
  ["feature-library-2560x1440", "Feature · Library", "2560 × 1440"],
  ["feature-playback-2560x1440", "Feature · Playback & queue", "2560 × 1440"],
  ["feature-playlists-2560x1440", "Feature · Playlists", "2560 × 1440"],
  ["feature-mini-player-2560x1440", "Feature · Mini player", "2560 × 1440"],
  ["feature-settings-2560x1440", "Feature · Settings", "2560 × 1440"],
  ["product-card-library-1600x1600", "Card · Library", "1600 × 1600"],
  ["product-card-playback-1600x1600", "Card · Playback & queue", "1600 × 1600"],
  ["product-card-playlists-1600x1600", "Card · Playlists", "1600 × 1600"],
  ["product-card-mini-1600x1600", "Card · Mini player", "1600 × 1600"],
  ["product-card-settings-1600x1600", "Card · Settings", "1600 × 1600"],
];

function contactHTML() {
  const tiles = SHEET_ITEMS.map(([file, label, dims], i) => {
    const square = file.includes("1600x1600") || file.includes("2400x2400");
    return `<div style="position:relative">
      <div style="width:100%;height:322px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.09);background:#0b0c15;display:flex;align-items:center;justify-content:center">
        <img src="${fileUrl(path.join(OUT, file + ".png"))}" style="width:100%;height:100%;object-fit:${square ? "contain" : "cover"}" alt="">
      </div>
      <div style="margin-top:16px">
        <div style="font-size:23px;color:#e7e5f1;font-weight:560;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
        <div style="font-size:18px;color:#777990;letter-spacing:0.06em;margin-top:5px">${dims}</div>
      </div>
      <span style="position:absolute;left:14px;top:14px;font-size:15px;letter-spacing:0.14em;color:#c4b5fd;background:rgba(8,9,16,0.7);border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:6px 12px">${String(i + 1).padStart(2, "0")}</span>
    </div>`;
  }).join("");

  return `
  <div class="scene" style="padding:100px 100px 0">
    <div class="bg"></div>
    <div class="aurora a1" style="width:1100px;height:700px;right:-100px;top:-180px"></div>
    <div class="aurora a3" style="width:700px;height:600px;left:-200px;bottom:-200px"></div>
    <div class="grain"></div>
    <div style="position:relative;display:flex;align-items:flex-end;justify-content:space-between">
      <div>
        ${brand(46, 34)}
        <h1 style="font-size:58px;line-height:1.05;letter-spacing:-0.04em;font-weight:640;margin-top:40px">Promotional asset sheet</h1>
        <p style="font-size:23px;color:#9b9db4;margin-top:14px">AuroraBeat 1.0.0 &nbsp;·&nbsp; built from authentic application captures &nbsp;·&nbsp; 14 assets</p>
      </div>
      <div style="text-align:right;font-size:18px;color:#777990;letter-spacing:0.18em;text-transform:uppercase;line-height:1.9">
        Dark product system<br>16:9 banners · square cards<br>PNG · 4K to 800 px
      </div>
    </div>
    <div style="position:relative;margin-top:44px;display:grid;grid-template-columns:repeat(5, 1fr);gap:34px 30px">${tiles}</div>
  </div>`;
}

/* --------------------------------- RENDER --------------------------------- */

async function render(page, name, w, h, html) {
  const file = path.join(PAGES, `${name}.html`);
  fs.writeFileSync(file, htmlDoc(html, w, h));
  await page.setViewportSize({ width: w, height: h });
  await page.goto(fileUrl(file), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const out = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log("rendered", name, `${w}x${h}`);
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  const outputs = [];
  outputs.push(await render(page, "hero-main-3840x2160", 3840, 2160, heroHTML()));
  outputs.push(await render(page, "app-showcase-3840x2160", 3840, 2160, showcaseHTML()));
  for (const key of Object.keys(FEATURES)) {
    outputs.push(await render(page, `feature-${key}-2560x1440`, 2560, 1440, featureHTML(key)));
  }
  outputs.push(await render(page, "download-page-2560x1440", 2560, 1440, downloadHTML()));
  for (const key of Object.keys(CARDS)) {
    outputs.push(await render(page, `product-card-${key}-1600x1600`, 1600, 1600, cardHTML(key)));
  }
  outputs.push(await render(page, "app-icon-presentation-2400x2400", 2400, 2400, iconHTML()));
  outputs.push(await render(page, "contact-sheet-3200x1620", 3200, 1620, contactHTML()));

  await browser.close();

  // Downscaled 1x companions for web use.
  const variants = [
    ["hero-main-3840x2160", "hero-main-1920x1080", 1920],
    ["app-showcase-3840x2160", "app-showcase-1920x1080", 1920],
    ["download-page-2560x1440", "download-page-1920x1080", 1920],
    ...Object.keys(FEATURES).map((k) => [`feature-${k}-2560x1440`, `feature-${k}-1280x720`, 1280]),
    ...Object.keys(CARDS).map((k) => [`product-card-${k}-1600x1600`, `product-card-${k}-800x800`, 800]),
    ["app-icon-presentation-2400x2400", "app-icon-presentation-1200x1200", 1200],
    ["contact-sheet-3200x1620", "contact-sheet-1600x810", 1600],
  ];
  for (const [src, dst, width] of variants) {
    await sharp(path.join(OUT, `${src}.png`)).resize({ width, kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${dst}.png`));
    console.log("scaled", dst);
  }

  await sharp(path.join(ROOT, "..", "assets", "app-icon.png"))
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "app-icon-1024x1024.png"));
  console.log("exported app icon");
})();
