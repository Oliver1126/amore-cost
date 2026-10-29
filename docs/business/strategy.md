# Strategy

The master plan in one place — vision, objectives, SWOT, financial
summary, and risks. Where [concept.md](concept.md) argues the problem
is real and [strategic-forks.md](strategic-forks.md) explains *why*
standalone SaaS won, this file is the current, living answer to "what
are we actually doing and how could it go wrong." The staged plan that
puts this into motion is [roadmap/roadmap.md](../roadmap/roadmap.md).
See [document-inventory.md](document-inventory.md) for what else exists.

## Vision

**Revised 2026-10-28 (decision 0040 + the new roadmap):** Amore Cost is
the **pricing brain** for Philippine food businesses — home bakers,
carinderias, food carts, online food sellers. It answers the question
every one of them asks before they ever need a POS: *"Magkano dapat ang
presyo ko?"* — true recipe cost, a defensible suggested price, VAT and
Senior/PWD done correctly, overhead per dish, break-even. It
deliberately does **not** run the store (checkout, stock, utang, staff,
branches); POS apps such as KwentaPOS, Loyverse, and UTAK do that, and
Amore Cost positions as the tool you price in *before* you type prices
into whichever POS you use. See
[competitive-landscape.md](competitive-landscape.md) for the wedge and
[kwentapos-comparison.md](kwentapos-comparison.md) for the line drawn
against POS apps.

History: the vision previously led with an uncontested service-costing
lane and multi-vertical breadth (retired at
[decision 0038](decisions/0038-food-only-vertical-removed.md), archived
in [docs/archive/multi-vertical-2026-08/](../archive/multi-vertical-2026-08/README.md)),
then with an 11-module "whole business OS" (cut to five pages at
[decision 0040](decisions/0040-five-pages-modeled-on-reference.md); the
full version is the `v1-full-11-modules` git tag).

## Objectives

- **Now (roadmap Stage 0–1):** deploy the current build (the live site
  at https://amore-cost.vercel.app predates decisions 0040/0041), add
  analytics and a feedback link, then validate with 20 real food owners
  against a gate set in advance. This is overdue, not just next — see
  [next-steps.md](../next-steps.md).
- **Next, conditional on validation (Stages 2–3):** a content engine,
  then optional accounts with cloud sync and a paid **Plus** tier
  (test ₱99/mo) — see the roadmap. Not worth building on spec.
- **Later (Stages 4–5):** the live ingredient price index, POS-export
  partnerships, institutional partners (DTI Negosyo Centers, culinary
  schools), and revisiting the PH Business Network partnership
  (Fork 3).

## SWOT

**Strengths**
- A focused five-page product that does pricing deeper than the POS
  apps advertise: suggested price, VAT/Senior-PWD/service-charge math
  (RA 9994/10754, RA 11360), OPEX per dish, break-even and a P&L
  simulator, yield %, menu price rounding (decision 0041).
- Free, no signup, English + Tagalog, one-click sample recipes — the
  lowest-friction first touch in this market.
- Effectively zero infrastructure cost (local-only, no backend).
- A real Vitest suite (184 tests) over the pricing, receipt, and
  simulator math.

**Weaknesses**
- **Zero real-user validation**, despite a built product — still the
  single biggest weakness by far.
- Data lives in one browser (`localStorage`); a cleared browser loses
  every recipe unless the owner downloaded a backup. No sync.
- No accounts, no payment, and the paid tier is a hypothesis
  (roadmap Stage 3), not a tested offer.
- Solo founder across several ventures.

**Opportunities**
- Catch owners at the *start* of their journey (pricing a first menu),
  before they need a POS — see the roadmap's Move 2.
- Partner with POS apps instead of competing: CSV price-list export in
  Loyverse/KwentaPOS/UTAK formats, referral swaps.
- A live PH ingredient price index (public DA price monitoring +
  anonymized owner prices) — a network-effect moat POS apps aren't
  built to pursue.
- Content into an audience that already searches "magkano dapat ang
  presyo" (see [go-to-market.md](go-to-market.md)).
- PH Business Network partnership (Fork 3); DTI/LGU livelihood
  programs and culinary schools as distribution.

**Threats**
- POS apps that already cost recipes — KwentaPOS (Pro, ₱299/mo) shows
  food cost and margin per item — could add VAT/Senior-PWD pricing
  depth and close the gap.
- iCost (₱299–599/mo) owns food costing mindshare with real traction.
- This market may only accept one-time pricing, not subscriptions —
  still untested (see `concept.md`).
- Solo-founder bandwidth: sustaining content, support, and billing is a
  different commitment than shipping code.

## Financial summary (draft, unvalidated)

- **Cost structure today: near-zero.** Vercel free tier, no backend, no
  team beyond the founder.
- **Revenue model: a hypothesis to test, not a decision.** The roadmap
  proposes free-forever for everything the app does on one device, and
  a paid **Plus** tier (test ₱99/mo or ₱899/yr, plus a one-time
  "Lifetime Starter" with early users) for cloud sync, price alerts,
  history, a branded PDF menu, and delivery-app pricing.
- No real financial model exists yet — building one before validation
  would be modeling fiction. Scenarios and decision order are in
  [financial-strategy.md](financial-strategy.md).

## Risks

1. **Building ahead of validation** — this project has done it
   repeatedly (v0, all of v1+v2, the 11-module build). More product
   does not reduce this risk; only real user contact does.
2. **Drifting back into POS features** — the KwentaPOS gap list
   (checkout, stock, utang, shifts, branches) is tempting and is
   exactly the crowded fight decision 0040 walked away from.
3. **Data loss before sync exists** — an owner who loses recipes to a
   cleared browser loses trust; mitigated today only by Backup/Restore
   on the Dashboard.
4. **The name isn't cleared yet** — domain, social handles, and an
   IPOPHL trademark search are still outstanding, see
   [branding/options.md](../branding/options.md).
