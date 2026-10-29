# One-page pitch

[pitch-one-pager.html](pitch-one-pager.html) — a self-contained HTML
page (fonts embedded, no external requests), also published at
**https://claude.ai/code/artifact/40b9c4b6-e977-453f-9fb1-def8442eb851**
(private until shared from the page's share menu).

## Design concept — "the ledger"

Rather than a generic SaaS landing page, it reads like an actual
accounting ledger — ruled-paper texture, an ink/receipt aesthetic, and
a single rubber-stamp accent color reserved for the one number that
matters (the suggested price). That's drawn from the subject itself:
Amore Cost's whole job is turning a pile of costs into one trustworthy
number, so the page treats that number like a stamped total on a real
receipt.

- **Type:** Special Elite (mechanical typewriter, headlines) + Work
  Sans (body) + Courier Prime (every peso figure, tabular)
- **Color:** warm ledger-paper ivory with sage rule lines in light
  mode; a dark chalkboard-green (like a sari-sari store price board) in
  dark mode — both carrying the same ochre "stamp" accent
- **Content:** every claim on the page is pulled from
  [concept.md](../business/concept.md),
  [market-research.md](../business/market-research.md), and
  [product/scope-v1.md](../product/scope-v1.md) — the 2,000+-buyer
  stat, the real four-step product mechanic, the three verticals, the
  honest "why now" section, and the draft ₱199–499/mo pricing labeled
  explicitly as unvalidated. Competitors are alluded to generically
  rather than named, since this is shareable pitch collateral, not an
  internal decision doc (contrast with `market-research.md`, which does
  name iCost directly).

## Status

Not yet reviewed against real users. **Content is stale as of
2026-10-29** — it still pitches three verticals and the old
₱199–499/mo draft price. Current truth: food-only (decision 0038), five
pages (0040), and a Plus tier tested at ₱99/mo with everything on one
device free ([roadmap](../roadmap/roadmap.md) Stage 3). For Stage 1
validation, use the live app with **"Try with sample recipes"**
(decision 0041) instead of this page; refresh the copy before sharing
it anywhere. The in-app public landing page (`/`, decision 0012) is the
current marketing surface.

The logo shipped as code, not from the prompts in
[logo-prompts.md](logo-prompts.md) — see decisions 0010/0011
(`public/brand-mark.png`, `src/components/BrandMark.tsx`). The `logo/`
folder is still empty.
