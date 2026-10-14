# Module upgrade plan — what to add/edit, not what exists

Companion to [business/product-depth-analysis.md](../business/product-depth-analysis.md)
(the diagnosis) — this is the punch list: concrete ADD/EDIT items per
module, each checked against the actual code (not assumed) and against
real competitor/industry research done 2026-09-02. No module
descriptions — see [modules.md](modules.md) for what already exists.

## Market update first — this changes the baseline

[competitive-landscape.md](../business/competitive-landscape.md) was
last checked assuming iCost was a pure calculator. **It isn't anymore.**
iCost.ph now markets: AI-powered recipe costing, AI recipe search with
ingredient suggestions, and a **"Transaction Ledger — complete audit
trail of all inventory movements."** That's iCost moving toward the
exact "Advisor" gap `product-depth-analysis.md` named as still open.
Unverified how deep the "AI" actually goes (could be marketing
language over simple rules, same as this app's own insights engine) —
flagged here so it gets re-checked properly in `market-research.md`,
not left stale. This doesn't invalidate the plan below; it raises the
bar on how fast it needs to happen.
[iCost — Google Play](https://play.google.com/store/apps/details?id=ph.icost.app&hl=en) ·
[iCost.ph](https://icost.ph/)

## Costing & Pricing

- **ADD — cost shock simulator.** A slider/input: "what if this
  ingredient's cost rises 10%?" — recompute margin/price live, before
  it happens. No PH competitor found offers this; it directly answers
  the real fear behind rising input costs, not just a static
  "suggested range."
- **EDIT — personalize the suggested margin range.** Today's
  suggested range (food 30–40%, service 40–60%, resale 20–30%,
  decision 0019) is the same three numbers for every user. Once an
  owner has 3+ catalog items, compute the range from *their own*
  catalog's actual margins instead; fall back to the static range for
  new owners with too little data.

## Break-Even

- **ADD — blended, whole-business break-even.** Today it's one item
  at a time. Real owners sell a mix of items — compute break-even
  using every catalog item's contribution margin weighted by actual
  sales mix (Reporting already has the data), answering "how many
  total sales do I need this month," not just "how many of this one
  item."
- **ADD — pace vs. target.** "On track" / "behind by N units" against
  the monthly target, using real sales velocity — not just a static
  units-needed number with no sense of whether it's realistic.

## Catalog Management

- **ADD — bulk price adjustment.** "+10% to all Food & Beverage
  items" in one action. Real time-saver when a shared cost (fuel,
  general inflation) moves everything at once — no spreadsheet
  replacement or competitor found offers a clean batch action here.
- **ADD — "create a variant" off Duplicate.** `duplicateCatalogItem()`
  exists today as a blind copy. A size/portion variant (small/medium/
  large) needs quantities scaled, not just copied — a one-click
  version of what owners currently do by hand.

## Inventory

- **EDIT — replace the fixed low-stock number with a real reorder
  point.** Verified formula from current inventory-management
  practice: `(sell-through rate × supplier lead time) + safety
  stock`. Needs one new field (lead time per item) that doesn't exist
  today — the insights engine's stock-runway estimate (decision 0032)
  is a lighter version of this; this is the properly-formed upgrade.
  [Reorder point formula — Netstock](https://www.netstock.com/blog/reorder-point-formula/)
- **ADD — optional "best before" tracking for the food vertical.**
  Confirmed genuinely uncontested at this ICP's scale: professional
  food-costing tools (WISK, Apicbase) *do* track expiry/waste, but
  they're priced and scaled for real restaurants — iCost's own listed
  feature set (recipe costing, inventory alerts, AI recipe search)
  doesn't mention it either. A lightweight "flag stock close to
  spoiling" beats every direct competitor in this specific price/scale
  bracket. [Apicbase food costing](https://get.apicbase.com/food-costing-software/) ·
  [WISK recipe costing](https://www.wisk.ai/features/restaurant-recipe-management-cost-software)

## Point of Sale

- **ADD — below-cost sale warning.** If a manual price override or
  discount would sell at a loss, flag it before the sale completes —
  currently nothing checks this at checkout.
- **ADD — "close today" shift summary.** Cash/GCash/card totals and
  transaction count for *today only*, ready to match against the
  actual drawer — the standard small-business "Z-report" pattern.
  Today this data only exists buried in Reporting's cumulative totals,
  not as a discrete daily close-out.
  [Z Report — ConnectPOS](https://www.connectpos.com/glossary/z-report/) ·
  [POS reconciliation — Fit Small Business](https://fitsmallbusiness.com/pos-reconciliation/)
  **Explicit boundary, stated the same way pricing already carries a
  disclaimer:** full BIR-compliant sequential official-receipt
  numbering and e-invoicing is a real, separate regulatory requirement
  for registered businesses issuing official receipts — this is a
  reconciliation convenience, not BIR compliance, and should say so
  on the page if built.

## Cost History

- **ADD — a per-ingredient price-history log.** Verified gap:
  `Ingredient` (`src/lib/ingredients.ts`) stores only the *current*
  `costPerUnit`, no history of its own. Without this, Cost History and
  the insights engine can say a recipe's cost rose, but never *which*
  ingredient drove it. This is the one prerequisite named but not
  built in decision 0032 — a small, scoped schema addition (append an
  entry when an ingredient's cost changes), not a rewrite.

## Documents

- **ADD — business branding on printed quotes.** Logo, business name,
  an accent color on the client-facing print output
  (`/documents/print/[id]`). Cheap, high perceived-value: every
  spreadsheet-based quote looks the same, and a branded document is a
  real trust signal for a home-based seller trying to look
  established to a new client.

## Multi-User

- **ADD — surface "last edited by."** Verified gap: `CatalogItem`
  already stores `updatedByProfileId` on every edit, but no page
  displays it. Show "last edited by [profile name]" on Catalog
  Management and Cost History — a real, already-half-built
  differentiator that needs zero backend, unlike everything else
  Multi-User is honestly blocked on.

## Multi-Channel Pricing

- **ADD — tag a logged sale with its channel.** Verified structural
  gap: `SaleEntry` has no channel field at all, so Multi-Channel
  Pricing computes a suggested price but the app has **no way to
  confirm it's actually being charged**, or to show real per-channel
  performance. Add an optional channel tag when logging a sale (POS/
  Inventory), then Reporting can show real revenue/profit *by
  channel* instead of a purely theoretical number with no feedback
  loop. This is the single most concrete structural gap found in this
  audit.

## Margin Alerts

- **ADD — a sidebar badge count.** `modules.md` currently documents
  "no notification yet... needs a backend" — verified that's not
  accurate for an in-app badge: a client-side count next to "Margin
  Alerts" in the sidebar needs zero backend, zero push infrastructure,
  and directly fixes the exact limitation already written down.

## Sales & Profit Reporting

- **ADD — payment-method breakdown.** Verified gap: `SaleEntry`
  already stores `paymentMethod` on every sale, but Reporting never
  aggregates or shows it. Cash vs. GCash vs. card totals is free once
  the channel-tagging work above exists, since both are the same kind
  of "slice sales by an existing field" addition.
- **ADD — week-over-week / month-over-month deltas per item.** Already
  named in `product-depth-analysis.md`, still not built — the
  natural home for the "compared to before" primitive every other
  insight ultimately wants.

## Ordering this — not all at once

Cheapest, zero-schema-change wins first (buildable in one pass each,
same pattern as decision 0032): **Multi-User's "last edited by,"
Margin Alerts' sidebar badge, Reporting's payment-method breakdown.**
Then the one shared prerequisite that unlocks the most downstream
value: **channel-tagging a sale** (unlocks real Multi-Channel
performance data) and **per-ingredient price history** (unlocks real
cost-change attribution). Everything else in this file depends on one
of those two, or stands alone.
