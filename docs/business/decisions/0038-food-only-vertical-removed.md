---
number: 0038
date: 2026-09-03
status: accepted
supersedes: 0004
---

# Food-only — Service and Resale removed from the product, not just the marketing

## Context

[Decision 0037](0037-reposition-to-lead-with-food.md), the same day,
repositioned marketing to lead with food while keeping the product
fully multi-vertical — explicitly the cheap, reversible option.
Oliver came back with a bigger ask: narrow the actual target market,
framed as a deliberate small-to-bigger staged rollout ("I just realize
that I need to be more on small to bigger target slowly process") —
not scope creep, a considered sequencing choice. Given the real
tradeoff was already surfaced once (decision 0037's context) and
again directly before this change (removing "one account across all
three verticals," a named differentiator in
[competitive-landscape.md](../competitive-landscape.md)), this decision
records the choice made with that tradeoff in view, not overlooked.

## Decision

**Removed, not hidden:** `Vertical` (`src/lib/calculator.ts`) narrowed
from `"food" | "service" | "resale"` to `"food"` only. `VERTICAL_LABELS`
and `SUGGESTED_MARGIN_RANGE` (and their Tagalog equivalents,
`VERTICAL_LABELS_TL` in `src/lib/i18n.tsx`) now hold one entry. The
now-single-option tab switcher UI was deleted (not just disabled) in
both places it existed — `CostForm.tsx`'s business-type tabs and
`CreateCatalogModal.tsx`'s "+ New item" flow — along with the
redundant vertical badge on Catalog Management's product cards (it
would have read "Food & beverage" on every single card).

**Every existing module stays.** This is the key distinction from
"cutting pages": Overview, Costing & Pricing, Catalog Management,
Break-Even, Inventory, Point of Sale, Cost History, Documents,
Multi-User, Multi-Channel Pricing, Margin Alerts, and Sales & Profit
Reporting are all still real, working, and still needed — none of
them were ever service- or resale-*specific* pages, because the
original architecture (decision 0004) never built separate pages per
vertical. What got removed was a *dimension* of the data model
(which business-type profile a `CalculatorState` uses), not a set of
pages. See each module's entry in
[product/modules.md](../../product/modules.md) for why it stays
relevant to a food-only product specifically.

**Marketing/docs updated to match, not just softened further:**
landing page, pitch one-pager, `concept.md`, `go-to-market.md` now say
food-only plainly, rather than 0037's "leads with food, discloses
service/resale as secondary." The multi-vertical era's actual copy and
reasoning are preserved, not deleted — see
[docs/archive/multi-vertical-2026-08/](../../archive/multi-vertical-2026-08/README.md).

## Why

Oliver's call, made twice with the same real cost in view: this
removes "one account across all three verticals" as a differentiator
against iCost, one of only 2–3 named as still real in
`competitive-landscape.md`. The stated reasoning — validate narrow
first, expand later once there's real signal, rather than asking Phase
1 to validate a broader claim at once — is a legitimate, common
sequencing strategy, not a smaller version of the same idea. It also
removes real, unnecessary UI complexity that was already flagged as a
future gap in `DESIGN.md`: a 3-tab switcher that only ever needed to
show one option preemptively costs more attention than it returns.

**Why remove instead of hide:** a hidden-but-present multi-vertical
data model would leave dead code, a `Vertical` type wider than its
only real use, and Tagalog translation upkeep for verticals nobody can
select — real maintenance cost for a reversibility benefit that's
already fully covered by version control and the archive folder above.
Reversing this later means re-adding two union members and rebuilding
two small tab components, not recovering lost work.

## Consequences

- `docs/business/decisions/0004` is **not** rewritten or deleted — it
  stays as the historical record of the original multi-vertical
  reasoning, per this project's own append-only decision-record rule.
  This decision (0038) is what future readers should check for
  "why isn't service/resale here anymore."
- `competitive-landscape.md`'s comparison table needs its "one account
  across all three verticals" row re-evaluated — it's no longer true
  of Amore Cost itself, so it drops from "our edge" to a documented
  fact about what used to be true. Updated in the same pass.
- CSV export (`src/lib/csv.ts`) still writes a `vertical` column —
  harmless (always "food" now), left as-is rather than removing a
  column for no functional gain.
- No data migration needed: Phase 1 validation never ran, so there is
  no real user data with `vertical: "service"` or `"resale"` in the
  wild to worry about breaking.
- 159 tests still pass unchanged in count (one test's fixture value
  changed from `"service"` to `"food"` in `templates.test.ts`, testing
  the same behavior); `tsc`/`build` clean.
