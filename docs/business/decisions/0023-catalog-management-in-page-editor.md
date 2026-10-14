---
number: 0023
date: 2026-08-20
status: accepted
supersedes:
---

> **Products layout superseded 2026-08-20** by
> [0024](0024-catalog-management-card-grid.md) — "keep the table"
> below didn't survive contact with the actual reference images; the
> Products list is now a card grid. Everything about the "Edit &
> Breakdown" modal itself described here is still correct and current.
>
> **Create-mode superseded 2026-08-21** by
> [0025](0025-lightweight-create-item-modal.md) — this modal no longer
> handles creating a brand-new item (`item` is now a required
> `CatalogItem`, not optional); that's its own lightweight
> `CreateCatalogModal` now, confirmed against the live reference site.
> Everything else here (editing an existing item) is unchanged.

# Catalog Management gets a real in-page editor ("Edit & Breakdown" modal)

## Context
Oliver shared a competitor's card-based "Recipe Management" UI and
asked whether to align Catalog Management to it. After reviewing the
insights (card grid doesn't scale as well as the existing table; the
reference's breakdown view is missing labor/packaging/overhead/tax
entirely and would regress real functionality if copied as-is), he
chose: keep the table, but make "Edit & Breakdown" a real in-page
editor with the full cost stack embedded, not a link away to Costing &
Pricing.

## Decision
- New `src/components/ItemEditor.tsx` — the `StatCards` + two-column
  `CostForm`/`CostComposition`/`StrategyCard`/`TaxCard`/`BatchCard`
  block was extracted out of `costing/page.tsx` verbatim into one
  `{state, onChange, ingredients, sideExtra}` component. `costing/page.tsx`
  now renders `<ItemEditor>` and passes `TemplatesCard` via `sideExtra`
  — a behavior-preserving refactor, not a rewrite.
- New `src/components/CatalogEditModal.tsx` renders that same
  `ItemEditor` inside a large scrollable modal on Catalog Management.
  Edit mode (a real `CatalogItem`) live-saves every change through
  `updateItemState`, identical to how `/costing?id=` already works.
  Create mode (no item) holds an ephemeral local `CalculatorState`,
  deliberately not the shared Costing & Pricing draft key, so the two
  can't collide; a "Save to Catalog" button calls `newCatalogItem`.
  Also adds a **Target margin %** field, editing `CatalogItem.targetMarginPercent`
  directly — the field Margin Alerts already reads/writes, now editable
  from the one place someone's actually looking at an item's margin
  (it wasn't editable from Catalog Management before this).
- `catalog/page.tsx`: "+ New item" and each row's item name now open
  this modal instead of navigating to `/costing`. The existing
  read-only "N ingredient(s) linked" drill-down (decision 0022) is
  untouched — still a quick-glance option alongside the new editor.
- `/costing` and `/costing?id=` are **unchanged and still fully
  functional** — Break-Even, Reporting, Alerts, and the Ingredient
  Library's "used in" links all still point there. The modal is an
  additional, faster path from Catalog Management specifically, not a
  replacement.

## Why
`costing/page.tsx` was already composed entirely of independent
`{state, onChange}` components with no page-specific dependencies —
confirmed by reading each one before committing to this design. That
meant the entire editor could be reused inside a modal with zero
duplicated logic, so the two editing surfaces can never drift apart the
way a hand-copied second implementation would.

## Consequences
- Two entry points to the identical editing logic (the standalone page
  and the modal) instead of one — by construction, not by accident,
  since both render the same `ItemEditor`.
- No new pure-logic functions were needed, so the test count stays at
  **115** — this was a component-extraction/UI change, not new
  business logic.
- Verified live in EN/TL and Light/Dark: edited an existing item's
  target margin, pricing strategy, and tax through the modal, confirmed
  it persisted after closing and reopening, confirmed the *same* data
  shows correctly on the standalone `/costing?id=` page afterward;
  created a new Service item entirely through the modal without ever
  navigating away from Catalog Management; confirmed the read-only
  drill-down badge still works independently.
