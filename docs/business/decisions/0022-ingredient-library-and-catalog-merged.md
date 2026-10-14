---
number: 0022
date: 2026-08-20
status: accepted
supersedes:
---

> **Presentation superseded 2026-08-21** by
> [0027](0027-ingredient-library-as-modal.md) — the Ingredient Library
> is no longer an always-visible page section (the `#ingredient-library`
> anchor referenced below no longer exists); it's now a modal opened by
> its own button. The merge decision itself — one page, cross-linked in
> both directions — is otherwise unchanged.

# Ingredient Library and Catalog merged into "Catalog Management"

## Context
Oliver said the app's UX wasn't making its own capabilities visible —
specifically, Ingredient Library (`/ingredients`) and Catalog
(`/catalog`) read as two separate, disconnected pages even though
they're deeply linked under the hood (a Costing & Pricing cost line can
point at a shared Ingredient, and every Catalog item that does gets
recalculated automatically). He asked for them to be merged into one
"Catalog Management" page, visibly working the way the competitor site
food-cost-tau.vercel.app's "Recipe Management" does: a product list
showing cost/margin up front, a margin-based filter, and a per-item
ingredient-cost breakdown, instead of requiring a trip to a different
page to see how something is costed.

## Decision
- One page at `/catalog`, one scroll, two sections — not tabs, since
  tabs would hide the second section behind a click, exactly the
  "invisible capability" problem being fixed. A "Jump to: Products ·
  Ingredient Library" anchor row sits under the heading.
- **Products** section (the former Catalog table) gains: a name/SKU
  search box; a 3-state margin filter — All / On target / Below target
  — using each item's own `targetMarginPercent` against its live
  `marginPercent` (new `marginStatus()` in `src/lib/catalog.ts`, same
  `>=` comparison Margin Alerts already makes). Rejected copying the
  competitor's fixed "≤30% cost" cutoff — Amore Cost is multi-vertical
  with different suggested margin ranges per vertical already, so a
  global 30% would misreport service/resale items. Each product row
  also gets a "N ingredient(s) linked" / "Not linked to the Ingredient
  Library yet" badge that expands an inline cost-breakdown table
  (Ingredient/Label, Supplier, Package price, Qty/package, Shipping,
  Unit cost, Line cost) — the direct analogue of the competitor's
  per-recipe ingredient-line breakdown.
- **Ingredient Library** section (the former `/ingredients` page)
  ported in unchanged, plus: its "used in N" count is now clickable,
  expanding the actual linked product names (new `usedInItems()` in
  `src/lib/ingredients.ts`), each a working link to `/costing?id=`.
- `/ingredients` is now a server-side redirect to
  `/catalog#ingredient-library`, so an old bookmark lands scrolled to
  the right section.
- `src/lib/modules.ts`: the `"ingredients"` module entry is gone; the
  `"catalog"` slug/href are unchanged (five other pages already look it
  up purely for a display name) but its name is now "Catalog
  Management" with a merged description.

## Why
Amore Cost's Ingredient Library isn't a per-recipe ingredient list like
the competitor's — it's a shared, cross-product database, which is
actually a stronger feature than what the competitor has. So this
wasn't a straight copy of their layout; it's one URL that keeps both
real capabilities intact while finally making the connection between
them visible and clickable in both directions, which is what was
actually missing.

## Consequences
- **Found and fixed two real crash risks while implementing this**, per
  root `CLAUDE.md`'s "fix what you find" rule: `CostForm.tsx` and the
  public landing page (`src/app/page.tsx`) both did
  `MODULES.find((m) => m.slug === "ingredients")!` purely to read a
  display name — the `!` would have silently produced `undefined` at
  runtime the moment that slug was removed, not a compile error.
  `CostForm.tsx` now reads a plain i18n string instead; the landing
  page's featured-module grid swapped "ingredients" for "pos" instead
  of leaving a gap.
- **Also found and fixed a stale, incorrect description** on the
  Inventory page (`inventory.description` in `src/lib/i18n.tsx`): it
  said stock quantity wasn't shared "yet" because a "real ingredient
  library" was "still on the roadmap" — but the Ingredient Library has
  existed since decision 0007 and already shares *cost*. Corrected to
  say cost sharing already exists and only stock-*quantity* pooling
  remains a gap (matching `modules.ts`'s own accurate framing of the
  same limitation).
- 6 new tests (`marginStatus`, `usedInItems`) — **115 total**.
- Module count drops from 12 to 11.
- Verified live in EN/TL and Light/Dark with seeded data covering an
  ingredient-linked item, a package-priced item, and a zero-cost-line
  item: the margin filter correctly separated on/below-target items,
  both drill-down shapes rendered with correct per-line math (unit cost
  = `amount / quantity`, line cost = `amount`), the ingredient's
  "used in" list linked to the real product, and `/ingredients`
  redirected to the correct anchor.
