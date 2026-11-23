# AuroraBeat 1.0.0 — Promotional Assets

High-resolution promotional artwork for **AuroraBeat 1.0.0**, built entirely around
authentic captures of the packaged application. No interface elements, features, or
screens were fabricated, and no application source or release binary was modified.

Branding in these assets is AuroraBeat only. NovaDevx appears solely where it already
exists in the application UI (the small in-app credit), exactly as captured.

## Asset catalog

| File | Purpose | Dimensions |
| --- | --- | --- |
| `hero-main-3840x2160.png` | Main hero banner (4K, 16:9) | 3840 × 2160 |
| `hero-main-1920x1080.png` | Main hero banner (web, 16:9) | 1920 × 1080 |
| `app-showcase-3840x2160.png` | Application showcase (4K, 16:9) | 3840 × 2160 |
| `app-showcase-1920x1080.png` | Application showcase (web) | 1920 × 1080 |
| `download-page-2560x1440.png` | Website download presentation | 2560 × 1440 |
| `download-page-1920x1080.png` | Website download presentation (web) | 1920 × 1080 |
| `feature-library-2560x1440.png` | Library feature preview | 2560 × 1440 |
| `feature-playback-2560x1440.png` | Playback & queue feature preview | 2560 × 1440 |
| `feature-playlists-2560x1440.png` | Playlists feature preview | 2560 × 1440 |
| `feature-mini-player-2560x1440.png` | Mini-player feature preview | 2560 × 1440 |
| `feature-settings-2560x1440.png` | Settings feature preview | 2560 × 1440 |
| `feature-*-1280x720.png` | 720p companions for all five features | 1280 × 720 |
| `product-card-library-1600x1600.png` | Square product card — Library | 1600 × 1600 |
| `product-card-playback-1600x1600.png` | Square product card — Playback | 1600 × 1600 |
| `product-card-playlists-1600x1600.png` | Square product card — Playlists | 1600 × 1600 |
| `product-card-mini-1600x1600.png` | Square product card — Mini player | 1600 × 1600 |
| `product-card-settings-1600x1600.png` | Square product card — Settings | 1600 × 1600 |
| `product-card-*-800x800.png` | 800px companions for all five cards | 800 × 800 |
| `app-icon-presentation-2400x2400.png` | App icon presentation | 2400 × 2400 |
| `app-icon-presentation-1200x1200.png` | App icon presentation (web) | 1200 × 1200 |
| `app-icon-1024x1024.png` | Existing AuroraBeat icon, exported | 1024 × 1024 |
| `contact-sheet-3200x1620.png` | Contact sheet of all 14 primary assets | 3200 × 1620 |
| `contact-sheet-1600x810.png` | Contact sheet preview | 1600 × 810 |

All files are PNG, sRGB, with descriptive filenames that include their dimensions.

## Sources

Interface imagery is real:

- `screenshots/app-home.png` — Home view
- `screenshots/app-library-playing.png` — Library with active playback
- `screenshots/app-playlists.png` — Playlists view
- `screenshots/app-queue-drawer.png` — Playback queue drawer
- `screenshots/app-settings.png` — Settings, native "Tray ready" state
- `screenshots/native-mini/app-mini-player.png` — Mini player at 460 × 188

The main screenshots come from the packaged `AuroraBeat.exe` (release build) through
the WebView2 debugging protocol at 2× device pixels (2880 × 1600); the mini player was
captured at 4× (1840 × 752). Captures use the bundled nine sample tracks and three
sample playlists on a clean app profile.

The icon presentation uses the existing `assets/app-icon.png`, exported unchanged as
`app-icon-1024x1024.png`.

## Design system

- Background base `#07080f` with layered violet aurora glows, fine grain, and vignette.
- AuroraBeat's own gradient (`#5b21b6 → #8b5cf6 → #b97cff → #e9d5ff`) and the real
  brand mark (same geometry as `src/components/Brand.tsx`).
- Segoe UI Variable type family, matching the desktop app.
- Screenshot frames are neutral presentation devices (rounded border, shadow, glow);
  no fake window chrome or invented controls are drawn over the UI.

Copy is limited to documented behavior from `README.md`, `PROJECT_PROGRESS.md`, and
the app's own labels: local scanning and metadata, eight supported formats, seekable
playback, queue/history persistence, playlists/favorites, the 460 × 188 mini player,
themes/accents/density, tray, and global media keys.

## Regenerating

Requirements: the packaged app at `release/baseline version/AuroraBeat.exe`, Node with
the project's Playwright and Sharp dependencies, and the WebView2 debug port.

```bash
# 1. Start the packaged app with remote debugging
cd "release/baseline version"
WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9223" ./AuroraBeat.exe

# 2. Capture native UI at high resolution (from the project root)
node promotional-assets/_build/capture-native.cjs
node promotional-assets/_build/capture-mini.cjs

# 3. Compose all banner, card, icon, and contact-sheet artwork
node promotional-assets/_build/render.cjs
```

`render.cjs` writes HTML intermediates to `_build/pages/` while running and can be
re-run safely; it also produces the 1× companions and the contact sheet.
