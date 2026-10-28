---
folder: qa
role: guide
---

# qa/

**Start here:** [qa-manual.md](qa-manual.md) — setup, the per-page test checklist,
what's a known simplification vs. a real bug, and how to report what
you find.

**Reads:** [../product/modules.md](../product/modules.md) before filing
anything as a bug — several things that look broken are documented,
deliberate simplifications (the simulators never save anything; they use
direct cost, not full recipe cost).
Re-describing a known limitation as a new bug wastes a review cycle.

**Contains:** the per-page test checklist (the old 11-module walkthrough
is archived in `../archive/eleven-modules-2026-10/`). Nothing here is product spec or roadmap — that's
[../product/](../product/CONTEXT.md) and [../roadmap/](../roadmap/roadmap.md).

**Human check:** this app has never been tested by anyone outside the
person building it — see [../next-steps.md](../next-steps.md)'s
"build has outpaced validation" note. This QA pass and real user
validation (Phase 1) are two different things: QA checks the app
works as built; Phase 1 checks whether the build is even the right
thing. Don't let a clean QA pass substitute for the still-missing
Phase 1 validation.
