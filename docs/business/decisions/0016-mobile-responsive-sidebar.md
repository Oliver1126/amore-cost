---
number: 0016
date: 2026-08-19
status: accepted
---

# Sidebar becomes a mobile drawer below the `lg` breakpoint

## Context
Found 2026-08-18 while writing the landing page FAQ's "does it work on
my phone" answer (checked live rather than assumed): `Sidebar.tsx` was
a fixed `w-64` element sitting in permanent flex flow next to the main
content, so on a phone-width screen the content got squeezed into a
narrow column and the language/theme toggles clipped off-screen.
Tracked in `roadmap/backlog.md` item 9, flagged as higher priority once
Point of Sale shipped (decision 0015) — a market-stall checkout is
exactly a phone-first use case.

## Decision
- `Sidebar` now takes `{ open, onClose }` props instead of managing its
  own state. Below the `lg` Tailwind breakpoint it renders as a
  fixed, full-height overlay panel (`fixed inset-y-0 left-0`, slid in/
  out via a `transform`/`translate-x` transition) with a backdrop and
  its own close (`×`) button; at `lg` and above it reverts to
  `lg:static` in normal flex flow, always visible — desktop behavior
  is pixel-identical to before.
- Every nav `Link` calls `onClose` `onClick` — clicking a link closes
  the mobile drawer as part of navigating, not as a separate step.
- `AppShell` (now a client component, needed for the `useState` toggle)
  owns the open/closed state and renders a hamburger button
  (`lucide-react`'s `Menu`) visible only below `lg`, next to a small
  `BrandMark` so the app is still identifiable with the drawer closed.
  The language/theme toggle row is unchanged on desktop; on mobile it
  now shares a row with the hamburger instead of clipping.

## Why
Directly requested, prioritized specifically because Point of Sale's
real-world use case (a market stall, a small counter) is a phone
scenario, not a desktop one — a checkout screen that's actually unusable
on a phone would undercut the whole point of shipping it.

## Consequences
- **No new dependency.** `Menu`/`X` were already available from
  `lucide-react`, already a project dependency (used throughout
  `modules.ts`'s icons).
- **Verified at three breakpoints, not just "responsive-looking" in
  code** — 390px (phone), 820px (tablet), 1400px (desktop) — confirming
  the drawer opens/closes, a nav click both navigates and auto-closes
  it, and desktop is unchanged pixel-for-pixel from before this change.
- `roadmap/backlog.md` item 9 is resolved and removed — no partial/
  narrowed version of it remains outstanding.
- This fixes the *dashboard's* layout only. The public landing page
  (`src/app/page.tsx`, decision 0012) already had its own responsive
  nav handling (a `hidden sm:flex` nav row) from when it was built and
  wasn't affected by this gap.
