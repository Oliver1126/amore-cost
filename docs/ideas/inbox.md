# Ideas inbox

A running, dated, low-friction log. Append here anytime something comes
up — mid-conversation, in the shower, wherever — that's worth
remembering but isn't decided yet. Nothing here is a commitment.

## How to add an entry

One or two lines, dated, newest at the top. Don't write a proposal —
just capture enough that future-you (or future-Claude) knows what you
meant.

```
- 2026-08-16 — Idea: let a user import their existing Raket.ph
  spreadsheet columns via CSV to zero out switching cost. Needs a real
  product before it can be built — parked here, not in product/.
```

## How triage works

When an idea is worth acting on:
- **A feature to consider for the build** → add it to
  [../roadmap/backlog.md](../roadmap/backlog.md) with the
  [roadmap](../roadmap/roadmap.md) stage it belongs to, once there's
  enough shape to it. (Read decision 0040 first — the app was cut to
  five pages on purpose.)
- **A name/tagline candidate** → add it to
  [../branding/options.md](../branding/options.md).
- **A real choice actually made** (name picked, fork picked, a
  technical call once code exists) → write it up as a numbered file in
  [../business/decisions/](../business/decisions/CONTEXT.md) using
  [../business/decisions/_template.md](../business/decisions/_template.md).
- **A validated market/business conclusion** → fold it into
  [../business/](../business/CONTEXT.md).
- **Doesn't hold up** → delete the entry, or leave it — there's no cost
  to a dead idea sitting here.

Move entries out, don't copy them — this file should only ever contain
things that haven't been decided yet.

## Log

- 2026-10-28 — Idea: a default yield % on each Ingredient Library entry
  (prefilled into new recipe lines), and an app-wide default menu
  rounding — both left out of decision 0041 on purpose (yield and
  rounding are per recipe today). Wait for a real user to ask.

*(The 2026-08-19 POS idea was triaged and built the same day as
a scoped checkout module: see
[decision 0015](../business/decisions/0015-pos-checkout-module.md) and
[completed.md](../roadmap/completed.md). The hardware-dependent pieces
it flagged (cash drawer, thermal-printer-specific commands,
multi-register sync) and the client-side-feasible follow-ups (camera
scanning, refunds/voids) are now tracked in
[roadmap/backlog.md](../roadmap/backlog.md) instead of sitting here.
POS itself was later removed entirely by
[decision 0040](../business/decisions/0040-five-pages-modeled-on-reference.md),
and those follow-ups were dropped with it.)*
