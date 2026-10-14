# Archive: the multi-vertical era (2026-08-17 → 2026-09-03)

**What this is:** Amore Cost originally launched as one unified account
covering three business types — food & beverage, service, and resale —
via decision [0004](../../business/decisions/0004-lead-vertical-unified.md).
As of decision
[0038](../../business/decisions/0038-food-only-vertical-removed.md),
the product is **food-only**. This folder preserves the reasoning,
positioning, and copy from the multi-vertical era so it isn't lost —
if the food-only launch validates and there's ever a reason to expand
back to service/resale ("small to bigger, slowly," in Oliver's own
framing), this is the starting point, not a from-scratch rebuild.

**What's NOT archived here:** decision records themselves
(`0004`, `0037`, and everything between) stay exactly where they are in
`docs/business/decisions/` — this project's own rule is that decision
records are historical and append-only, never moved or rewritten. This
folder is for *positioning and reasoning* that lived in still-live
documents (`concept.md`, `go-to-market.md`, `competitive-landscape.md`,
`modules.md`), which have now been rewritten for food-only and would
otherwise lose the multi-vertical version entirely.

## What the multi-vertical era actually was

- **The core bet** (decision 0004): one account, three business-type
  profiles (food/service/resale), each with its own terminology
  (ingredients vs. materials vs. cost items) over the same shared
  costing/pricing engine. Chosen specifically because every SaaS
  competitor found (iCost, FoodCost, Craftybase, MarketMan) was
  single-vertical — "one account across all three verticals" was
  named in `competitive-landscape.md` as one of only 2–3 real,
  defensible differentiators against iCost specifically.
- **Who it targeted, beyond food:** service providers (events, salons,
  contractors, digital marketing — explicitly called "uncontested,"
  no PH SaaS competitor served this at all) and resellers/makers
  (Shopee/Lazada sellers, home-based crafters).
- **What it looked like in the product:** a 3-way tab switcher (Food &
  Beverage / Service / Resale) on Costing & Pricing and the "+ New
  item" flow, each changing terminology and the suggested margin range
  (service 40–60%, resale 20–30%, vs. food's 30–40%).
- **Decision 0037** (2026-09-03) had already started walking this back
  at the *marketing* layer — leading with food, disclosing service/
  resale as secondary — while keeping the product fully multi-vertical.
  Decision 0038 went further and removed it from the product itself.

## If this ever gets revisited

The fastest path back isn't re-reading this file cold — it's:
1. Re-read decision [0004](../../business/decisions/0004-lead-vertical-unified.md)
   for the original reasoning and decision
   [0038](../../business/decisions/0038-food-only-vertical-removed.md)
   for exactly what was removed and why, so the tradeoff being reversed
   is understood, not just the mechanics.
2. `competitive-landscape.md`'s "one account across all three
   verticals" differentiator claim will need re-verifying against
   whatever iCost/FoodCost look like *then* — it was already flagged
   as fragile ("a UX choice any competitor could copy in a sprint")
   even during the multi-vertical era.
3. The actual code removal (decision 0038) is small and mechanical to
   reverse — it narrowed `Vertical` from a 3-value union to 1 and
   deleted the now-single-option tab UI in two components
   (`CostForm.tsx`, `CreateCatalogModal.tsx`). Re-adding "service" and
   "resale" back to the `Vertical` type, `VERTICAL_LABELS`,
   `SUGGESTED_MARGIN_RANGE`, and their Tagalog equivalents in
   `src/lib/i18n.tsx` restores the data model; the tab UI itself would
   need to be rebuilt (it was deleted, not hidden).

## Copy preserved from the multi-vertical era

### `concept.md`'s original "Who this is for" (pre-0038)

> - Food/beverage sellers (home bakers, small carinderias, online food
>   sellers, dessert/pasalubong shops)
> - Service providers (events, salons, contractors, digital marketing,
>   freelance-adjacent services — the same ICP Atlas Freelance already
>   serves for invoicing, which is a natural cross-sell later)
> - Resellers and small retailers (buy-and-sell, online sellers on
>   Shopee/Lazada/Facebook Marketplace)
> - Home-based makers/crafters (soap, candles, resin, baked goods, apparel)

### `go-to-market.md`'s original pitch (pre-0037, further removed at 0038)

> "the only Philippine costing tool that covers food, services, and
> resale in one account." ... vs. iCost: "does your food costing *and*
> your service quotes *and* your resale margins — not just food"

### The pitch one-pager's original "Who it's for" cards (pre-0038)

> - **Services** — Events, salons, contractors, digital marketing.
>   "Labor and materials costed into a real client-ready quote — the
>   vertical most costing apps skip entirely."
> - **Resale & makers** — Shopee/Lazada sellers, home-based crafters.
>   "One place for unit cost and margin, even when you sell more than
>   one kind of thing."

### The pitch one-pager's original "Why now" edge (pre-0038)

> **One account** — "Food, services, and resale in one place — not a
> separate subscription or a separate spreadsheet for every kind of
> business you run."
