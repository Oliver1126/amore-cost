---
number: 0024
date: 2026-08-20
status: accepted
supersedes: 0023
---

# Catalog Management's product list becomes a card grid, not a table

## Context
Decision 0023 kept the Products list as a table, reasoning that a
table scales better once someone has 30+ items. After that shipped,
Oliver confirmed he'd actually seen the reference screenshots and
wanted the Products list itself to match their card-grid structure —
reversing the earlier table answer, not just the editor-location one
from 0023.

## Decision
- `src/app/(dashboard)/catalog/page.tsx`'s Products section: replaced
  the `<table>` with a responsive card grid
  (`grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5`), one
  `card` per item.
- Each card mirrors the reference's structure with Amore Cost's own
  data and visual language: item name (click → opens the 0023 "Edit &
  Breakdown" modal) + a target-margin pill badge top-right; vertical +
  SKU; the existing "N ingredient(s) linked" badge (click → expands a
  read-only breakdown *within the card*, now a compact stacked list —
  label/line-cost/supplier-or-"Linked ingredient"/unit-cost per line —
  instead of the wide multi-column table from 0022, since a card isn't
  wide enough for that layout); two small stats (True cost, Margin —
  colored via the existing `marginStatus()`); a highlighted
  accent-colored "Suggested price" block, reusing `StatCards`' existing
  color treatment rather than inventing new colors; stock; the job-
  status dropdown; then a footer with QR/Duplicate/Delete on one row
  and a full-width "Edit & Breakdown" button below it.
- Search box and margin-filter pills above the grid are unchanged in
  function — only the results container changed shape.

## Why
Direct instruction, reversing 0023's table call specifically for the
Products list (the "Edit & Breakdown" modal itself was not
reconsidered — that decision stands).

## Consequences
- **Found and fixed a real overflow bug during implementation:**
  the first card layout put QR/Duplicate/Delete and "Edit & Breakdown"
  on one flex row — "Edit & Breakdown" is long enough that it visibly
  clipped past the card's right edge into the neighboring card at
  narrower grid widths. Fixed by stacking the footer instead of
  cramming it into one row: the actions row on top, a full-width
  primary button below.
- **Found and fixed a real copy bug:** the linked-line label in the
  card's expanded breakdown reused `catalog.linkedSuffix` (a suffix
  meant to follow a number, e.g. "1 ingredient(s) linked") as a
  standalone label, rendering as the nonsensical "ingredient(s) linked"
  with no number. Added a proper `catalog.linkedLine` key ("Linked
  ingredient") instead.
- No new pure-logic functions — this was a presentation-layer change
  reusing existing data/handlers (`marginStatus`, `computePriceBreakdown`,
  `duplicate`/`remove`/`setStatus`/`setSku`/`setEditModalItem`
  unchanged). Test count stays at 115.
- Verified live in EN/TL and Light/Dark, plus a mobile-width
  (390px) check: 4-column desktop grid down to 1-column mobile, no
  overflow anywhere, the margin filter correctly narrows the grid, the
  in-card expand and the "Edit & Breakdown" modal both still work
  correctly from the new card footer.
