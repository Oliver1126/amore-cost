# Pages

The whole app is five pages (decision 0040), modeled on the
[food-cost-tau reference](https://food-cost-tau.vercel.app/)'s Dashboard /
Recipes / OpEx / Receipt Simulator / Margin Simulator. Kept in sync with
`src/lib/modules.ts`. The previous 11-module reference is archived at
[../archive/eleven-modules-2026-10/modules.md](../archive/eleven-modules-2026-10/modules.md),
and the full 11-module code is the `v1-full-11-modules` git tag.

Everything runs on `localStorage` — no accounts, no backend. Data shapes:
`CatalogItem` (a recipe, `src/lib/catalog.ts`), `Ingredient`
(`src/lib/ingredients.ts`), and `OpexSettings` (`src/lib/opex.ts`).

## 1. Dashboard — `/dashboard`

Four KPI cards: **Active recipes**, **Monthly OPEX** (contingency
included), **Avg food cost %** against the 28–32% industry target
(`FOOD_COST_TARGET`), **Ingredients in library**. Then the "Needs your
attention" insights panel (`src/lib/insights.ts`, decision 0032 — in
practice only its below-target-margin check fires now, since the sales
and channel data its other checks read no longer has a page that writes
it), a Recent recipes table linking to each recipe's breakdown, a Dish
overhead allocation card, and **Backup / Restore** — moved here from the
retired Documents page because it's the only protection against a
cleared browser.

## 2. Input — `/input`

Every recipe as a card (cost per serving, food cost %, suggested price,
expandable ingredient list). **"+ New recipe"** creates it and opens
**"Edit breakdown"** straight away — the full `ItemEditor` (ingredients
table, servings, pricing strategy, tax) in a modal, every edit
live-saved, one Cost History snapshot per settled edit (decision 0036).
Search, an On/Below-target filter, Duplicate, Delete, and the shared
**Ingredient Library** (link an ingredient once; a price change cascades
to every recipe using it — decision 0007). `/input?edit=<id>` opens a
recipe directly; old `/costing?id=<id>` links redirect there.

## 3. OPEX & Overhead — `/opex`

Monthly recurring expenses, each with a category (Rent, Utilities,
Labor, Marketing, Software, Other), a category breakdown, a contingency
buffer %, and **Dish overhead allocation**: buffered OPEX ÷ estimated
dishes sold per month = overhead each dish must earn back
(`overheadPerDish`). That monthly-dishes number is shared with the
Dashboard and is the Margin & POS Simulator's default volume.

## 4. Receipt Simulator — `/receipt`

A sandbox order — nothing is saved or recorded as a sale. Pick recipes
and quantities, choose VAT inclusive/exclusive pricing, VAT rate, service
charge %, and Standard vs. Senior/PWD. Renders a mock official receipt
(subtotal, less VAT, SC/PWD discount, VATable / VAT-exempt sales, VAT,
service charge, total due) plus **what you actually keep**: direct cost,
food cost %, net profit. Math in `src/lib/receipt.ts`: Senior/PWD is 20%
off the VAT-exclusive price and VAT-exempt (RA 9994/10754, same rule as
`seniorPwdPrice()`); service charge is on the post-discount net and
excluded from profit (RA 11360 sends it to staff).

## 5. Margin & POS Simulator — `/simulator`

Pick a recipe, try a menu price (field + slider, defaults to the
suggested price) and monthly portions, and set what share of OPEX this
dish carries (100% = worst case, it alone pays all fixed costs). Shows
food cost %, gross and net margin, break-even portions, and a **profit
& loss waterfall** (Revenue → − Direct cost → Gross profit → − OPEX →
Net profit). Math in `src/lib/simulator.ts`.

## Shared rule: direct cost vs. recipe cost

Input shows **cost per serving** = everything in the recipe, including
its per-unit overhead line (`trueCost`). Both simulators use **direct
cost** (`directCost` = `trueCost` − overhead), because they subtract
monthly OPEX as a fixed cost separately — using `trueCost` there would
charge the same rent twice. **Food cost %** (`foodCostPercent`) is direct
cost ÷ the pre-VAT menu price, everywhere.

## Test coverage

`src/lib/*.test.ts` (Vitest, `npm test`, 163 tests) covers the pure logic:
pricing/tax/break-even math, catalog CRUD and history snapshots, the
ingredient cascade and unit conversion, OPEX totals and categories,
backup parsing, insights, and the receipt and margin simulators. Pages
and components have no automated coverage.
