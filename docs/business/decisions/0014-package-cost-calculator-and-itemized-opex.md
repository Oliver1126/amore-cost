---
number: 0014
date: 2026-08-18
status: accepted
---

> **OPEX data model superseded 2026-08-19** by
> [0017](0017-opex-is-a-shared-store-not-per-item.md) — the itemized-
> list + contingency % design below is still correct and current, but
> it moved out of `CalculatorState` into its own shared store
> (`src/lib/opex.ts`) once it became clear OPEX was resetting per item
> instead of describing the whole business. The **package cost
> calculator** half of this record is unaffected.

# Cost Ledger gets a package-to-unit-cost calculator; Break-Even's OPEX becomes itemized with a contingency buffer

## Context
Oliver asked for two additions, both real gaps against how PH small
businesses actually buy and budget: (1) a way to enter a cost line as
"I bought a package for this much, it has this many units, plus
shipping" and have Amore Cost derive the per-unit cost, rather than
requiring the owner to do that division by hand before typing a number
in; (2) Break-Even's single "fixed costs per month" number replaced
with itemized operating expenses (OPEX) — named lines like rent,
salaries, utilities — plus a contingency % safety margin on top, since
budgeting with a buffer for the unexpected is standard small-business
practice, not an edge case.

## Decision
- **`CostItem`** (`src/lib/calculator.ts`) gains four optional fields:
  `supplier`, `packagePrice`, `qtyPerPack`, `shippingFee`. A new pure
  function, `packageUnitCost(packagePrice, qtyPerPack, shippingFee)`,
  returns `(packagePrice + shippingFee) / qtyPerPack`. In
  `CostForm.tsx`, a "Calculate from package price" toggle per line
  (hidden when that line is linked to an Ingredient Library entry —
  the two ways of deriving a cost are mutually exclusive) expands a
  mini-panel for these four fields and shows the computed unit cost;
  the line's `amount` is then derived as `unitCost × quantity` and its
  own Cost input becomes disabled, the same pattern already used for
  Ingredient-Library-linked lines.
- **`CalculatorState.monthlyOpex: number`** is replaced with
  **`opexItems: OpexItem[]`** (`{ id, label, amountPerMonth }`, same
  shape/pattern as `CostItem`) and **`opexContingencyPercent: number`**.
  New pure functions `totalOpex(items)` and
  `opexWithContingency(items, contingencyPercent)`. Break-Even's page
  now renders an itemized add/remove list (mirroring Cost Ledger's own
  UI pattern) instead of one input, with the contingency-adjusted total
  — not the raw sum — feeding `computeBreakEven`.
- Every call site that read `state.monthlyOpex` updated:
  `break-even/page.tsx`, `dashboard/page.tsx` (Overview's break-even
  preview), `LandingCalculator.tsx` (the landing-page demo, which
  doesn't use break-even at all — just needed its stub state fixed).

## Why
Oliver's direct ask, chosen because both problems are real and common
for the PH food/service/resale ICP this product targets: buying
ingredients by the sack/case/box and needing a per-unit number for
recipe costing, and budgeting operating expenses with a contingency
line rather than a single optimistic guess.

## Consequences
- **`monthlyOpex` is gone, not kept as a deprecated alias.** This is a
  breaking rename of a `CalculatorState` field. Acceptable *only*
  because this is a pre-launch concept build with zero real users
  (confirmed against `next-steps.md` before doing it) — any saved
  catalog item's old `state.monthlyOpex` value is simply not read
  anymore. If this app had real user data at rest, this would need a
  migration step instead of a silent field swap.
- **Package pricing and Ingredient Library pricing are deliberately
  mutually exclusive per line**, not layered — a line either follows a
  linked ingredient's cost, or follows its own package math, never
  both at once. This avoids an ambiguous "which number wins" state,
  at the cost of not letting a *linked* ingredient also show its own
  package breakdown inline (that breakdown already lives on the
  Ingredient Library page itself via supplier quotes, decision 0008 —
  this is a second, lighter-weight way to get a per-unit number for
  cost lines someone hasn't bothered linking to the library yet).
- **New pure functions, new tests.** `packageUnitCost`, `totalOpex`,
  and `opexWithContingency` are all covered in `calculator.test.ts`
  (7 new tests, 86 total) — consistent with this project's rule that
  business logic gets tested, UI doesn't.
- Both features are fully translated (EN/TL) in the same commit, not
  deferred — matches the standard this project already holds itself to
  post-decision-0013.
