---
number: 0031
date: 2026-08-21
status: accepted
supersedes:
---

# Deployed to Vercel — the app now has a real, reachable link

## Context

Every module was real and working (0006, 0007, 0015, 0022), the test
suite was at 130 tests, and a cross-page audit had just closed out a
batch of correctness bugs (0030) — but the app still only ran at
`localhost:3003`. `docs/roadmap/backlog.md` item 1 tracked this as
explicitly deferred since 2026-08-18 so ingredient-library work and
the test suite could go first. With that work done, deployment was the
one remaining blocker on `docs/marketing/launch-checklist.md`'s
"nothing below can start without this" gate for Phase 1 validation.

## Decision

Deployed via the Vercel CLI directly from the local project folder
(`vercel --prod`), not via a GitHub-connected project — this repo
isn't a git repository yet. Production URL:

**https://amore-cost.vercel.app**

Project is linked locally (`.vercel/project.json`, scoped to
`oliverrepaja1-6139s-projects/amore-cost`), so a future `vercel --prod`
run from this same folder redeploys to the same URL without
re-linking.

## Why

CLI deploy was the fastest path to a real, shareable link given the
project has no git remote yet — Vercel's git integration (auto-deploy
per commit/PR preview) needs a connected repo, which is a separate,
larger step (initializing git, choosing a host, pushing history) not
required just to get *a* link in front of a business owner. The
project name had to be passed explicitly as `amore-cost` since Vercel
derives a default name from the folder name ("Amore Cost"), which
fails validation (must be lowercase, no spaces) — consistent with this
org's own "services use lowercase" naming convention.

## Consequences

- `docs/roadmap/backlog.md` item 1 (deploy) is done and removed;
  real accounts + backend is now item 1.
- Every future code change requires an explicit `vercel --prod`
  redeploy from this folder — there is no auto-deploy-on-commit yet,
  since that needs a connected git repository. If/when this repo is
  put under git and pushed to GitHub, connecting it to this same
  Vercel project (rather than creating a second one) is the natural
  next step, gaining preview deployments per branch/PR for free.
- The Phase 1 validation gate on `docs/marketing/launch-checklist.md`
  is cleared — go-to-market outreach can start.
- Vercel's own analytics/logs (via `vercel inspect` or the dashboard at
  vercel.com/oliverrepaja1-6139s-projects/amore-cost) are now the place
  to check for real-world errors, not just local `npm run dev` logs.
