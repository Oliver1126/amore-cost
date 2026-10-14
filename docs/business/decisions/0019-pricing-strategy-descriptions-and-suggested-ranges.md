---
number: 0019
date: 2026-08-19
status: accepted
---

# Costing & Pricing explains what Margin %, Markup %, and Fixed profit actually mean, plus a suggested starting range

## Context
Oliver asked for a description of *why* each pricing strategy exists
and a suggested percentage to use — the three options (Margin %,
Markup %, Fixed profit) were previously just three unlabeled buttons
with a bare number input, no explanation of what any of them actually
compute or why someone would pick one over another.

## Decision
- `StrategyCard.tsx` now shows a one-line description under the
  percent input, specific to whichever strategy is selected — plainly
  stating that margin divides profit by *price* and markup divides the
  same profit by *cost*, which are never the same number for the same
  peso profit (a real, common source of small-business pricing
  confusion, not a subtlety this app should paper over).
- A **suggested range**, specific to the item's business type (Food &
  beverage / Service / Resale), shown next to a **"Use suggested"**
  quick-fill button — same one-click-apply pattern as the OPEX →
  Overhead estimator (decision 0018), never automatic.
- New `SUGGESTED_MARGIN_RANGE` (`src/lib/calculator.ts`): food 30–40%,
  service 40–60%, resale 20–30% — common small-business rule-of-thumb
  starting points, explicitly labeled as a starting point, not a rule.
- New pure function `marginPercentToMarkupPercent(marginPercent)` — the
  suggested range converts correctly when Markup % is selected (e.g.
  food's 30–40% margin becomes ~43–67% markup), rather than showing the
  same numbers under a different label, which would have been actively
  wrong.

## Why
Oliver's direct ask. The margin/markup distinction specifically is
worth explaining rather than assuming — this product's whole premise is
helping someone price correctly instead of guessing, and silently
showing a percent field without saying which of two genuinely different
numbers it is would undercut that.

## Consequences
- **The suggested ranges are opinion, clearly labeled as such** — not
  pulled from any PH-specific dataset or the market research already in
  `docs/business/market-research.md`. They're the kind of range widely
  cited as a generic small-business starting point. If real Phase 1
  validation surfaces different numbers that actually fit this ICP
  better, these should be revised then, not treated as settled.
- **`marginPercentToMarkupPercent` is a new, tested pure function**
  (`calculator.test.ts`, 4 new tests, 96 total) — the margin↔markup
  conversion is exact math, not a guess, so it's held to the same
  correctness bar as pricing/tax logic elsewhere in this app.
- Verified live in both EN and TL, across all three strategies and two
  business-type verticals, confirming the suggested range recalculates
  correctly on both vertical switch and strategy-type switch (e.g.
  Food's margin range 30–40% correctly becomes 43–67% under Markup %,
  not a re-copy of the same numbers).
