---
number: 0004
date: 2026-08-17
status: accepted
supersedes:
---

# Lead vertical is unified food + service + retail, not service-costing alone

## Context
[next-steps.md](../../next-steps.md)'s Phase 0 flagged an open call after
the iCost correction in
[market-research.md](../market-research.md): lead narrow with
service-costing (the one vertical with no found PH SaaS competitor), or
go broad with a single tool unifying food + service + retail/resale and
pitch "the incumbent only does food" as the explicit differentiator
against iCost.

## Decision
Unified food + service + retail, from day one. This confirms rather
than changes [product/scope-v1.md](../../product/scope-v1.md)'s v0
scope, which already assumed all three verticals in one calculator —
the open question was whether to *narrow* it to service-only given
iCost's food-costing head start, and the answer is no.

## Why
Oliver's direct call. Leans on edge #2 in
[market-research.md](../market-research.md)'s "Your actual edge"
section — one account across food + service + resale is real for a
user who runs more than one type of business at once, which the ICP in
[concept.md](../concept.md) explicitly includes (e.g. a reseller with a
food side-hustle).

## Consequences
- No rescoping needed in `product/scope-v1.md` — v0's unified-calculator
  premise stands as originally drafted.
- Going after the food vertical head-on, not avoiding it, means
  competing more directly with iCost's *feature set*, not just its
  costing mechanic — iCost also does real-time inventory with low-stock
  alerts and an auto-deduct-on-sale feature ("Cook & Deduct"). This is
  the direct motivation for adding a dedicated **Inventory module** to
  the product (see [product/modules.md](../../product/modules.md)),
  which wasn't part of the original v0/v1 scope draft.
- The go-to-market pitch is now structurally broader and harder to
  validate in one message than a narrow service-costing pitch would
  have been — per market-research.md's own caveat, this only works if a
  real target user actually runs more than one of these business types
  at once. Phase 1 validation (see [roadmap.md](../../roadmap/roadmap.md)) needs
  to test this directly, not assume it.
