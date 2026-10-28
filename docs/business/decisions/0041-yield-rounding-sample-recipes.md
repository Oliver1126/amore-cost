---
number: 0041
date: 2026-10-28
status: accepted
supersedes:
---

# Add yield %, menu price rounding, and one-click sample recipes

## Context

After the cut to five pages (0040), Oliver asked what was still missing.
The audit (`roadmap/backlog.md`, "Feature gaps") ranked fifteen gaps;
he approved building the top three: a demo kitchen, yield/waste %, and
menu price rounding. All three are about the app's one job — pricing a
dish correctly — not about adding pages.

## Decision

1. **Yield %** — optional `yieldPercent` on `CostItem`, clamped 1–100,
   blank = 100. `lineCost()` = `amount` × 100 ÷ yield and is what
   `materialsCost` sums. `amount` keeps meaning "what I paid for this
   quantity," so the ingredient cascade (which rewrites `amount`) and
   yield never fight.
2. **Rounding** — optional `priceRounding` on `CalculatorState`
   (`none | 1 | 5 | 10 | 9`), applied to the *customer* price; pre-VAT
   price, VAT and profit are backed out of the rounded figure.
   `foodCostPercent` now reads `computePriceBreakdown().priceBeforeTax`
   so it follows rounding. The control sits on the always-visible
   Suggested price card, not inside the collapsed Advanced Pricing
   Settings.
3. **Sample recipes** — `src/lib/demo.ts`, ids prefixed `demo-`, loaded
   only by an explicit click; writes localStorage and reloads (same as
   Restore backup) because each page holds its own copy of the keys.

## Why

- **Rounding is always up.** Rounding down silently sells below the
  margin the owner picked; a ₱0.03 overshoot is the safe direction.
- **Back out from the rounded price** so the receipt simulator, profit
  card and food cost % all agree with what's on the menu board — a
  rounding that only changes the displayed price would make the profit
  number a lie.
- **Never auto-insert sample data, never overwrite real OPEX, never
  delete a demo ingredient the owner linked into their own recipe** —
  sample data that can damage real data is worse than none.
- Unset fields behave exactly as before, so every saved recipe and
  backup reads unchanged (all 165 pre-existing tests passed untouched).

## Consequences

- An empty app is now explorable in one click — useful for Phase 1
  validation demos.
- Yield is per recipe line, not per Ingredient Library entry: the same
  chicken can have different yields in adobo vs. tinola. A library-level
  default would be a later convenience.
- Rounding is per recipe; there is no app-wide default yet.
