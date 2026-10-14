---
number: 0029
date: 2026-08-21
status: accepted
---

# Cost Composition/Pricing strategy/Tax/Batch/Templates moved above the vertical tabs

## Context
Requested reordering: Cost Composition, "Price using" (Margin %/
Markup %/Fixed profit), Tax, Batch size, and Quote templates — until
now a narrow `20rem` side column running beside `CostForm` — should
sit above the Food & beverage/Service/Resale section instead of next
to it.

## Decision
`src/components/ItemEditor.tsx`: replaced the
`grid lg:grid-cols-[1fr_20rem]` side-by-side layout with a stacked one
— `CostComposition`/`StrategyCard`/`TaxCard`/`BatchCard`/`sideExtra`
now render first, in a responsive `grid sm:grid-cols-2 lg:grid-cols-3`
row (wrapping to one column on mobile), followed by `CostForm` (whose
own vertical tabs sit at its top) at full width below. Pure layout
change — no props, state, or logic touched in any of the five card
components.

## Why
Direct request. As a side effect, `CostForm`'s new column-heavy cost-
line table (decision 0028) also gets the full page width instead of
being squeezed into a `1fr` column beside a `20rem` sidebar — less
horizontal scrolling needed for the same table.

## Consequences
- **Follow-up fix same day:** the first version used a 3-column grid,
  which looked wrong in practice — uneven card heights within a row
  (`Cost composition` next to the much taller `Price using`) and an
  empty trailing grid cell whenever the row count wasn't a multiple of
  3 (always true for Catalog Management's 4 cards, no `sideExtra`).
  Fixed by switching to 2 columns and reordering to pair
  similarly-sized cards: `Cost composition`+`Batch size` (both short)
  in one row, `Price using`+`Tax` (both taller) in the next, with
  `sideExtra` (Quote templates, standalone page only) on its own row.
  This makes the 4-card Catalog Management case a perfect 2×2 grid
  with zero empty cells — the more common entry point.
- No new tests needed (no logic changed); 119 tests unchanged.
- Verified live on both entry points (standalone Costing & Pricing and
  Catalog Management's "Edit & Breakdown," where `sideExtra` is absent
  since quote templates don't apply to an already-saved item) and at
  mobile width (390px, stacks to one column cleanly).
