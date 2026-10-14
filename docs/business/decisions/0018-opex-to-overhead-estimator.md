---
number: 0018
date: 2026-08-19
status: accepted
---

# Costing & Pricing gets a one-directional OPEX → Overhead estimator

## Context
After decision 0017 made OPEX its own shared, business-wide store
(separate from any one item's `CalculatorState`), Oliver asked how
Costing & Pricing and OPEX actually connect — the honest answer at the
time was "they don't, except indirectly through Break-Even": Costing &
Pricing's own `overhead` field is a manually-typed per-item guess, and
OPEX only ever fed the separate break-even units-needed calculation,
never the price itself. Oliver asked for the connection to actually
exist.

## Decision
Added an "Estimate from OPEX" toggle under the Overhead field in
`CostForm.tsx`. Expanding it:
- Reads the shared OPEX total via `opexWithContingency` from
  `src/lib/opex.ts` (the same store Break-Even edits) and shows it
  plainly ("Your OPEX is ₱30,000.00/month").
- Asks for an **Expected monthly volume** (a one-off, ephemeral input —
  not persisted, since it's an assumption for this calculation, not a
  fact worth saving).
- Computes `OPEX ÷ expected volume` and shows it as a per-unit figure.
- **"Use this"** writes that number directly into `state.overhead` —
  the same field the manual input sets — then closes the panel.
- If OPEX hasn't been set up yet (total is 0), shows a prompt linking
  to Break-Even instead of a meaningless ₱0.00 estimate.

## Why
Oliver's direct ask, after the OPEX/Costing-&-Pricing relationship
prompted genuine confusion (documented in this same conversation) about
whether OPEX should feed pricing at all. The connection is deliberately
**one-directional and non-automatic**: OPEX informs a *suggested*
overhead figure on request, but never silently overwrites what someone
typed by hand, and doesn't create a live/reactive link that would
recompute a saved item's price every time the shared OPEX total changes
elsewhere.

## Consequences
- **Expected monthly volume is intentionally not saved anywhere.** It's
  an assumption used once to produce a number, not a fact about the
  business. If OPEX changes later, or someone wants to redo the
  estimate with a different volume, they just reopen the panel — the
  *result* of the last estimate (the overhead value itself) is what
  persists, on the item, exactly like manually-typed overhead always
  has.
- **Still not automatic on purpose.** This does not turn `overhead`
  into a computed/derived field that updates whenever OPEX changes —
  doing so would mean every saved Catalog item's price silently shifts
  whenever rent goes up, with no chance to review the change first.
  "Use this" is a deliberate, reviewable action, consistent with how
  every other cost input in this app works.
- Verified live in both languages with real numbers (₱20,000 Rent +
  ₱10,000 Utilities on Break-Even → ₱30,000 OPEX → ÷300 units →
  ₱100.00/unit, applied and confirmed in the Overhead field) — not just
  read from the code.
