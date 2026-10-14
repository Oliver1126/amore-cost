---
number: 0013
date: 2026-08-18
status: accepted
---

# Landing page gets a real interactive demo calculator + an honest placeholder pricing section

## Context
Oliver asked for the landing page's costing calculator to be a real,
usable demo (not the static mockup card decision 0012 shipped with),
with a usage limit that pushes visitors toward "the pricing section to
subscribe or create an account for free." No accounts or payment system
exist anywhere in this app — `product/scope-v1.md` calls pricing/gating
a genuinely open question, and the draft ₱149–299/month figure is
explicitly flagged everywhere as unvalidated. Building a fake, clickable
"Subscribe" flow with nothing behind it would be a real dark pattern —
so this was flagged back before building, and Oliver chose: show a
placeholder pricing section (clearly marked as not live), plus a clear
link to the actually-free dashboard.

## Decision
- `src/components/LandingCalculator.tsx` (new, client component): a
  real 4-field demo (materials/labor/packaging cost, target margin %)
  that calls the actual `computePriceBreakdown` from `src/lib/calculator.ts`
  — the same pricing math the real app uses, not a re-implementation
  that could drift out of sync. Fully ephemeral (`useState` only, no
  `localStorage`) — a page refresh resets it, deliberately, since this
  is a try-before-you-open-the-real-thing demo, not a place to store
  real data.
- **3 free tries** (`FREE_TRIES` constant), counted per calculation. On
  the 4th attempt the card swaps in place to a "you've tried the free
  preview" message with a button straight to `/dashboard` — worded
  honestly: the *real* app has no such limit, this is a landing-page-
  only nudge.
- New `#pricing` section on the landing page: a **Free** card (what's
  actually live today, linking to `/dashboard`) next to a **Pro** card
  labeled "proposed, not final" with a disabled "Coming soon" button —
  visually present for feedback/direction-setting, but nothing on it is
  clickable in a way that implies a working signup or payment flow.
  The section's own copy states directly: "Nothing below is live yet."

## Why
Oliver's direct choice between three options after the fake-paywall
concern was raised: honest-nudge-only, placeholder-pricing, or a real
email waitlist. He picked placeholder pricing *plus* the honest
dashboard link — both, not instead of each other.

## Consequences
- **No deceptive UI shipped.** The "Coming soon" button is `disabled`,
  not a fake link, and the pricing section states plainly that it
  isn't live. Anyone reading the page can tell the Free tier is the
  entire truth of what exists today.
- **Reuses real pricing logic, not a copy.** If `computePriceBreakdown`
  or `CalculatorState` change shape later, this demo either keeps
  working or fails to typecheck — it can't silently drift into showing
  wrong math the way a hand-duplicated calculation would.
- **The visible ₱149–299/month figure is the same unvalidated draft
  number already in `product/scope-v1.md`** — reused deliberately for
  consistency rather than inventing a new number nobody's reasoned
  about. If that draft number ever changes, this page needs updating
  too (not currently wired to a single source of truth for the figure
  itself, only for the module descriptions via `MODULES`).
- This still doesn't resolve the real open question (`scope-v1.md`,
  `roadmap.md` Phase 4) of *whether* to ever charge anything — it just
  gives the landing page a place to react to, without committing to it.
