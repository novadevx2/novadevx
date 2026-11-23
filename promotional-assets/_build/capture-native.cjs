// Captures the packaged AuroraBeat 1.0.0 app through the WebView2 debug port,
// at 2x device pixels via CDP clip screenshots (2880x1600 for the main window).
// Start the app first:
//   WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9223" ./release/AuroraBeat.exe
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "screenshots");
fs.mkdirSync(OUT, { recursive: true });
const MINI_OUT = path.join(OUT, "native-mini");
fs.mkdirSync(MINI_OUT, { recursive: true });

async function wait(page, ms = 900) {
  await page.waitForTimeout(ms);
  await page.evaluate(() => document.querySelectorAll(".playback-notice").forEach((n) => n.remove()));
}

async function nav(page, name) {
  await page.locator("button.nav-item", { hasText: name }).first().click();
  await wait(page);
}

async function snap(cdp, page, file, w, h) {
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: w, height: h, scale: 1 },
    captureBeyondViewport: false,
  });
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  console.log("saved", path.basename(file));
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  page.on("console", (m) => { if (m.type() === "error") console.log("console error:", m.text()); });

  const cdp = await context.newCDPSession(page);
  // Main window: 1440x800 CSS at 2x device pixels.
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 800, deviceScaleFactor: 2, mobile: false,
  });
  await page.waitForSelector(".app-shell", { timeout: 20000 });
  await wait(page, 1400);

  await snap(cdp, page, path.join(OUT, "app-home.png"), 1440, 800);
  await nav(page, "Library");
  await page.locator(".track-row-main").nth(3).click();
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    const a = document.querySelector('[data-testid="audio-engine"]');
    if (a) a.currentTime = 9;
  });
  await wait(page, 900);
  await snap(cdp, page, path.join(OUT, "app-library-playing.png"), 1440, 800);

  await nav(page, "Settings");
  await snap(cdp, page, path.join(OUT, "app-settings.png"), 1440, 800);
  await page.locator("main.main-scroll").evaluate((el) => el.scrollTo(0, 600));
  await wait(page, 700);
  await snap(cdp, page, path.join(OUT, "app-settings-behavior.png"), 1440, 800);

  await nav(page, "Playlists");
  await snap(cdp, page, path.join(OUT, "app-playlists.png"), 1440, 800);
  await page.locator(".playlist-card").first().click();
  await wait(page);
  await snap(cdp, page, path.join(OUT, "app-playlist-detail.png"), 1440, 800);

  await nav(page, "Library");
  await page.getByRole("button", { name: "Open queue" }).click();
  await wait(page);
  await snap(cdp, page, path.join(OUT, "app-queue-drawer.png"), 1440, 800);
  await page.keyboard.press("Escape");
  await wait(page, 500);

  // Mini player: the app resizes its real window to 460x188.
  await cdp.send("Emulation.clearDeviceMetricsOverride");
  await page.locator('.player-icon-button[aria-label="Open mini player"]').click();
  await wait(page, 1600);
  const size = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  console.log("mini viewport", size);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: size.w, height: size.h, deviceScaleFactor: 2, mobile: false,
  });
  await wait(page, 800);
  await snap(cdp, page, path.join(MINI_OUT, "app-mini-player.png"), size.w, size.h);

  // Restore the normal window for the next run.
  await cdp.send("Emulation.clearDeviceMetricsOverride");
  await page.keyboard.press("Escape");
  await browser.close();
})();
