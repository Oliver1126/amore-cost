---
number: 0006
date: 2026-08-17
status: accepted
supersedes:
---

# All 10 modules built now, simulated with localStorage instead of waiting for accounts

## Context
[roadmap.md](../../roadmap/roadmap.md) sequenced the build as v0 (free calculator,
local-only) → v1 (catalog, inventory, history, documents — assumed to
need real accounts) → v2 (multi-user, multi-channel, alerts, reporting
— assumed to need a backend), validating demand between phases. After
the dashboard redesign (decision 0005) and an Overview page, Oliver
asked to build out the remaining 8 "coming soon" module pages. Offered
three options: leave them as placeholders, build only the two
(Catalog, Documents) that don't strictly need accounts, or build all
eight using local-only data. He chose the third.

## Decision
All 10 modules are now real and interactive, built entirely on
`localStorage` — no accounts, no backend, same trust model as v0. A new
`CatalogItem` record (`src/lib/catalog.ts`) replaced the single
in-progress draft as the core data shape: it holds the costing state
plus per-item stock, a target margin, sale-channel fees, a cost-change
history, and a sales log. Every module reads or writes some slice of
that one record type.

## Why
Oliver's direct call, after being shown the tradeoff (staying
placeholder vs. a smaller real subset vs. all eight simulated locally).

## Consequences — what's real vs. simplified per module

- **Catalog, Cost History, Documents (CSV + print), Multi-Channel
  Pricing, Sales & Profit Reporting**: fully real for a single-device
  user — no meaningful gap versus what accounts would have added,
  other than cross-device sync.
- **Inventory** is simplified: tracks stock per *finished catalog
  item*, not a shared per-ingredient stock pool. iCost's actual
  "Cook & Deduct" decrements shared raw-ingredient stock across every
  recipe using it — replicating that needs a real ingredient-library
  module (referenced items instead of free-text cost-item labels) that
  doesn't exist yet. Flagged via `note` on the module in
  `src/lib/modules.ts` and in `docs/product/modules.md`.
- **Margin Alerts** is simplified similarly: it compares an item's
  current margin against a target you set on that item, not a
  cross-item alert triggered by a shared ingredient's price change
  (same root cause — no shared ingredient registry yet).
- **Multi-User is the biggest gap from the original spec, by design
  necessity, not an oversight**: it's a named-profile switcher with
  zero real security — anyone using the browser can switch profiles or
  add new ones freely. It's labeled as such directly in its own page.
  Real multi-user access control needs actual accounts and a backend.
- No automated test suite covers any of this yet — verified via manual
  Playwright passes during the build (catalog CRUD, inventory stock/
  sale logging cross-checked against Reporting's aggregates, CSV
  import/export round-trip, print-media CSS actually hiding the app
  chrome, cost-history snapshots firing on real changes only). Worth
  turning into a real suite before this grows further.

## What this means for the roadmap

[roadmap.md](../../roadmap/roadmap.md)'s Phase 3 (build v1) and Phase 4
(monetize/v2) are effectively done in local-only form, well ahead of
Phase 1 (validate) — the build has now outpaced validation twice
(first with v0 itself, now with all ten modules). Phase 1 is more
urgent than ever: there's a lot now riding on whether real business
owners actually want this, still unconfirmed.
