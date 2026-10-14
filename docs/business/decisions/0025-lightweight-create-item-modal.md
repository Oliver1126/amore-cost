---
number: 0025
date: 2026-08-21
status: accepted
supersedes: 0023
---

# "+ New item" becomes a lightweight modal, separate from "Edit & Breakdown"

## Context
Confirmed by actually visiting the live reference site
(food-cost-tau.vercel.app), not just reading a static screenshot: its
"Create New Recipe" is a deliberately small modal — Name, Portions
Yield, Target Food Cost % only — fully separate from its much larger
"Edit & Breakdown" view. Amore Cost's "+ New item" opened the *entire*
`CatalogEditModal` (vertical, cost lines, labor, tax, strategy) even
for a brand-new, empty item, which doesn't match that pattern and is
more form than a first step needs.

Also confirmed live: the reference's "+ Add Ingredient Line" is a
plain inline table row, **not** a popup — correcting an earlier
misreading of a static mockup image that had prompted planning a
popup-based line editor. That popup was never built; no work is lost,
and none should be attempted now that this is settled.

## Decision
- New `src/components/CreateCatalogModal.tsx` — name (required),
  vertical picker, batch size (reusing the existing `batch.size` label
  from `BatchCard`), and target margin %. On submit, builds a
  `CalculatorState` via `defaultState(vertical)`, creates the
  `CatalogItem` via the existing `newCatalogItem()`, and overrides
  `targetMarginPercent` with the chosen value — no new business logic,
  just composing existing pure functions.
- `CatalogEditModal` (0023) is simplified back to edit-only — the
  `item: CatalogItem | null` / `isCreate` branching it carried for
  create-mode is removed now that creation has its own component. Its
  `item` prop is now a required `CatalogItem`, not optional.
- `catalog/page.tsx`'s "+ New item" (and the empty-state prompt) now
  open `CreateCatalogModal`; clicking "Edit & Breakdown" on the
  resulting card opens the full `CatalogEditModal` separately — the
  same two-step shape confirmed on the live reference.

## Why
Matches the live reference exactly (verified by browsing it, not
inferring from a static image), and is a genuine UX improvement on its
own terms: creating a new item no longer requires looking at fields
(tax preset, pricing strategy) that are meaningless before a single
cost line exists.

## Consequences
- **A live code audit surfaced two real, unrelated bugs, fixed in the
  same pass** (per this repo's own "fix what you find" rule):
  1. `CatalogEditModal`'s Target margin input bound its value directly
     instead of the `|| ""` pattern this codebase uses for every other
     numeric input — reintroducing the exact "literal 0 blocks new
     typing" bug already fixed elsewhere in this project. Fixed.
  2. `CostForm` rendered its own `<datalist id="calcost-units">`,
     duplicating the same id already on the Catalog page — invalid
     HTML whenever `CatalogEditModal` is open, since the Catalog page
     stays mounted behind it. Fixed by giving `CostForm`'s datalist a
     unique id (`calcost-units-cost-form`).
- No new pure-logic functions; test count stays at 115.
- Verified live in EN/TL and Light/Dark: created a Service item
  ("Aircon Cleaning") entirely through the new lightweight modal,
  confirmed the Create button stays disabled with an empty name,
  confirmed the resulting card correctly carries vertical/name/batch
  size/target margin into "Edit & Breakdown," and confirmed zero
  duplicate DOM ids while that modal is open (directly checked via
  `document.querySelectorAll("[id]")`, not just visually).
