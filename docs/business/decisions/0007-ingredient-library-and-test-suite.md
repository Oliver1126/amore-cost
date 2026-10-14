---
number: 0007
date: 2026-08-18
status: accepted
supersedes:
---

> **Navigation/page merged 2026-08-20** by
> [0022](0022-ingredient-library-and-catalog-merged.md) — the Ingredient
> Library feature and data model described below are unchanged and
> still current. It no longer has its own top-level module or route;
> it's now presented as a section of the merged **Catalog Management**
> page (`/catalog#ingredient-library`), directly beneath the product
> list, with the two now cross-linked (which products use which
> ingredient, and vice versa).

# Ingredient Library built, plus a real test suite — deployment explicitly deferred to the backlog

## Context
[decision 0006](0006-all-modules-built-local-only.md) flagged the
Cost Ledger module as still missing its single biggest promised
feature: "cost each raw input once, reuse it across every product —
change one price, every linked product recalculates" (see
[../concept.md](../concept.md)'s "why static templates aren't enough").
`CostItem` only ever held a free-typed label and a manually-entered
amount — nothing was actually shared. Separately, `next-steps.md`
flagged real regression risk: 10 modules now share one `CatalogItem`
data shape with zero automated test coverage. Offered a choice between
deploying the app, building the ingredient library, or writing tests;
Oliver chose to build the library and the tests, explicitly deferring
deployment.

## Decision
- Added a real **Ingredient Library** module (`/ingredients`,
  `src/lib/ingredients.ts`): a shared `Ingredient { name, unit,
  costPerUnit }` record. A `CostItem` can now optionally carry an
  `ingredientId`; when linked, its label/unit/amount are derived from
  the ingredient instead of typed manually. Editing an ingredient's
  cost cascades to every catalog item and the current draft that
  references it, via `propagateIngredientChange` — and correctly
  triggers a real Cost History snapshot only when the cascade actually
  changes a linked item's cost or price (reuses `updateItemState`'s
  existing change-detection, doesn't reinvent it).
- Added a real **test suite** — Vitest, `npm test`, 52 tests across
  `calculator.test.ts`, `catalog.test.ts`, `csv.test.ts`, and
  `ingredients.test.ts`, covering the pricing/tax/break-even/channel
  math, catalog CRUD and history-snapshot logic, CSV import/export
  round-tripping, and the ingredient cascade itself (including that
  *unrelated* items are provably untouched).
- Restructured `docs/roadmap.md` into `docs/roadmap/` (`roadmap.md` +
  `backlog.md` + `completed.md`), matching Atlas Freelance's actual
  backlog/completed split instead of one flat phased file. Deployment
  is now `backlog.md` item 1, explicitly deferred rather than dropped.
- Added `docs/business/strategy.md` (vision/objectives/SWOT/financial
  summary/risks) and `docs/business/competitive-landscape.md` (the
  crisp comparison table + "the wedge," separated from
  `market-research.md`'s narrative research trail).

## Why
Oliver's direct call on scope (library + tests over deployment), then
asked for the strategy/competitive docs in the same session.

## Consequences
- **This is a partial fix for decision 0006's flagged Inventory/Alerts
  simplification, not a full one — be precise about which half moved.**
  The Ingredient Library shares **cost**: one `costPerUnit`, referenced
  everywhere. It does **not** share **stock quantity** — Inventory still
  tracks stock-on-hand per finished catalog item, not a pooled raw-
  ingredient stock that draws down across every recipe using it (real
  "Cook & Deduct" parity). That remains a real gap, now with a natural
  foundation (`Ingredient` records already exist) but not yet built.
- Deleting an ingredient detaches linked items rather than destroying
  their data (`detachIngredient`) — they keep their last-known
  label/unit/amount as a plain manual entry. Confirmed deliberate, not
  a safety-rail afterthought.
- The test suite covers pure logic only (`src/lib/*.ts`), not
  components or pages — a real, honest scope limit, not full coverage.
- Deployment, real accounts, and the name due-diligence checklist all
  now live in `docs/roadmap/backlog.md` rather than scattered across
  `next-steps.md` prose.
