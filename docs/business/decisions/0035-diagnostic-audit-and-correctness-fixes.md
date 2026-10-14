---
number: 0035
date: 2026-09-02
status: accepted
supersedes:
---

# A real diagnostic audit found 15 correctness bugs — 13 fixed the same day

## Context

Asked for a deeper diagnostic of the app's pages after a run of
UX/design work (decisions 0032–0034) — a plain "still not satisfied."
Ran the `code-review` skill at max effort against the pages/components
not yet freshly audited this session (Costing & Pricing, Catalog
Management, the landing page, POS receipt) plus the newly-shipped
`insights.ts` engine. It surfaced 15 verified correctness bugs — several
in code written earlier the same session.

## Decision

Fixed 13 of the 15 immediately; deferred 2 with reasoning (tracked as
`docs/roadmap/backlog.md` items 10–11).

**Fixed:**

1. **`marginStatus()`'s raw float comparison** misclassified an item
   priced exactly on target as below it 83.5% of the time (simulated).
   Added a small epsilon.
2. **Margin % had no upper clamp** — 100 or more sent price to
   Infinity, which a "no tax" preset then turned into `NaN`,
   permanently corrupting stored Cost History. Clamped at 99.
3. **`CostForm`'s unit fallback on link was dead code** — every fresh
   cost line defaults to `unit: "pcs"`, so `item.unit || ing.unit`
   never actually fell back to the ingredient's own unit, silently
   skipping conversion and able to misprice a line by up to 1000x.
   Linking now always adopts the ingredient's own unit.
4. **`recompute()`'s `item.quantity || 1` fallback disagreed with**
   `ingredients.ts`'s `syncCostItem`, which uses the raw quantity —
   the same linked line could show one cost on screen and silently
   recompute to a different one (including a false ₱0 drop plus a
   false Cost History entry) the next time an ingredient cascade ran.
   Aligned both to the raw quantity.
5. **Unlinking an ingredient bypassed `recompute()` entirely**,
   leaving a stale amount that could also get stuck read-only if
   leftover package fields were still present. Unlink now recomputes
   like every other handler in the file.
6. **The insights engine's "raise price by ~₱X" was computed pre-tax**,
   but every price the app actually shows is tax-inclusive — wrong for
   every VAT/Percentage-Tax item. Now computed against the
   tax-inclusive price.
7. **The insights engine's channel-fee-gap check was mathematically
   unreachable** — its 10% threshold could never clear the 6%/8%
   presets that are the *only* fees the app's UI can actually produce.
   Lowered to 5%.
8. **The insights engine's stock-runway pace divided by a flat 30
   days** regardless of how long the item had actually existed,
   understating pace (and suppressing the alert) for anything newer
   than 30 days. Now divides by the item's real tracked age, capped at
   30.
9. **The insights engine's portfolio-share math was unclamped** — a
   loss-making sibling item could push a leader's reported share past
   100%. Now only computed when every item in the comparison actually
   has non-negative profit.
10. **The insights engine's severity-capped output could let one
    generator's run of same-severity insights silently starve an
    equally important insight from a different generator.** Now
    interleaves round-robin across generators before the severity
    sort, so a cap can no longer be filled by just one source.
11. **`duplicateCatalogItem` shared the exact same `history`/`channels`
    array references as the original** instead of copying them — a
    fresh duplicate could report the *original* item's months-old cost
    history as its own. Now seeds a fresh single snapshot and copies
    the channels array.
12. **A cross-tab data-loss bug**: the POS receipt page opens in a
    genuine new browser tab, and `useLocalStorage` never re-synced
    after its initial read — a refund processed on the receipt tab
    could be silently erased by the original POS tab's next write.
    Added a `storage` event listener to the shared hook (a native
    browser mechanism that only fires for *other* tabs' writes),
    fixing this for every page that uses the hook, not just POS.
13. **Overselling (deliberately allowed per decision 0030) plus a
    refund could inflate stock above any level the item ever held** —
    `checkoutCart` recorded the full oversold quantity on the
    `SaleEntry`, and a later refund restocked that same inflated
    number. Added `stockDeducted` to `SaleEntry` (what actually left
    stock, separate from `quantity`, which stays the true sold amount
    for revenue) — refunds now restock only what was actually taken.
14. Two smaller items the review flagged but didn't formally cap:
    a Tagalog Insights message missing its ₱ prefix, and Costing &
    Pricing's `Suspense` fallback still hardcoding "Loading…" instead
    of the `PageSkeleton` the file already uses correctly elsewhere.
15. A 28px delete-button tap target in `CostForm`'s cost-line table —
    fixed via the same padding-plus-canceling-negative-margin
    technique as `InfoButton.tsx` (decision 0034), keeping the visible
    icon compact for the table's density while the actual clickable
    area reaches 44px.

**Deferred, tracked in `backlog.md`:**

- **Cost History records one snapshot per keystroke**, not per
  settled edit, while a saved item's cost fields are being typed into.
  The correct fix needs a real local-state buffer plus a debounced
  commit — a bigger, riskier change than the other fixes here, and not
  data-destroying (just history bloat and a noisier Sparkline), so
  deferred rather than rushed.
- **Percentage displays inconsistently use `.toFixed(0)`** in a few
  places against `DESIGN.md`'s own documented 1-decimal rule —
  cosmetic, worth one dedicated sweep across every occurrence rather
  than fixing a couple and missing the rest.

## Why

Several of these bugs were in code shipped earlier the *same day*
(decisions 0032's insights engine had 5 of the 15) — a direct
demonstration of why "diagnose it again after building" is a real
discipline, not a formality. The two deferrals follow this project's
own established pattern (decision 0030's POS-memoization deferral):
fix what's correctness-critical immediately, name what needs its own
careful pass instead of rushing it in the same breath.

## Consequences

- `SaleEntry` gained a new optional field (`stockDeducted`) —
  backward-compatible with data already in `localStorage` (falls back
  to `quantity` when absent).
- `useLocalStorage`'s new `storage`-event sync benefits every page
  using the hook, not just the one bug report that found it — worth
  keeping in mind if any future feature relies on *not* auto-syncing
  from another tab (none do today).
- 153 tests now (up from 146) — 7 new, covering the marginStatus
  epsilon, the tax-inclusive raise-by, the channel-gap reachability
  fix, the age-aware stock-runway fix, the portfolio-share clamp, the
  round-robin anti-starvation fix, and the oversell-then-refund stock
  ceiling. `tsc`/`build` clean, key fixes re-verified live against
  hand-computed expected values (not just automated tests).
