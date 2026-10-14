---
number: 0017
date: 2026-08-19
status: accepted
supersedes: 0014 (data model only — the itemized-list + contingency % design from 0014 is unchanged, just moved to live in the right place)
---

# OPEX moves out of `CalculatorState` into its own shared store

## Context
Decision 0014 turned Break-Even's single `monthlyOpex` number into an
itemized list + contingency %, but kept it as a field on
`CalculatorState` — the same object that holds one product's cost
lines, labor, and tax settings, and which exists once per Catalog item
plus once more for the current Costing & Pricing draft. Oliver noticed
the actual symptom this caused: after entering OPEX (Rent, Salaries,
Utilities) while pricing one item, editing a *different* item on
Costing & Pricing appeared to carry stray data between them, and asked
why. The real cause was worse than a display glitch: Break-Even always
read the current *draft's* OPEX specifically — so saving an item to
Catalog and starting a new draft silently reset the OPEX list to empty,
even though the business's actual rent hadn't changed.

## Decision
- New `src/lib/opex.ts`: `OpexItem`, `newOpexItem`, `totalOpex`,
  `opexWithContingency` (moved as-is from `calculator.ts`, math
  unchanged) plus a new `OpexSettings` (`{ items, contingencyPercent }`)
  and `OPEX_STORAGE_KEY` (`calcost:v0:opex`) — one shared record for
  the whole account, same pattern as the Ingredient Library
  (`src/lib/ingredients.ts`): entered once, read everywhere.
- `CalculatorState` no longer has `opexItems`/`opexContingencyPercent`
  at all — OPEX was never a property of one product, so it shouldn't
  have lived on the per-product/per-draft state to begin with.
- `break-even/page.tsx` now loads `OpexSettings` via its own
  `useLocalStorage(OPEX_STORAGE_KEY, ...)`, completely independent of
  whichever item's draft happens to be open. `dashboard/page.tsx`'s
  Overview preview updated the same way. The page now says so directly
  in the UI ("Shared across your whole business — the same list is
  used no matter which item you're pricing") so this doesn't surprise
  anyone else the way it surprised Oliver.
- `OPEX_STORAGE_KEY` added to `backup.ts`'s `BACKUP_KEYS` — arguably
  more important to back up than before, since losing it now means
  retyping real business-wide expenses, not just one item's number.
- Tests moved to a new `src/lib/opex.test.ts` (still 4 tests, still 92
  total across the suite) — no behavior change to the math itself, only
  where the data lives.

## Why
Oliver caught this by using the app and noticing the actual behavior
didn't match what "operating expenses" should mean for a business —
correctly identifying that rent/salaries/utilities describe the
business, not any one product, so they shouldn't reset or duplicate
per item.

## Consequences
- **No migration path for the old per-item `opexItems`.** Any OPEX
  numbers previously typed under the old (0014) design are gone —
  acceptable only because this is pre-launch with zero real user data
  at rest (confirmed before making the change, same reasoning as 0014
  dropping `monthlyOpex` outright).
- **This is the second time in as many days a `CalculatorState` field
  turned out to belong somewhere else** (the first being `monthlyOpex`
  itself, decision 0014). Worth naming as a pattern: before adding a
  new field to `CalculatorState`, ask whether it actually describes
  *one priced item* or the *business as a whole* — the Ingredient
  Library and now OPEX both belong in the second category, and both
  needed a dedicated shared store, not a field bolted onto per-item
  state.
- Verified live, not just by re-reading the code: entered OPEX while
  drafting one item, saved it, started a completely new draft for a
  different item, and confirmed the OPEX list was still there
  unchanged — the exact scenario that surfaced the original bug.

## Addendum, same day: OPEX was still hidden with no item priced
The first pass of this fix moved *where OPEX is stored* but left the
OPEX card nested inside `{hasItem ? ... : ...}` in `break-even/page.tsx`
— a leftover from 0014, when OPEX genuinely was tied to whatever item
was open. Oliver hit this immediately: with no item currently priced,
the page showed only "you haven't priced anything yet" and the entire
OPEX section was gone, which read as OPEX being broken rather than
just hidden. Restructured so the OPEX card renders unconditionally;
only the price-per-unit/units-needed cards and the final "you need to
sell X units" line stay gated behind `hasItem`, since those genuinely
need a priced item to compute against and OPEX doesn't. Verified live
with a completely empty account (no item ever priced) — OPEX now
shows, is editable, and totals correctly with nothing else on the page.
