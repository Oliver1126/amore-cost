---
number: 0034
date: 2026-09-02
status: accepted
supersedes:
---

# DESIGN.md aligned to reality, plus the real gaps it surfaced got fixed the same day

## Context

A `DESIGN.md` existed at the project root — a generic UI-governance template (product principles, tokens, accessibility rules, checklists) written with many `[NEEDS TEAM INPUT]` placeholders, some already answered by real code that was never checked, some describing behavior the app doesn't actually have. Asked to align it with the real system. A second, independent list arrived mid-task — a plausible-sounding set of "likely" issues, explicitly self-flagged by whoever wrote it as "inferred from page names/product intent, not an actual visual audit." Cross-checking both against the real code was the actual work, not just editing prose.

## Decision

**Rewrote `DESIGN.md` in place**, replacing every `[NEEDS TEAM INPUT]` with either the real answer (read directly from `globals.css`, actual component files, actual class usage) or an honest `GAP`/`Fixed` marker instead of a placeholder. Corrected several claims in the process:

- "One true cost" (no data-drift risk) and "never price blind" (live recalculation, no Calculate button) were already **real** — the second list's claim that these might not be true was checked and is wrong.
- The sidebar's mobile behavior was already a real, working full-screen drawer (decision 0016) — not the "no mobile-collapse strategy" the second list assumed, and not the generic "bottom nav" the original `DESIGN.md` template suggested either.
- Margin Alerts already pairs color with a text label, not color alone — real, verified in the actual component.

**Then fixed the gaps that were real**, the same day, since they were small and low-risk once actually identified:

1. **Skeleton loading state.** New `PageSkeleton` component replaces the bare `t("common.loading")` text string across all 12 pages that had it.
2. **Visible keyboard focus rings.** One global `:focus-visible` rule in `globals.css` (unlayered CSS, wins over Tailwind's utility-layer `focus:outline-none` used at 16 call sites) — no per-component changes needed.
3. **Two sub-44px nav tap targets** (`AppShell.tsx`'s hamburger, `Sidebar.tsx`'s close button) resized to 44px. `InfoButton.tsx` (decision 0033, shipped the same session) got the same fix via padding + a canceling negative margin, keeping its icon visually small while its clickable area is a full 44px.
4. **The printed customer-facing quotation was entirely hardcoded English.** Wired through `t()` like every other page — the one document most likely to go directly to a Tagalog-speaking client was the one page that couldn't speak Tagalog.
5. **A related, quieter bug found while fixing #4:** `StatCards`, `TaxCard`, and the print page all displayed the tax preset name (`breakdown.taxLabel` — "VAT," "Percentage Tax") as raw English even in TL mode, instead of routing through the already-existing `getTaxPresetLabel()` helper. Three independent call sites making the same mistake — fixed all three.

**Not fixed, named honestly instead:** the missing shared `<Table>` component (8 separate hand-rolled tables) and tables not collapsing to a card layout on mobile (using `overflow-x-auto` instead). Both are real, both are correctly on the "second list," but fixing them properly means building the shared component first and converting all 8 call sites to it — collapsing them to cards individually first would be redone work. Scoped as its own future pass, not folded into this one.

## Why

A design-governance doc that's mostly placeholders and unverified guesses is worse than no doc — it can't be trusted to tell a future agent (or the founder) what's actually true, and a plausible-sounding "likely" list that turns out to be partly wrong (source-of-truth risk, manual-calculate) would have sent effort at problems that don't exist while the real ones (skeleton state, focus rings, tap targets, the hardcoded-English print page) sat unfixed. Verifying against the actual code before either documenting or fixing anything is the same discipline this project has applied all session — check, don't assume.

The five fixes were made immediately rather than just logged, because none of them were speculative feature work (the kind this project has repeatedly, deliberately deferred until Phase 1 validates) — they're corrections to already-shipped pages doing something the app's own stated rules say they shouldn't.

## Consequences

- `DESIGN.md` is now a real reference — future UI work should be checked against it and trusted, not treated as a template with unknowns.
- The shared `<Table>` component is now a named, scoped future task (`DESIGN.md` §5/§9), not a vague "should probably do this someday."
- `PageSkeleton` and the `getTaxPresetLabel()` pattern are now the things to reach for — a 13th "Loading…" text string or a 4th raw `taxLabel` display would be a regression, not a fresh mistake.
- No test coverage added — every fix here is presentational (CSS, component swap, i18n wiring), not new pure logic; verified live instead (keyboard Tab-focus color, EN/TL print output, tap-target pixel dimensions, skeleton markup).
