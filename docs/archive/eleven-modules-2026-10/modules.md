# Modules

The product broken into discrete functional units. All 11 are now
**built and interactive** — see
[decisions/0006](../business/decisions/0006-all-modules-built-local-only.md),
[decisions/0007](../business/decisions/0007-ingredient-library-and-test-suite.md),
[decisions/0008](../business/decisions/0008-feature-research-batch.md),
[decisions/0015](../business/decisions/0015-pos-checkout-module.md), and
[decisions/0022](../business/decisions/0022-ingredient-library-and-catalog-merged.md)
(Ingredient Library and Catalog merged into Catalog Management).
This file is the reference for *what each module actually is* and, for
the ones that are simplified versus their original spec, *how*.

## Core modules

0. **Overview** — added 2026-08-17, not in the original draft. A
   summary of whatever's currently being priced (reuses the same stat
   cards and cost-composition chart as Costing & Pricing) plus a hub of
   cards linking to every other module. Exists because the app is a
   real multi-page dashboard now, not a single calculator page — see
   [decisions/0005](../business/decisions/0005-app-visual-identity-diverges-from-pitch-page.md).
   **Extended 2026-09-02 (decision 0032):** a "Needs your attention"
   insights panel (`src/lib/insights.ts`, `InsightsPanel.tsx`) sits
   above the featured-item stats — specific, personalized
   recommendations computed across the *whole* catalog (below-target
   items with their cause and a price fix, which item drives most
   profit, a channel-fee margin gap, a sell-through-rate stock runway
   estimate), not just whatever's currently being priced. Hidden with
   an empty catalog; shows an honest empty state when nothing actually
   triggers.
1. **Cost Ledger** (`/costing`) — where a cost gets entered:
   materials/ingredients, labor, packaging, overhead. See
   [../business/concept.md](../business/concept.md)'s "why static
   templates aren't enough" for why this module exists at all.
   **Extended 2026-08-18 (decision 0008):** a batch-size field shows
   total cost/revenue/profit scaled linearly for producing more than
   one unit at a time, and reusable **quote templates** let a set of
   line items be saved and loaded into a fresh item — templates
   deliberately strip any ingredient link on save, since a template is
   a portable starting point, not a live connection to today's
   Ingredient Library state.
   **Extended 2026-08-18 (decision 0014):** an optional **package cost
   calculator** per line, for a cost typed manually rather than linked
   to the Ingredient Library — enter Supplier (reference only), Package
   Price, Qty per Pack, and Shipping Fee, and the line's Cost is derived
   as `(Package Price + Shipping Fee) ÷ Qty per Pack`, then multiplied
   by that line's quantity. Mutually exclusive with an Ingredient
   Library link — a line is priced one way or the other, never both.
   Each line also now shows what % of the item's total true cost it
   represents.
   **Extended 2026-08-19 (decision 0018):** an "Estimate from OPEX"
   toggle under the Overhead field — shows the shared OPEX total
   (`src/lib/opex.ts`), takes an expected monthly volume, and offers
   `OPEX ÷ volume` as a suggested per-unit overhead figure. Deliberately
   one-directional and request-only: "Use this" writes the number into
   the same manually-typed `overhead` field, once, on click — it does
   **not** create a live link that recomputes a saved item's price
   whenever OPEX changes elsewhere.
   **Extended 2026-08-21 (decision 0028):** the cost-line editor is now
   an always-visible table (no more expand/collapse) matching a
   competitor reference's exact columns — Name / Supplier / Package
   Price / Qty per pack / Shipping fee / **Pack unit** (new) / Portion
   qty / Portion unit / Unit cost `AUTO` / Line cost `AUTO`. The 0014
   package calculator's formula is unchanged; what's new is `packUnit`
   — a package can now be bought in one unit (a 25kg sack) and portioned
   in a different one (grams), the same unit conversion the Ingredient
   Library already offered for linked lines, via `packageLineAmount()`.
2. **Catalog Management** (`/catalog`) — a saved list of costed items
   (the `CatalogItem` record in `src/lib/catalog.ts`) instead of one
   throwaway calculation at a time, merged with the Ingredient Library
   into a single page (decision 0022). This is the central data shape
   every module below reads or writes a slice of.
   **Extended 2026-08-18 (decision 0008):** lightweight **job-status**
   tracking (quoted → accepted → in progress → invoiced), settable here
   or from the Costing & Pricing header; and **QR code generation** for
   a catalog item, meant for printing on a price tag or menu board.
   **Includes the Ingredient Library** (added 2026-08-17, decision
   0007; merged here 2026-08-20, decision 0022) — the feature the
   original spec always called for but wasn't built until 0007: cost a
   raw ingredient or material once, link it into any Cost Ledger line,
   and changing that cost cascades to every linked item automatically —
   including a real Cost History snapshot for anything whose price
   actually moved. This is the "single biggest upgrade over the static
   Raket.ph spreadsheets" `concept.md` describes, now real
   (`src/lib/ingredients.ts`).
   **Extended 2026-08-18 (decision 0008):** unit conversion, so a
   recipe line can be entered in grams against an ingredient priced per
   kilo (or mL/L, or pcs/dozen) — this also fixed a real bug where the
   cascade ignored unit conversion entirely; per-ingredient
   **supplier management** (name, price, a cheapest-price badge, "Use
   this price" triggering the same cascade as editing cost directly);
   and category-tagged **substitution suggestions** (other ingredients
   sharing a category, cheapest first).
   **Merged 2026-08-20 (decision 0022):** the two pages became one —
   `/ingredients` now redirects to `/catalog#ingredient-library`. The
   product list gained a name/SKU search, a margin filter (All/On
   target/Below target, against each item's own `targetMarginPercent`),
   and a per-item ingredient-cost drill-down (Supplier, Package price,
   Qty/package, Shipping, Unit cost, Line cost per cost line); the
   Ingredient Library's existing "used in N" count is now clickable,
   showing the actual linked product names. Done because the two
   features looked disconnected even though a cost line has always been
   able to link to a shared ingredient — the UX wasn't showing it.
   **Extended 2026-08-20 (decision 0023):** "+ New item" and each row's
   name now open a modal (`CatalogEditModal.tsx`) with the *entire*
   cost stack embedded — vertical, ingredients, labor, packaging,
   overhead, tax, pricing strategy — via a shared `ItemEditor.tsx`
   component extracted from the standalone Costing & Pricing page, so
   the two never diverge. Also adds a **Target margin %** field, now
   editable from Catalog Management itself for the first time. Prompted
   by reviewing a competitor's card UI whose own breakdown view only
   showed ingredients (no labor/overhead/tax) — reusing Amore Cost's
   own already-complete editor avoided copying that regression.
   `/costing` and `/costing?id=` are unchanged and still work
   everywhere else that links to them.
   **Extended 2026-08-20 (decision 0024):** the Products list is a
   card grid (one card per item), not a table — a direct alignment to
   a competitor's reference layout. Each card shows the target-margin
   badge, vertical/SKU, the "N ingredient(s) linked" badge (expanding a
   compact in-card breakdown list, not a wide table), True cost/Margin
   stats, a highlighted Suggested Price block, stock, status, and a
   full-width "Edit & Breakdown" button opening the 0023 modal.
3. **Pricing Engine** (`/costing`) — turns a cost into a price: markup
   %, margin %, or fixed-peso-profit-target strategies, plus a flexible
   tax system (No tax / VAT 12% / Percentage Tax 3% / a fully custom
   tax with its own name and rate).
   **Extended 2026-08-19 (decision 0019):** each strategy shows a plain-
   language description of what it actually computes (margin divides
   profit by *price*; markup divides the same profit by *cost* — a
   different number, not interchangeable), plus a vertical-specific
   **suggested range** (`SUGGESTED_MARGIN_RANGE`, `src/lib/calculator.ts`
   — food 30–40%, service 40–60%, resale 20–30%, explicitly a rule-of-
   thumb starting point, not a rule) and a one-click **"Use suggested"**
   fill.
   **Extended 2026-08-19 (decision 0020):** shows the Senior Citizen/
   PWD price (RA 9994/RA 10754 — 20% off the pre-tax price, VAT-exempt,
   `seniorPwdPrice()` in `src/lib/calculator.ts`) alongside the regular
   suggested price.
4. **Break-Even Calculator** (`/break-even`) — units needed to sell in
   a month to cover real OPEX, not a guess.
   **Extended 2026-08-18 (decision 0014):** OPEX is itemized (rent,
   salaries, utilities, etc. as separate named lines, like Cost Ledger's
   pattern) rather than one flat number, plus a **Contingency %** safety
   margin added on top of the itemized total — break-even is computed
   against that contingency-adjusted figure, not the raw OPEX sum, so
   the units-needed number already has a buffer for the unexpected
   built in.
   **Fixed 2026-08-19 (decision 0017):** OPEX is a single shared store
   for the whole account (`src/lib/opex.ts`), not a field on any one
   item's state — it's entered once and used for every item's
   break-even, and doesn't reset when you start pricing something new.
   (It briefly *did* reset per item between 0014 and 0017 — a real bug,
   not a design choice, caught by using the app.)
5. **Inventory** (`/inventory`) — stock-on-hand tracking, low-stock
   alerts, and deduct-on-sale. Added specifically because of
   [decision 0004](../business/decisions/0004-lead-vertical-unified.md)
   — going after the food vertical directly means competing with
   iCost's real-time inventory and "Cook & Deduct" feature, not just
   its costing math.
   **Still simplified after decision 0007 — be precise about which
   half moved:** the Ingredient Library (part of module 2, Catalog
   Management) shares *cost*, one `costPerUnit` referenced everywhere.
   It does not share *stock quantity* — Inventory still tracks
   stock-on-hand per finished catalog item, not a pooled raw-ingredient
   stock that draws down across every recipe using it. Real "Cook &
   Deduct" parity needs that second piece, not yet built (tracked in
   [../roadmap/backlog.md](../roadmap/backlog.md)).
6. **Point of Sale** (`/pos`) — added 2026-08-19 (decision 0015): scan
   or search a Catalog item by name or an assigned SKU (a real
   keyboard-emulating barcode scanner just types the code + Enter, no
   camera/vision API needed), build a cart, pick a payment method
   (Cash/GCash/Card/Other), and check out — deducts stock and logs a
   `SaleEntry` per line via the new `checkoutCart()`
   (`src/lib/catalog.ts`), all lines in one checkout sharing a
   `transactionId` so they print as a single receipt
   (`/pos/receipt/[transactionId]`) and roll up in Sales & Profit
   Reporting exactly like any other logged sale — no changes needed
   there. **What's deliberately not here:** cash-drawer hardware
   signals and thermal-printer-specific formatting (receipts print via
   the browser's normal print dialog, same as Documents' quotations, so
   they need OS print drivers already configured, not a
   POS-specific one), camera-based barcode scanning, and multi-register
   real-time sync (needs real accounts + a backend, tracked in
   `../roadmap/backlog.md` item 1, same gap as Multi-User's).
   **Extended 2026-08-19 (decision 0020):** a per-cart-line Senior
   Citizen/PWD toggle applies the discount to just that line (a
   discount ID only covers that person's own purchase, not everything
   else in the same checkout) — the flag is recorded on the `SaleEntry`
   itself and shown as a tag on the printed receipt.
   **Extended 2026-08-20 (decision 0021):** a "Refund this sale" button
   on the receipt page reverses a completed transaction — restocks it
   and appends a negative-quantity `SaleEntry` (`refundOf` links it back
   to the original) under its own transactionId, so the original receipt
   is never altered and a separate refund receipt can be printed.
   Already-refunded transactions show a "Refunded" badge instead of the
   button. Sales & Profit Reporting needed no changes at all — its
   existing sums over `SaleEntry[]` net a refund out automatically. No
   partial-quantity refund UI yet (full-transaction only).
7. **Cost History** (`/history`) — a snapshot recorded every time a
   saved item's true cost or price actually changes, so margin erosion
   is visible before it quietly eats a bestseller's profit. Also fires
   correctly when an Ingredient Library cascade is what caused the
   change, not just a direct manual edit.
   **Extended 2026-08-18 (decision 0008):** a small inline trend
   sparkline (`src/components/Sparkline.tsx`) alongside the existing
   snapshot table.
8. **Documents** (`/documents`) — CSV import from Raket.ph-style
   spreadsheets (zeroing out the switching cost for someone who already
   owns one), CSV export of the whole catalog, and a printable
   client-facing quotation per item (`/documents/print/[id]`, via the
   browser's own print-to-PDF — deliberately shows only the final price
   a client should see, not the internal cost/margin breakdown).
   **Extended 2026-08-18 (decision 0008) — the data-safety fix:** a
   full backup/export of every piece of Amore Cost data (Catalog,
   Ingredient Library, team profiles, templates) as one JSON file, and
   restore from one. Added because there was previously no way to
   recover from a cleared browser or move data to a new device — real
   accounts don't exist yet, so this was the only available mitigation.

## Growth-tier modules

9. **Multi-User** (`/multi-user`) — owner plus staff/bookkeeper
    profiles on one browser.
    **The biggest gap from the original spec, by necessity, not
    oversight (decision 0006):** this is a named-profile switcher with
    *zero real security* — anyone using the browser can switch profiles
    or add new ones freely, and the page says so directly. Real
    multi-user access control needs actual accounts and a backend.
10. **Multi-Channel Pricing** (`/multi-channel`) — different prices for
    the same product across Shopee, Lazada, and in-person, computed so
    the per-unit profit stays the same after each channel's fee.
11. **Margin Alerts** (`/alerts`) — set a target margin per item and
    see which ones have fallen below it.
    **Simplified per decision 0006, revisit per 0008:** compares
    against a target you set on that one item, not a cross-item alert
    triggered by a shared ingredient's price change. It does, however,
    already reflect an Ingredient Library cascade automatically (it
    just reads live computed margin) — what's still missing is a
    *notification*, not the underlying math; there's no push or email
    yet, only what's visible when this page is open (tracked in
    [../roadmap/backlog.md](../roadmap/backlog.md)).
12. **Sales & Profit Reporting** (`/reporting`) — sales you log on
    Inventory *or Point of Sale* turn the cost data already in the
    system into real (not theoretical) profit reporting, aggregated and
    per-item.

## Food-only, as of decision 0038

**Was "three vertical profiles, not separate modules"** (food/
beverage, service, retail/resale as configurations of the same Cost
Ledger and Pricing Engine, per decision 0004) — [decision 0038](../business/decisions/0038-food-only-vertical-removed.md)
narrowed `Vertical` (`src/lib/calculator.ts`) to `"food"` only and
deleted the now-single-option business-type tab switcher from
`CostForm.tsx` and `CreateCatalogModal.tsx`. Every module above is
still real, working, and needed — none of them were ever vertical-
specific pages, since the original architecture never built separate
pages per vertical. What was removed is the *dimension*, not any page.
See [docs/archive/multi-vertical-2026-08/](../archive/multi-vertical-2026-08/README.md)
for the original multi-vertical reasoning and copy.

## Test coverage

As of decision 0032, `src/lib/*.test.ts` (Vitest, `npm test`, 146
tests) covers the pure logic behind every module above except
Multi-User, Multi-Channel, Alerts, and Reporting's UI-only pieces —
pricing/tax/break-even/channel/batch math (including package-cost and
itemized-OPEX math, decision 0014), catalog CRUD and history-snapshot
logic, `checkoutCart()`/`refundTransaction()`'s transaction logic
(decisions 0015, 0021), CSV round-tripping, the ingredient cascade
(including unit conversion, supplier switching, and `usedInItems()`),
`marginStatus()`, quote templates, and the insights engine's four
recommendation generators (decision 0032). Components and pages have
no automated coverage yet.
