// Renders facebook-cover.html → facebook-cover.png (1640×624, upload this)
// and facebook-cover-guides.png (same, with safe-zone outlines, for checking).
// Needs a temporary `npm install --no-save playwright@1.62.1`.
const path = require("path");
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright"));
const DIR = __dirname;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1640, height: 624 } });
  const url = "file://" + path.join(DIR, "facebook-cover.html");
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(DIR, "facebook-cover.png") });
  await page.goto(url + "?guides"); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(DIR, "facebook-cover-guides.png") });
  await browser.close();
  console.log("wrote facebook-cover.png + facebook-cover-guides.png");
})();
