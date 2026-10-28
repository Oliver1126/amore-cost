---
number: 0040
date: 2026-10-28
status: accepted
supersedes: 0006 (the "all 11 modules" scope), 0015 (Point of Sale as a real checkout)
---

# Cut the app from 11 modules to 5 pages, modeled on the food-cost-tau reference

## Context

Oliver: the app was "too complicated — too many pages that don't
matter as of now." He named exactly what to keep — Dashboard, Input
(with input breakdown and edit breakdown), OPEX/Overhead, Receipt
Simulator, Margin and POS Simulator — and pointed at
https://food-cost-tau.vercel.app/ as the model. Fetched and read that
site directly: its nav is Dashboard · Recipes · OpEx · Overhead ·
Receipt Simulator · Margin Simulator, which mapped one-to-one onto the
ask. Phase 1 validation still hasn't run (`next-steps.md`), so eleven
modules was eleven things to explain to a first user who needs one job
done: price a dish correctly.

## Decision

Five pages, nothing else in navigation:

| Page | Built from | Reference equivalent |
|---|---|---|
| Dashboard `/dashboard` | Overview, rebuilt | Executive Summary |
| Input `/input` | Catalog Management + Costing & Pricing merged | Recipes + costing sheet |
| OPEX & Overhead `/opex` | Break-Even's OPEX editor, plus categories | OpEx + Dish Overhead Allocation |
| Receipt Simulator `/receipt` | new (`src/lib/receipt.ts`) | Interactive POS Receipt Simulator |
| Margin & POS Simulator `/simulator` | new (`src/lib/simulator.ts`), replaces Break-Even | Margin Simulator / P&L waterfall |

**Removed:** Inventory, Point of Sale (real checkout + receipts), Cost
History page, Documents (CSV, printable quotation), Multi-User,
Multi-Channel Pricing, Margin Alerts page, Sales & Profit Reporting,
and the standalone Costing & Pricing page. Their routes redirect to the
nearest surviving page (`next.config.ts`), including
`/costing?id=<id>` → `/input?edit=<id>`. Before removing anything the
full version was tagged **`v1-full-11-modules`** and pushed to GitHub —
one checkout restores it.

**Kept on purpose, despite the cut:**
- **Backup/Restore**, moved from Documents to the Dashboard — the only
  protection against a cleared browser in a `localStorage`-only app.
- **Ingredient Library** and its cost cascade, inside Input — it's the
  single biggest advantage over a spreadsheet (`concept.md`).
- **Insights panel** on the Dashboard — degrades gracefully: only its
  below-target-margin check still has data to read.
- The underlying `CatalogItem` shape (stock, sales, channels fields
  stay, unused) — so restoring a backup from the 11-module version, or
  checking out the tag, never hits a data-shape mismatch.

**New, beyond a straight copy of the reference:**
- **Input opens the breakdown editor immediately** after "+ New recipe"
  — one flow instead of create-then-find-then-edit.
- **An "OPEX share" control on the Margin simulator.** The reference
  loads all fixed costs onto whichever dish is selected; that's only
  true for a one-product business. Default 100% (the reference's
  worst case), adjustable.
- **Direct cost vs. recipe cost**, stated in `modules.md`: both
  simulators exclude a recipe's per-unit overhead line
  (`directCost()`), since they subtract monthly OPEX separately.
  Otherwise rent would be counted twice — easy to get wrong, and
  invisible in the output.
- **PH receipt rules done properly**: Senior/PWD is 20% off the
  VAT-exclusive price and VAT-exempt (VAT stripped first under
  inclusive pricing, never discounted on top), and service charge is
  excluded from profit (RA 11360).

## Why

The reference site already proves this shape works for exactly this
user, and Oliver named it explicitly. The cut is fully reversible
(git tag + unchanged data shape), so there was no reason to keep
half-used pages around "just in case." Real POS checkout, inventory,
and sales history were the most expensive pieces to keep working and
the least likely to matter before a single real owner has tried the
costing core.

## Consequences

- 163 tests (CSV tests removed with `csv.ts`; 17 added for the receipt,
  margin, and OPEX-category math). `tsc`/build clean; verified live on
  all 5 pages, EN/TL, light/dark, desktop + 390px phone, zero console
  errors; receipt and break-even figures hand-checked.
- Caught two runtime crashes the typechecker couldn't: the landing page
  and `CostForm` both did `MODULES.find(slug)!` on retired slugs, which
  would have thrown on load. Fixed; worth remembering that `!` on a
  `find()` hides exactly this class of bug.
- The insights engine's portfolio, channel-gap, and stock-runway checks
  now never fire (no page writes sales, channels, or stock). Left in
  place rather than deleted — harmless, tested, and live again the day
  any of that data comes back.
- `docs/product/modules.md` and `docs/qa/qa-manual.md` rewritten for 5
  pages; the 11-module versions are archived in
  `docs/archive/eleven-modules-2026-10/`. Decision records 0001–0039
  stay as written — history, not current spec.
- If the reference's "Print Printable Recipe Card (PDF)" turns out to
  matter to real users, it's the obvious next addition to Input.
