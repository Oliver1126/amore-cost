---
number: 0036
date: 2026-09-02
status: accepted
supersedes:
---

# Cost History now commits one snapshot per settled edit, not per keystroke

## Context

Decision 0035 named this as a real bug but deferred it: every keystroke
while editing a saved item's cost fields called `updateItemState()`
directly, appending a Cost History snapshot per digit typed instead of
per real edit — typing "1200" into a cost field could append 4
snapshots. Deferred at the time because a hasty debounce risked losing
a final edit on quick navigation or introducing stale-closure bugs — a
bigger, riskier change than the other fixes in that same batch.

## Decision

Split `updateItemState()` (`src/lib/catalog.ts`) into two composable
pieces:

- **`updateItemStateLive(item, state, profileId)`** — bumps
  `state`/`updatedAt`/`updatedByProfileId` instantly, never touches
  history. Called on every keystroke.
- **`commitHistorySnapshot(item)`** — appends a snapshot of the item's
  *current* state, only if it actually differs from the last recorded
  one. Called once, debounced, after the user pauses.
- `updateItemState()` itself is now just `commitHistorySnapshot(updateItemStateLive(...))`
  — every other caller (`propagateIngredientChange`'s cascade,
  Costing & Pricing's one-shot `reset()`) keeps its exact existing
  atomic behavior, unchanged.

New shared hook, `useDebouncedCommit` (`src/lib/useDebouncedCommit.ts`):
re-arms a timer on every dependency change, reads the commit callback
through a ref (so a fired timer always runs the *latest* closure, not
a stale one), and flushes once more on unmount so a final edit isn't
lost if the user navigates away before the delay elapses (1200ms).
Wired into both places that had this bug: Costing & Pricing's
`setState`, and Catalog Management's "Edit & Breakdown" modal
(`saveEditModalState`) — the same underlying pattern, duplicated.

## Why

The split keeps the *display* instant (every module still reads
`item.state` directly, updated on every keystroke via
`updateItemStateLive`, so "never let a user price blind" — this
project's own stated principle — holds exactly as before) while only
debouncing the *record-keeping* side effect. Reading the commit
callback through a ref rather than closing over it once avoids the
classic stale-closure bug where a debounced call would act on
whatever `catalog`/`editingItem` existed when the timer was first
set, not what exists when it actually fires — verified live: typing
"1200" digit-by-digit left history untouched until the pause, then
added exactly one entry with the settled value 1200, while the
displayed "True cost" updated on every keystroke with no visible
delay.

## Consequences

- `docs/roadmap/backlog.md` item 10 is done and removed.
- `useDebouncedCommit` is now a small, reusable, generically-named
  utility — worth reaching for anywhere else a "live display, debounced
  side effect" pattern is needed, rather than hand-rolling a new timer.
- 159 tests now (up from 153) — 6 new, directly covering
  `updateItemStateLive`, `commitHistorySnapshot`, and pinning that
  `updateItemState` is exactly their composition.
