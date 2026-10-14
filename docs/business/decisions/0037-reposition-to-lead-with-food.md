---
number: 0037
date: 2026-09-03
status: accepted
supersedes: 0004 (partial — positioning only, not scope)
---

# Reposition marketing to lead with food; the product itself stays all three verticals

## Context

Oliver asked to focus the SaaS on the food business market specifically,
citing [food-cost-tau.vercel.app](https://food-cost-tau.vercel.app/)
(documented as "FoodCost" in
[competitive-landscape.md](../competitive-landscape.md)) as a
reference. Before changing anything, the real tradeoff was surfaced:
[decision 0004](0004-lead-vertical-unified.md) deliberately chose a
unified food+service+resale account specifically *because* every
competitor — FoodCost and iCost both — is single-vertical, and
`competitive-landscape.md` names "one account across all three
verticals" as one of only 2-3 real differentiators left against iCost
(500+ users, 4.9★, ₱299–599/mo). Fully reversing 0004 would remove that
differentiator entirely and put Amore Cost in direct, feature-for-
feature competition with both named competitors.

Given that tradeoff, three levels of "focus on food" were on the
table: (a) reposition marketing only, product stays multi-vertical;
(b) make food the default experience, others stay available; (c)
delete service/resale entirely and rebuild food-only, matching the
reference site exactly. **Oliver chose (a).**

## Decision

**The product is unchanged.** `Vertical` still has three values, all
three still work identically, [decision 0004](0004-lead-vertical-unified.md)'s
actual scope decision stands. Only the marketing/positioning layer
changed, to lead with food and disclose service/resale as also-
supported rather than co-equal:

- **Landing page** (`src/app/page.tsx`) — hero headline, subtitle,
  features intro, and one FAQ entry now lead with "built for Philippine
  food businesses," with service/resale mentioned honestly as also
  running on the same engine, not hidden.
- **Page metadata** (`src/app/layout.tsx`) — title and description
  now lead with "recipe costing... for PH food businesses."
- **Pitch one-pager** (`docs/branding/pitch-one-pager.html`) — this
  needed more than a word swap: its "Why now" section previously
  *argued the multi-vertical thesis directly* ("Nobody covers the
  actual mix of businesses people run"). Rewrote that section's
  framing to lead with recipe-level food costing as the primary edge,
  with "also covers service and resale, same account" as a supporting
  point — not deleted, rebalanced. The "Who it's for" card grid keeps
  all three cards (still true, still honest) but labels service/resale
  "Also runs:" instead of presenting all three as co-equal.
- **`go-to-market.md`'s "The pitch"** section, updated to match — see
  below.

## Why

Oliver's call, made with the competitive tradeoff in front of him
(narrower positioning, in exchange for whatever "food business" clarity
buys in an actual pitch — a sharper answer to "what is this" tends to
convert better than a correct-but-diffuse one, even if the code
underneath is broader). Reposition-only was chosen specifically
*because* it's cheap and fully reversible: if Phase 1 validation shows
the food-first framing doesn't land, or shows real demand from service/
resale owners who feel the copy no longer speaks to them, reverting is
a copy change, not a re-architecture — nothing about `CalculatorState`,
`VERTICAL_LABELS`, or any module's actual vertical-switching logic was
touched.

## Consequences

- No code risk, no test changes needed — this is a documentation/copy-
  only decision. `npm test`/`tsc`/`build` are unaffected by definition.
- `docs/business/concept.md`'s "Who this is for" and
  `go-to-market.md`'s "The pitch" section need the same food-first
  reordering for internal consistency — done in this same pass, see
  their own diffs.
- The **still-live ready-to-post copy** (`docs/marketing/launch-checklist.md`,
  `MASTER-PLAN.md`) hadn't gone out yet — updated to match before
  anything gets posted, so Phase 1 validation tests the *new*
  positioning, not the old one.
- If Phase 1 signal later suggests going further (option b or c from
  the Context above), that's a fresh decision, not an extension of this
  one — this decision is explicitly scoped to marketing/copy only.
- `competitive-landscape.md`'s "one account across all three verticals"
  differentiator claim is now slightly less prominent in *outward*
  messaging than it was, even though it's still fully true of the
  product — worth remembering when writing future content or answering
  "what makes this different" in person, since the honest answer still
  includes it, just isn't the headline anymore.
