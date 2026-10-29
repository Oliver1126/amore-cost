# ⭐ Next steps — read this first

The single pinned entry point for "what do I do now" on this idea.
Linked from the top of both root `CLAUDE.md` and `docs/CLAUDE.md`
specifically so it's never missed at the start of a session. Update
this file the same session anything on it gets resolved or superseded.
See [roadmap/roadmap.md](roadmap/roadmap.md) for the whole plan (start,
scale, win), and [roadmap/backlog.md](roadmap/backlog.md) /
[roadmap/completed.md](roadmap/completed.md) for concrete not-started
work vs. the shipped changelog.

## Where this stands (as of 2026-10-29)

- **The app is five pages** (decision 0040): Dashboard, Input, OPEX &
  Overhead, Receipt Simulator, Margin & POS Simulator — see
  [product/modules.md](product/modules.md). The old 11-module app is the
  `v1-full-11-modules` git tag.
- **Latest build** (decision 0041): Yield % per ingredient line, menu
  price rounding on the Suggested price card, and one-click **"Try with
  sample recipes"** (Adobo, Tapsilog, Halo-Halo) — the fastest way to
  demo the app to a first owner. 184 tests (Vitest).
- **Code:** https://github.com/Oliver1126/amore-cost (`main`).
  **Live site:** https://amore-cost.vercel.app — **behind the code**:
  it predates decisions 0040/0041 and needs a manual `vercel --prod`
  from this folder (no auto-deploy).
- **Competition:** KwentaPOS also does recipe costing inside a POS —
  see [business/kwentapos-comparison.md](business/kwentapos-comparison.md)
  and [business/competitive-landscape.md](business/competitive-landscape.md).
  The answer is the strategy in [roadmap/roadmap.md](roadmap/roadmap.md):
  be the pricing brain, not another POS.
- **Validation: still not run.** Nothing has been shown to a real
  business owner. The build has outpaced validation for months; more
  building doesn't change that.

How it got here, decision by decision, is the changelog in
[roadmap/completed.md](roadmap/completed.md) and the records in
[business/decisions/](business/decisions/CONTEXT.md) — not repeated
here.

## Open, in priority order

1. **Stage 0 — launch-ready** ([roadmap.md](roadmap/roadmap.md#stage-0-launch-ready-week-1-mostly-free)):
   deploy the current build (`vercel --prod`), turn on analytics and add
   an in-app feedback link ([backlog](roadmap/backlog.md) item 3),
   finish the name due-diligence checklist (backlog item 2), create the
   Facebook page and one short-video account.
2. **Stage 1 — validate with 20 food owners**
   ([roadmap.md](roadmap/roadmap.md#stage-1-validate-weeks-26)): the
   script and the pre-set gate are there — set the gate *before* the
   first conversation. Log every conversation in a new
   `business/validation-log.md`. This also answers
   [business/concept.md](business/concept.md)'s open question (monthly
   vs. one-time pricing).
3. **Backlog item 9 (labor double-count guard)** is the one remaining
   correctness gap worth fixing at any stage. Everything else in the
   backlog waits for its roadmap stage.
4. **Extend test coverage to components/pages** — the suite is
   pure-logic only (`src/lib/*.test.ts`); the UI is verified by live
   browser checks, not automated tests.

Real accounts/backend (backlog item 1) is **Stage 3** — deliberately
not on this list until Stage 1's gate is met.

## The moment any of the above resolves

Write a numbered record in
[business/decisions/](business/decisions/CONTEXT.md) using
[business/decisions/_template.md](business/decisions/_template.md), then
come back and edit this file's "Where this stands" list and the open
list above — don't leave a resolved item sitting here stale.
