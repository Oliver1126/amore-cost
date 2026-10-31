// Renders one 1920×1080 PNG per narration line (out/frames/sSS-lLL.png)
// from slide.html + scenes.json. Needs a temporary playwright install.
// CAPTIONS=tl renders the Taglish captions into out/frames-tl/ instead.
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright"));

const DIR = __dirname;
const { scenes } = JSON.parse(fs.readFileSync(path.join(DIR, "scenes.json"), "utf8"));
const TL = process.env.CAPTIONS === "tl";
const FRAMES = path.join(DIR, "out", TL ? "frames-tl" : "frames");
fs.mkdirSync(FRAMES, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + path.join(DIR, "slide.html"));
  const total = scenes.reduce((n, s) => n + s.lines.length, 0);
  let done = 0;
  for (const [si, scene] of scenes.entries()) {
    for (const [li, line] of scene.lines.entries()) {
      done += 1;
      const shown = TL ? { ...line, caption: line.tl.caption } : line;
      await page.evaluate((d) => window.renderSlide(d), { scene, line: shown, progress: done / total });
      const name = `s${String(si).padStart(2, "0")}-l${String(li).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(FRAMES, name) });
    }
  }
  await browser.close();
  console.log(`${total} frames → ${FRAMES}`);
})();
