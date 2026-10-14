# Competitive landscape

The crisp, current reference: who's actually in this space and where
Amore Cost sits against them. For the research trail — how each of these
was found, what changed as the research corrected itself — see
[market-research.md](market-research.md); that file is the narrative,
this one is the answer.

## The full comparison

| Product | Type | Price | Verticals | Signup to try | Auto-recalc | PH-aware |
|---|---|---|---|---|---|---|
| **Amore Cost** | SaaS | Free (local); paid tier undecided | Food only (decision 0038 — was food+service+resale) | None | Yes | Yes — flexible tax (VAT/Percentage/custom) |
| [iCost](https://icost.ph/) | SaaS | Free (1 recipe) / ₱299–599/mo | Food only | Account/app required | Yes ("Cook & Deduct") | Yes, ₱-priced |
| [FoodCost](https://food-cost-tau.vercel.app/) | SaaS (indie/soft-launched) | Unpublished | Food only | Account required | Partial | Yes — 12% VAT, Senior/PWD built in |
| Raket.ph templates (JR Quilantang + ~6 other sellers) | Static spreadsheet | ₱200–₱1,000 one-time | Food *or* service, sold as separate products | N/A (buy once) | No — manual edits | Yes, but static |
| [Craftybase](https://craftybase.com/recipe-costing-software) | SaaS | From $49/mo (~₱2,800) | Makers/artisans | Account required | Yes | No — USD, not PH-specific |
| [MarketMan](https://www.marketman.com/platform/recipe-costing-software) | SaaS | From $199/mo (~₱11,000) | Restaurant chains | Account required | Yes | No — USD, enterprise scale |

## The wedge, stated plainly

**Updated 2026-09-03 (decision 0038):** this section previously listed
four claims; two of them — "service-costing is uncontested" and "one
account across all three verticals" — depended entirely on Amore Cost
being multi-vertical. As of decision 0038 it isn't anymore, so both
are gone, not just de-emphasized. Stated plainly: **Amore Cost is now
in the same single-vertical bracket as iCost and FoodCost**, the two
competitors this table already tracks. See
[docs/archive/multi-vertical-2026-08/](multi-vertical-2026-08/README.md)
if that ever needs re-reading.

Two claims from even earlier already didn't survive contact with
iCost:

- ~~"Auto-recalculating costs"~~ — iCost already does this (Cook &
  Deduct).
- ~~"Peso-priced, PH-aware"~~ — both iCost and FoodCost already are.

**What's actually left, in order of how defensible it is:**

1. **Zero-signup trial.** Every SaaS competitor above requires an
   account before you can calculate anything. Amore Cost doesn't.
2. **The Insights engine** (decision 0032) — specific, personalized
   recommendations (why a recipe's margin slipped, which dish carries
   most profit, a sell-through-rate stock warning), not just a
   recalculated number. iCost's newly-marketed "AI-powered" framing
   (see "Where this could break" below) may be closing this gap —
   unverified how deep it actually goes.
3. **Atlas Freelance ecosystem tie-in** — weaker than it was: it was
   originally reasoned as a cross-sell for the *service-provider*
   overlap between the two products' ICPs, and Amore Cost no longer
   serves service providers at all. Still real for a food business
   that also does some client/catering work needing an Atlas Freelance
   quote, but a smaller overlap than before — named honestly rather
   than left stale.

**Net effect of decision 0038 on this file:** the remaining wedge is
real but noticeably thinner than it was. Worth having in view before
treating Phase 1 outreach as low-risk — the pitch is narrower, and so
is what's left to differentiate on if food-only alone doesn't land.

## Where this could break

- **Update 2026-09-02:** iCost now markets itself as AI-powered — AI
  recipe search with ingredient suggestions, and a "Transaction
  Ledger — complete audit trail of all inventory movements." That's
  movement toward exactly the "Advisor" gap
  [product-depth-analysis.md](product-depth-analysis.md) names as
  still open across this whole market. Unverified how deep the "AI"
  actually goes — could be marketing language over simple rules, same
  as this app's own insights engine (decision 0032) — needs a proper
  re-check in `market-research.md`, not assumed either way.
  [iCost — Google Play](https://play.google.com/store/apps/details?id=ph.icost.app&hl=en)
- If iCost's "AI-powered" framing turns out to be real depth (not
  marketing language over simple rules), claim 2 above goes away in
  one product update from a well-funded, well-rated incumbent (4.9/5,
  500+ users) — worth watching, not just noting once.
- Zero-signup (claim 1) is a UX choice any competitor could copy in a
  sprint — it's a current gap, not a moat.

## Keeping this current

This table should be re-checked whenever market-research.md gets a new
finding, not left to drift — same instinct that already caught the
"no SaaS exists" mistake once in this project's history.
