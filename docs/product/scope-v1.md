# Product scope

See [modules.md](modules.md) for what each module actually is. This
file is the build-history and the open pricing-tier question — as of
[decision 0006](../business/decisions/0006-all-modules-built-local-only.md)
**everything below has been built**, all local-only (no accounts, no
backend), which changes what's left open here from "what to build
next" to "how to eventually monetize something that already works for
free."

## What shipped, in the order it shipped

**2026-08-17, v0 — the free, no-signup tool** (as it originally
shipped — narrowed to food-only as of
[decision 0038](../business/decisions/0038-food-only-vertical-removed.md),
2026-09-03; this section describes v0's original scope, not current
scope). A real dashboard shell (`src/`) — one unified calculator engine
covering all three verticals (food/ingredients, service/labor,
retail/resale unit cost) instead of splitting them into separate
products the way the Raket.ph templates do. Materials/ingredients with
quantity + unit of measure, labor,
packaging, overhead. Three pricing strategies (markup / margin / fixed
profit). A flexible tax system — No tax / VAT 12% / Percentage Tax 3%
presets, plus a fully custom tax (any name, any rate). A Break-Even
page. All of it `localStorage`-only, no login — the same
trust-building move Atlas Freelance's Phase 1 used.

**Same day, immediately after — an Overview page and a full dashboard
redesign** (decision 0005), plus a light/dark/auto theme toggle.

**Same day, immediately after that — every remaining module built**
(decision 0006), simulated entirely with `localStorage` instead of
waiting for real accounts:

- **Catalog** — a saved `CatalogItem` list, not one throwaway
  calculation. This became the central record every module below
  reads or writes a slice of.
- **Inventory** — stock-on-hand, low-stock alerts, log-a-sale
  deduction. Simplified: per finished item, not a shared per-ingredient
  pool (see modules.md) — the cost half of this gap closed 2026-08-18,
  see below.
- **Cost History** — a snapshot on every real cost/price change.
- **Documents** — CSV import (matches the Raket.ph-template column
  shape, so switching cost is near zero), CSV export of the catalog,
  and a printable client-facing quotation (browser print-to-PDF;
  deliberately shows only the final price, not internal cost/margin).
- **Multi-User** — a named-profile switcher. No real security — see
  modules.md's caveat, repeated directly on the page itself.
- **Multi-Channel Pricing** — per-channel (Shopee/Lazada/in-person)
  fee-adjusted pricing that holds per-unit profit constant.
- **Margin Alerts** — per-item target margin vs. actual, flagged when
  below.
- **Sales & Profit Reporting** — aggregates the sales logged on
  Inventory into real revenue/profit, not theoretical pricing.

**2026-08-18 — the Ingredient Library, and a real test suite**
(decision 0007). The single feature the original spec always called
for but v0/v1 shipped without: cost an ingredient or material once,
link it into any Cost Ledger row, and a cost change cascades to every
linked item — including a real Cost History snapshot, and Margin
Alerts reflecting the new margin automatically since it reads live
state. This closes the *cost*-sharing half of Inventory's and Margin
Alerts' flagged simplification; the *stock-quantity*-sharing half is
still open (see `modules.md`). Also added: Vitest, `npm test`, 52 tests
covering the pricing/tax/break-even/channel math, catalog CRUD and
history logic, CSV round-tripping, and the ingredient cascade —
components and pages still have no automated coverage.

## The open question this leaves: pricing and gating

The original plan assumed a free v0 and a paid tier unlocking
everything else (draft ₱199–499/month, see the open questions in
[business/concept.md](../business/concept.md)). That framing doesn't
map cleanly onto current reality: **every module is free and working
right now**, with no accounts to gate anything behind. Before
introducing payment, real decisions are needed on:

- Whether to keep the local-only model entirely free forever and
  monetize differently (e.g. a paid tier for cross-device sync via real
  accounts, which is also the fix for Multi-User's security gap and
  Inventory's remaining per-item-not-per-ingredient stock limitation),
  or gate some of what's already built behind a paid unlock
  retroactively.
- Whether real accounts are worth building before Phase 1 validation
  (see [roadmap.md](../roadmap/roadmap.md)) actually confirms anyone wants this
  at all — the build has now outpaced validation twice.
