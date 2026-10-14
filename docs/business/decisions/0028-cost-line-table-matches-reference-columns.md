---
number: 0028
date: 2026-08-21
status: accepted
---

# Cost-line editor becomes an always-visible table, matching the reference's exact columns

## Context
Oliver sent the reference site's actual column header row — Ingredient
Name / Supplier / Package Price (₱) / Pack Qty / Shipping (₱) / Pack
Unit / Portion Qty / Portion Unit / Unit Cost [AUTO] / Line Item Cost
[AUTO] — and asked to realign Amore Cost's cost-line editor to match it
column-for-column, adding to the data model whatever's genuinely
missing, plus vertical-specific rules (Food/Service/Resale).

Today's `CostForm` (before this decision) showed a compact 4-column
grid (Qty/Unit/Ingredient/Cost) with an expand/collapse "Calculate from
package price" panel hiding Supplier/Package Price/Qty per Pack/
Shipping — the reference never hides these behind a toggle (confirmed
directly, decision 0025), so this needed to become an always-visible
table.

## Decision
- **New data field** — `packUnit?: string` on `CostItem`
  (`src/lib/calculator.ts`): the unit the *package* is measured in
  (e.g. "kg" for a 25kg sack), distinct from the existing `unit` field,
  which is really the *portion's* unit. This is the one genuinely
  missing piece — today there was no way for a package-priced line to
  be bought in one unit and used in portions of a different one.
- **New pure function** `packageLineAmount()` (`src/lib/calculator.ts`)
  — mirrors `linkedCostAmount`'s (`src/lib/ingredients.ts`)
  convert-then-multiply shape exactly, reusing `packageUnitCost` and
  `convertQuantity` (`src/lib/units.ts`) as-is: converts the portion
  quantity into the pack's own unit when they differ, falling back to
  the raw quantity when `packUnit` is unset or the units aren't in a
  convertible category. 4 new tests.
- **`CostForm.tsx` rewritten** from the compact grid + expand panel
  into a real `<table>` with all 10 reference columns plus a delete
  action. The "{itemNoun} Name" header is vertical-aware (Ingredient/
  Material/Cost item — the existing `labels.itemNoun` convention),
  satisfying the "varies per vertical" ask without inventing
  column-hiding rules the reference doesn't evidence (it's food-only).
  Linked-ingredient lines show em-dashes on the package-specific
  columns (mutually exclusive, same existing rule); package-priced
  lines auto-compute via the new function; plain manual lines keep a
  directly-editable Line cost cell. The old expand/collapse state and
  its now-dead i18n keys were removed, not left in place.
- **Reaches both entry points for free** — `CostForm` is shared by the
  standalone Costing & Pricing page and Catalog Management's "Edit &
  Breakdown" modal (decision 0023's whole point).

## Why
Direct, well-evidenced request (the user sent the actual column header
row from the live reference), and the missing "pack unit vs. portion
unit" distinction is a real capability gap, not just a cosmetic
mismatch — the same unit-conversion Amore Cost already offers for
shared Ingredient Library entries now also works for manually-entered
package-priced lines.

## Consequences
- **A real, launch-blocking-if-shipped layout bug was found and fixed
  during verification, not guessed at:** `<fieldset>` (and grid items
  generally) default to `min-width: min-content` in browsers, which
  silently overrides a descendant's `overflow-x-auto` and forces
  ancestors to grow to fit — confirmed live by comparing
  `element.scrollWidth` against its own bounding width before and
  after the fix. The wide new table was stretching `CatalogEditModal`
  itself past its own `max-w-5xl`, not scrolling internally as
  intended. Fixed with `min-w-0` on `CostForm`'s root card and on the
  `<fieldset>` — confirmed after the fix that the modal's
  `scrollWidth` matches its rendered width, and the table's own
  wrapper (not the modal) is what scrolls.
- 4 new tests (`packageLineAmount`); **119 total**.
- Verified live on **both** entry points, across all three verticals
  (header label changes correctly), and in EN/TL × Light/Dark: a
  linked-ingredient line, a package-priced line with matching pack/
  portion units, a package-priced line with *different* units (a 25kg
  sack costed in kg, portions entered in grams — confirmed the new
  conversion math: ₱50/kg → ₱0.05/g → ₱25.00 for a 500g portion, not
  just that a field renders), and a plain manual line, all in one
  table with correct em-dashes and AUTO-computed values.
