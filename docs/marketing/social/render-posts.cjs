// Renders post-images.html → post-1.png … post-4.png (1080×1350, 4:5 feed size).
// Needs a temporary `npm install --no-save playwright@1.62.1`.
const path = require("path");
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright"));
const DIR = __dirname;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const n of [1, 2, 3, 4]) {
    await page.goto("file://" + path.join(DIR, "post-images.html") + "?n=" + n);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(DIR, `post-${n}.png`) });
  }
  await browser.close();
  console.log("wrote post-1.png … post-4.png");
})();
