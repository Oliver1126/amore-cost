---
number: 0032
date: 2026-09-02
status: accepted
supersedes:
---

# Insights engine — the app's first "advisor," not just a calculator

## Context

A direct question forced an honest look at the product: every module
computes a correct number and shows it, but none of them tell the
owner what to *do* about it. `competitive-landscape.md` had already
caught half of this — "auto-recalculating costs" and "peso-aware" are
no longer differentiators, since iCost already does both. The deeper
audit is written up in
[product-depth-analysis.md](../product-depth-analysis.md): a
"Calculator → Tracker → Advisor" framework applied to every module,
finding that nothing in the app reaches "Advisor" — and that level is
still open across every competitor in this market, not just this app.

## Decision

Built `src/lib/insights.ts`: a pure synthesis layer that reads data
every module already collects (`CatalogItem[]` — cost, target margin,
Cost History snapshots, sales logs, channel fees) and produces
specific, personalized recommendations instead of raw numbers. Four
generators, combined and ranked by `generateInsights()`:

- **Below-target margin, with cause and fix** — not just "this is
  below target" (Margin Alerts already did that) but *why* (cost rose
  X% since first saved, when Cost History shows it) and *what to do*
  (raise price by ~₱Y to close the exact gap).
- **Portfolio view** — which single item is carrying most of the
  logged profit, and which below-target item is *also* a slow seller
  (a real repricing/retirement candidate, not just a red flag on a
  list).
- **Channel fee gap** — charging the same price on a high-fee channel
  (e.g. Shopee) as everywhere else quietly misses the target margin;
  names the channel, the actual margin it nets, and the price that
  would match.
- **Stock runway** — a sell-through-rate-based reorder signal ("~2
  weeks of stock left at your current pace") instead of the fixed
  threshold Inventory already has, which the owner sets once and
  rarely revisits.

Surfaced as a new `InsightsPanel` component at the top of Overview,
above the existing featured-item stats — the first thing an owner sees
on login, per `product-depth-analysis.md`'s own recommendation for
where this belongs. Hidden entirely when the catalog is empty; shows
an honest "nothing needs attention" state when the catalog has items
but nothing actually triggers.

Also extracted `itemSalesTotals()` into `src/lib/catalog.ts` — the
per-item units/revenue/cost/profit aggregation `insights.ts` needed
was previously duplicated inline in `reporting/page.tsx`; Reporting
now calls the same shared function, same "extract once needed a second
place" discipline as `marginStatus()` and `featuredState()`.

## Why

Every one of these four insights draws from data already sitting in
`localStorage` — no backend, no accounts, no Phase 6 dependency. This
isn't a case of the build outpacing validation again: Phase 1 hasn't
posted anything publicly yet, so there's no existing pitch this
contradicts or preempts. If anything, this strengthens what Phase 1 is
about to show — the difference between "here's a calculator" and
"here's a tool that already told me something true about my own
numbers" is exactly the kind of reaction worth testing for. The
alternative (building this only *after* someone says "cool calculator,
so what do I do with this") is also defensible, but the marginal cost
of shipping the pure-logic version now, before a single public post,
is low and reversible — nothing about the existing pages changed
behavior, this is a pure addition.

Explicitly bounded in scope, per `product-depth-analysis.md`'s own
sequencing note: this is the client-side-computable slice of that
document's ideas, not all of it. Line-level cost attribution (which
specific ingredient drove a cost increase, not just "cost rose X%
overall") needs `CostSnapshot` to store more than it does today
(`{savedAt, cost, price, marginPercent}`, no per-line detail) — left
for a future pass if this direction proves out, not built speculatively
now.

## Consequences

- Overview is no longer just a status page for whatever's currently
  being priced — it's the one place an owner sees what's actually
  wrong across their *whole* catalog, without opening Margin Alerts,
  Cost History, Multi-Channel, and Inventory separately to piece it
  together themselves.
- `docs/marketing/launch-checklist.md`'s pitch can now honestly say
  more than "a calculator" if early reactions call for it — this is
  also a sharper candidate answer to `scope-v1.md`'s open "what to
  gate behind a paid tier" question than the current draft list
  (ingredient library, inventory, cost history, PDF export,
  multi-user), which are just more features, not a different kind of
  value. Not decided here — flagged for Phase 7 when it's relevant.
- `src/lib/insights.ts` is a second consumer that will need updating
  if `CatalogItem`'s shape changes materially (e.g. if stock moves to
  a pooled ingredient model per the still-open Inventory gap) — worth
  checking when that work happens.
- 146 tests now (up from 130) — 16 new, covering all four generators
  plus the combined ranking/cap behavior.
