---
number: 0033
date: 2026-09-02
status: accepted
supersedes:
---

# Progressive disclosure for terminology — Costing & Pricing showed too much at once

## Context

Direct feedback: Costing & Pricing had too much always-visible
information for a first-time owner — full paragraph explanations of
Margin % vs. Markup % vs. Fixed profit (decision 0019), no explanation
at all of VAT vs. Percentage Tax vs. Custom tax, and a 10-column
package-pricing table (decision 0028) with no explanation of which
columns matter when. The math was always correct; the page was
teaching a full pricing vocabulary whether or not the owner needed it
in that moment.

## Decision

Built a reusable `InfoButton` component (`src/components/InfoButton.tsx`)
— a small "?" that reveals a short explanation on click, closes on an
outside click or Escape. Applied it in three places on Costing &
Pricing:

- **StrategyCard** — the always-visible margin/markup/fixed-profit
  description paragraph is now behind the "?" next to "Price using."
  The suggested-range line and "Use suggested" button stay visible —
  that's actionable data, not a definition.
- **TaxCard** — a new explainer (VAT vs. Percentage Tax vs. Custom, in
  plain language, pointing at BIR registration as the real source of
  truth) behind the "?" next to "Tax." The existing dynamic footer
  note ("VAT (12%) is added on top...") stays as-is — short and
  contextual, not a jargon dump.
- **CostForm's cost-line table** — one explainer behind the "?" next
  to the "Ingredients"/"Materials"/"Cost items" legend, covering the
  whole package-price → unit-cost pipeline (Package price, Qty per
  pack, Shipping fee, Pack unit, Portion qty/unit, and what "AUTO"
  means) in one place, rather than one icon per column header.

No pricing logic changed — this is purely what's visible by default
vs. available on demand.

## Why

The existing precedent in this exact file (`costForm.overheadCalcShow`/
`overheadCalcHide`, decision 0018's "Estimate from OPEX" toggle) already
proved this pattern works here: hide the advanced/explanatory part
behind a click, keep the default view clean. This extends that same
idea to *definitions*, not just optional calculators. One button per
concept cluster (not one per table column) — a column-by-column swarm
of icons on a 10-column table would trade one kind of clutter for
another.

## Consequences

- Costing & Pricing's default view is shorter — the strategy card lost
  a full paragraph, the tax card gained a "?" for a previously-absent
  explanation, and the cost-line table gained one central explainer
  instead of relying on column headers alone.
- `InfoButton` is now a shared component — worth reaching for on any
  other page carrying jargon-without-explanation, rather than
  reinventing a tooltip pattern each time. Multi-Channel Pricing's fee
  concept and Break-Even's contingency % are reasonable next
  candidates if similar feedback comes up there.
- No test coverage added — this is presentational only, no new pure
  logic to test; verified live instead (EN/TL, light/dark, open/close/
  outside-click/Escape behavior).
