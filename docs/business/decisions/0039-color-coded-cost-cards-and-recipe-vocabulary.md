---
number: 0039
date: 2026-09-03
status: accepted
supersedes:
---

# Color-coded cost/price/profit cards, and food-specific vocabulary app-wide

## Context

Oliver shared a detailed redesign brief for the Costing & Pricing
screen (a "Costing & Breakdown" mockup — bright-colored metric cards
for cost/price/profit, restaurant vocabulary like "Recipe Name,"
"Portions Yield," "Direct Cost," "Food Cost %"). Two real forks needed
resolving before touching anything:

1. The brief's yellow/purple metric-card colors don't exist anywhere
   in Amore Cost — it's a 2-tone system (green accent, red for
   problems), consistent across every page. Introducing them without
   a plan would either clash or require a bigger palette decision.
2. The brief's exact vocabulary ("Direct Cost," "Food Cost %") is
   restaurant-industry jargon more specific than Amore Cost's existing
   generic terms — worth checking whether to adopt verbatim, adapt, or
   leave alone.

Oliver's answers: substitute orange + blue for the brief's yellow +
purple (delegated the exact hex choice), and use "alternative names
related to the app [being] food only" rather than the brief's literal
restaurant terms — i.e., rename for food-specificity, in Amore Cost's
own voice, not a copy of the brief's exact words.

## Decision

**Two new permanent design tokens**, `globals.css`, both themes:
`--warn`/`--warn-soft` (amber-orange — cost emphasis) and
`--info`/`--info-soft` (calm blue — the profit/serving metric).
Exposed via Tailwind's `@theme inline` block as `warn`/`info`
utilities, same pattern as the existing `accent`/`bad` tokens.

**Applied to `StatCards.tsx` and `BatchCard.tsx`** for a coherent color
language across both the per-serving and batch-total views: cost is
always orange, price/revenue stays green (unchanged), profit is
always blue (was unstyled/plain text). This mirrors the brief's intent
(distinct, prominent color-coding per metric) without introducing a
clashing yellow/purple pair or a dark-only page.

**Vocabulary renamed app-wide, not just this screen** (~35 `STRINGS`
keys, EN+TL, plus 2 hardcoded strings in `BatchCard.tsx`/`catalog/page.tsx`):
- "Item" → **"Recipe"** (the generic noun for a costed thing —
  `common.item`, "+ New item" → "+ New recipe," "New catalog item" →
  "New recipe," every "save an item"/"that item doesn't exist" string)
- "Batch size" → **"Servings"** (and its unit suffix, "N units" →
  "N servings")
- "True cost" → **"Recipe cost"**
- "Profit per unit" → **"Profit per serving"**
- "What are you pricing?" → **"What recipe are you costing?"**

**Deliberately not renamed:** pricing-strategy terms (Margin %/
Markup %/Fixed profit) and module/page names (Costing & Pricing,
Catalog Management, etc.) — the brief's "Food Cost %" is mathematically
identical to the existing Margin % (Food Cost % = 100 − Margin %), so
adopting it verbatim would mean removing the Markup %/Fixed-profit
strategy options entirely, a functional regression nobody asked for,
not a rename. Kept Margin % as the one already explained via
`InfoButton` (decision 0033).

**Not rebuilt:** the ingredient cost-line table. Cross-checked against
the brief's exact column list (Ingredient Name, Supplier, Package
Price, Pack Qty, Shipping, Pack Unit, Portion Qty, Portion Unit, Unit
Cost, Line Cost) — decision 0028 already built this exact table. No
changes needed there.

## Why

The brief's core ask — distinct, prominent color-coding per financial
metric, and food-specific language throughout — is a real, reasonable
design improvement, achievable without a page rebuild since the
underlying data (per-serving cost, batch totals, price, profit) and
table structure already existed. Renaming app-wide rather than one
screen keeps the product internally consistent — a user seeing
"Recipe cost" on Costing & Pricing and "True cost" on Overview would
read as a mistake, not a design choice. Keeping the Light/Dark/Auto
toggle and existing accent green (rather than a dark-only page with a
new primary color) avoids repeating the exact tension already resolved
once this session: Costing & Pricing must still look and behave like
every other page in the same dashboard shell.

## Consequences

- 159 tests unaffected — none were coupled to the renamed UI copy;
  `tsc`/`build` clean.
- Any future page introducing a "warning" or "informational" visual
  state (distinct from `accent`/`bad`) should reach for `--warn`/
  `--info` now that they exist, rather than inventing a third pair —
  `DESIGN.md` §4 previously flagged the lack of a third semantic tone
  as a named gap; this closes it.
- `DESIGN.md` should be updated to reflect the now-4-tone palette
  (`accent`, `bad`, `warn`, `info`) the next time it's revisited —
  not done in this pass, since this decision record is the source of
  truth until then.
- Anywhere still reading "item"/"batch size"/"true cost"/"profit per
  unit" going forward is a real inconsistency to fix, not a stylistic
  choice — the grep-verified rename covered `src/lib/i18n.tsx` and
  hardcoded component strings, but any *new* code should use the
  renamed vocabulary from the start.
