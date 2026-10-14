---
number: 0012
date: 2026-08-18
status: accepted
---

# `/` is now a public landing page; the app moved to `/dashboard`

## Context
Since v0 (decision 0005), `/` was the Overview dashboard page — there
was no separate marketing/landing surface inside the app itself (only
the standalone `docs/branding/pitch-one-pager.html`, built for Phase 1
outreach, decision 0005). Oliver asked for an actual in-app landing
page at `/`, referencing a Pinterest-linked design ("TaskGo – Technology
Website Template" — the Pinterest fetch only returned that title, no
visual/layout detail, so the built page follows a generic modern
SaaS-template shape: hero, feature grid, "how it works," closing CTA,
footer — not a pixel copy of an unseen reference), with the existing
dashboard moved to `/dashboard`.

## Decision
- `src/app/page.tsx` is now a standalone public landing page — no
  Sidebar, no `AppShell`, a plain marketing layout (hero with a sample
  cost-breakdown mockup, a 6-module feature grid pulled from
  `MODULES` so the copy can't drift from what `product/modules.md`
  says, a 3-step "how it works," a closing CTA, a footer). "Open
  Dashboard" links point to `/dashboard`.
- Everything that used to render inside `AppShell` now lives under a
  Next.js **route group**, `src/app/(dashboard)/` — `costing/`,
  `ingredients/`, `break-even/`, `catalog/`, `inventory/`, `history/`,
  `documents/` (incl. `documents/print/[id]/`), `multi-user/`,
  `multi-channel/`, `alerts/`, `reporting/`, all moved in as-is. Route
  groups don't add a URL segment, so **none of those routes' actual
  URLs changed** — `/costing` is still `/costing`. `AppShell` (Sidebar
  + language/theme toggles) moved from the root layout into
  `src/app/(dashboard)/layout.tsx`, so it now wraps only the dashboard
  routes, not the new landing page.
- The Overview page itself moved: `src/app/page.tsx` (old) →
  `src/app/(dashboard)/dashboard/page.tsx` (new), so its URL changed
  from `/` to `/dashboard`. `MODULES` in `src/lib/modules.ts` updated
  to match (`href: "/dashboard"`), which is also what drives the
  Sidebar's active-link highlighting — no separate change needed there.
- Root `src/app/layout.tsx` now only sets up `<html>`/`<body>`/fonts/
  the pre-hydration theme script — it no longer renders `AppShell`.

## Why
Oliver's direct ask: a real landing page belongs at the root URL of a
product people might actually be pointed at, with the working app one
click away — not the dashboard itself sitting at `/` with no
introduction for a first-time visitor.

## Consequences
- **Found and fixed a real pre-existing bug while doing this**: Break-
  Even's "you haven't priced anything yet" empty state linked its
  "Costing & Pricing" text to `href="/"` — which used to *coincidentally*
  work because `/` was Overview and Overview also has a costing CTA,
  but was always mislabeled. Now that `/` is the marketing page, that
  link would have sent a mid-flow user out to the landing page instead
  of Costing & Pricing. Fixed to `href="/costing"`.
- **Every other module's URL is unchanged** — this was a deliberate
  scope limit. Prefixing every route under `/dashboard` (e.g.
  `/dashboard/costing`) was not requested and would have meant editing
  `MODULES`, every internal `Link`, and re-testing every page for no
  real benefit — the route group achieves the actual ask (dashboard
  chrome vs. a bare landing page) without that churn.
- **No fabricated social proof on the landing page** — no fake user
  counts, testimonials, or client logos. `next-steps.md` is explicit
  that this app has never been shown to a real business owner; a
  landing page implying otherwise would be actively misleading. The
  feature grid states only what's actually built.
- Favicon/apple-icon routes (`icon.tsx`, `apple-icon.tsx`) stayed at
  the `src/app/` root, unaffected by the route group — they apply
  site-wide regardless of which page is being viewed.
- The standalone `docs/branding/pitch-one-pager.html` is a *different*
  artifact for a *different* purpose (external Phase-1 validation
  outreach, decision 0005) and is untouched by this — the app now has
  two distinct "front door" surfaces for two different audiences/
  purposes, not one replacing the other.
