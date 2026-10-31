// Screenshots of the real app for the presentation video.
// Needs the app running (`npx next start -p 3013`) and a temporary
// `npm install --no-save playwright@1.62.1`. Usage: node capture.cjs [baseUrl]
const path = require("path");
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright"));

const BASE = process.argv[2] || "http://localhost:3013";
const OUT = path.join(__dirname, "shots");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    localStorage.clear();
    localStorage.setItem("calcost:lang", "en");
    localStorage.setItem("calcost:theme", "light");
    localStorage.setItem(
      "calcost:v0:receipt-profile",
      JSON.stringify({ businessName: "Aling Nena's Carinderia", address: "Parañaque City", tin: "" })
    );
    sessionStorage.setItem("seeded", "1");
  });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());
  const settle = () => page.waitForTimeout(700);
  const shot = (name, target = page) => target.screenshot({ path: path.join(OUT, `${name}.png`) });

  // Empty dashboard → load the sample menu
  await page.goto(`${BASE}/dashboard`);
  await settle();
  await shot("01-dashboard-empty");
  await page.getByRole("button", { name: "Try with sample recipes" }).first().click();
  await page.waitForLoadState("networkidle");
  await settle();
  await shot("02-dashboard");

  // Recipe editor: price cards, then the ingredient table with yield
  await page.goto(`${BASE}/input?edit=demo-adobo`);
  await settle();
  const cards = page.locator("div.bg-accent.text-accent-ink:has(select)").first().locator("xpath=..");
  await shot("03-price-cards", cards);
  const table = page.locator("table:has(input[aria-label^='Yield %'])").first();
  await table.scrollIntoViewIfNeeded();
  await settle();
  // Clip to the part of the table actually visible inside the editor window
  // (the table scrolls sideways, so its own box runs past the modal edge).
  const tb = await table.boundingBox();
  const panel = await page.locator("div.fixed.inset-0 > div").first().boundingBox();
  const right = Math.min(tb.x + tb.width, panel.x + panel.width - 24);
  await page.screenshot({
    path: path.join(OUT, "04-ingredients.png"),
    clip: { x: tb.x, y: tb.y, width: right - tb.x, height: Math.min(tb.height, 900 - tb.y) },
  });
  await page.keyboard.press("Escape");
  await page.goto(`${BASE}/input`);
  await settle();
  await shot("05-input");

  // Ingredient Library
  await page.getByRole("button", { name: "Ingredient Library" }).first().click();
  await settle();
  await shot("06-library");

  // OPEX
  await page.goto(`${BASE}/opex`);
  await settle();
  await shot("07-opex");

  // Receipt: 2 × Adobo + 1 × Halo-Halo, then Senior/PWD
  await page.goto(`${BASE}/receipt`);
  await settle();
  const pick = page.getByLabel("Select recipe");
  await pick.selectOption("demo-adobo");
  await page.getByLabel("Quantity").first().fill("2");
  await page.getByRole("button", { name: "Add to order" }).click();
  await pick.selectOption("demo-halohalo");
  await page.getByLabel("Quantity").first().fill("1");
  await page.getByRole("button", { name: "Add to order" }).click();
  await settle();
  await shot("08-receipt-standard");
  await page.getByRole("radio", { name: "Senior / PWD" }).check();
  await settle();
  await shot("09-receipt-senior");
  await shot("10-receipt-paper", page.locator(".receipt-paper").first());

  // Margin & POS Simulator: Adobo, 600 portions, carries 100% of OPEX
  await page.goto(`${BASE}/simulator`);
  await settle();
  await page.locator("select").first().selectOption("demo-adobo");
  await page.getByLabel("Estimated portions sold / month").fill("600");
  await settle();
  await shot("11-simulator");

  // Phone view, in Tagalog, for the "works on your phone" scene
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p2 = await phone.newPage();
  await p2.goto(`${BASE}/dashboard`);
  await p2.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
    localStorage.setItem("calcost:lang", "tl");
    localStorage.setItem("calcost:theme", "light");
  }, await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))));
  await p2.reload();
  await p2.waitForTimeout(800);
  await p2.screenshot({ path: path.join(OUT, "12-phone-tl.png") });

  await browser.close();
  console.log("shots written to", OUT);
})();
