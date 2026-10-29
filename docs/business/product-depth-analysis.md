# Product depth analysis — why "free" isn't enough on its own

Written 2026-09-02, prompted by a direct question: every module works,
but is it actually *solving* the small-business owner's problem, or
just doing arithmetic they could do in a spreadsheet? This file is the
honest answer, module by module, plus what to do about it.

**This was analysis, not an approved build queue, when it was
written** — and most of it still is. One slice of it *was* built the
same day: [decision 0032](decisions/0032-insights-engine-calculator-to-advisor.md)
shipped the client-side-computable parts of the "Advisor" idea below
(below-target cause + fix, portfolio view, channel gap, stock runway)
as `src/lib/insights.ts`, reasoning that it's a pure addition with no
Phase 1 pitch to contradict yet. The rest of this document — line-level
cost attribution needing a `CostSnapshot` schema change, and the
broader "don't build ahead of validation" sequencing point — still
holds. See "Where this fits in the roadmap" at the bottom, and decision
0032 itself for what actually shipped vs. what's still just analysis.

## Status as of 2026-10-28 — read this before the module sections

The module-by-module section below audits the **11-module app**. Since
[decision 0040](decisions/0040-five-pages-modeled-on-reference.md) the
app is five pages, so map it like this:

| Section below | Today |
|---|---|
| Costing & Pricing, Catalog Management | Merged into **Input** (recipe cards + "Edit breakdown"). Decision 0041 added yield % and menu price rounding — both Level 1, but they close real accuracy gaps |
| Break-Even | Replaced by the **Margin & POS Simulator** (break-even portions + P&L waterfall). Its "missing number" (monthly volume) now comes from OPEX's estimated dishes per month |
| Inventory, Cost History page, Margin Alerts page, Multi-Channel, Sales & Profit Reporting, POS, Documents, Multi-User | **Removed** — history only; code is the `v1-full-11-modules` tag. Cost snapshots are still recorded, just not shown (backlog item 15) |
| Insights engine (decision 0032) | Still on the **Dashboard**, but only the below-target-margin check fires — the sales, channel, and stock data its other checks read no longer has a page that writes it |

The diagnosis itself (calculator → tracker → advisor) still holds. The
2026-10-28 [roadmap](../roadmap/roadmap.md) turns the Level 3 idea
into something concrete: **price alerts driven by a live ingredient
price index** ("pork is up 8%, these 3 recipes dropped below target,
suggested new price ₱189") as the Plus tier's reason to exist.

"Phase N" below refers to the old roadmap's phases, archived at
[../archive/eleven-modules-2026-10/roadmap.md](../archive/eleven-modules-2026-10/roadmap.md);
Phase 1 = today's Stage 1, Phase 6 = Stage 3 (accounts), Phase 7 = Stage 3 (Plus).

## The actual diagnosis

The instinct behind the question is correct, and it's not a new
worry — this project already caught it once, in
[competitive-landscape.md](competitive-landscape.md):

> ~~"Auto-recalculating costs"~~ — iCost already does this.
> ~~"Peso-priced, PH-aware"~~ — both iCost and FoodCost already are.

**Every module in this app, today, does one thing: it computes a
number and shows it to you.** Cost → price. OPEX → break-even units.
Sales → totals. That was a real upgrade over a static spreadsheet when
spreadsheets were the entire competitive set (`concept.md`'s "why
static templates aren't enough"). It stopped being a differentiator
the moment a funded, 4.9-star competitor (iCost) also auto-recalculates
and is also peso-aware. **A calculator that computes correctly is
table stakes now, not a moat.**

The real, still-open gap — and it's a gap iCost, FoodCost, Craftybase,
and MarketMan *all* share, per the comparison table in
`competitive-landscape.md` — is that none of them, Amore Cost
included, answer the question the ICP actually has. `concept.md`
already names it in Tagalog: **"paano ko malalaman kung tama ang
presyo ko"** — *how do I know if my price is right.* A number on a
screen doesn't answer that. A number next to "this is 8 points below
where food businesses like yours usually land, and here's why" does.

**The framework:** every module below sits at one of three levels.

| Level | What it does | Who else already does this |
|---|---|---|
| **1 — Calculator** | Computes a correct number from inputs you typed | Every competitor, and a spreadsheet |
| **2 — Tracker** | Shows the number changing over time or across items | iCost's cost history, most SaaS competitors |
| **3 — Advisor** | Tells you *specifically* what's wrong and what to do about it | **Nobody in this market, currently** |

Level 3 is the actual open wedge. Not "AI" for its own sake — plain
`if`/`then` heuristics over data the app already has, written in the
same plain, specific, no-hype voice this project already uses
everywhere else (`mwp-matrix/01_input/instructions.md`'s tone rule).

## Module by module

### Costing & Pricing — Level 1, could reach Level 3 cheaply

**What it does today:** enter cost, pick a strategy, get a price.
Already has one Level-2 touch — the vertical-specific suggested margin
range (decision 0019) — but it's a static range, not personalized.

**The generic part:** the suggested range (food 30–40%, service
40–60%, resale 20–30%) is the same three numbers for every user,
forever, regardless of what's actually in their own catalog.

**What Level 3 looks like:** the app already knows this specific
owner's *other* items' margins (Catalog Management), which of their
items are already flagged below target (Margin Alerts), and — once
Point of Sale/Inventory logs sales — which items actually sell. A real
recommendation reads like: *"Your other food items average 34% margin.
This one's priced at 22% — ₱46 lower than what your own catalog
usually charges for this cost structure."* That's not a generic
range any competitor could paste in; it's specific to the one business
looking at the screen.

### Break-Even — Level 1, missing the one number that would make it real

**What it does today:** OPEX ÷ profit-per-unit = units needed per
month. Correct math, and it's honest that it's a target, not a
forecast.

**The generic part:** it never says whether that target is realistic.
146 units/month is meaningless without knowing whether this business
currently sells 40 or 400 a month.

**What Level 3 looks like:** once Sales & Profit Reporting has real
logged sales (it does, from Inventory and POS), Break-Even can say:
*"You're currently selling ~9 units/week. At that pace, you'll clear
this month's fixed costs by day 41 — 11 days past the end of the
month."* This turns an abstract target into "you're behind, here's by
how much" — the single most direct answer to the anxiety in
`concept.md`.

### Catalog Management — Level 1/2 (a list), missing the portfolio view

**What it does today:** every costed item, searchable, filterable by
margin status. This is already the central data store every other
module reads — the raw material for Level 3 is already sitting here.

**The generic part:** it's a list. It doesn't tell you which items in
the list actually matter.

**What Level 3 looks like:** a Pareto cut — *"These 3 items (out of
12) generate 71% of your logged profit. These 4 are below target
margin **and** rarely sell — consider repricing or dropping them,
not just the ones flagged red."* Combines Margin Alerts' existing
math with Sales & Profit Reporting's existing data — no new
computation, just a new lens on data every module already has
separately.

### Inventory — Level 1 (a counter with a fixed threshold)

**What it does today:** stock-on-hand, a manually-set low-stock
number, deduct-on-sale.

**The generic part:** the reorder threshold is a number the owner
guessed once and probably never revisits. It doesn't account for how
fast that item actually sells.

**What Level 3 looks like:** *"You sell ~6 of these a week. At 12 on
hand, you have about 2 weeks of stock left."* A sell-through-rate-based
reorder signal instead of a static number — genuinely differentiated,
since none of the competitors in `competitive-landscape.md` are
described as doing this either, and it's real "Cook & Deduct" parity
territory `modules.md` already flags as the still-missing half of
matching iCost.

### Cost History — Level 2 already, needs to push to Level 3

**What it does today:** this is the most advanced module already —
snapshots + a sparkline. It's genuinely a tracker, not just a
calculator.

**The generic part:** it's passive. The owner has to remember to open
this page and notice the line moved.

**What Level 3 looks like:** turn the trend into a specific,
attributed statement instead of a chart to interpret: *"Your true
cost on this item rose 12% over the last 6 weeks — mostly the flour
line, up ₱0.02/g since Aug 3. At your current price, that's already
cost you ₱340 in margin this month."* Attribution (which line moved)
is free — the Ingredient Library cascade already knows exactly which
cost input changed and when.

### Margin Alerts — closest to Level 3 of any module, missing the "why"

**What it does today:** flags items below their own target margin.
This is already proactive in intent, not just a passive log.

**The generic part:** it says *that* something's wrong, never *why*,
and `modules.md` already documents the honest reason: "there's no
notification yet, only what's visible when this page is open" — so
even the "that" doesn't reach the owner unless they think to check.

**What Level 3 looks like:** pair the flag with the specific cause
(Cost History already has this data) and a concrete lever: *"Below
target because flour costs rose 12% — raise price by ₱18 to restore
your 34% margin, or find a supplier under ₱68/kg."* Same root-cause
data as Cost History's recommendation above — this is one shared
capability serving two pages, not two separate builds.

### Multi-Channel Pricing — Level 1, a fee-adjusted calculator

**What it does today:** same product, different price per channel, so
per-unit profit holds after each platform's fee.

**The generic part:** it computes the adjusted price but never
compares channels against each other.

**What Level 3 looks like:** *"Shopee nets you 8% margin after fees.
Your store nets 35% on the same item. To match your store's margin on
Shopee, you'd need to charge ₱18 more there — or accept Shopee is a
volume channel, not a margin one."* Turns three separate numbers into
one comparative decision.

### Sales & Profit Reporting — Level 1/2, totals without a trend

**What it does today:** aggregated units/revenue/profit, overall and
per item, plus a recent-sales list.

**The generic part:** every number is a snapshot total. No "compared
to what," no direction.

**What Level 3 looks like:** week-over-week or month-over-month
deltas per item — *"Profit on this item is down 18% from last month,
even though units sold are flat — your margin, not your volume, is
the problem."* This is the module every other Level-3 recommendation
above ultimately feeds into or draws from — the shared "compared to
before" primitive belongs here first.

### Point of Sale, Documents, Multi-User — different kind of module, don't force Level 3

These three are **transactional/utility**, not analytical — forcing
an "insight" onto a checkout screen or a PDF export would be noise,
not depth. Their differentiation lever is different: POS's real gap is
the deliberately-deferred camera barcode scanning and multi-register
sync (Phase 6/8, tracked already); Documents' is professionalism/polish
of the printed output, not analysis; Multi-User's is real access
control, which needs actual accounts (Phase 6) to be anything but
cosmetic. None of these should be forced into the Level 3 pattern —
that would be depth theater, not real depth.

## The pattern, stated once

Every Level 3 recommendation above draws from data **that already
exists somewhere in this app** — Catalog Management's items, Cost
History's snapshots, Margin Alerts' target comparison, Sales &
Profit Reporting's logged sales. None of it needs a backend, an
account, or Phase 6. It's a **synthesis layer**, not new data
collection: one new module, tentatively `src/lib/insights.ts`,
computing plain-language, specific statements from data every other
module already reads or writes — the same "extract once it's needed a
second place" discipline this project already used for
`marginStatus()` and `featuredState()`, just at a bigger scale.

Concretely, this would be a short, ranked list of real observations —
"below target because X, here's the specific fix," "these 3 items
carry your profit," "you're behind pace on break-even by N units" —
surfaced somewhere an owner actually sees on login (Overview is the
natural home), not buried in a page they'd have to think to open.

## Why this isn't a build order

Naming a real gap doesn't make it the next thing to build. This
project's own roadmap has a named, repeated pattern —
[roadmap.md](../roadmap/roadmap.md) calls it out directly: **the build
has outpaced validation many times over**, every time before Phase 1
ran. Building an entire insight layer before a single real business
owner has opened the app would be that same mistake a sixth time, just
dressed up as strategy instead of a feature request.

The honest sequencing:

1. **Phase 1 still comes first, unchanged.** Post what already exists.
   If the actual objection people raise is "cool calculator, so what
   do I do with this number" — that's this exact analysis, confirmed
   by a real person instead of guessed at a desk. If nobody says that,
   this whole document was solving a problem that wasn't the real one.
2. **If Phase 1 validates and *this specific objection* comes up**,
   this document is the shortlist, already scoped, already leveled by
   effort (Cost History and Margin Alerts share one root-cause
   capability; Catalog Management and Reporting share one trend
   primitive) — pick the cheapest one that answers what people actually
   asked for, not all of them at once.
3. **This is also a legitimate answer to the Phase 7 pricing
   question**, not just a Phase 1 nice-to-have: "the calculator part
   stays free forever; the advisor part — root-cause alerts, portfolio
   view, pace-tracking — is the paid tier's actual reason to exist,"
   which is a sharper answer to `scope-v1.md`'s still-open "what to
   gate" question than the current draft list (ingredient library,
   inventory, cost history, PDF export, multi-user) — those are just
   *more features*, not a different *kind* of value.
   **2026-10-28:** the roadmap adopted a version of this — Plus = sync,
   price alerts, history, PDF menu, delivery pricing; everything the
   app does on one device stays free.
