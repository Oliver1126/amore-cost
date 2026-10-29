# Amore Cost — docs

This is the project's ICM knowledge workspace: where the business case,
branding, and product scope live as plain files instead of scattered
chat history. The app itself lives in `../src/` — see the root
`../CLAUDE.md` for what's actually built there.

## ⭐ [next-steps.md](next-steps.md) — read this first, every session

The pinned "what's open / what to do next" list. Everything else below
is reference; this is the one page that says what's actually next.

## Where to go

| Task | Go to |
|---|---|
| "What's the full plan — how do we start, scale, and win?" | [roadmap/roadmap.md](roadmap/roadmap.md) — strategy + stages 0–5 with gates, of which `next-steps.md` is just the pinned "right now" excerpt |
| "What's shipped? What's queued but not started?" | [roadmap/completed.md](roadmap/completed.md) / [roadmap/backlog.md](roadmap/backlog.md) |
| "What is this, who's it for, what's the evidence it's needed?" | [business/concept.md](business/concept.md) |
| "What's the overall strategy — vision, SWOT, risks?" | [business/strategy.md](business/strategy.md) — full index of business docs in [business/document-inventory.md](business/document-inventory.md) |
| "Is this feature actually differentiated, or generic?" | [business/product-depth-analysis.md](business/product-depth-analysis.md) — the calculator-vs-advisor audit, module by module |
| "What should I actually add or change per page?" | [roadmap/backlog.md](roadmap/backlog.md) — the current gap list, each item tagged with its roadmap stage; [product/module-upgrade-plan.md](product/module-upgrade-plan.md) is the older 11-module punch list |
| "What already exists in this space?" | [business/competitive-landscape.md](business/competitive-landscape.md) — the crisp current view; [business/kwentapos-comparison.md](business/kwentapos-comparison.md) — what a PH POS with recipe costing has that we don't; [business/market-research.md](business/market-research.md) — the fuller research trail |
| "What are the different ways to run this business?" | [business/strategic-forks.md](business/strategic-forks.md) |
| "How do we actually reach and sell to small businesses?" | [business/go-to-market.md](business/go-to-market.md) |
| "What could we call this?" | [branding/options.md](branding/options.md) |
| "What does the app include?" | [product/modules.md](product/modules.md) — the five pages and what each does; [product/scope-v1.md](product/scope-v1.md) — build history and the pricing/gating question |
| "Why did we decide X this way?" | [business/decisions/](business/decisions/CONTEXT.md) — browse by filename, newest number = latest |
| "How do I test this app / I'm QA, where do I start?" | [qa/](qa/CONTEXT.md) — setup, a full walkthrough, and the test checklist |
| "I'm a client/user, how do I use this app?" | [onboarding/user-manual.md](onboarding/user-manual.md) — plain-language guide, no internal jargon |
| "What do I actually do to launch/market this?" | [marketing/](marketing/CONTEXT.md) — execution checklist + content backlog; strategy itself stays in [business/go-to-market.md](business/go-to-market.md) |
| "What are the actual UI/design rules, and where does the real system fall short of them?" | [../DESIGN.md](../DESIGN.md) — component/token/accessibility rules, aligned against real code with honest gaps marked |
| Got a raw idea, name candidate, or feature riff | [ideas/inbox.md](ideas/inbox.md) — not a decision yet, just log it |

## Rules for this workspace

- One fact, one home. If something's already documented, link to it —
  don't restate it.
- A decision record is written *when the decision is made*, not
  reconstructed later from memory.
- Ship something from `roadmap/backlog.md` → delete its line there,
  add a line to `roadmap/completed.md`, same session.
- `ideas/inbox.md` is a queue, not an archive — check it before adding
  new material to `business/`, `branding/`, or `product/`, and move
  (don't copy) anything concrete enough into the right home.
- Closest sibling workspace in this repo is `../../Atlas Freelance/docs/`
  — same conventions, same PH-SME-first philosophy, same
  backlog/completed discipline.
