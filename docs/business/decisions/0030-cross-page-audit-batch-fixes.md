---
number: 0030
date: 2026-08-21
status: accepted
supersedes:
---

# Cross-page audit batch: fixed 8 correctness bugs, deferred 2 by design

## Context

Asked to audit every dashboard page not yet reviewed this session
(Alerts, Break-Even, Dashboard, Documents, Documents/Print, History,
Inventory, Multi-Channel, Multi-User, POS, Reporting) for bugs needing
fixes, beyond the Catalog Management / Costing & Pricing work already
done. Ran the `code-review` skill at high effort across all 11 pages,
which returned 10 findings.

## Decision

Fixed 8 of the 10 findings in the same pass. Deliberately left 2
unfixed, documented below rather than silently dropped.

**Fixed:**

1. Inventory "Add Stock" accepted negative quantities, silently
   *reducing* stock instead of adding to it — now clamped to `n <= 0`
   rejected, plus `min={1}` on the input as a UI signal.
2. Inventory "Log Sale" accepted negative quantities, which
   `logSale()` would have booked as a fake refund — same guard.
3. Restoring a backup missing `exportedAt` crashed on a later
   `.slice(0, 10)` call instead of showing the existing "not a valid
   backup" error — `parseBackup()` now validates that field exists.
4. Break-Even always showed the *draft* calculator state, ignoring
   any saved catalog item — even right after Dashboard/Overview had
   just shown that same item as "most recently priced." Extracted the
   inline Dashboard logic Break-Even needed too into shared
   `mostRecentCatalogItem()` / `featuredState()` in `src/lib/catalog.ts`
   (following this project's own established rule: duplication gets
   extracted once a second caller needs it, same precedent as
   `marginStatus()`).
5. Multi-User's "Remove" had no confirmation — one misclick silently
   deleted a profile. Added a `window.confirm`, matching the phrasing
   pattern (EN/TL, name-aware) already used elsewhere in this app.
6. Inventory, Alerts, and Multi-Channel edits didn't bump
   `updatedAt` on the catalog item — only `/costing`'s
   `updateItemState` did. This made Dashboard's "most recently
   touched item" go stale after touching stock, thresholds, alert
   targets, or channel prices. Also fixed at the source:
   `logSale`/`checkoutCart`/`refundTransaction` in `src/lib/catalog.ts`
   now bump `updatedAt` too, since those funnel through the same gap.
7. Alerts re-implemented the below-target-margin check by hand
   instead of reusing the shared `marginStatus()` — now shares it, so
   the two can't silently disagree.
8. `peso()`/`pesoSigned()` were duplicated verbatim across what
   turned out to be **14** files once components (not just the pages
   the audit scoped) were checked — including the customer-facing
   printed quotation and POS receipt. Extracted to `src/lib/format.ts`.

**Deliberately not fixed:**

9. POS cart quantity has no ceiling against stock on hand. Left as-is:
   `checkoutCart()` already rejects `quantity <= 0` at the function
   level, and the remaining "let it go over, just warn" behavior
   matches this app's own established, previously-scoped POS
   philosophy (decision 0015) of flagging rather than blocking —
   overselling is a real, common small-business reality (pre-orders,
   backorders), not a bug.
10. `cartDetails`/`visibleItems` in POS recompute on every keystroke
    instead of being memoized. This is a performance finding, not a
    correctness one, on the app's single most business-critical
    screen (checkout) — fixing it deserves a careful, isolated pass on
    its own rather than folding it into a batch of unrelated
    correctness fixes. Left for `docs/roadmap/backlog.md`.

## Why

An audit that stops at "find bugs" without triaging by severity just
relocates the problem from code to a findings list. Correctness bugs
that produce wrong stored data (negative stock, fake refunds, a
crash, silent `updatedAt` staleness feeding a *different* page's
"most recent" logic) get fixed immediately, in the same pass, per
this project's own "fix what you find" rule. Findings that are really
about a deliberate, already-documented product stance (POS
overselling) or that trade correctness fixing for performance risk on
a high-stakes screen (POS memoization) get named and deferred
explicitly instead of either being silently fixed against the grain
of a prior decision, or silently dropped.

## Consequences

- Dashboard's "most recently touched item," Break-Even, and any
  future feature relying on `updatedAt` freshness are now trustworthy
  across every module that edits a catalog item, not just `/costing`.
- `peso`/`pesoSigned` have one home; a future formatting change (e.g.
  currency symbol placement, grouping) can no longer silently diverge
  between the printed quotation, the POS receipt, and the dashboard.
- `featuredState()` is now the one place "what item should this page
  show by default" logic lives — a third caller (any future module
  needing the same "prefer named draft, else most recent" rule) reuses
  it rather than re-deriving it a third time.
- POS overselling ceiling and POS memoization remain open; the latter
  is tracked in `docs/roadmap/backlog.md`.
