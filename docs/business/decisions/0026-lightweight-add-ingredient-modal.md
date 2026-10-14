---
number: 0026
date: 2026-08-21
status: accepted
---

# "Add ingredient" (Ingredient Library) becomes a lightweight popup

## Context
Following 0025's "+ New item" popup, the same treatment was requested
for "Add Ingredient" — but two different "Add Ingredient" actions exist
in Catalog Management, and only one should get this treatment:

1. The **Ingredient Library's** "Add an ingredient" form — an
   always-visible inline form (Name/Unit/Cost/Category) that
   permanently occupies page space regardless of whether anyone's
   using it.
2. The **per-recipe cost-line** "+ Add ingredient" inside "Edit &
   Breakdown" (`CostForm`) — already confirmed against the live
   reference site (decision 0025) to be a plain inline row, not a
   popup, on purpose.

Clarified directly which one before building, given two earlier rounds
this session where guessing the wrong scope wasted work. Confirmed: #1
only.

## Decision
- New `src/components/AddIngredientModal.tsx` — Name (required),
  Unit + Cost/unit side by side, Category — matching the exact fields
  the old inline form had, in a popup instead of permanently-open page
  space. Reuses the existing `newIngredient()` constructor; no new
  business logic.
- `catalog/page.tsx`'s Ingredient Library section header gained an
  "Add ingredient" button opening this modal; the old always-open
  inline form, its `form`/`setForm` state, and its `addIngredient()`
  handler are removed (dead code, not kept around "just in case").
- The shared `<datalist id="calcost-units">` — previously nested
  *inside* the now-removed inline form, so removing that form would
  have silently broken the still-needed ingredient-row unit datalist
  (used when editing an existing ingredient inline) — was relocated to
  always render at the top of the section, independent of whether the
  add modal is open. The new modal's own Unit field references this
  same datalist rather than declaring its own, avoiding a repeat of
  the duplicate-id bug just fixed in 0025.

## Why
Direct request, scoped correctly this time by asking first which of
two same-named buttons was meant — avoiding a third round of building
the wrong thing this session.

## Consequences
- No new pure-logic functions; test count stays at 115.
- Verified live in EN/TL and Light/Dark: Add button disabled with an
  empty name; created an ingredient ("Flour," kg, ₱55, "baking")
  through the modal, confirmed it appears correctly in the table;
  confirmed zero duplicate DOM ids while the modal is open (checked
  directly via `querySelectorAll`, not just visually); confirmed the
  new ingredient is still selectable from the cost-line "link to
  Ingredient Library" dropdown inside a fresh item's "Edit &
  Breakdown" — the datalist relocation didn't break anything it used
  to support.
