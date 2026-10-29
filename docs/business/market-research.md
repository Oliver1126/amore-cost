# Market research

The research trail — how each finding below was found, including the
correction where an earlier pass got it wrong. For the crisp,
current-state comparison and "the wedge" without the narrative, see
[competitive-landscape.md](competitive-landscape.md) instead.

> **Read with dates in mind.** Sections dated 2026-08-17 reason from
> the multi-vertical product (food + service + resale), retired at
> decision 0038, and from an 11-module app, cut to five pages at
> decision 0040. They stay as the trail. The current answer is in
> competitive-landscape.md and the
> [roadmap](../roadmap/roadmap.md); the newest finding (POS apps that
> cost recipes) is at the bottom of this file.

## Direct reference products (the ones you shared)

Both by **JR Quilantang**, founder of **PH Business Network** (160K+
members) and CEO of Recurra:

| Product | Covers | Model | Signal |
|---|---|---|---|
| [Service Costing Calculator](https://www.raket.ph/phbusinessnetwork/products/small-business-service-costing-calculator-google-sheets?src=share) | Labor, materials, overhead → markup %, margin %, or fixed peso profit target; VAT + discount handling; monthly break-even; client-ready quote docs | One-time purchase, Google Sheets | Targets events, consulting, salons, contracting, digital marketing |
| [Food Costing Calculator](https://www.raket.ph/phbusinessnetwork/products/small-business-food-costing-calculator-google-sheets?src=share) | Ingredient/product cost analysis, profit margin targets, VAT, discounts, OPEX tracking, order simulation | One-time purchase, Google Sheets | "Trusted by 2,000+ food business owners" |

Neither publishes its price on the public listing page, but the
category norm on this marketplace (see below) runs roughly
**₱200–₱1,000 one-time**.

## The wider Raket.ph marketplace for this category

A single search turns up a whole cluster of competing sellers making
near-identical products — this is not a one-seller niche, it's an
established, multi-vendor product category with real recurring buyer
demand and zero recurring-revenue businesses in it:

- Small Business Pricing Calculator (brightsidedigital)
- Digital Product Pricing Calculator (sparklabdigitalacademy)
- Product Pricing Calculator V1 and V2 (jelscreativestudio)
- Pricing & Product Costing Spreadsheets (digitalsbambi)
- Product Costing Calculator (eya_gab02)
- Sales Inventory Tracker + Price and Profit Calculator (plancontent)

**Read on this:** every one of these is a static template sold once.
Nobody *in this specific Raket.ph cluster* has built a logged-in web app
with saved data, auto-recalculation, or a subscription. But see the next
section — that doesn't mean no one anywhere has; two real PH SaaS
competitors exist outside this cluster.

## Direct PH SaaS competitors (corrected 2026-08-17 — read before trusting "Where this leaves the opportunity" below)

An earlier pass of this research concluded "no SaaS exists in this gap."
That was wrong — a more targeted search turned up two real, live,
peso-priced products:

| Product | Covers | Pricing | Traction |
|---|---|---|---|
| [iCost](https://icost.ph/) | Food costing only (recipes, ingredients, labor, overhead), real-time inventory with low-stock alerts, a "Cook & Deduct" auto-inventory-adjustment feature, AI recipe search, supplier price comparison | Free (1 recipe) / Plus ₱299/mo / Premium ₱599/mo, 7-day trial, no card required | 500+ food businesses, 10,000+ recipes costed, 4.9/5 rating, claims 23% average margin improvement |
| [FoodCost](https://food-cost-tau.vercel.app/) | Food costing, OPEX tracking, a POS receipt simulator with PH tax rules (12% VAT, Senior/PWD discounts) built in, dish profitability, inventory/supplier management, CSV export | Requires account signup; pricing not published, has a demo account | Less polished/marketed than iCost — no credited team, generic `vercel.app` domain — possibly an indie or soft-launched build, but functionally real and live |

**This directly overlaps the food-costing half of the original two
reference calculators** — iCost in particular already does the exact
auto-recalculating-cost mechanic this idea treated as its core
differentiator, at real peso pricing, with genuine user traction and a
4.9/5 rating. Competing head-on against iCost specifically in food
costing would mean out-executing an incumbent with 500+ users and a
strong rating, not filling an empty gap.

**What's still open:** iCost is explicitly food-only — "not designed
for service-based enterprises," per its own site. No PH-specific SaaS
competitor turned up for the *service*-costing vertical (events,
consulting, salons, contracting — the other original Raket.ph
reference calculator), nor for a single tool unifying food + service +
retail/resale costing in one place. Those two angles are the more
defensible wedge now, not "costing SaaS doesn't exist yet" in general.

## Your actual edge vs. iCost/FoodCost specifically (added 2026-08-17)

Being honest about what iCost and FoodCost already match, so positioning
doesn't lean on a claim a prospect can disprove in one Google search:

**No longer a differentiator** (both already do this):
- "Auto-recalculating costs" — iCost's Cook & Deduct already links
  ingredients to recipes and updates automatically.
- "Peso-priced, PH-aware" — both are ₱-denominated; FoodCost has PH tax
  (12% VAT, Senior/PWD) built in.
- "A real app, not a spreadsheet" — both are live, working SaaS.

**Still a real edge, in order of how defensible it is:**
1. **Service-costing coverage.** Neither competitor touches
   events/consulting/salons/contracting-style costing — iCost states
   outright it's not built for service businesses. This is the one
   genuinely uncontested lane found in this research.
2. **One account across food + service + resale**, instead of iCost's
   food-only scope plus a separate tool (or a separate Raket.ph
   spreadsheet) for anything else. Real for a user who runs more than
   one type of business at once; not a differentiator for someone who
   only ever needed food costing (they'd probably just use iCost).
3. **Zero-signup, try-it-in-two-minutes entry**, the same wedge that
   worked for Atlas Freelance's Phase 1. iCost is account/app-based from
   the first tap; nothing found suggests either competitor lets someone
   run a real calculation with no signup at all.
4. **Ecosystem tie-in with Atlas Freelance** — a service provider who
   quotes a job here and turns it straight into an Atlas Freelance
   proposal/invoice is a workflow no standalone competitor (iCost,
   FoodCost, or any Raket.ph template) can offer, since none of them are
   part of a wider suite. Unique to this specific founder's position,
   not copyable by a new entrant.
5. **Pricing/packaging** — a more generous free tier or a lower paid
   price than iCost's ₱299–599/mo is possible but weak as a durable
   moat on its own; iCost can just match a price cut.

## International SaaS in the adjacent category (costing/inventory)

These serve the same underlying job (know your true cost, protect your
margin) but for larger, non-PH businesses:

| Product | Price | Who it's for |
|---|---|---|
| [Craftybase](https://craftybase.com/recipe-costing-software) | From $49/mo (~₱2,800/mo) | Makers/artisans — raw materials, production costing, inventory |
| [MarketMan](https://www.marketman.com/platform/recipe-costing-software) | From $199/mo (~₱11,000/mo) | Restaurant/food-service inventory + recipe costing at scale |
| PlateIQ | Custom/enterprise | AP automation + food cost tied to purchasing, restaurant chains |

These validate the *feature set* worth building toward (auto-updating
ingredient costs, recipe-level margin visibility, inventory tie-in) but
are priced and positioned for a completely different buyer — a US
restaurant group, not a home baker or a one-person events business in
Cebu. None of them think in pesos, BIR tax categories, or GCash-era
small-business realities.

## Where this leaves the opportunity (revised 2026-08-17)

The general pattern Atlas Freelance proved out — spreadsheets/templates
at one-time PH-budget prices vs. enterprise SaaS priced in USD, nothing
in between — still holds for **service-costing** specifically: no
PH-peso SaaS competitor was found for events/consulting/salons/
contracting-style pricing. It no longer holds cleanly for **food
costing**, where iCost already occupies the "peso-priced, PH-aware,
recurring SaaS" position this idea assumed was empty.

Two honest paths were on the table; **resolved 2026-08-17 in
[decisions/0004](decisions/0004-lead-vertical-unified.md): unified food
+ service + retail**, making "does all three, iCost does only food" the
explicit differentiator against a named incumbent. This is the harder
pitch to validate — it only works if a real target user actually runs
more than one of these business types at once — so validation
needed to test that directly rather than assume it. (Moot since
decision 0038 narrowed the product to food-only.)

## Distribution channels worth testing first

- PH Business Network itself (160K members) — same audience, though
  care needed on positioning (see business-concept.md's open questions)
- The same PH freelancer/small-business Facebook groups, r/phcareers,
  and OnlineJobs.ph-adjacent communities Atlas Freelance used for its
  Phase 1 validation — likely material overlap in who's in both rooms
- TikTok/short-form: JR Quilantang and Recurra already run educational
  business content there — a proof that this ICP is reachable and
  responsive to creator-led financial-literacy content, not just ads

## POS apps now cost recipes too (added 2026-10-28)

A new category of competitor: **PH cloud POS apps with recipe costing
built in.** [KwentaPOS](https://www.kwentapos.com/) (₱59 / ₱299 /
₱999 per month, PWA, offline, GCash/Maya/utang) sets up ingredients
and recipes per dish, deducts stock as you sell, and shows "food cost
and margin per menu item" — on its Pro plan (₱299) and up. Its pages
don't mention VAT, Senior/PWD, service charge, expenses, or a
suggested-price engine, and never mention BIR accreditation. Loyverse,
StoreHub, and UTAK occupy the same "run the store" space. Full
line-by-line, with what Amore Cost should and shouldn't copy:
[kwentapos-comparison.md](kwentapos-comparison.md).

What this changes: the defensible lane is no longer "costing exists
nowhere" (wrong since iCost) or "multi-vertical" (retired at 0038) —
it's **pricing depth and PH compliance, positioned as the step before
any POS**, with a live ingredient price index as the moat to build.
That's the strategy in [../roadmap/roadmap.md](../roadmap/roadmap.md).

