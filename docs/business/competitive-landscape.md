# Competitive landscape

The crisp, current reference: who's actually in this space and where
Amore Cost sits against them. For the research trail — how each of these
was found, what changed as the research corrected itself — see
[market-research.md](market-research.md); that file is the narrative,
this one is the answer.

## The full comparison

| Product | Type | Price | Verticals | Signup to try | Auto-recalc | PH-aware |
|---|---|---|---|---|---|---|
| **Amore Cost** | SaaS — pricing tool, not a POS (5 pages, decision 0040) | Free (local); Plus tier ₱99/mo is a roadmap hypothesis | Food only (decision 0038 — was food+service+resale) | None | Yes (Ingredient Library cascade) | Yes — VAT incl./excl., Percentage/custom tax, Senior/PWD, service charge |
| [iCost](https://icost.ph/) | SaaS | Free (1 recipe) / ₱299–599/mo | Food only | Account/app required | Yes ("Cook & Deduct") | Yes, ₱-priced |
| [FoodCost](https://food-cost-tau.vercel.app/) | SaaS (indie/soft-launched) | Unpublished | Food only | Account required | Partial | Yes — 12% VAT, Senior/PWD built in |
| Raket.ph templates (JR Quilantang + ~6 other sellers) | Static spreadsheet | ₱200–₱1,000 one-time | Food *or* service, sold as separate products | N/A (buy once) | No — manual edits | Yes, but static |
| [KwentaPOS](https://www.kwentapos.com/) | Cloud POS (PWA) | ₱59 / ₱299 / ₱999 per mo | Sari-sari, food, retail | 15-day trial, account | Yes (recipe costing, Pro plan and up) | Partly: GCash/Maya/utang; no VAT or Senior/PWD mentioned. Full gap list: [kwentapos-comparison.md](kwentapos-comparison.md) |
| [Craftybase](https://craftybase.com/recipe-costing-software) | SaaS | From $49/mo (~₱2,800) | Makers/artisans | Account required | Yes | No — USD, not PH-specific |
| [MarketMan](https://www.marketman.com/platform/recipe-costing-software) | SaaS | From $199/mo (~₱11,000) | Restaurant chains | Account required | Yes | No — USD, enterprise scale |

## The wedge, stated plainly

**Current (2026-10-28 — decisions 0040/0041, the KwentaPOS comparison,
and the new [roadmap](../roadmap/roadmap.md)):** Amore Cost is the
**pricing brain, not a POS.** The POS apps (KwentaPOS, Loyverse,
StoreHub, UTAK) run the store; KwentaPOS even shows food cost per menu
item on its ₱299 Pro plan. None of them advertise the *pricing depth*
Amore Cost has: a suggested price from a chosen margin, VAT
inclusive/exclusive, Senior/PWD and service charge done per PH law,
OPEX allocated per dish, break-even and a P&L simulator, yield %, and
menu price rounding — free, no signup, English and Tagalog. The wedge,
in order of defensibility:

1. **A live PH ingredient price index** (roadmap Move 4, not built yet)
   — public DA price monitoring plus anonymized owner prices; gets
   better with every user. The only claim here that could become a
   real moat.
2. **Pricing depth + PH compliance** — real today, but copyable by a
   POS vendor that decides to care (see "Where this could break").
3. **Earliest touch, free, no signup, Tagalog, sample recipes** — the
   first tool an owner pricing a first menu reaches for. A UX lead,
   not a moat.
4. **Complement, not competitor, to POS apps** — "price it here, sell
   it in your POS," backed by a planned CSV price-list export.

Full line-by-line against KwentaPOS:
[kwentapos-comparison.md](kwentapos-comparison.md).

**History — the 2026-09-03 version of this section,** kept below for
the reasoning trail. Its claim 2 (the Insights engine) is weaker since
decision 0040 removed the sales and stock data most of its checks read;
only the below-target-margin check still fires.

**Updated 2026-09-03 (decision 0038):** this section previously listed
four claims; two of them — "service-costing is uncontested" and "one
account across all three verticals" — depended entirely on Amore Cost
being multi-vertical. As of decision 0038 it isn't anymore, so both
are gone, not just de-emphasized. Stated plainly: **Amore Cost is now
in the same single-vertical bracket as iCost and FoodCost**, the two
competitors this table already tracks. See
[docs/archive/multi-vertical-2026-08/](../archive/multi-vertical-2026-08/README.md)
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
treating Stage 1 outreach as low-risk — the pitch is narrower, and so
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
- **Update 2026-10-28:** POS apps already cost recipes (KwentaPOS Pro).
  If one adds VAT/Senior-PWD pricing math and a suggested-price engine,
  claim 2 of the current wedge narrows to OPEX and the simulators.
  Re-check KwentaPOS, Loyverse, and UTAK quarterly — see
  [kwentapos-comparison.md](kwentapos-comparison.md).

## Keeping this current

This table should be re-checked whenever market-research.md gets a new
finding, not left to drift — same instinct that already caught the
"no SaaS exists" mistake once in this project's history.
