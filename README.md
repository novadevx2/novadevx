# NovaDevx website

The official NovaDevx site: an independent software studio, with AuroraBeat
1.0.0 — a local-first music player for Windows x64 — as its first product.

The site is plain **HTML, CSS, and vanilla JavaScript**. There is no framework,
package manager, build step, external font, or runtime dependency. Every path is
relative, so the same files work from the filesystem, a local server, or a
GitHub Pages repository subpath.

## Pages

| File             | Purpose                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `index.html`     | Homepage: NovaDevx hero, featured AuroraBeat project, app showcase, studio principles, downloads CTA |
| `downloads.html` | Downloads: AuroraBeat 1.0.0 release details, package status, feature previews, product cards |

Both pages share `css/style.css` and `js/main.js`.

## Project structure

```text
website/
├── index.html
├── downloads.html
├── Novadev.png                 # official NovaDevx logo
├── promotional-assets/         # supplied AuroraBeat artwork and asset notes
│   ├── README.md
│   ├── hero-main-1920x1080.png
│   ├── app-showcase-1920x1080.png
│   ├── download-page-1920x1080.png
│   ├── app-icon-presentation-1200x1200.png
│   ├── app-icon-1024x1024.png
│   ├── feature-*-1280x720.png
│   ├── product-card-*-800x800.png
│   └── larger/alternate source sizes
├── css/
│   └── style.css
├── js/
│   └── main.js
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .nojekyll
└── README.md
```

`promotional-assets/_build/` and `promotional-assets/screenshots/` contain the
source-generation material. They are not part of the website and are not copied
into the deployed artifact.

The two SVGs under `assets/` are left over from an earlier scaffold. The current
pages do not reference them.

## Artwork usage

The supplied assets are used directly; none are recreated or edited.

- **NovaDevx logo** — `Novadev.png` is shown large in the homepage hero and in
  the footer. The black background is blended away with
  `mix-blend-mode: screen`, so the white mark sits directly on the dark page.
  The compact header mark is the same file cropped with CSS background sizing.
- **AuroraBeat hero banner** — `hero-main-1920x1080.png` in the featured project
  section.
- **Application showcase** — `app-showcase-1920x1080.png` below the project.
- **Release presentation** — `download-page-1920x1080.png` on the downloads page.
- **App icon** — `app-icon-presentation-1200x1200.png` in the downloads hero and
  the featured project identity; `app-icon-1024x1024.png` in the download panel.
- **Feature previews** — all five `feature-*-1280x720.png` images.
- **Product cards** — the library, playback, playlists, and settings
  `product-card-*-800x800.png` images.

Anything below the first viewport is lazy-loaded. The deployed artifact includes
only the files the pages reference; the larger source sizes stay in the
repository.

## Local preview

No install or build step is required. All paths are relative, so opening
`index.html` directly works.

For a local server that mirrors GitHub Pages:

```bash
# from the project root
python -m http.server 8000
```

Then visit:

- <http://localhost:8000/>
- <http://localhost:8000/downloads.html>

## Publishing to GitHub Pages

1. Create a repository on GitHub and push this folder to `main`:

   ```bash
   git init
   git add .
   git commit -m "Build NovaDevx website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` again, or run **Deploy static site to GitHub Pages** manually
   from the **Actions** tab.

The workflow checks out the site, copies the pages plus the referenced logo,
CSS, JavaScript, and artwork into `_site`, and deploys that artifact. It runs on
pushes to `main` and on `workflow_dispatch`.

The site will be available at:

- `https://YOUR-USERNAME.github.io/YOUR-REPO/` for a project repository
- `https://YOUR-USERNAME.github.io/` for a `<username>.github.io` repository
- your custom domain, if configured in **Settings → Pages**

No base-path configuration is needed. If your default branch is not `main`,
update the branch name in `.github/workflows/deploy.yml`.

Keep `.nojekyll` in the repository so GitHub Pages serves the files without
Jekyll processing.

## AuroraBeat download availability

The download area is intentionally **not linked to a fabricated URL or file**.
No public AuroraBeat package URL exists in this repository, so
`downloads.html` shows:

- version `1.0.0`, Windows x64, installer and portable build — as documented by
  the supplied release artwork;
- a disabled **Download for Windows** button;
- a note explaining that the public download link has not yet been published.

The file size is listed as **Not published** because no real size is known. Do
not invent one.

When an official AuroraBeat 1.0.0 package is available:

1. In `downloads.html`, replace the disabled button inside
   `<aside class="download-panel" id="download">` with a real link:

   ```html
   <a
     class="button button--primary button--block"
     href="https://example.com/AuroraBeat-1.0.0-win-x64.exe"
     download
   >
     Download for Windows
   </a>
   ```

2. Replace the pending text in `#download-availability` with real requirements
   or installation notes, and remove the "Link pending" status row.
3. Replace `Not published` in the file-size row with the real size, and update
   the status line if the package differs from the artwork.
4. If both installer and portable downloads are offered, link each one
   explicitly rather than pointing a single button at an ambiguous package.

Only publish a URL after the file is actually available.

## Accessibility and behaviour

- Semantic landmarks, a skip link, keyboard-operable navigation, and visible
  focus styles.
- The mobile menu supports `Escape`, focus return, a focus loop, outside-click
  closing, and closes automatically when the viewport reaches desktop width.
- Scroll reveals use `IntersectionObserver` and are disabled under
  `prefers-reduced-motion`. If JavaScript or the observer is unavailable,
  content remains visible.
- Images carry descriptive alt text based on the supplied screenshots; purely
  decorative app icons use empty alt text.
- The layout is responsive at approximately 1080, 980, 900, 820, 640, and
  400 pixels, with a single-column reading flow on phones.

## Verification checklist

Before deploying a change:

```bash
python -m http.server 8000
```

Then confirm:

- both pages load and all images resolve;
- header, footer, and in-page links work;
- the mobile menu opens, closes, and restores focus;
- layouts hold at narrow widths and at 100% browser zoom;
- the download button remains disabled until a real URL is supplied.
