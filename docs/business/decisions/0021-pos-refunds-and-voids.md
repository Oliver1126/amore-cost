---
number: 0021
date: 2026-08-20
status: accepted
---

# Point of Sale refunds/voids

## Context
Refunds/voids for Point of Sale had been tracked as a known, explicitly
out-of-scope gap since decision 0015 (POS v1) and called out directly
in `docs/qa/qa-manual.md`'s "known simplifications" list. Oliver asked
to build it as the next concrete item off `roadmap/backlog.md`.

## Decision
- `SaleEntry` (`src/lib/catalog.ts`) gains `refundOf?: string` — present
  only on a refund entry, holding the id of the original `SaleEntry` it
  reverses.
- New pure function `refundTransaction(catalog, transactionId)`:
  reverses every not-yet-refunded original entry in a transaction by
  restocking its quantity and appending a **new negative-quantity**
  `SaleEntry` (same `unitPrice`/`unitCost` as the original, linked via
  `refundOf`) under a **freshly generated transactionId** — the original
  receipt is never mutated, so reprinting it later still shows exactly
  what was actually sold. Skips entries already refunded rather than
  double-reversing them.
- New pure function `isTransactionRefunded(catalog, transactionId)`:
  true only once every original entry in that transaction has a
  matching reversal elsewhere in the catalog.
- The receipt page (`pos/receipt/[transactionId]/page.tsx`) gets a
  "Refund this sale" button (with a confirm dialog, since it's not
  undoable) that calls `refundTransaction` and navigates to the new
  refund receipt. Once refunded, the original receipt shows a
  "Refunded" badge and the date it happened instead of the button. A
  refund receipt renders with its own "Refund receipt" heading, a
  "Refund of receipt [link back to the original]" line, a "Refund" tag
  per line, and negative quantities/totals.
- **Reporting required zero special-casing.** Every aggregation on
  `/reporting` already sums `unitPrice * quantity` and
  `unitCost * quantity` across `SaleEntry[]` — a negative-quantity
  refund entry nets out revenue, profit, and units-sold automatically
  wherever those sums already happen.

## Why
The natural design for "undo a sale" in a system that already treats
sales as an append-only list of `SaleEntry` records: reverse with a new
entry, don't mutate history. Matches how real receipts/credit notes
work (the original stays intact; the refund is its own record) and
avoids inventing a parallel "Order" concept just for this.

## Consequences
- **Only full-transaction refunds in this pass** — no partial-quantity
  refund UI yet, though `refundTransaction`'s per-entry-id skip logic
  already supports it at the data layer if a future UI wants to refund
  individual lines.
- **Uncovered a real formatting bug while building this**, per root
  `CLAUDE.md`'s "fix what you find" rule: negative revenue/profit was
  rendering as `₱-333.33` (peso sign before the minus) on both the
  receipt page and `/reporting`'s cards/tables — the first time any
  negative amount could occur in either place. Fixed with a
  `pesoSigned()` helper (`-₱333.33`) added to both files, also
  normalizing a `-0` edge case from a zero-cost item.
- New tests in `catalog.test.ts`: `refundTransaction` (restock + negative
  entry + linkage, nets to zero, multi-item transactions, no
  double-refund, leaves untouched items alone) and
  `isTransactionRefunded` — 9 new tests, **109 total**.
- Verified live in EN/TL and Light/Dark: sold 2 units, refunded from the
  receipt page, confirmed the original stayed unchanged with a
  "Refunded" badge, the new refund receipt showed `-2` / `-₱333.33` with
  a link back to the original, Inventory restocked correctly, and
  `/reporting` netted units/revenue/profit back to zero without any
  reporting-side code change.
- `docs/roadmap/backlog.md` item 10 removed;
  `docs/qa/qa-manual.md`'s "known simplifications" list and Point of
  Sale checklist entry updated to match.
