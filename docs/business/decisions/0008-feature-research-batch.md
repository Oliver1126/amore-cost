---
number: 0008
date: 2026-08-18
status: accepted
supersedes:
---

# A researched feature batch built client-side-only; backend-dependent ideas deliberately deferred

## Context
Asked to research possible Calcost features; the resulting list (logged
in [../../ideas/inbox.md](../../ideas/inbox.md) at the time) split
cleanly into two kinds: features buildable with the current
local-only architecture, and features that fundamentally need real
accounts/backend (Shopee/Lazada API access, OCR, true push/email
delivery, or a URL that works outside the business owner's own
browser). Offered a choice between building everything, just the
single most urgent item (data backup), or a hand-picked subset; Oliver
chose **all client-side-feasible ideas**.

## Decision
Built: full backup/export/import, unit conversion for linked
ingredients, batch/recipe scaling, supplier management with a
cheapest-price shortcut, category-tagged substitution suggestions,
reusable quote templates, job-status tracking, Cost History trend
charts, and QR code generation — see
[../../roadmap/completed.md](../../roadmap/completed.md) for the full
description of each.

**Not** built: Shopee/Lazada order sync, receipt OCR, real push/email
notifications, a shareable public price-list link, and a client-facing
quote-approval link — all moved to
[../../roadmap/backlog.md](../../roadmap/backlog.md) as items requiring
real accounts/backend first, per Oliver's explicit instruction to keep
them tracked "for the next build" rather than let them disappear once
out of the active ideas log.

**Also caught while extending, not part of the original ask:** a
Tagalog/English UI toggle was in the original research list but never
actually included in the client-side-feasible build plan — an
oversight, not a deliberate scope cut. Logged separately in
`backlog.md` rather than silently dropped.

## Why
Oliver's direct call on scope. The backend-dependent split is a real
architectural boundary, not a judgment call — none of those four
features have any meaningful local-only version.

## Consequences
- **A real bug was found and fixed while building unit conversion**:
  `propagateIngredientChange`'s cascade previously recomputed a linked
  item's cost using raw `quantity × costPerUnit`, ignoring the
  possibility that the item's own unit differs from the ingredient's.
  Once `CostForm` started allowing a linked row's unit to differ (for
  conversion), the cascade would have silently reverted that unit
  choice and produced a wrong number the next time the ingredient's
  cost changed. Fixed by extracting a shared `linkedCostAmount` helper
  used by both `CostForm` and the cascade, so the two can't disagree —
  verified with both a unit test and a full browser end-to-end pass
  (supplier price switch → cascade → correct converted amount on the
  saved catalog item).
- Quote templates strip `ingredientId` on save by design — a template
  loaded later is a fresh, unlinked starting point, not a live
  connection to whatever the Ingredient Library looks like at load
  time. This is a deliberate tradeoff (portability over always-current
  values), not an oversight — worth remembering if this ever feels like
  a bug report.
- Test suite grew from 52 to 79 tests, still pure-logic only
  (`src/lib/*.test.ts`) — components/pages remain uncovered by
  automated tests, an intentional, stated scope limit, not an
  omission.
