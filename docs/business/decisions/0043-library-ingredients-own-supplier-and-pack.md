---
number: 0043
date: 2026-11-02
status: accepted
supersedes:
---

# Library ingredients own their supplier and pack price; linked lines edit them in place

## Context
After decision 0042, the "+ Pack price" drawer in Edit & Breakdown only
appeared on lines typed in by hand. As soon as a line was linked to the
Ingredient Library, the drawer disappeared. That was where an owner
naturally wanted to say "I buy this oil at Puregold, ₱120 per 1 L
bottle". The library itself had no supplier field either. Its only
supplier feature was a "Suppliers (n)" list of per-unit price quotes
hidden behind an expand toggle, which the owner didn't find.

## Decision
- `Ingredient` gets the same five optional fields a recipe line has:
  `supplier`, `packagePrice`, `qtyPerPack`, `packUnit` and
  `shippingFee`. When a pack is set, `costPerUnit` is derived from it
  by `withPack()` / `packCostPerUnit()` in `src/lib/ingredients.ts`
  (the pack's unit can differ from the ingredient's, e.g. a 25 kg sack
  for an ingredient priced per kg, or a 370 mL can for one priced per L).
- **Linked lines get the "Pack price" drawer too.** It shows and edits
  the *library ingredient's* pack, says so ("Saved to the Ingredient
  Library: changing it updates every recipe that uses {name}"), and
  saves through the normal cascade (`propagateIngredientChange`), so
  every recipe using that ingredient updates at once.
- **The library has a Supplier column**, and the cost per unit shows the
  pack under it ("₱1,450.00 / 25 kg"). Add and Edit share one form
  (`IngredientForm`): name, unit, cost / unit, supplier, category, plus
  an optional Pack price box. When a pack is filled in, the cost / unit
  field becomes the derived figure.
- The old quotes list is renamed **"Compare prices (n)"** / "Other
  suppliers' prices", to separate it from the current supplier. **Use
  this price** now also sets the supplier to that quote and clears the
  old pack, because the pack no longer describes what is being paid.
- The five drawer fields are one shared component (`PackFields` in
  `CostForm.tsx`) used by recipe lines and the library.
- Sample ingredients now carry suppliers and packs (rice ₱1,450 / 25 kg
  sack, oil ₱120 / 1 L, evaporated milk ₱48.10 / 370 mL, …). Each pack
  works out to exactly the old per-unit price (there is a test for
  this), so the sample numbers used in the Facebook posts and the video
  don't move.

## Why
A linked line's cost comes from the library, so its pack has to live
there too. Storing it on the line would create a second, conflicting
price, and the library cascade would silently overwrite it. Editing
the library from the line keeps one home per fact while still letting
the owner set it from where they're working. The note in the drawer
makes the wider effect visible before they type.

## Consequences
- Changing a pack from one recipe changes every recipe using that
  ingredient. This is intended, and the drawer says so.
- Typed-in lines keep their own pack fields, unchanged.
- Old saved data needs no migration: all new fields are optional, and
  an ingredient without a pack keeps its typed cost / unit.
- Decision 0042's note that the package fields "only apply to unlinked
  lines" is superseded.
