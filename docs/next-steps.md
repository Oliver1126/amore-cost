# ⭐ Next steps — read this first

The single pinned entry point for "what do I do now" on this idea.
Linked from the top of both root `CLAUDE.md` and `docs/CLAUDE.md`
specifically so it's never missed at the start of a session. Update
this file the same session anything on it gets resolved or superseded.
See [roadmap/roadmap.md](roadmap/roadmap.md) for the fuller phased
sequence, and [roadmap/backlog.md](roadmap/backlog.md) /
[roadmap/completed.md](roadmap/completed.md) for concrete not-started
work vs. the shipped changelog.

## Where this stands (as of 2026-10-28)

**Latest (decision 0041):** Input now has a **Yield %** column and a
**menu price rounding** select, and an empty app offers **"Try with
sample recipes"** (Adobo, Tapsilog, Halo-Halo) — which is also the
fastest way to demo Amore Cost to a first business owner for Phase 1
validation. Remaining audit gaps are backlog items 9–15. A comparison
against KwentaPOS (a PH POS with recipe costing) is at
[business/kwentapos-comparison.md](business/kwentapos-comparison.md).
The plan for starting, scaling and winning against them is the new
[roadmap/roadmap.md](roadmap/roadmap.md) (old 11-module roadmap archived): **next action is
Stage 0 — deploy, add analytics + a feedback link — then Stage 1's
20-owner validation with a pre-set gate.**

**Latest (decision 0040):** the app is now **five pages** — Dashboard,
Input, OPEX & Overhead, Receipt Simulator, Margin & POS Simulator —
modeled on the food-cost-tau reference, after "too many pages that don't
matter as of now." Inventory, POS checkout, Cost History, Documents,
Multi-User, Multi-Channel, Margin Alerts, and Reporting are gone (the
full version is the `v1-full-11-modules` git tag). The code is also on
GitHub at https://github.com/Oliver1126/amore-cost. Everything in the
history below that describes a removed module is accurate history, not
current spec — see `product/modules.md` for what exists now.


Fork, name, and lead vertical are decided (see
[business/decisions/](business/decisions/CONTEXT.md) 0001, 0009, 0004).
**All 11 modules are real, working code** — **Point of
Sale** (`/pos`), shipped 2026-08-19 (decision 0015): a scoped checkout
module (cart, barcode-style scan/search, payment method, printable
receipt) reusing Inventory's sale-logging and Sales & Profit
Reporting's aggregation as-is, deliberately not a full retail POS (no
cash-drawer/thermal-printer hardware, no multi-register sync — see
`roadmap/backlog.md`). The dashboard Sidebar is a mobile
drawer below the `lg` breakpoint (decision 0016). OPEX is a real shared
store, not a per-item field (decision 0017, fixing a bug from 0014),
with a one-directional OPEX → Overhead estimator on Costing & Pricing
(decision 0018). Pricing strategies (Margin %/Markup %/Fixed profit)
now explain what they compute and suggest a vertical-specific starting
range (decision 0019). The Senior Citizen/PWD discount (RA 9994/10754)
is real — Costing & Pricing shows it, Point of Sale applies it per cart
line (decision 0020), found by deliberately reviewing a competitor.
Point of Sale now supports refunds/voids (decision 0021) — a "Refund
this sale" button on the receipt page restocks the item and reverses
the sale via a new negative-quantity `SaleEntry`, without ever altering
the original receipt; Sales & Profit Reporting needed no changes to net
it out correctly. Ingredient Library and Catalog are now one page,
**Catalog Management** (`/catalog`, decision 0022) — `/ingredients`
redirects there — with a name/SKU search, a margin filter (On target/
Below target), a per-product ingredient-cost breakdown, and each
ingredient's "used in" count now links to the real products using it,
addressing feedback that the two features looked disconnected. Its
"Edit & Breakdown" is now a real in-page editor too (decision 0023) —
a modal embedding the *entire* cost stack (vertical, ingredients,
labor, packaging, overhead, tax, pricing strategy, plus a new Target
margin % field), reusing a shared `ItemEditor` component so it and the
standalone Costing & Pricing page can never drift apart; `/costing`
still works unchanged for every existing cross-link. Its product list
is now a card grid, not a table (decision 0024), matching a
competitor's reference layout Oliver shared directly. "+ New item"
(0025) and "Add ingredient" (0026) are now their own lightweight
popups — confirmed against the *live* reference site (not a static
mockup) that its "Add Ingredient Line" is a plain inline row, not a
popup, correcting an earlier assumption before anything was built on
it. The shared Ingredient Library itself moved from an always-visible
page section into its own modal too (0027). The cost-line editor
(`CostForm`) is now an always-visible table matching the reference's
exact 10 columns, adding a real new capability — a package can be
bought in one unit and portioned in a different one (0028), the same
conversion the Ingredient Library already offered for linked lines.
Both `Edit & Breakdown` and the standalone Costing & Pricing page share
this table, so neither needed separate work. Two real bugs were found
and fixed via live audits along the way this session (a missing `|| ""`
numeric-input fallback, a duplicate DOM id, and a `<fieldset>`
`min-width` layout bug that was silently stretching a modal past its
own max-width) — none guessed at, all confirmed via
`document.querySelectorAll`/`scrollWidth` checks, not just visually.
The item editor's cards (Cost Composition, Price using, Tax, Batch
size, Quote templates) now sit above the Food & Beverage/Service/
Resale vertical tabs instead of beside them in a narrow side column
(decision 0029) — reaches both Costing & Pricing and Catalog
Management's "Edit & Breakdown" since both share `ItemEditor`. A
follow-up cross-page audit (decision 0030) then swept every other
dashboard page (Alerts, Break-Even, Dashboard, Documents, History,
Inventory, Multi-Channel, Multi-User, POS, Reporting) and fixed 8 real
correctness bugs — negative-quantity Inventory edits, a backup-restore
crash, Break-Even ignoring the saved catalog item Dashboard just
showed, an unconfirmed Multi-User profile removal, `updatedAt` not
bumping outside `/costing` (which was making Dashboard's "most
recently touched item" go stale), a duplicated margin check in Alerts,
and `peso()`/`pesoSigned()` duplicated across 14 files — now centralized
in new `src/lib/format.ts`, alongside new shared
`mostRecentCatalogItem()`/`featuredState()` helpers in
`src/lib/catalog.ts`. Two lower-priority findings were deliberately
left open rather than folded in: POS's lack of an overselling ceiling
(matches this app's own existing "flag, don't block" POS design,
decision 0015) and POS's unmemoized cart computations (a performance
concern, not correctness — tracked as `roadmap/backlog.md` item 3).
The app is now **deployed and reachable at
https://amore-cost.vercel.app** (decision 0031) — CLI deploy direct
from this folder (no git repo yet), so a future code change needs an
explicit `vercel --prod` redeploy, not an automatic one. This clears
`docs/marketing/launch-checklist.md`'s "nothing below can start
without this" gate.
Overview now has a real **insights engine** (decision 0032): a "Needs
your attention" panel showing specific, personalized recommendations —
why a below-target item is below target and the exact price fix, which
item drives most of the catalog's profit, a channel-fee margin gap
with the matching price, and a sell-through-rate stock runway
estimate — instead of just the numbers each module already showed
separately. Grounded in
[business/product-depth-analysis.md](business/product-depth-analysis.md)'s
"Calculator → Tracker → Advisor" audit: every other module still sits
at Calculator or Tracker, and this is the first thing in the app that
reaches Advisor. Pure client-side logic (`src/lib/insights.ts`) over
data every module already collects — no backend or accounts needed.
Costing & Pricing then went through a real UX pass: financial jargon
("Price using," "Tax," "Batch size") now sits behind click-to-reveal
"?" popovers instead of always-visible paragraphs (decision 0033,
`InfoButton`), and "Price using"/"Tax"/"Quote templates" moved into a
collapsed-by-default "Advanced Pricing Settings" accordion so the main
screen stays focused on True cost/Suggested price/Profit per
unit/Cost composition — the numbers that change on every edit.
`DESIGN.md` was then rewritten to match the *real* implementation
instead of a generic template — real token values, and honest "GAP"
markers for things like the missing shared table component and
missing keyboard-focus rings (decision 0034), several of which got
fixed the same day: real `:focus-visible` rings app-wide, two sub-44px
nav tap targets corrected, a shared `PageSkeleton` replacing bare
"Loading…" text across all 12 pages, and a real bilingual bug fixed in
three places (`StatCards`, `TaxCard`, the printed quotation) where the
Tagalog toggle silently left the tax preset name in English. A
follow-up diagnostic (decision 0035) then found 15 verified
correctness bugs via the `code-review` skill at max effort — 13 fixed
the same day, including a `marginStatus()` float-comparison bug that
misclassified an on-target item as below-target most of the time, an
unclamped margin % that could corrupt Cost History with `NaN`, and
three separate insights-engine math bugs (pre-tax "raise by" amount,
an unreachable channel-fee threshold, a flat 30-day stock-runway
divisor). Cost History's snapshot-per-keystroke behavior was then
fixed properly (decision 0036) — typing no longer appends a snapshot
per character; a snapshot only fires on blur/500ms-debounce or when
the field actually stops changing. Most recently, marketing
positioning was **repositioned to lead with food** (decision 0037,
2026-09-03) — the landing page, pitch one-pager, and
`go-to-market.md`/`concept.md` now lead with "built for Philippine
food businesses," disclosing service/resale as also-supported rather
than co-equal; the product itself is unchanged, decision 0004 stands.
A real pre-existing bug was caught in the same pass: the pitch
one-pager had no `<meta charset="UTF-8">`, corrupting every ₱ symbol
into mojibake when opened directly as a file — fixed and verified.
**The same day, the product itself went food-only** (decision 0038,
superseding 0004) — a deliberate staged small-to-bigger rollout, not
scope creep. `Vertical` narrowed to `"food"` only; the now-single-
option business-type tab switcher was deleted (not hidden) from
Costing & Pricing and the "+ New item" flow. Every module stays —
none were ever vertical-specific pages, since the original
architecture never built separate pages per vertical; what was removed
is a data-model dimension, not any page. This retires
`competitive-landscape.md`'s "one account across all three verticals"
differentiator for real, not just de-emphasizes it — the remaining
edge against iCost/FoodCost is now zero-signup trial and the Insights
engine. The original multi-vertical positioning and copy are preserved
in `docs/archive/multi-vertical-2026-08/`, not deleted, in case this
market gets revisited once food-only validates.
The **test suite is now 159 tests** (Vitest, `npm test`). Everything
shipped 2026-08-18 is
still current: the Ingredient
Library's cascade logic (0007) and its feature batch (0008); the
package-cost calculator (0014); the **Amore Cost** rename (0009) and
its logo, the real designed asset (0011); a complete Tagalog/English
toggle (`src/lib/i18n.tsx`); a QA workspace (`docs/qa/`); a client
onboarding guide (`docs/onboarding/`); the dev port at `3003`; and the
public landing page at `/` with the dashboard at `/dashboard` (0012).
`docs/business/strategy.md`, `competitive-landscape.md`, and the new
`financial-strategy.md` (revenue-model scenarios, explicitly not a
fabricated forecast) hold the master plan; `docs/marketing/` holds the
launch checklist and content backlog.

**The build has outpaced validation for a while now** — nothing here
has been shown to a real business owner yet, even though it now has a
real link to send them. That's still the most urgent open item by a
wide margin, and more building doesn't change that.

## Open, in priority order

1. **Validate demand — overdue, not just next, and no longer blocked.**
   Deployment (decision 0031) cleared the one gate on
   [marketing/launch-checklist.md](marketing/launch-checklist.md) —
   the actual outreach in [business/go-to-market.md](business/go-to-market.md)
   ("would this replace your spreadsheet") can start now. Resolve the
   open questions in [business/concept.md](business/concept.md) and
   [product/scope-v1.md](product/scope-v1.md)'s pricing/gating question
   — there's now even more built product riding on the answer.
2. **Run the name due-diligence checklist** — tracked as
   [roadmap/backlog.md](roadmap/backlog.md) item 2, now against
   "Amore Cost" rather than Calcost.
3. **Decide on real accounts** — now **Phase 6** in
   [roadmap.md](roadmap/roadmap.md), tracked as
   [roadmap/backlog.md](roadmap/backlog.md) item 1, informed by Phase 1
   signal. Needed to fix Multi-User's lack of real security,
   Inventory's remaining per-item (not per-ingredient)
   stock-*quantity* limitation, and Point of Sale's lack of
   multi-register sync — the Ingredient Library (now a section of
   Catalog Management, decision 0022) already closed the *cost*-sharing
   half of the Inventory gap. Also unlocks **Phase 7** (the actual paid
   tier) and most of **Phase 8** (Shopee/Lazada sync, receipt OCR, real
   push/email notifications, shareable client-facing links —
   `backlog.md` items 4–8).
4. **Extend test coverage to components/pages** — the current suite is
   pure-logic only (`src/lib/*.test.ts`); no automated coverage of the
   UI layer yet.

## The moment any of the above resolves

Write a numbered record in
[business/decisions/](business/decisions/CONTEXT.md) using
[business/decisions/_template.md](business/decisions/_template.md), then
come back and edit this file's "Where this stands" line and the open
list above — don't leave a resolved item sitting here stale.
