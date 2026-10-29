# Product scope

See [modules.md](modules.md) for what each page actually is. This
file is the build-history and the open pricing-tier question.

> **Current scope (2026-10-29): five pages** — Dashboard, Input, OPEX &
> Overhead, Receipt Simulator, Margin & POS Simulator
> ([decision 0040](../business/decisions/0040-five-pages-modeled-on-reference.md)),
> plus yield %, menu price rounding and sample recipes
> ([decision 0041](../business/decisions/0041-yield-rounding-sample-recipes.md)).
> Inventory, POS, Cost History page, Documents, Multi-User,
> Multi-Channel, Margin Alerts and Reporting below were **built, then
> cut** by 0040 — they live on as the `v1-full-11-modules` git tag. The
> history below is accurate history, not current spec.

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

**2026-10-28 — cut to five pages** (decision 0040), then yield %,
menu price rounding and one-click sample recipes (decision 0041). 184
tests. See [../roadmap/completed.md](../roadmap/completed.md) for
everything between 2026-08-18 and here.

## The open question this leaves: pricing and gating

The original plan assumed a free v0 and a paid tier unlocking
everything else (draft ₱199–499/month). The current proposal is in
[../roadmap/roadmap.md](../roadmap/roadmap.md) Stage 3: **everything the
app does today on one device stays free forever**; a paid "Plus" tier
(test ₱99/mo or ₱899/yr, plus a one-time "Lifetime Starter" option)
sells what genuinely needs a backend — cloud sync, price alerts,
history, branded PDF menus, delivery-app pricing. Still unvalidated:
whether this market pays monthly at all (see
[business/concept.md](../business/concept.md)), and real accounts stay
gated on Stage 1's validation result — the build has outpaced
validation many times.
