# Amore Cost

A costing & pricing calculator for Philippine small/medium businesses —
a real recurring-revenue web app instead of the static Google Sheets
templates that currently dominate this category. Standalone product
(Fork 1), not a module of another business and not structured around a
partnership — see [docs/business/decisions/](docs/business/decisions/CONTEXT.md)
for that and the other founding decisions. Separate from every other
business in this workspace — see `../START-HERE-FOLDER-GUIDE.md` for
the full map. Closest sibling in spirit is `../Atlas Freelance/` — same
PH-SME-first, peso-first philosophy, same Next.js + TypeScript +
Tailwind stack.

## Running it

```bash
npm install     # first time only
npm run dev     # http://localhost:3003
npm test        # Vitest — pure-logic tests, no component/page coverage yet
```

`/` is a **public marketing landing page** (`src/app/page.tsx`, decision
0012) — no Sidebar. The app itself lives under a `(dashboard)` route
group (`src/app/(dashboard)/`, wrapped in `AppShell`/`Sidebar`) and is
**five pages** (decision 0040, modeled on
https://food-cost-tau.vercel.app/): **Dashboard** (`/dashboard`),
**Input** (`/input` — recipes + "Edit breakdown" modal + Ingredient
Library), **OPEX & Overhead** (`/opex`), **Receipt Simulator**
(`/receipt`), and **Margin & POS Simulator** (`/simulator`). See
[docs/product/modules.md](docs/product/modules.md) (kept in sync with
`src/lib/modules.ts`) for what each does. Every retired route
(`/costing`, `/catalog`, `/pos`, `/inventory`, …) redirects via
`next.config.ts`. The old 11-module app is the **`v1-full-11-modules`**
git tag — check it out rather than rebuilding anything from memory.

Everything runs on `localStorage` — no accounts, no backend. Data
shapes: `CatalogItem` (a recipe, `src/lib/catalog.ts`), `Ingredient`
(`src/lib/ingredients.ts`), `OpexSettings` (`src/lib/opex.ts`). Linking
a cost line to an `Ingredient` makes a price change cascade to every
recipe using it (decision 0007). **Read decision 0040 before adding a
page** — the cut to five was deliberate. Both simulators use
`directCost()` (recipe cost minus its overhead line) because they
subtract monthly OPEX separately; using `trueCost()` there would count
rent twice.

A light/dark/auto theme toggle lives in the top bar
(`src/components/ThemeToggle.tsx`), persisted to `localStorage` and
applied pre-hydration via an inline script in `layout.tsx` (hence
`suppressHydrationWarning` on `<html>` — that's intentional). Visual
identity is a clean white-card/green-accent dashboard look
(`src/app/globals.css`), deliberately **different** from the pitch
page's ledger/ink theme — see
[decisions/0005](docs/business/decisions/0005-app-visual-identity-diverges-from-pitch-page.md).
**Read [DESIGN.md](DESIGN.md) before generating or reviewing any UI** —
it governs component/token/accessibility rules and, as of 2026-09-02,
is aligned against the real implementation (real token values, and
honest "GAP" markers for things like the missing shared table
component and missing focus-visible rings) rather than a generic
template.
The one-page marketing pitch (`docs/branding/pitch-one-pager.html`) is
a separate, standalone landing page — not part of this app's routing,
and not restyled by that decision.

See `node_modules/next/dist/docs/` via `AGENTS.md` before touching
anything Next.js-version-specific — this was scaffolded on a recent
Next.js release that may differ from older training data.

## ⭐ Start here every session: [docs/next-steps.md](docs/next-steps.md)

The pinned, current "what's open / what to do next" list — read it
before adding new material so effort doesn't drift from what's actually
next. As of 2026-08-18 the single most important open item is still
**validation** — every module is built (including the ingredient
cascade and a real test suite), and none of it has been shown to a real
business owner yet. Deployment is tracked as
[docs/roadmap/backlog.md](docs/roadmap/backlog.md) item 1, explicitly
deferred rather than dropped.

## Before doing anything else, check docs/

This project keeps an ICM knowledge workspace at
[docs/](docs/CLAUDE.md) — the business case, branding history, and
product scope as plain files instead of buried in chat history. Read it
first when:

- Starting a new session on this idea — skim [docs/business/strategy.md](docs/business/strategy.md)
- Asked "what's decided so far" — [docs/business/decisions/](docs/business/decisions/CONTEXT.md)
- About to touch `src/` — check [docs/product/modules.md](docs/product/modules.md)
  for which page you're in and what's simplified about it
- Handed a raw idea, name riff, or something to research that isn't a
  decision yet — log it in [docs/ideas/inbox.md](docs/ideas/inbox.md),
  don't force it into `decisions/` before it's real

## Before calling any change done

- **Run the full check every time, not just the part that seems
  relevant**: `npx tsc --noEmit`, `npm test`, and `npm run build`. A
  change that passes typecheck but breaks the build (or passes both but
  breaks a test) is not done. For anything visual or interactive,
  verify live in a real browser — temporarily
  `npm install --no-save playwright@1.62.1`, screenshot the actual
  states (both EN/TL, both light/dark, real pixel sizes for anything
  like icons/favicons, not just a large preview), then
  `npm uninstall playwright` when finished. Reading the code is not the
  same as confirming it works.
- **Fix what you find, in the same pass.** If checking one thing
  surfaces an unrelated bug, inconsistency, or stale doc, fix it now
  and say so — don't leave it for "later" to get rediscovered from
  scratch. (Real examples from this project: a Break-Even link that was
  mislabeled "Costing & Pricing" but pointed at `/`; a number input
  using `??` instead of `||` that let a literal "0" sit in the field
  and get typed over instead of replaced.)
- **QA is a standing responsibility, not a one-time pass.**
  [docs/qa/qa-manual.md](docs/qa/qa-manual.md)'s per-page checklist
  and "known simplifications" list need to stay accurate as modules
  change — when a page's real behavior changes, update its QA entry the
  same session, same discipline as `docs/roadmap/completed.md`.

## Keeping it alive

- Any future decision (validation result, product-scope cut, technical
  choice) → write a numbered record in `docs/business/decisions/` using
  `docs/business/decisions/_template.md` **and** update
  `docs/next-steps.md`'s "Where this stands" line in the same session —
  don't leave it stale.
- Ship something from `docs/roadmap/backlog.md` → delete its line
  there, add a line to `docs/roadmap/completed.md`, same session.
- Building toward real accounts/backend → start a fresh decision record
  documenting the migration plan off `localStorage`, and note it in
  `docs/roadmap/roadmap.md`'s phase list.
