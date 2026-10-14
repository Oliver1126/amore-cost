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
(lead vertical is **unified food + service + retail**),
[0005](0005-app-visual-identity-diverges-from-pitch-page.md) (the app's
visual identity is a clean dashboard look, intentionally different from
the pitch page's ledger theme),
[0006](0006-all-modules-built-local-only.md) (all 10 modules built and
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
Demand validation is still open, see [../next-steps.md](../next-steps.md).

**Human check:** does this decision still hold? If reversed later, don't
edit the old record — add a new one that supersedes it and link back
(`Supersedes: 0001`).

Copy [_template.md](_template.md) for a new entry. Write one the moment
a real choice is made — not retroactively from memory later, once the
"why" has been forgotten.
