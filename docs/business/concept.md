# Business concept

## The problem

Filipino small-business owners — food sellers, service providers,
resellers, home-based makers — routinely **underprice their own
products** because they never separated their true cost (ingredients,
materials, labor, overhead, packaging) from the price they charge. The
two reference products you shared are direct evidence of this:

- [Small Business Service Costing Calculator](https://www.raket.ph/phbusinessnetwork/products/small-business-service-costing-calculator-google-sheets?src=share) —
  built explicitly for people "tired of underpricing and wondering why
  there's no profit left."
- [Small Business Food Costing Calculator](https://www.raket.ph/phbusinessnetwork/products/small-business-food-costing-calculator-google-sheets?src=share) —
  "trusted by 2,000+ food business owners," same underlying problem for
  F&B sellers specifically.

Both are Google Sheets templates by JR Quilantang (PH Business Network,
160K+ members) sold as **one-time purchases**. See
[market-research.md](market-research.md) for the full competitive
picture — **correction as of 2026-08-17:** someone *has* already turned
the food-costing half into a real, live, peso-priced SaaS with real
traction ([iCost](https://icost.ph/)) — see market-research.md's "Direct
PH SaaS competitors" section before assuming this is unbuilt. The
service-costing half still looks open.

## Who this is for

**Primary ICP, as of [decision 0038](decisions/0038-food-only-vertical-removed.md):**
Filipino food business owners running on manual tools —
- Home bakers (cakes, pastries, made-to-order desserts)
- Small carinderias and eateries
- Online food sellers (pasalubong, home-based food business,
  delivery-only)
- Dessert/pasalubong shops

They are past "hobby" stage — real recurring sales, real recurring
costs — but not big enough to justify enterprise inventory/costing
software priced in USD.

**Service providers and resellers were the ICP through 2026-09-03**
(decisions 0004 → 0037), when the product was unified across food,
service, and resale in one account. Decision 0038 narrowed the product
itself to food-only, not just the marketing — see
[docs/archive/multi-vertical-2026-08/](../archive/multi-vertical-2026-08/README.md)
for the original reasoning and copy, kept for a possible future
re-expansion once food-only validates.

## Why static templates aren't enough

A spreadsheet is a *snapshot*, not a *system*. Concretely:

1. **No propagation.** When flour, eggs, or a supplier's rate goes up,
   the user has to manually find and edit every recipe/service that uses
   that input. A single shared "ingredient/material" costed once and
   reused everywhere is the single biggest upgrade a real app offers
   over a sheet.
2. **No history.** You can't see that your margin on your bestseller
   quietly eroded over three months as ingredient costs crept up — the
   sheet only ever shows "now."
3. **No shared ingredient cost across recipes.** A spreadsheet recipe
   is its own island — raise the price of flour, and there's no way
   to see every other recipe using flour without opening each sheet by
   hand. A real app can cost an ingredient once and reuse it
   everywhere.
4. **No mobile-friendly, no collaboration.** A sheet doesn't work well
   thumb-typed at a market stall, and sharing edit access with a
   partner/bookkeeper is clunky and risks someone breaking a formula.
5. **One-time purchase = no incentive to keep improving it.** The
   creator's business model is selling more templates to more people,
   not compounding value for existing users — which is exactly the gap
   a subscription SaaS is built to fill (and exactly the reason it can
   sustain ongoing development, unlike a ₱500 one-time sheet).

## The differentiator (draft positioning — revised 2026-09-03)

**"The costing calculator that updates itself"** is no longer a unique
claim for food costing — iCost already does this, at ₱299–599/month,
with 500+ users and a 4.9/5 rating (see market-research.md). It's still
an accurate differentiator *against the static Google Sheets templates*.
Peso-first, BIR-aware (VAT / Non-VAT / 8% flat toggle — same logic
Atlas Freelance already built for its tax estimate) still holds. As of
[decision 0032](decisions/0032-insights-engine-calculator-to-advisor.md),
the sharper remaining edge is the Insights engine — specific
recommendations (why a recipe's margin slipped, which dish carries most
profit, when stock is about to run out), not just a recalculated
number — something no competitor found in `competitive-landscape.md`
does yet.

## Open questions to validate before building

- Is the willingness to pay *monthly* actually there, or does this
  market only accept one-time pricing? (Worth testing directly — maybe
  a low one-time "starter" price unlocks a free tier, with the paid
  monthly tier selling *automation* — price-update propagation, history,
  multi-user — as the upgrade reason.)
- ~~Which vertical to lead with~~ — **resolved twice:** unified food +
  service + resale first
  ([decision 0004](decisions/0004-lead-vertical-unified.md)), then
  narrowed to food-only
  ([decision 0038](decisions/0038-food-only-vertical-removed.md)) as a
  deliberate small-to-bigger staged rollout, not a reversal made
  lightly — see 0038 for the tradeoff accepted in making that call.
- Distribution: PH Business Network's 160K-member community is the
  obvious first channel to reach this exact ICP — but it's also where
  the competing template is sold, so positioning needs to be "the
  upgrade path from the sheet you already bought," not a direct
  frontal attack.
