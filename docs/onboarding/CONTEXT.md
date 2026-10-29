---
folder: onboarding
role: deliverable
---

# onboarding/

**Contains:** [user-manual.md](user-manual.md) — the real, client-facing
onboarding guide for someone who just started using Amore Cost. Written
for a business owner, not a developer or QA tester — plain language, no
internal jargon, no decision-number references.

**Different from [../qa/](../qa/CONTEXT.md):** QA's docs are for
someone testing whether the app *works as built*. This is for someone
*using* the finished thing. Don't merge them — different audience,
different tone, different level of detail.

**Worked examples:** every peso figure in the manual comes from the
built-in sample recipes (`src/lib/demo.ts`) run through the app's own
math, so a reader who taps "Try with sample recipes" sees the same
numbers. If the sample data or pricing math changes, recompute the
examples (Adobo/Halo-Halo price and rounding table, OPEX per dish,
the receipt table, the simulator scenarios) — don't hand-edit them.

**Reads:** [../product/modules.md](../product/modules.md) for what's
actually true about each module before writing or updating a "how do I…"
section here — this file should never claim a feature works differently
than it actually does.

**Human check:** the "Need help?" section in `user-manual.md` has a
placeholder for real contact info — it was deliberately left as a
placeholder rather than invented, since no support channel exists yet.
Fill it in (or remove the section) before actually handing this to a
client.
