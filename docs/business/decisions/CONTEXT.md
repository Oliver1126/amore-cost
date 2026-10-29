---
folder: decisions
role: record-library
---

# decisions/

**Reads:** nothing new — a decision record is written from what just got
decided in conversation, not researched separately.

**Contains:** [0001](0001-standalone-saas-fork-chosen.md) (strategic
fork: standalone SaaS), [0002](0002-brand-name-repricediq.md)
(superseded — brand name was briefly RepricedIQ), [0003](0003-brand-name-calcost.md)
(superseded — brand name was then Calcost), [0004](0004-lead-vertical-unified.md)
(lead vertical was **unified food + service + retail** — superseded by 0038, food-only),
[0005](0005-app-visual-identity-diverges-from-pitch-page.md) (the app's
visual identity is a clean dashboard look, intentionally different from
the pitch page's ledger theme),
[0006](0006-all-modules-built-local-only.md) (superseded by 0040 — all 10 modules built and
interactive, simulated with `localStorage` instead of waiting for
accounts — with specific, documented simplifications for Inventory,
Margin Alerts, and Multi-User), and
[0007](0007-ingredient-library-and-test-suite.md) (a real Ingredient
Library with cross-item cost cascade, plus a Vitest suite — deployment
explicitly deferred to `../roadmap/backlog.md`), and
[0008](0008-feature-research-batch.md) (a researched feature batch —
backup/restore, unit conversion, batch scaling, suppliers, templates,
job status, trend charts, QR codes — built client-side-only, with
backend-dependent ideas deliberately deferred to `../roadmap/backlog.md`),
[0009](0009-brand-name-amore-cost.md) (brand name is now **Amore
Cost** — the logo portion of this one is itself superseded, see next),
[0010](0010-logo-mark-v2-ring-and-chevrons.md) (the current logo design:
a two-tone ring with motion chevrons and a centered α% glyph, replacing
0009's single-stroke merged glyph the same day), and
[0011](0011-logo-real-asset-not-hand-coded.md) (that same design now
renders from the real designed asset, `public/brand-mark.png`, instead
of a hand-coded SVG recreation), and
[0012](0012-public-landing-page-and-dashboard-route-group.md) (`/` is
now a public marketing landing page; the dashboard moved to
`/dashboard` via a `(dashboard)` route group — every other module's URL
is unchanged), and
[0013](0013-landing-page-demo-calculator-and-pricing-placeholder.md)
(the landing page's calculator is now a real interactive demo with a
3-try limit, and an honest "not live yet" placeholder pricing section
— no fake subscribe/signup flow, since no accounts or payment system
exist), and
[0014](0014-package-cost-calculator-and-itemized-opex.md) (Cost Ledger
lines can now derive a per-unit cost from a package purchase —
supplier, package price, qty per pack, shipping fee; Break-Even's OPEX
is now itemized with a contingency % buffer, replacing the old single
`monthlyOpex` number), and
[0015](0015-pos-checkout-module.md) (a scoped Point of Sale checkout
module — cart, barcode-style scan/search, payment method, receipt —
explicitly not a full retail POS: no cash-drawer/thermal-printer
hardware integration, no multi-register sync), and
[0016](0016-mobile-responsive-sidebar.md) (the dashboard Sidebar is now
a mobile drawer below the `lg` breakpoint instead of squeezing content
into a narrow column), [0017](0017-opex-is-a-shared-store-not-per-item.md) (OPEX moved out of
`CalculatorState` into its own shared store, `src/lib/opex.ts` — it
was resetting every time a new item was drafted, since 0014 had left
it as a per-item field when it should describe the whole business;
0014's data-model portion is superseded by this, its package-cost-
calculator portion is unaffected), [0018](0018-opex-to-overhead-estimator.md) (Costing & Pricing can now
suggest a per-unit Overhead figure from the shared OPEX total ÷ an
expected monthly volume — one-directional and only applied on request,
never automatic), [0019](0019-pricing-strategy-descriptions-and-suggested-ranges.md)
(Margin %/Markup %/Fixed profit each get a plain-language description
plus a vertical-specific suggested range and a "Use suggested"
quick-fill — margin and markup are mathematically different numbers
for the same profit, and the suggested range converts correctly
between them rather than reusing the same figures under both labels),
and [0020](0020-senior-pwd-discount.md) (the Senior Citizen/PWD
discount, RA 9994/RA 10754 — 20% off the pre-tax price, VAT-exempt,
applied per Point of Sale cart line and shown on Costing & Pricing —
found as a real compliance gap while reviewing a competitor).

**0021 onward** (one line each — the filename is the summary; newest
number = latest):

| # | Decision | Status |
|---|---|---|
| [0021](0021-pos-refunds-and-voids.md) | POS refunds/voids | Removed with POS at 0040 |
| [0022](0022-ingredient-library-and-catalog-merged.md) | Ingredient Library + Catalog merged | Superseded by 0027; Catalog itself became Input at 0040 |
| [0023](0023-catalog-management-in-page-editor.md) | In-page "Edit & Breakdown" editor | Partly superseded by 0024/0025; the editor lives on in Input |
| [0024](0024-catalog-management-card-grid.md) | Recipe list as a card grid | Current (Input) |
| [0025](0025-lightweight-create-item-modal.md) | Lightweight "+ New item" modal | Input now opens the breakdown straight after create (0040) |
| [0026](0026-lightweight-add-ingredient-modal.md) | Lightweight "Add ingredient" popup | Current |
| [0027](0027-ingredient-library-as-modal.md) | Ingredient Library as its own modal | Current |
| [0028](0028-cost-line-table-matches-reference-columns.md) | Cost-line table matches the reference's columns | Current (0041 added a Yield % column) |
| [0029](0029-item-editor-cards-above-vertical-tabs.md) | Editor cards above vertical tabs | Vertical tabs gone at 0038 |
| [0030](0030-cross-page-audit-batch-fixes.md) | Cross-page audit, 8 bugs fixed | History |
| [0031](0031-deployed-to-vercel.md) | Deployed to Vercel | Current (live site lags the code until the next `vercel --prod`) |
| [0032](0032-insights-engine-calculator-to-advisor.md) | Insights engine | Current, but only the below-target check fires since 0040 |
| [0033](0033-progressive-disclosure-for-terminology.md) | Progressive disclosure for terminology | Current |
| [0034](0034-design-system-alignment-and-accessibility-fixes.md) | DESIGN.md aligned to reality | Current |
| [0035](0035-diagnostic-audit-and-correctness-fixes.md) | Diagnostic audit, 13 bugs fixed | History |
| [0036](0036-cost-history-debounced-snapshot.md) | One cost snapshot per settled edit | Current (snapshots recorded, no page shows them) |
| [0037](0037-reposition-to-lead-with-food.md) | Marketing leads with food | Superseded by 0038 |
| [0038](0038-food-only-vertical-removed.md) | **Food-only** product | Current |
| [0039](0039-color-coded-cost-cards-and-recipe-vocabulary.md) | Color-coded cards, recipe vocabulary | Current |
| [0040](0040-five-pages-modeled-on-reference.md) | **Five pages** (Dashboard, Input, OPEX, Receipt Sim, Margin & POS Sim) | Current — supersedes 0006 and 0015 |
| [0041](0041-yield-rounding-sample-recipes.md) | Yield %, menu price rounding, sample recipes | Current |

Read 0001–0020 above with 0040 in mind: several describe modules that
no longer exist (0006's "all modules," 0015 POS, 0018's Costing &
Pricing estimator, 0020's POS-cart Senior/PWD — the discount itself
lives on in Input and the Receipt Simulator). The full 11-module code
is the `v1-full-11-modules` git tag.

Demand validation is still open — see [next-steps.md](../../next-steps.md)
and Stage 1 of [roadmap.md](../../roadmap/roadmap.md).

**Human check:** does this decision still hold? If reversed later, don't
edit the old record — add a new one that supersedes it and link back
(`Supersedes: 0001`).

Copy [_template.md](_template.md) for a new entry. Write one the moment
a real choice is made — not retroactively from memory later, once the
"why" has been forgotten.
