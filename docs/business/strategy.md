# Strategy

The master plan in one place — vision, objectives, SWOT, financial
summary, and risks. Where [concept.md](concept.md) argues the problem
is real and [strategic-forks.md](strategic-forks.md) explains *why*
standalone SaaS won, this file is the current, living answer to "what
are we actually doing and how could it go wrong." See
[document-inventory.md](document-inventory.md) for what else exists.

## Vision

**Revised 2026-09-03 ([decision 0038](decisions/0038-food-only-vertical-removed.md)):**
Amore Cost becomes the default place Philippine food business owners —
home bakers, carinderias, online food sellers — go to know their true
recipe cost and set a price they can defend, starting narrow and
deliberately staged (small to bigger, once food-only validates) rather
than fighting a well-rated incumbent (iCost) head-on with breadth
alone. The original vision led with an uncontested service-costing
lane and a multi-vertical structural edge — both real, both now
retired from the product itself, preserved in
[docs/archive/multi-vertical-2026-08/](../archive/multi-vertical-2026-08/README.md).
See [competitive-landscape.md](competitive-landscape.md) for what's
actually left to differentiate on now.

## Objectives

- **Now:** validate demand with real business owners. This is
  overdue, not just next — see [next-steps.md](../next-steps.md) and
  [roadmap/roadmap.md](../roadmap/roadmap.md). The product has outpaced
  validation twice already (decision 0006).
- **Next, conditional on validation:** real accounts and a backend —
  the fix for Multi-User's lack of real security and for Inventory/
  Margin Alerts' per-item (not per-ingredient) simplification. Not
  worth building on spec; see
  [product/scope-v1.md](../product/scope-v1.md)'s open pricing/gating
  question.
- **Later:** revisit the PH Business Network partnership (Fork 3) and
  the Atlas Freelance ecosystem tie-in — both are Phase 5 moves, not
  dependencies, per [roadmap/roadmap.md](../roadmap/roadmap.md).

## SWOT

**Strengths**
- A full, working 10-module product already built, at effectively zero
  infrastructure cost (local-only, no backend to run or pay for).
- The Insights engine (decision 0032) — specific recommendations, not
  just a recalculated number; unverified whether any competitor's
  newly-marketed "AI" features go this deep (see
  [competitive-landscape.md](competitive-landscape.md)). Replaces the
  multi-vertical structural edge, retired at decision 0038.
- Zero-friction, no-signup trial — the same wedge that worked for Atlas
  Freelance's own Phase 1.
- Peso-first, PH-context positioning throughout, not a USD tool with
  currency swapped.

**Weaknesses**
- **Zero real-user validation**, despite a fully built product — the
  single biggest weakness by far.
- Multi-User has no real access control (by necessity, documented in
  decision 0006, not hidden).
- Inventory and Margin Alerts work per catalog item, not a shared
  ingredient registry — see [product/modules.md](../product/modules.md).
- Pricing is a total guess (₱199–499/month) with nothing gated behind
  it yet — see `product/scope-v1.md`.
- No automated test coverage yet across 10 interconnected modules
  sharing one data shape (`CatalogItem`) — real regression risk.

**Opportunities**
- Service-costing is genuinely uncontested — no PH SaaS competitor
  found for it (see `competitive-landscape.md`).
- PH Business Network partnership (Fork 3) — 160K-member audience with
  zero recurring-revenue product of their own to compete with a
  partnership offer.
- Atlas Freelance ecosystem tie-in (a costed job flowing straight into
  an Atlas Freelance proposal/invoice).
- Content marketing into an audience that already searches for
  how-to-price advice (see [go-to-market.md](go-to-market.md)).

**Threats**
- iCost could expand into service-costing or multi-vertical pricing,
  closing the exact gap this strategy is built on.
- Raket.ph template sellers could add a subscription tier of their own.
- This market may only accept one-time pricing, not subscriptions —
  still an open, untested question (see `concept.md`).
- Solo-founder bandwidth: everything here was built by one person in a
  single push; sustaining a monetized, supported product is a
  different commitment than shipping a working demo.

## Financial summary (draft, unvalidated)

- **Cost structure today: near-zero.** Local-only architecture means
  no hosting/backend cost and no team beyond the founder.
- **Revenue model: undecided**, not just unpriced — see
  `product/scope-v1.md`'s "open question this leaves" for the real
  fork (free-forever local tool + a future paid sync tier, vs.
  retroactively gating what already works). The ₱199–499/month figure
  floating around this workspace is a placeholder, not a plan.
- No real financial model (unit economics, CAC, runway) exists yet —
  building one before Phase 1 validation would be modeling fiction. The
  scenarios and decision order themselves are laid out in
  [financial-strategy.md](financial-strategy.md) — that file is the
  full version of this section, kept in sync with it rather than
  duplicated.

## Risks

1. **Building ahead of validation** — already happened twice (v0, then
   all of v1+v2). More product does not reduce this risk; only real
   user contact does.
2. **Multi-User's security gap**, if anyone mistakes the local profile
   switcher for real access control — mitigated today only by the
   in-app disclaimer, not a structural fix.
3. **The name isn't cleared yet** — domain, social handles, and an
   IPOPHL trademark search are still outstanding, see
   [branding/options.md](branding/options.md).
4. **Positioning depends on breadth being real for actual users** — the
   unified-vertical bet (decision 0004) only pays off if a meaningful
   share of the ICP genuinely runs more than one business type at once,
   which hasn't been confirmed.
