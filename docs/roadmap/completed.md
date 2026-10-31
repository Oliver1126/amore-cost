# Completed

What's actually shipped, newest first — a flat changelog, not a plan.
See [../business/decisions/](../business/decisions/CONTEXT.md) for
*why* each of these happened, not just that they did.

- **2026-10-31** — Presentation video (`docs/marketing/video/`): a
  3:15 narrated explainer, 1920×1080, built from real app screenshots
  with the sample recipes, burned-in captions + `.srt`, reproducible
  from `scenes.json` via capture/render/build scripts. Fixed two stale
  UI strings found while capturing it: the Ingredient Library's
  description and empty state still pointed to the removed "Costing &
  Pricing" page and "Cost History" (EN + TL, plus "products" →
  "recipes"), and the Tagalog Dashboard showed "Average food cost %"
  untranslated.

- **2026-10-29** — Full documentation sweep to match the five-page app,
  decision 0041, the KwentaPOS comparison and the new competitive
  roadmap: business/branding docs, product/QA/marketing docs,
  next-steps (condensed to current status + Stage 0/1 actions), backlog
  (every item tagged with its roadmap stage), root CLAUDE.md, README,
  DESIGN.md page references, and the decisions index (0021–0041 added).
  **User manual rewritten** (`onboarding/user-manual.md`) as a full
  guide with worked examples — every peso figure computed from the
  sample recipes with the app's own math (Adobo ₱80.08 → ₱299, OPEX
  ₱35.13/dish, a Standard vs. Senior/PWD receipt, three simulator
  scenarios).

- **2026-10-28** — Three pricing aids from the five-page feature audit
  (decision 0041): **Yield %** per ingredient line (bone-in chicken at
  70% costs ÷ 0.7, flowing into unit cost, recipe cost, price and food
  cost %); **menu price rounding** on the Suggested price card (Exact /
  ₱1 / ₱5 / ₱10 / ends in 9, always up — ₱298.97 → ₱299, with "rounded up
  from" shown and profit recomputed from the rounded price); and
  **sample recipes** — one click loads Adobo, Tapsilog and Halo-Halo
  with linked ingredients and sample OPEX (only if OPEX is blank), one
  click removes only the `demo-` records. Also fixed: food cost % now
  measures against the price actually charged, so rounding moves it
  too. Verified live EN/TL, light/dark, 360/390/1280px, zero console
  errors. 184 tests.

- **2026-10-28** — Receipt Simulator redesigned as a thermal receipt,
  following the reference's POS receipt layout: monospace slip, the
  owner's own business name/address/TIN (optional, saved, in backups — no
  invented placeholder TIN), QTY/DESCRIPTION/AMOUNT, double/dashed rules,
  scalloped edge, in-receipt Dish margin analysis (hidden on print),
  "not a valid receipt" footer. Fixed a real money bug: lines didn't foot
  by a centavo (₱193.45 + ₱23.21 ≠ ₱216.67) — now computed from rounded
  menu prices like a POS, matching the reference to the centavo. Fixed a
  mobile bug on four pages: implicit grid columns grew to the widest
  dropdown option and pushed content off the left edge of phones
  (invisible to a document-scroll check because the app's scroll
  container swallowed it); verified with a per-element offscreen check
  proven against the broken version first. 165 tests.

- **2026-10-28** — Cut from 11 modules to 5 pages (decision 0040),
  modeled on https://food-cost-tau.vercel.app/: **Dashboard**, **Input**
  (recipes + "Edit breakdown," opened automatically on new recipes),
  **OPEX & Overhead** (now with expense categories + per-dish overhead
  allocation), **Receipt Simulator** (new — PH official-receipt math with
  VAT inclusive/exclusive, Senior/PWD, service charge), **Margin & POS
  Simulator** (new — P&L waterfall, break-even, OPEX-share control).
  Removed Inventory, POS checkout, Cost History, Documents, Multi-User,
  Multi-Channel, Margin Alerts, Reporting, and standalone Costing; every
  old route redirects. Backup/Restore moved to the Dashboard. Full old
  version tagged `v1-full-11-modules`. Fixed two latent crashes
  (`MODULES.find(...)!` on retired slugs in the landing page and
  `CostForm`). 163 tests, `tsc`/build clean, verified live on all pages
  in EN/TL, light/dark, desktop + phone, receipt/break-even figures
  hand-checked.

- **2026-09-03** — Color-coded cost/price/profit cards, food vocabulary
  app-wide (decision 0039): two new permanent design tokens,
  `--warn` (orange, cost emphasis) and `--info` (blue, profit emphasis)
  — `globals.css`, both themes, closing a gap `DESIGN.md` had already
  flagged (only 2 semantic tones existed). Applied to `StatCards.tsx`
  and `BatchCard.tsx` for a consistent cost=orange/price=green/
  profit=blue language across the per-serving and batch-total views.
  ~35 `STRINGS` keys (EN+TL) renamed app-wide: "Item"→"Recipe," "Batch
  size"→"Servings," "True cost"→"Recipe cost," "Profit per unit"→
  "Profit per serving." Pricing-strategy terms (Margin %/Markup %/
  Fixed profit) and module names deliberately kept — "Food Cost %"
  from the original brief is mathematically identical to the existing
  Margin %, so adopting it verbatim would have meant removing the
  Markup/Fixed-profit options, a regression nobody asked for. 159
  tests unaffected, `tsc`/`build` clean, verified live in both themes
  and both languages, redeployed.

- **2026-09-03** — Food-only, product and marketing both (decision
  0038, superseding 0004): `Vertical` narrowed from `"food" | "service"
  | "resale"` to `"food"` only, and the now-single-option business-type
  tab switcher deleted from `CostForm.tsx` and `CreateCatalogModal.tsx`
  (not just hidden) — a deliberate, staged small-to-bigger rollout, not
  scope creep. Every module stays; none were ever vertical-specific
  pages. Landing page, pitch one-pager, `concept.md`, `go-to-market.md`,
  `competitive-landscape.md`, `strategy.md`, `modules.md`, and the
  onboarding manual all updated to match — `competitive-landscape.md`'s
  "one account across all three verticals" differentiator is honestly
  retired, not just softened. The original multi-vertical positioning,
  reasoning, and copy are preserved in
  `docs/archive/multi-vertical-2026-08/` for a possible future
  re-expansion, not deleted. 159 tests, `tsc`/`build` clean, redeployed.

- **2026-09-03** — Repositioned marketing to lead with food (decision
  0037): landing page, page metadata, the pitch one-pager, and
  `go-to-market.md`/`concept.md` now lead with "built for Philippine
  food businesses," disclosing service/resale as also-supported rather
  than co-equal. The product itself is unchanged — all three verticals
  still work identically; decision 0004 stands. Also fixed a real,
  pre-existing bug found along the way: the pitch one-pager had no
  `<meta charset="UTF-8">`, so opening it directly as a file (exactly
  how it'd be shared) corrupted every ₱ symbol and em-dash into
  mojibake — one-line fix, verified before/after with a real
  screenshot. Copy-only change; `tsc`/tests/build unaffected by
  definition, redeployed to amore-cost.vercel.app.

- **2026-09-02** — Cost History debounced snapshot (decision 0036,
  backlog item 10, deferred from decision 0035): typing into a saved
  item's cost fields no longer appends one Cost History snapshot per
  keystroke. Split `updateItemState()` into `updateItemStateLive()`
  (instant state update, no history) and `commitHistorySnapshot()`
  (the actual snapshot), wired together via a new reusable
  `useDebouncedCommit` hook (re-arms on every change, flushes on
  unmount, reads its callback through a ref to avoid stale-closure
  bugs) in both Costing & Pricing and Catalog Management's "Edit &
  Breakdown" modal. Verified live: typing "1200" digit-by-digit left
  history untouched until the pause, then added exactly one entry with
  the settled value — while the displayed "True cost" still updated
  instantly on every keystroke, no visible lag. 159 tests (up from
  153, 6 new), `tsc`/`test`/`build` clean.

- **2026-09-02** — Percentage-formatting consistency sweep (backlog
  item 11, deferred from decision 0035): every margin/markup/cost-share
  percentage in `CostComposition.tsx`, `CostForm.tsx`, `catalog/page.tsx`,
  and 5 distinct values across `insights.ts` (gap, cost-rose %,
  margin %, portfolio share %, channel margin %) now consistently uses
  1 decimal, matching `DESIGN.md` §4's own rule — previously a mix of
  0 and 1 decimals in the same panel. `avgUnits` (a units-sold count,
  not a percentage) deliberately left at 0 decimals. 153 tests
  unchanged (assertions use substring matches, not exact decimal
  output), `tsc`/`build` clean.

- **2026-09-02** — Diagnostic audit, 13 correctness bugs fixed
  (decision 0035): a `code-review` skill run at max effort against
  Costing & Pricing, Catalog Management, the landing page, POS
  receipt, and the just-shipped insights engine surfaced 15 real bugs
  — 5 of them in `insights.ts` from earlier the same day. Fixed:
  `marginStatus()`'s float-epsilon misclassification (83.5% false
  positive rate, simulated), a margin-≥100% NaN-corruption bug, a
  unit-conversion fallback that was dead code (up to 1000x mispricing
  when linking an ingredient), a linked-quantity fallback disagreement
  between live display and the ingredient-cascade path, a stale amount
  left behind on unlink, the insights engine's pre-tax "raise by"
  advice, its mathematically-unreachable channel-fee check, its
  flat-30-day stock-pace understatement, its unclamped >100%
  portfolio-share bug, a same-severity insight-starvation bug,
  `duplicateCatalogItem` sharing history/channel array references with
  the original, a cross-tab data-loss bug (fixed via a `storage`-event
  listener added to the shared `useLocalStorage` hook, benefiting
  every page), an oversell-then-refund stock-inflation bug (new
  `SaleEntry.stockDeducted` field), plus a missing Tagalog ₱ prefix, a
  hardcoded English `Suspense` fallback, and a 28px delete-button tap
  target. Deferred 2 (Cost History's per-keystroke snapshot spam;
  inconsistent `.toFixed(0)` percentage formatting) to
  `backlog.md` items 10–11 with reasoning. 153 tests (up from 146,
  7 new), `tsc`/`build` clean, key fixes re-verified live against
  hand-computed expected values.

- **2026-09-02** — DESIGN.md aligned to reality, real gaps fixed
  (decision 0034): rewrote the root `DESIGN.md` from a generic
  template full of `[NEEDS TEAM INPUT]` placeholders into a real
  reference — actual token values, actual component names, and
  honest gap markers checked against the real code (which also
  disproved a second, self-admittedly unverified "likely issues"
  list on a few points — data source-of-truth and live recalculation
  were already real, the sidebar already collapses on mobile). Then
  fixed what was actually real: a shared `PageSkeleton` component
  replacing bare "Loading…" text on all 12 pages that had it, a
  global `:focus-visible` ring, two sub-44px nav tap targets resized
  to 44px, and the printed customer-facing quotation — previously
  entirely hardcoded English — now bilingual, which also surfaced and
  fixed the same raw-English tax-label bug independently duplicated
  in `StatCards` and `TaxCard`. `tsc`/`test` (146)/`build` clean,
  verified live (keyboard focus color, EN/TL print output, tap-target
  pixel sizes).

- **2026-09-02** — Progressive disclosure for terminology (decision
  0033): Costing & Pricing showed too much always-visible jargon for a
  first-time owner — a full paragraph explaining Margin %/Markup %/
  Fixed profit, no explanation of VAT vs. Percentage Tax, and a
  10-column package-pricing table with no guidance on which columns
  matter when. New reusable `InfoButton` component (click to reveal,
  closes on outside click/Escape) now hides these behind a "?" in
  three places — the strategy card, the tax card, and the cost-line
  table's legend — while keeping actionable data (the suggested
  margin range, the dynamic tax note) visible by default. `tsc`/
  `test`/`build` clean, verified live in EN/TL and light/dark.

- **2026-09-02** — Insights engine (decision 0032): Overview now shows
  a "Needs your attention" panel with specific, personalized
  recommendations instead of raw numbers — below-target items paired
  with their cause (a Cost History-driven cost increase) and a
  precise price fix, a portfolio view (which item drives most profit,
  which below-target item is also a slow seller), a channel-fee
  margin gap with the price that would match it, and a sell-through-
  rate stock runway estimate. All four (`src/lib/insights.ts`) are
  pure reads over data already in `CatalogItem[]` — no backend, no
  accounts needed. Also extracted `itemSalesTotals()` into
  `catalog.ts`, deduplicating an inline calculation Reporting had.
  146 tests (up from 130), full `tsc`/`test`/`build` clean, verified
  live in EN/TL and light/dark, redeployed to
  amore-cost.vercel.app.

- **2026-08-21** — Deployed to Vercel (decision 0031):
  **https://amore-cost.vercel.app** is now live, via CLI deploy
  directly from the project folder (no git repo yet, so future changes
  need an explicit `vercel --prod` redeploy). Clears
  `docs/roadmap/backlog.md`'s former item 1 and the one gate on
  `docs/marketing/launch-checklist.md` — Phase 1 validation outreach
  can start.

- **2026-08-21** — Cross-page audit batch (decision 0030): audited
  every dashboard page not previously reviewed this session (Alerts,
  Break-Even, Dashboard, Documents, History, Inventory, Multi-Channel,
  Multi-User, POS, Reporting) and fixed 8 correctness bugs — negative
  quantities accepted by Inventory's Add Stock/Log Sale, a backup
  missing `exportedAt` crashing restore, Break-Even ignoring the saved
  catalog item Dashboard just showed, Multi-User's unconfirmed profile
  removal, `updatedAt` silently not bumping outside `/costing`
  (Inventory/Alerts/Multi-Channel/`logSale`/`checkoutCart`/
  `refundTransaction`), Alerts duplicating the shared `marginStatus()`
  check by hand, and `peso()`/`pesoSigned()` duplicated across 14
  files — extracted to new `src/lib/format.ts`, plus new shared
  `mostRecentCatalogItem()`/`featuredState()` in `src/lib/catalog.ts`.
  POS's missing overselling ceiling was deliberately left as-is
  (matches decision 0015's existing "flag, don't block" philosophy);
  POS's unmemoized cart computations moved to
  [backlog.md](backlog.md). 130 tests (up from 119), full
  `tsc`/`test`/`build` clean, live-browser verified.

- **2026-08-21** — Reordered the item editor (decision 0029): Cost
  Composition/Price using/Tax/Batch size/Quote templates moved from a
  narrow side column into a responsive row above the Food & beverage/
  Service/Resale section, instead of running beside it. Pure layout
  change in `ItemEditor.tsx`, no logic touched; reaches both Costing &
  Pricing and Catalog Management's "Edit & Breakdown" since both share
  the component. 119 tests unchanged.

- **2026-08-21** — The cost-line editor (`CostForm`) became an
  always-visible table matching the live reference site's exact
  columns (decision 0028): Ingredient/Material/Cost item Name /
  Supplier / Package Price / Qty per pack / Shipping fee / **Pack
  unit** (new field) / Portion qty / Portion unit / Unit cost `AUTO` /
  Line cost `AUTO`. Added a genuinely missing capability, not just a
  layout change: package-priced lines can now be bought in one unit
  and portioned in a different one (a 25kg sack costed in kg, used in
  gram portions), via a new `packageLineAmount()` mirroring the
  existing linked-ingredient conversion math. Reaches both Costing &
  Pricing and Catalog Management's "Edit & Breakdown" for free, since
  both share this component. Found and fixed a real layout bug during
  verification — `<fieldset>`'s default `min-width: min-content` was
  silently overriding the table's `overflow-x-auto` and stretching the
  whole modal past its own max-width; fixed with `min-w-0`, confirmed
  via `scrollWidth` before/after, not just visually. 4 new tests
  (**119 total**).

- **2026-08-21** — The Ingredient Library itself moved from an
  always-visible Catalog Management page section into its own modal
  (decision 0027, superseding part of 0022's presentation), opened by
  a new button next to "+ New item" — matching the popup pattern
  already established for 0025/0026. Extracted ~300 lines of state/
  JSX/handlers off the page into a new self-contained
  `IngredientLibraryModal.tsx`; the "Add ingredient" popup (0026) now
  opens from inside it. Designed around the datalist-id collision
  fixed in 0025 up front this time — the ingredient-row unit datalist
  got its own unique id before anything could collide, confirmed live
  via `querySelectorAll`. Dead state/handlers and the now-pointless
  jump-to-anchor nav were removed, not left in place. No new logic;
  115 tests unchanged.

- **2026-08-21** — The Ingredient Library's "Add ingredient" form
  became a lightweight popup too (decision 0026), matching "+ New
  item" (0025) — the always-open inline form (permanent page space
  regardless of use) is gone, along with its now-dead `form`/
  `addIngredient()` state. Scoped correctly by asking first which of
  two same-named "Add Ingredient" buttons was meant (the shared
  Ingredient Library's, not the per-recipe cost-line one inside Edit &
  Breakdown, which stays an inline row per 0025's finding). Relocated
  the shared unit datalist out of the removed form so the still-needed
  ingredient-row edit datalist didn't silently break. No new logic;
  115 tests unchanged.

- **2026-08-21** — "+ New item" became a lightweight create-only modal
  (decision 0025, superseding part of 0023), matching the live
  reference site's own two-step shape (confirmed by actually browsing
  it: a small Create modal, fully separate from its much bigger Edit &
  Breakdown) — also confirmed the reference's "Add Ingredient Line" is
  a plain inline row, not a popup, correcting an earlier misreading of
  a static mockup before any popup was built. A code audit of the
  Catalog Management files in the same pass found and fixed two real
  bugs: `CatalogEditModal`'s Target margin input was missing the
  `|| ""` fallback every other numeric input in this codebase uses
  (would've reintroduced the "literal 0 blocks typing" bug already
  fixed elsewhere), and `CostForm` rendered a `<datalist>` with an id
  that collided with the Catalog page's own when the modal was open
  (invalid duplicate DOM id). No new logic; 115 tests unchanged.

- **2026-08-20** — Catalog Management's Products list became a card
  grid instead of a table (decision 0024, superseding 0023's "keep the
  table" call once the actual reference images were confirmed): one
  card per item (name, target-margin badge, vertical/SKU, the existing
  "N ingredient(s) linked" badge and its expand — now a compact stacked
  list instead of a wide table, since a card isn't wide enough for
  that — True cost/Margin stats, a highlighted Suggested Price block,
  stock, status, then QR/Duplicate/Delete + a full-width "Edit &
  Breakdown" button). Along the way, fixed a real overflow bug (the
  edit button clipped past the card edge when crammed onto one row with
  the other actions — fixed by stacking them) and a real copy bug (the
  linked-line label read as "ingredient(s) linked" with no number,
  since it reused a suffix-only string as a standalone label). No new
  logic; 115 tests unchanged.

- **2026-08-20** — Catalog Management's "Edit & Breakdown" became a
  real in-page editor (decision 0023): a new modal
  (`CatalogEditModal.tsx`) embeds the *entire* cost stack — vertical,
  ingredients, labor, packaging, overhead, tax, pricing strategy — by
  reusing a newly extracted `ItemEditor.tsx` component pulled verbatim
  out of `costing/page.tsx` (a behavior-preserving refactor, not a
  rewrite), plus a new **Target margin %** field editable right there
  for the first time. "+ New item" and each row's name now open this
  modal instead of navigating away; `/costing` and `/costing?id=` are
  unchanged and still work everywhere else that links to them. Prompted
  by reviewing a competitor's card-based UI — its breakdown view only
  showed ingredients with no labor/packaging/overhead/tax, which would
  have been a real regression if copied as-is, so the fix was to reuse
  Amore Cost's own already-complete editor inside a modal instead of
  copying the competitor's simplified one. No new pure-logic functions
  needed; test count stays at 115.

- **2026-08-20** — Ingredient Library and Catalog merged into one
  **Catalog Management** page (decision 0022, `/catalog`) — feedback
  that the two looked disconnected even though a Costing & Pricing cost
  line has always been able to link to a shared ingredient. One page,
  two sections (Products, Ingredient Library), not tabs, so both stay
  visible at once; `/ingredients` now redirects to
  `/catalog#ingredient-library`. Products gained a name/SKU search, a
  3-state margin filter (All/On target/Below target, against each
  item's own `targetMarginPercent` — new `marginStatus()` in
  `src/lib/catalog.ts`), and a per-row "N ingredient(s) linked" badge
  that expands a cost breakdown (Supplier/Package price/Qty per pack/
  Shipping/Unit cost/Line cost per line) mirroring a competitor's
  recipe-management view. The Ingredient Library's "used in N" count is
  now clickable to the real product names (new `usedInItems()` in
  `src/lib/ingredients.ts`). Along the way, fixed two real crash risks
  (`CostForm.tsx` and the landing page both did
  `MODULES.find(...)!` on the now-removed "ingredients" slug) and a
  stale Inventory description that wrongly said the Ingredient Library
  was "still on the roadmap." 6 new tests (115 total); module count
  11.

- **2026-08-20** — Refunds/voids for Point of Sale (decision 0021,
  `roadmap/backlog.md` item 10 resolved): `refundTransaction()` reverses
  a completed sale by restocking it and appending a new negative-quantity
  `SaleEntry` linked via `refundOf`, under a fresh transactionId — the
  original receipt is never mutated. `isTransactionRefunded()` gates a
  "Refund this sale" button on the receipt page (with a confirm dialog);
  once refunded, the original shows a "Refunded" badge and the refund
  gets its own printable "Refund receipt" linking back to the original.
  Sales & Profit Reporting needed **zero code changes** — its existing
  sums over `SaleEntry[]` net a refund out automatically. Along the way,
  found and fixed a real formatting bug (per `CLAUDE.md`'s "fix what you
  find" rule): negative amounts were rendering as `₱-333.33` instead of
  `-₱333.33` on both the receipt page and `/reporting` — the first time
  either page could show a negative number. 9 new tests (109 total).
  Verified live in EN/TL and Light/Dark: sold, refunded, confirmed the
  original stayed intact with a "Refunded" badge, the refund receipt
  showed `-2`/`-₱333.33` with a working link back, Inventory restocked,
  and Reporting netted back to zero.

- **2026-08-19** — `docs/marketing/free-tier-benefits.md` added: the
  actual "why is this free" explanation — user-facing benefits (no
  signup, not a crippled trial, no lock-in, no hidden costs) and the
  business rationale (it's the sales mechanism for a solo founder with
  no ad budget, costs ~₱0 to offer today, is the only way to get a real
  validation signal) — grounded in `go-to-market.md`, `concept.md`, and
  the new `financial-strategy.md` rather than new positioning invented
  on the spot.

- **2026-08-19** — Senior Citizen/PWD discount (decision 0020, RA 9994/
  RA 10754): new `seniorPwdPrice()` in `src/lib/calculator.ts` (20% off
  the pre-tax price, no tax re-added since the purchase is VAT-exempt
  by law) — surfaced by `computePriceBreakdown`'s new `seniorPwdPrice`
  field, so it's free for every consumer. Shown on Costing & Pricing's
  Suggested Price card; a real per-cart-line toggle in Point of Sale
  applies it to just that line, recorded on the `SaleEntry`
  (`seniorPwdDiscount`), and shown as a tag on the printed receipt.
  Found by deliberately reviewing a competitor (food-cost-tau.vercel.app)
  rather than assuming the feature set was complete — a real PH
  compliance gap, not a nice-to-have. 4 new tests (100 total). Verified
  live in EN/TL: ₱166.67 regular → ₱133.33 Senior/PWD, confirmed on
  Costing & Pricing, the POS cart total, and the printed receipt.
- **2026-08-19** — Two new docs additions. `docs/business/financial-strategy.md`
  — the revenue-model *scenarios* and decision order (free-forever vs.
  retroactive gating, subscription vs. one-time pricing, a business-
  level break-even framed with the app's own Break-Even math),
  explicitly not a fabricated financial model — real unit-economics
  figures (§5) are left blank on purpose since no real usage data
  exists yet, consistent with `strategy.md`'s existing "modeling
  fiction" caution; `document-inventory.md` and `strategy.md` updated
  to cross-reference it rather than duplicate. `docs/marketing/` added
  (`CONTEXT.md`, `launch-checklist.md` — a step-by-step version of
  `go-to-market.md`'s Phase 1 plan, `content-ideas.md` — a content
  backlog grounded in real shipped features like decisions 0018/0019),
  registered in `docs/CLAUDE.md`'s routing table.
- **2026-08-19** — Pricing-strategy descriptions + suggested ranges
  (decision 0019): Margin %/Markup %/Fixed profit each explain what
  they actually compute (margin ÷ price vs. markup ÷ cost — genuinely
  different numbers for the same profit), plus a vertical-specific
  suggested range (food 30–40%, service 40–60%, resale 20–30% margin)
  and a "Use suggested" quick-fill. New tested pure function
  `marginPercentToMarkupPercent` so the suggested range converts
  correctly under Markup % instead of reusing the margin numbers
  under a different label. 4 new tests (96 total). Verified live in
  both EN/TL across all three strategies and two verticals.
- **2026-08-19** — OPEX → Overhead estimator on Costing & Pricing
  (decision 0018): an "Estimate from OPEX" toggle under the Overhead
  field shows the shared OPEX total, takes an expected monthly volume,
  and offers `OPEX ÷ volume` as a suggested per-unit overhead — "Use
  this" applies it once, on request, never automatically. Answers the
  question Oliver asked directly ("how do Costing & Pricing and OPEX
  connect") with a real, reviewable bridge instead of leaving them
  fully separate. Verified live in both EN and TL with real numbers
  (₱30,000 OPEX ÷ 300 units → ₱100.00/unit, applied and confirmed).
- **2026-08-19** — Fixed a real data-model bug: OPEX moved out of
  `CalculatorState` into its own shared store (decision 0017,
  `src/lib/opex.ts`, new `calcost:v0:opex` key, added to
  `backup.ts`'s `BACKUP_KEYS`). Found because Oliver noticed Break-Even
  behaved inconsistently after entering OPEX for one item and then
  drafting a different one — the actual cause was that OPEX had been
  left as a per-item field (decision 0014) when rent/salaries/
  utilities describe the whole business, so it was silently resetting
  every time a new draft started. The Break-Even page now says so
  directly in the UI. Tests moved to `src/lib/opex.test.ts` (still 92
  total). Verified live: entered OPEX, saved an item, started a
  completely different draft, confirmed OPEX was still there.
  **Same-day follow-up**: the OPEX card was still nested inside the
  "you haven't priced anything yet" empty state (a 0014 leftover), so
  with no item priced at all, OPEX appeared to vanish entirely — Oliver
  hit this immediately after the first fix. Restructured so OPEX always
  renders; only the price/units-needed cards stay gated behind having a
  priced item. Verified live with a fully empty account.
- **2026-08-19** — Client onboarding user manual added at
  `docs/onboarding/user-manual.md` (`CONTEXT.md` alongside it,
  registered in `docs/CLAUDE.md`'s routing table). Written for a
  business owner, not a developer or QA tester — plain language,
  step-by-step getting-started, a "how do I…" reference covering every
  module including Point of Sale, and an FAQ. The "Need help?" section
  deliberately left a placeholder for real contact info rather than
  inventing one, since no support channel exists yet.
- **2026-08-19** — Mobile-responsive dashboard (decision 0016,
  `roadmap/backlog.md` item 9, resolved): `Sidebar.tsx` is now a
  slide-in drawer with a backdrop and close button below the `lg`
  breakpoint, opened via a hamburger button in `AppShell.tsx`'s top
  bar; a nav click both navigates and auto-closes the drawer. Desktop
  layout is unchanged. Verified at 390px/820px/1400px. Prioritized
  now specifically because Point of Sale's real use case (a market
  stall) is phone-first.
- **2026-08-19** — Point of Sale module (decision 0015), the 12th:
  `/pos` — scan or search a Catalog item (by name or a new optional
  `sku` field, editable on the Catalog page), build a cart, pick a
  payment method (Cash/GCash/Card/Other), check out. New
  `checkoutCart()` in `src/lib/catalog.ts` rings up every cart line in
  one transaction (shared `transactionId`, 5 new tests, 92 total) —
  reuses the exact stock-deduction/sale-logging math `logSale` already
  used, so Sales & Profit Reporting needed zero changes to pick up POS
  sales correctly. Receipt prints via `/pos/receipt/[transactionId]`
  (same pattern as Documents' quotations), explicitly labeled "not a
  BIR-registered official receipt." Scoped deliberately: no cash-drawer
  or thermal-printer hardware integration, no camera-based barcode
  scanning, no multi-register sync — all stated in the module's own
  `note` field, not silently dropped. A written plan was reviewed and
  approved before any code was written. Verified end-to-end live
  (seeded SKUs, simulated a scan, oversold an item to trigger the
  low-stock warning, completed a sale, confirmed stock/reporting/
  receipt all correct) in both EN/TL and light/dark.
- **2026-08-18** — Package cost calculator + itemized OPEX (decision
  0014): Cost Ledger lines not linked to the Ingredient Library can now
  derive a per-unit cost from Supplier/Package Price/Qty per
  Pack/Shipping Fee (`packageUnitCost()`), auto-applied to that line's
  Cost. Break-Even's single "fixed costs per month" number replaced
  with an itemized OPEX list (add/remove named expenses, same pattern
  as Cost Ledger) plus a Contingency % buffer —
  `CalculatorState.monthlyOpex` removed entirely in favor of
  `opexItems` + `opexContingencyPercent`. 7 new tests (86 total). Fully
  translated EN/TL in the same pass, verified live with real numbers
  in both languages before shipping.
- **2026-08-18** — Per-line cost percentage added to Costing & Pricing's
  Cost Ledger (`CostForm.tsx`): each ingredient/material/cost-item row
  now shows what share of the item's total true cost it represents
  (e.g. "31% of total cost"), computed from the same `trueCost()`
  function `CostComposition`'s aggregate chart already uses — no
  duplicated math. Complements, doesn't replace, the existing
  Materials/Labor/Packaging/Overhead breakdown chart, which only
  showed category totals, not per-ingredient detail. Fully translated
  (`costForm.percentOfCost` in `src/lib/i18n.tsx`).
- **2026-08-18** — FAQ section added to the landing page (`#faq`, 7
  questions): account/signup, data storage and safety, PH tax handling,
  multi-vertical support, Multi-User's real limitation (honestly
  restated, not oversold), mobile support (checked live — the
  dashboard sidebar doesn't collapse on a phone-width screen yet, so
  the answer says so instead of claiming full mobile support), and
  whether a paid tier is coming. No claim made without checking it
  against the real app first.
- **2026-08-18** — Landing page's calculator is now a real interactive
  demo (decision 0013, `LandingCalculator.tsx`) — 4 inputs, computes
  using the actual `computePriceBreakdown` from `src/lib/calculator.ts`,
  not a duplicated calculation. 3 free tries, then an honest nudge to
  the (actually free, no limit) `/dashboard`. Also added an honest
  placeholder pricing section (`#pricing`) — a real "Free, live today"
  card next to a "Pro, proposed, not final" card with a disabled
  "Coming soon" button. Explicitly **not** a fake subscribe/signup
  flow — flagged to Oliver before building since no accounts or
  payment system exist anywhere in this app, and he chose this
  honest-placeholder approach over the alternatives offered.
- **2026-08-18** — Public landing page added at `/` (decision 0012),
  with the app moved to `/dashboard` via a new `(dashboard)` route
  group (`src/app/(dashboard)/`) — every other module kept its
  existing URL (`/costing`, `/catalog`, etc.), only Overview's route
  changed. The landing page (hero, a 6-module feature grid pulled live
  from `MODULES`, a 3-step "how it works," closing CTA) has zero
  fabricated social proof — no fake testimonials or user counts, since
  this app has never actually been shown to a real business owner.
  Caught and fixed a real pre-existing bug in the process: Break-Even's
  empty-state link was labeled "Costing & Pricing" but pointed at `/`
  (only ever worked by coincidence, since `/` used to *be* Overview) —
  now correctly points to `/costing`.
- **2026-08-18** — QA workspace added at `docs/qa/` (`CONTEXT.md`,
  `instructions.md` — setup + a full module-by-module walkthrough for
  a first-time tester, `qa-manual.md` — the actual test checklist, a
  "known simplifications, don't file these as bugs" list pulled from
  `product/modules.md`, and a bug-report format). Registered in
  `docs/CLAUDE.md`'s routing table. Dev server port changed
  `3000` → `3003` (`package.json`'s `dev` script, plus every doc that
  referenced `localhost:3000`) at the same time.
- **2026-08-18** — Logo now renders the real designed asset (decision
  0011) instead of the hand-coded SVG from decision 0010: Oliver
  supplied the actual Figma export (`medium.png`, 250×154px — an
  earlier `small Logo.png` at 32×20px was too low-res to use), copied
  into the repo as `public/brand-mark.png`. `BrandMark.tsx` now
  renders it as an `<img>`; `icon.tsx`/`apple-icon.tsx` embed the same
  file as a base64 data URI in the `next/og` `ImageResponse`. Verified
  legible at real favicon size (16px) same as every prior icon change.
- **2026-08-18** — Tagalog/English UI toggle, phase 3 (final): full
  Tagalog coverage added for the last 5 pages — Costing & Pricing
  (plus all 6 of its shared components: `CostForm`, `StatCards`,
  `CostComposition`, `StrategyCard`, `TaxCard`, `BatchCard`,
  `TemplatesCard`), Ingredient Library, Catalog, Inventory, and
  Documents. Added `getVerticalLabels`, `getJobStatusLabel`, and
  `getTaxPresetLabel` helpers to `src/lib/i18n.tsx` alongside
  `getModuleText`, so vertical names (Food & beverage/Service/Resale),
  job statuses (Quoted/Accepted/etc.), and tax preset labels
  (VAT/Percentage Tax/etc.) all translate consistently everywhere
  they're rendered, not just in one place. **All 11 modules now have
  full Tagalog coverage — this closes out the Tagalog/English toggle
  entirely**, so `backlog.md` item 9 is deleted rather than narrowed
  further. Caught and fixed one real bug during verification: the
  Tagalog string for Inventory's "on hand" label had accidentally left
  the phrase "on hand" itself in English — found by screenshotting the
  actual rendered Tagalog page with seeded data, not just reading the
  translation dictionary source.
- **2026-08-18** — Tagalog/English UI toggle, phase 2: full Tagalog
  coverage added for Break-Even, Cost History, Margin Alerts,
  Multi-User, and Multi-Channel Pricing —
  all five self-contained pages with no shared sub-components, so each
  page's static strings moved into `src/lib/i18n.tsx`'s `STRINGS`
  dictionary (namespaced per page, e.g. `breakEven.*`, `alerts.*`) and
  page titles/cross-links reuse `getModuleText` instead of duplicating
  translated module names. Verified with seeded catalog/history/sales
  data so every conditional branch (empty states, populated tables,
  warning banners) was actually rendered and screenshotted in both
  languages, not just the default empty view. Remaining: Costing &
  Pricing, Ingredient Library, Catalog, Inventory, and Documents — the
  five pages with heavy shared components, deliberately saved for last.
- **2026-08-18** — Tagalog/English UI toggle, phase 1
  (`backlog.md` item 9): real i18n infrastructure
  (`src/lib/i18n.tsx` — `LanguageProvider`/`useLanguage` context,
  `calcost:lang` in `localStorage`, `getModuleText` for per-module
  name/description/note) plus a top-bar EN/TL toggle
  (`LanguageToggle.tsx`, next to the theme toggle in `AppShell`). Full
  Tagalog coverage shipped for the Sidebar nav and the entire Overview
  page (title, hub cards, all 11 module descriptions, CTAs).
- **2026-08-18** — Renamed Calcost → **Amore Cost** (decision 0009), the
  second rename after RepricedIQ → Calcost. Every user-facing string
  updated across the app and docs; internal `localStorage` keys and the
  backup file format's `app: "calcost"` tag deliberately left unchanged
  (no user-facing meaning).
- **2026-08-18** — Logo mark revised a second time the same day
  (decision 0010): a two-tone ring (green/teal) with motion chevrons and
  a centered α% glyph, recreated from a reference image Oliver generated
  externally, replacing 0009's single-stroke merged glyph
  (`src/components/BrandMark.tsx`). The browser-tab favicon
  (`icon.tsx`) uses a simplified ring-only version — the full mark's
  inner glyph turned into a blur once actually downscaled to a real
  16px tab icon; `apple-icon.tsx` and the in-app sidebar mark keep full
  detail since they render at 32px+.
- **2026-08-18** — Feature-research batch (decision 0008): full backup/
  restore of all Calcost data as one JSON file (Documents page — the
  data-safety fix, since there was previously no way to recover from a
  cleared browser); unit conversion for linked ingredients (kg↔g,
  L↔mL, dozen↔pcs — `src/lib/units.ts`, and a bug fix along the way:
  the ingredient cascade previously ignored unit conversion entirely);
  batch/recipe scaling (a batch-size field on Costing & Pricing showing
  total cost/revenue/profit); supplier management per ingredient (name,
  price, a cheapest-price badge, "Use this price" triggering the same
  cascade as editing cost directly) plus category-tagged substitution
  suggestions; reusable quote templates (save current line items, load
  them into a fresh item — deliberately strips ingredient links, since
  a template is a portable starting point, not a live link); lightweight
  job-status tracking (quoted → accepted → in progress → invoiced) on
  Catalog and Costing & Pricing; trend-line sparkline charts on Cost
  History; QR code generation for a catalog item's price tag. 27 new
  tests (79 total). Deliberately **not** built alongside this batch:
  Shopee/Lazada order sync, receipt OCR, real push/email notifications,
  and shareable public links — all need real backend/API
  infrastructure, tracked in [backlog.md](backlog.md) instead.
- **2026-08-18** — Ingredient Library (`/ingredients`) and a real test
  suite (decision 0007): cost a raw ingredient once, link it into any
  Cost Ledger row, and a cost change cascades to every linked item plus
  a real Cost History snapshot. Vitest added — 52 tests across
  pricing/tax/break-even/channel math, catalog CRUD, CSV round-
  tripping, and the cascade itself (`npm test`). Deployment explicitly
  deferred to [backlog.md](backlog.md).
- **2026-08-18** — `docs/business/strategy.md` (vision/SWOT/financial
  summary/risks) and `docs/business/competitive-landscape.md` (the
  crisp comparison table + "the wedge") added; this roadmap folder
  itself restructured from one flat `roadmap.md` into
  `roadmap.md` + `backlog.md` + `completed.md`.
- **2026-08-18** — Icon set: every module got a real `lucide-react`
  icon (sidebar + Overview hub cards, one source of truth in
  `src/lib/modules.ts`), and the browser tab favicon was replaced with
  one generated to match the in-app brand mark exactly
  (`src/app/icon.tsx` / `apple-icon.tsx`).
- **2026-08-17** — All 10 modules built and made interactive, entirely
  `localStorage`-only (decision 0006): Catalog, Inventory, Cost
  History, Documents (CSV + printable quotations), Multi-User,
  Multi-Channel Pricing, Margin Alerts, Sales & Profit Reporting.
- **2026-08-17** — Overview page added (`/`, a real dashboard summary
  + module hub) and a light/dark/auto theme toggle.
- **2026-08-17** — Full dashboard redesign (decision 0005) — the app's
  visual identity split from the pitch page's ledger theme into a
  clean white-card/green-accent look.
- **2026-08-17** — v0 built: the free, no-signup costing calculator
  (Costing & Pricing + Break-Even), quantity/unit-of-measure per cost
  item, and a flexible tax system (VAT / Percentage Tax / custom).
- **2026-08-17** — Lead vertical decided: unified food + service +
  retail (decision 0004), after discovering iCost as a real PH
  food-costing competitor.
- **2026-08-16 to 2026-08-17** — Brand name settled on Calcost
  (decisions 0002/0003), strategic fork settled on standalone SaaS
  (decision 0001), one-page marketing pitch designed and published.
