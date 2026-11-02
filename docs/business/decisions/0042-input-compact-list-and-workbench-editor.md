---
number: 0042
date: 2026-11-01
status: accepted
supersedes: 0028 (in part — the cost-line columns)
---

# Input: compact recipe list and a "workbench" Edit & Breakdown

## Context
The owner found the Input page's output too large. Each recipe was a
tall card, about 350 px, so three recipes filled a laptop screen. Edit &
Breakdown opened on three big stat cards, then Cost composition,
Servings and Advanced settings. The ingredient table, the part people
actually edit, came last. It had 12 columns (decision 0028 copied the
reference app's columns), so it overflowed sideways in the modal and
cut off the line cost. For library-linked lines, five of those columns
showed only "—", and each row stacked a link dropdown, a name box and a
"Converted to…" note.

The owner asked for the ingredient costing to feel like the reference
(https://food-cost-tau.vercel.app/), with a different UX, not a copy.
The reference puts recipe fields in a top row, then four stat tiles,
then a full-width table with every package column, and Save/Cancel
buttons.

## Decision
**Recipe list:** one compact row per recipe in a single card:
- name, servings, ingredient count and target badge;
- cost per serving;
- food cost % with a small meter (green inside 28–32%, red above);
- suggested price;
- a ▾ toggle and an Edit breakdown button.

The ▾ shows the ingredient costs inline, plus Duplicate and Delete. On
phones each row stacks: name and price, then cost and food cost.

**Edit & Breakdown, our own layout:**
- **Fixed header:** the recipe name as a large inline-editable title,
  with Servings and Target margin as small chips beside it.
- **Main area:** the ingredient list (`IngredientLines` in
  `CostForm.tsx`), with 6 columns instead of 12:
  - ingredient, qty, unit, yield %, unit cost, and line cost with a
    small share-of-cost bar labelled "N% of cost" (2026-11-02: the
    unlabelled % was being read as a yield; unit cost is the as-bought
    price, and the yield's extra shows as "+₱X waste" under the Yield
    box);
  - **one name field that also links to the library:** typing or
    picking an Ingredient Library name links the line (a green
    "Library" chip shows it), and editing the name away unlinks it.
    This replaces the separate link dropdown;
  - **package fields fold away:** supplier, pack price, qty per pack,
    pack unit and shipping only apply to unlinked lines, so they sit in
    a per-row "+ Pack price" drawer. When set, the drawer button
    summarises them ("Pack price: ₱25.00 / 50 g").
- Under the list: "Other costs per serving" (labor hours, rate,
  packaging, overhead) on one row, then the collapsed Advanced pricing
  settings.
- **Price panel:** a slim column to the right (`PriceSummary`), sticky
  while scrolling. It replaces StatCards, CostComposition and
  BatchCard. It shows the suggested price with the rounding select and
  Senior/PWD price, cost per serving, food cost % on a meter with the
  28–32% band, profit with margin and markup, a thin composition bar,
  and batch totals when servings > 1.
- **On phones** the price panel comes after the ingredients, and the
  footer shows a live mini price ("₱299.00 · 30.0% food cost") beside
  Done.
- **Footer:** "Saved automatically" plus Done. There is still no Save
  button, because editing live-saves (0036). Escape now closes the
  modal.

## Why
- **The table is the job.** Editing quantities and yields is what
  people come here for, so it gets the main area. The price, the
  answer, stays visible next to it instead of above it, so every
  keystroke's effect is seen without scrolling. The reference keeps
  stat tiles on top; a side rail is the deliberate difference.
- **Fewer columns:** 12 columns didn't fit a modal. Most lines are
  linked or simple, so five package columns full of "—" were noise.
  The drawer keeps pack pricing one tap away for the lines that need it.
- **One name field:** a separate link dropdown above a disabled name
  box was two controls for one idea. Exact-name linking reuses the
  library people already built.
- **Rows instead of cards:** an owner with 30 dishes needs to scan
  price and food cost down a column, and cards made that a scroll.

## Consequences
- `StatCards.tsx`, `CostComposition.tsx` and `BatchCard.tsx` are
  deleted. `PriceSummary.tsx` is the stat pattern now.
  `CostForm.tsx` exports `IngredientLines` and `OtherCosts`.
- **Behavior change:** a linked line's name is now editable, and typing
  in it unlinks the line. The line keeps its last amount, so the cost
  doesn't jump, and the Library chip disappears so the change is
  visible. Retyping a library name relinks it.
- **The cost math is untouched:** the same `recompute()` and
  `syncCostItem` agreement, and 184 tests still pass. Remaining
  verification: live checks in EN/TL, light/dark, at 1440, 1280, 390
  and 360 px.
- **Not done:** Pressing Enter in the New recipe box doesn't submit
  (pre-existing; the box isn't a `<form>`). The reference's printable
  recipe card is still backlog 13.
