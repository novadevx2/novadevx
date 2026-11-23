// Re-captures the mini player at 4x device pixels (1840x752).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.clearDeviceMetricsOverride");
  await page.waitForTimeout(800);

  if (!(await page.locator(".app-shell.is-mini").count())) {
    await page.locator('.player-icon-button[aria-label="Open mini player"]').click();
    await page.waitForTimeout(1600);
  }
  const size = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  console.log("mini css size", size);

  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: size.w, height: size.h, deviceScaleFactor: 4, mobile: false,
  });
  await page.waitForTimeout(900);
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: size.w, height: size.h, scale: 1 },
    captureBeyondViewport: false,
  });
  const out = path.join(__dirname, "..", "screenshots", "native-mini", "app-mini-player.png");
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  console.log("saved", out);

  await cdp.send("Emulation.clearDeviceMetricsOverride");
  await page.keyboard.press("Escape");
  await browser.close();
})();
