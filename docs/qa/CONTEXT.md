---
folder: qa
role: guide
---

# qa/

**Start here:** [instructions.md](instructions.md) — setup and a
walkthrough of every module, for anyone testing the app who hasn't used
it before.

**Then:** [qa-manual.md](qa-manual.md) — the actual test checklist,
what's a known simplification vs. a real bug, and how to report what
you find.

**Reads:** [../product/modules.md](../product/modules.md) before filing
anything as a bug — several things that look broken are documented,
deliberate simplifications (Multi-User's lack of real security,
Inventory's per-item stock, Margin Alerts' lack of push notifications).
Re-describing a known limitation as a new bug wastes a review cycle.

**Contains:** onboarding instructions for a QA tester and the module-by-
module test checklist. Nothing here is product spec or roadmap — that's
[../product/](../product/CONTEXT.md) and [../roadmap/](../roadmap/roadmap.md).

**Human check:** this app has never been tested by anyone outside the
person building it — see [../next-steps.md](../next-steps.md)'s
"build has outpaced validation" note. This QA pass and real user
validation (Phase 1) are two different things: QA checks the app
works as built; Phase 1 checks whether the build is even the right
thing. Don't let a clean QA pass substitute for the still-missing
Phase 1 validation.
