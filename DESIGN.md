# DESIGN.md — Amore Cost

**Aligned to the actual implementation 2026-09-02** — every claim below
was checked against real code (`src/app/globals.css`, `src/components/`,
actual class usage), not assumed. Where the honest answer is "this
isn't built yet," it says **GAP**, not "needs team input" — the team
(a solo founder) has already made most of these calls; what's missing
is that it was never written down, or that it's a real, known
shortfall worth fixing, not an open question. See
[docs/business/decisions/0005](docs/business/decisions/0005-app-visual-identity-diverges-from-pitch-page.md)
for the visual-identity decision this file elaborates on, and
[docs/CLAUDE.md](docs/CLAUDE.md) for where this fits in the rest of
the project's documentation.

**Page-reference refresh 2026-10-29:** the app is now five pages
(decision 0040) — Dashboard, Input (recipes + "Edit breakdown" modal +
Ingredient Library), OPEX & Overhead, Receipt Simulator, Margin & POS
Simulator. Module names and counts below were updated to match; the
token, accessibility and anti-pattern rules themselves are unchanged.

## 1. Purpose and scope
This file governs UI generation and critique for **Amore Cost**, a costing-and-pricing SaaS for Philippine micro/small food businesses (food-only since decision 0038). Any agent generating or reviewing a screen must check it against this document before shipping.

## 2. Product and user principles
- **Product name and purpose:** Amore Cost — "cost it once, price it right." Helps PH food micro-entrepreneurs (home bakers, carinderias, food carts, online food sellers) compute true recipe cost, set a defensible price, and see break-even and margin before committing to a price.
- **Target users:** Non-accountant small business owners in the Philippines, often solo or 1–3 staff, mobile-first, price-sensitive, Taglish-speaking. Low tolerance for jargon (COGS, markup vs. margin, VAT) unless explained inline.
- **Main jobs to be done:**
  1. Cost a recipe correctly (ingredients with yield %, packaging, labor, overhead). — **Input** ("Edit breakdown").
  2. Turn that cost into a price using a margin/markup target, with VAT, Senior/PWD and menu rounding. — **Input** ("Edit breakdown").
  3. Spread monthly fixed costs into each dish. — **OPEX & Overhead**.
  4. See what a real order looks like with VAT, Senior/PWD and service charge. — **Receipt Simulator**.
  5. Know break-even volume and try a different price. — **Margin & POS Simulator**.
  6. Get warned when a recipe's margin is below target. — the **Insights** panel ("Needs your attention") on Dashboard (decision 0032), which names the cause and a specific fix.
  - **Removed by decision 0040** (still in the `v1-full-11-modules` tag): inventory, real POS checkout, multi-channel pricing, cost-history and sales reporting pages, documents/quotations, and multi-user profiles. Real multi-user needs accounts + a backend (roadmap Stage 3).
- **Product principles:**
  1. *Numbers first, jargon never alone* — every financial term gets a plain-language gloss on first appearance per screen. **Mostly real**: `InfoButton` (decision 0033) explains terms in the Edit breakdown editor (pricing strategy, tax, servings, package pricing, yield %) and on OPEX, Receipt Simulator and Margin & POS Simulator; Dashboard KPI terms are the main remaining gap. Treat as the pattern to extend, not a solved problem.
  2. *One true cost* — cost data entered once (a recipe on Input) propagates everywhere (Dashboard, both simulators) rather than being re-entered. **Real** — the Ingredient Library cascade (decision 0007) is exactly this; `CatalogItem` (`src/lib/catalog.ts`) is the single source every page reads from.
  3. *Never let a user price blind* — every pricing action shows resulting margin/markup live, before submission. **Real** — `computePriceBreakdown()` recomputes on every keystroke, no submit step exists in the Edit breakdown editor.
  4. *Small screens are the default*, not an afterthought — most users will run this on a phone behind a counter. **Aspirational, not yet true** — see §9; the sidebar and several tables are the actual current gaps.
  5. *Free tool, trustworthy math* — all calculations must be transparent (show the formula/breakdown, not just a result). **Real** — Cost Composition, the receipt's line-by-line VAT/discount math, and the simulator's P&L waterfall all show their inputs, not just an output number.
- **Brand personality (voice):** Warm, encouraging, plain-spoken "kuya/ate who's good with numbers." Confident but never condescending; Taglish-friendly; never uses corporate/finance-bro tone. The closest real, written-down answer today is `mwp-matrix/01_input/instructions.md`'s tone rule for marketing copy: "plain, practical, peso-denominated worked examples, no hype language." No formal copy deck exists for in-app UI strings specifically — until one does, match that same register.
- **Supported platforms:** Web only, responsive, optimized for mobile-browser use at point-of-sale. No native app or PWA install exists today. A native wrap (Android via Trusted Web Activity first, iOS later) is roadmap **Stage 4**, deliberately gated behind Stage 1 validation — see `docs/roadmap/roadmap.md`.
- **Responsive breakpoints:** Tailwind v4 defaults, unmodified — no custom breakpoint scale is defined in `globals.css`'s `@theme` block. In practice: `sm` 640px, `lg` 1024px are the two actually used in the codebase (`md`/`xl`/`2xl` appear rarely to never). The Sidebar's mobile/desktop split happens exactly at `lg` (decision 0016) — that is the one breakpoint every other responsive decision should default to matching unless there's a specific reason not to.

## 3. Visual hierarchy and layout rules
- Every page needs one primary action above the fold (e.g., "Add Product," "New Sale," "Add Cost Item") — never bury the main task behind secondary nav or settings.
- Numbers (cost, price, margin %) are the visual focal point of any card/row — larger weight/size than labels.
- Use a consistent page shell: left/side nav (collapses to a full-screen hamburger drawer below `lg`, not a bottom nav — see §9) + page title + primary action + content region. The current shell (logo, EN/TL, Light/Dark/Auto — `AppShell.tsx`) is present on every dashboard page. **Exception, intentional:** the public marketing landing page (`/`, decision 0012) does not use this shell at all — it's a separate, standalone page by design, not an oversight.
- Group by task, not by data type: e.g., a "Product" page shows cost, price, and margin together rather than splitting across three unrelated pages the user must reconcile manually. Real example: Input's "Edit breakdown" modal (decision 0023, kept through 0040) embeds the *entire* cost stack — ingredients, labor, packaging, overhead, tax, pricing strategy — rather than linking out to a separate page.

## 4. Token and visual-system guidance
Real values, read directly from `src/app/globals.css` — this is the actual token source of truth, not a separate design tool:

- **Color** (semantic tokens, both light and dark defined): `--bg`, `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`, `--accent` / `--accent-strong` / `--accent-soft` / `--accent-ink`, `--good`, `--bad` / `--bad-soft`, `--warn` / `--warn-soft`, `--info` / `--info-soft`. **Four semantic tones as of decision 0039** — `accent` (positive/good — suggested price, revenue), `bad` (negative/critical — alerts, loss), `warn` (cost emphasis — an amber-orange, not a severity level despite the name), `info` (profit/secondary-metric emphasis — a calm blue). The Insights panel's critical/warning/info severities (decision 0032) still only map onto `accent`/`bad` with opacity, not onto the new `warn`/`info` tokens — those were added for cost/profit emphasis on `StatCards`/`BatchCard`, not yet reused for alert severity. Worth reconsidering together next time either area is touched, rather than assuming they're already unified.
- **Type:** one self-hosted variable font, Work Sans (`src/app/fonts.ts`, weights 400–700), exposed as `--font-body`. `.font-display` is just that same font at bold weight with tightened tracking — there is no separate display typeface. `.font-num` applies `font-variant-numeric: tabular-nums` for anywhere digits need to line up (prices, tables). No formal type scale is documented beyond ad hoc Tailwind size utilities (`text-xs` through `text-3xl` are all in active use) — a real gap if the page count keeps growing, not urgent today.
- **Radius:** `.card` uses `1rem` (16px) consistently — the one real radius token in use. Smaller elements (buttons, inputs, pills) use Tailwind's `rounded-lg`/`rounded-xl`/`rounded-full` ad hoc, not a documented scale.
- **Elevation:** one shadow value, on `.card` only (`0 1px 2px rgba(20,22,18,0.04)`) — deliberately subtle, no elevation scale beyond that.
- **Motion:** no documented duration/easing scale. `prefers-reduced-motion: reduce` is respected globally (`globals.css`'s media query collapses all animation/transition durations to near-zero) — that baseline exists; a real scale for intentional motion doesn't, because there's very little intentional motion in the app today (mostly `transition-colors` on hover/focus).
- Currency: always ₱ (PHP), formatted with thousands separators and 2 decimals (₱1,250.00), via the shared `peso()`/`pesoSigned()` functions (`src/lib/format.ts`) — never a raw float, and never a second, competing formatter (this was itself a real bug fixed once, duplicated across 14 files before being extracted).
- Percent values (margin, markup, VAT) always to 1 decimal with a % suffix (`.toFixed(1)` at every call site that displays one).
- Dark/Light/Auto theme toggle exists and is real (`ThemeToggle.tsx`, pre-hydration inline script in `layout.tsx`) — every new component must be built against the semantic tokens above, never a hardcoded hex value.
- Bilingual toggle (EN/TL) exists and is real (`src/lib/i18n.tsx`, a flat `STRINGS` dict) — every string must go through `t()`, no hardcoded English/Tagalog copy in components. Dynamic, data-driven sentences (e.g. the Insights panel's per-item messages) are the one accepted exception — they're built with `lang === "tl" ? … : …` ternaries directly in `src/lib/*.ts`, not through `STRINGS`, since they interpolate computed values `STRINGS`'s flat-string model can't parameterize. Match that precedent, don't invent a third pattern.

## 5. Component selection and usage rules
- **GAP — no canonical data table component exists.** Verified 2026-10-29: 3 separate, independently-written `<table>` implementations — Dashboard's Recent recipes, the CostForm cost-line editor, and the Ingredient Library modal (down from 8 before decision 0040 removed most pages). Each duplicates its own header/row/hover styling. This is real technical debt, not a documented pattern to follow — treat "use the existing table" as **do not copy the nearest one**; if a shared `<Table>` component gets built, that's the moment to also collapse these 3 into it, not before.
- **Canonical stat card: real.** `src/components/StatCards.tsx` is used in the shared `ItemEditor` (Input's Edit breakdown modal) — the only place since decision 0040, now also carrying the menu-rounding select — value, label, and a margin badge, same shape everywhere it appears. This is the pattern to actually follow.
- **Canonical form pattern: mostly real.** The Edit breakdown editor, OPEX & Overhead, and both simulators all use labeled inputs with live-recalculated derived fields — no "Calculate" button exists anywhere in the app. Inline *validation* (as opposed to live recalculation) is thin — most numeric fields just clamp or ignore invalid input rather than showing a validation message.
- **Alert/banner severity: still two-tone in practice, even though a third token now exists.** See §4 — `--warn`/`--info` (decision 0039) were added for cost/profit emphasis, not alert severity, and the Insights panel (decision 0032) still map their critical/warning/info levels onto just `accent`/`bad`. If alert severity ever gets a real third tier, reuse `--warn` deliberately rather than adding a fifth token — don't invent a new color without checking what already exists first.

## 6. Interaction states and behavior
- **Fixed 2026-09-02 — skeleton state.** A shared `PageSkeleton` component (`src/components/PageSkeleton.tsx`, `role="status"` with the existing loading string as its `aria-label`, `animate-pulse` blocks shaped like a generic page) now replaces the bare loading string across every page (5 today) that previously rendered `t("common.loading")`/`t("overview.loading")` as plain text while `useLocalStorage` hydrates. Low visual risk in practice since `localStorage` reads are near-instant — this closes the gap for slower devices/first paints, and for this file's own §11 anti-pattern rule to actually be true.
- Every list/table needs: loading, empty (first-time, zero data), zero-results (filtered), error, and populated states — explicitly designed, not just "populated" assumed. **Empty states are generally good** (Dashboard and Input have a real, specific empty-state message with a next action, plus "Try with sample recipes" — decision 0041) — loading and error states are the weaker half of this rule in practice.
- Every destructive action (delete product, remove staff user, delete cost entry) requires a confirm step. **Real**, via `window.confirm()` — four call sites today (Input delete recipe, Ingredient Library delete, Dashboard restore backup, Remove sample recipes). This is a native browser dialog, not a custom modal — consistent everywhere it's used, which matters more than the exact styling.
- Every numeric input recalculates dependent values live (no manual "Recalculate" click) per Principle 3. Real, verified above.
- Forms must show validation inline on blur, not only on submit. **Thin** — see §5's form-pattern note.

## 7. Content and microcopy guidance
- Financial terms get a one-line plain-language explainer (tooltip or inline caption) on first use per screen. **Mostly real** — see §2 principle 1 for where `InfoButton` is used today.
- Empty states must explain the payoff, not just say "No data" — real in most places, see §6.
- Error messages state what happened and the next action, never a raw system/API error. No systematic audit done of every error path; the ones that exist (backup restore validation, e.g.) do follow this.
- All copy must exist in both EN and TL — real, enforced by `STRINGS`'s shared key structure (see §4's i18n note for the one accepted dynamic-string exception). **Real exception, found and fixed 2026-09-02 (that page was later removed by decision 0040):** the customer-facing printed quotation (`/documents/print/[id]`) was entirely hardcoded English — the one document a Tagalog-speaking owner is most likely to hand directly to a client. Now wired through `t()` like every other page. The same pass also fixed a related, quieter gap: `StatCards`, `TaxCard`, and the print page all displayed the tax preset name (`breakdown.taxLabel`, e.g. "VAT", "Percentage Tax") as raw English text even in TL mode, instead of going through the already-existing `getTaxPresetLabel()` helper — three call sites making the same mistake independently is itself a signal to grep for `.taxLabel` before adding a fourth.
- Numbers, never adjectives, carry the weight: avoid "your margin looks low," prefer "Margin is 8% — below your 20% target." **This is exactly how the Insights panel (decision 0032) is written** — every message names the actual percentage/peso figure, never a vague adjective.

## 8. Accessibility requirements
- **No formal target standard documented.** Recommend WCAG 2.1 AA as the baseline to design against going forward, but no full audit against it has been done.
- Color must never be the only signal for margin health — **real** in the places checked: the Insights panel and food-cost % flags pair color with text, not color alone (though see §4 — only two colors exist to pair with in the first place).
- **Fixed 2026-09-02 — visible keyboard focus rings.** A global `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` rule now exists in `globals.css`, layered to win over the `focus:outline-none` + border-color-only pattern used at 16 call sites, without needing to touch each one. (If checking in devtools right after pressing Tab, give it ~150ms — most elements also transition color, so the ring briefly renders mid-fade before settling on the accent color.)
- **Fixed 2026-09-02 — the two known sub-44px nav tap targets.** `AppShell.tsx`'s mobile hamburger button (was `w-9 h-9`/36px) and `Sidebar.tsx`'s mobile close button (was `w-8 h-8`/32px) are both now `w-11 h-11` (44px). `InfoButton.tsx` (decision 0033) was also fixed the same day, via padding + a canceling negative margin so its 14px "?" icon keeps its compact visual size while its actual clickable area is 44px.
- Form fields need programmatic labels, not placeholder-only labels. Mixed — several numeric inputs (batch size, custom tax rate) use `aria-label` correctly; others rely on an adjacent `<p>` label with no programmatic association. Not audited page-by-page.

## 9. Responsive behavior
- **Every responsive grid needs an explicit mobile column: `grid grid-cols-1 lg:grid-cols-[minmax(0,…)_…]`, never bare `grid lg:grid-cols-[…]`.** Below `lg` a bare `grid` gets an implicit `auto` column that grows to its widest content — a `<select>` sizes itself to its longest `<option>`, so one long recipe name pushed the Receipt Simulator 703px wide on a 360px phone (decision 0040 follow-up). The app's own scroll container swallows the overflow, so the document never scrolls and a `scrollWidth` check reads 0 — check element bounding rects against the viewport instead. Give `<select>`s `w-full min-w-0`.
- Input and the Receipt Simulator must be fully usable one-handed on a phone. Verified at 360/390px in a real browser (decisions 0040/0041) but not on a real device.
- **Data tables do not collapse to a card layout below tablet width — they use `overflow-x-auto` (horizontal scroll) instead**, across every one of the 3 table implementations named in §5. This directly contradicts this file's own rule and its own §11 anti-pattern ("No table that only works with horizontal scroll on mobile"). Named as a real, current gap — fixing it properly is bundled with §5's "build one canonical table" gap, since collapsing each hand-rolled table to cards individually would be 3x the work of fixing it once in a shared component.
- **The sidebar does not collapse to a bottom nav.** The actual, deliberate decision (0016) was a full-screen hamburger drawer below `lg`, showing every page (5 since decision 0040) behind a slide-in panel with a backdrop. This is the real, working pattern — treat it as the answer, not a stopgap for a future bottom-nav redesign.
- No sticky primary action exists on mobile today (e.g. "+ New recipe" scrolls out of reach on a long recipe list). Not yet built; a reasonable candidate if real usage ever surfaces this as friction — no evidence yet that it has, since Stage 1 validation with real users hasn't run.

## 10. AI-specific UI patterns
**Not an AI/ML product.** As of decision 0032, the Dashboard has an "Insights" panel (`src/lib/insights.ts`) that reads catalog/sales data and produces specific recommendations — but this is deterministic `if`/`then` logic, not a model, and should never be described to users or in copy as "AI-powered." If real AI/ML features are added later:
- Always show the suggestion as a proposal the user accepts/edits, never auto-applies to price or cost silently. The existing Insights panel already follows the *spirit* of this rule even though it's not AI — every insight is informational and links to the relevant page to act on manually; nothing it computes writes back to `CatalogItem` automatically.
- Label AI-derived numbers distinctly from user-entered numbers.
- No AI features are currently planned on the roadmap (`docs/roadmap/roadmap.md`'s later stages are sync, price alerts and a price index — not AI/ML) — this section stays placeholder guidance until one is.

## 11. Anti-patterns and prohibited choices
- No page without a clear primary action.
- No financial number without a visible unit (₱ or %) — never bare digits.
- No jargon-only labels without an explainer. **Mostly fixed** — see §2 principle 1.
- No client-side-only "Loading…" text with no skeleton/empty/error handling. **Fixed 2026-09-02** — see §6.
- No hardcoded English-only or Tagalog-only strings.
- No table that only works with horizontal scroll on mobile. **Currently violated by all 3 existing tables** — see §9.
- No destructive action without confirmation.
- No color-only status signaling.
- No re-entering the same cost/price data in more than one place — always reference the saved recipe (`CatalogItem`) as source of truth.

## 12. Canonical design references
No Figma, Storybook, or standalone component-library site exists — for a solo-founder, bootstrapped project (see `docs/business/decisions/`'s own financial-strategy notes), that's a reasonable permanent state, not a gap to necessarily fill. The real, living references are:
- **This file**, for rules and rationale.
- **`src/app/globals.css`**, for the actual token values — the source of truth for color/radius/elevation, not a document that could drift from it.
- **`src/components/`**, for the actual canonical components (`StatCards.tsx`, `CostComposition.tsx`, `InfoButton.tsx`, etc.) — read the component, not a spec of it.

## 13. Preflight checklist before generating UI
- [ ] Does this screen have exactly one primary action above the fold?
- [ ] Is every financial value tied to ₱ or % formatting rules (via `peso()`/`pesoSigned()`, never a raw `toFixed`)?
- [ ] Does data here already exist in Catalog/Inventory — if so, reference it, don't re-collect it?
- [ ] Are loading/empty/error/populated states all designed? (Loading currently means "match the existing bare-text pattern," not "this is solved" — see §6.)
- [ ] Is copy present in both EN and TL?
- [ ] Does layout collapse correctly at the `lg` breakpoint specifically (not `md`)?
- [ ] Are destructive actions confirmed (`window.confirm()`, matching the existing five call sites' phrasing style)?
- [ ] Does it work in both Light and Dark themes, using the semantic tokens in §4 — never a hardcoded hex value?

## 14. Final UI QA checklist
- [ ] Keyboard navigable — a real accent-colored focus ring now applies app-wide (§8); don't add a component that fights it with its own `outline` override.
- [ ] Tap targets ≥44px on mobile — §8's two known nav exceptions are fixed; keep new elements at 44px too (see `InfoButton.tsx`'s padding-plus-negative-margin technique for a visually-small icon that still has a full-size hit area).
- [ ] No color-only status indicators
- [ ] All numbers formatted per token rules (currency, percent)
- [ ] Jargon has inline explainer on first use — reuse `InfoButton` (decision 0033), don't build a second pattern
- [ ] Empty states explain payoff, not just "no data"
- [ ] Error states are actionable, not raw system errors
- [ ] Table/list view — if adding a new one, seriously consider whether this is the moment to extract the shared `<Table>` component §5 flags as missing, rather than adding a 9th hand-rolled one
- [ ] Theme toggle (Light/Dark/Auto) and language toggle (EN/TL) both functional on this screen
