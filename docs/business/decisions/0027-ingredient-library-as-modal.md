---
number: 0027
date: 2026-08-21
status: accepted
supersedes: 0022
---

# Ingredient Library moves from a page section into its own modal

## Context
Since 0022, the Ingredient Library lived as an always-visible section
at the bottom of Catalog Management — a full add-form and table
permanently occupying page space whether or not anyone was using it.
Requested to move it into a popup instead, opened by a button next to
"+ New item" — the same treatment "+ New item" (0025) and "Add
ingredient" (0026) already got.

## Decision
- New `src/components/IngredientLibraryModal.tsx` — a large, scrollable
  modal that owns everything the old page section did: the ingredients
  table, inline edit, delete (with the same detach-don't-destroy
  confirmation), and the expandable suppliers/similar-ingredients/
  used-in panel. It's self-contained (owns its own edit/expand/
  supplier-form state internally) and only needs
  `ingredients/setIngredients/catalog/setCatalog/draft/setDraft` from
  the parent — the same shape as `CatalogEditModal`.
- The "Add ingredient" popup (0026) now opens *from inside* this modal
  rather than from the Catalog Management page directly — a modal
  opening another modal on top, same pattern as clicking a card's
  "Edit & Breakdown" from within Catalog Management.
- `catalog/page.tsx` gained an "Ingredient Library" button next to
  "+ New item"; the old always-open section, its "Jump to: Products /
  Ingredient Library" nav (pointless now that Products is the only
  section left on the page), and roughly 300 lines of state/JSX/
  handlers that lived on the page itself are all removed — moved into
  the new component, not duplicated.
- `/ingredients` still redirects to `/catalog` (no longer to
  `#ingredient-library`, since that anchor no longer exists).

## Why
Direct request, matching the popup pattern already established for
"+ New item" and "Add ingredient" — permanently-visible page real
estate for a feature most sessions don't touch doesn't need to cost
that space by default.

## Consequences
- **A real datalist-id collision was designed around up front,** having
  just fixed one of these in 0025: the ingredient-row unit datalist
  (previously nested inside the section being removed, at risk of
  disappearing along with it) now lives inside the new modal under a
  unique id (`calcost-units-ingredient-library`), and `AddIngredientModal`
  was updated to reference that same id rather than defining its own —
  confirmed live via `document.querySelectorAll("[id]")` that no
  duplicate ids exist while both modals are open at once.
- Dead code removed in the same pass, not left "just in case": the old
  `form`/`editingId`/`editDraft`/`expandedIngredientId`/`supplierForm`
  state, their handlers, and the now-pointless jump-to-anchor i18n keys.
- No new pure-logic functions; test count stays at 115.
- Verified live in EN/TL and Light/Dark: opened the Ingredient Library
  modal from Catalog Management, added an ingredient from the nested
  popup, confirmed it appears in the table, expanded its suppliers/
  similar/used-in row, and reconfirmed zero duplicate DOM ids.
