---
number: 0010
date: 2026-08-18
status: accepted
supersedes: 0009 (logo portion only — the brand name "Amore Cost" from 0009 is unaffected)
---

> **Rendering approach superseded 2026-08-18** by
> [0011](0011-logo-real-asset-not-hand-coded.md) — the design below
> (ring + chevrons + α%) is still correct and current, but it now
> renders from the real Figma-exported asset
> (`public/brand-mark.png`), not the hand-coded SVG paths this record
> describes.

# Logo mark revised: two-tone ring + motion chevrons + α% glyph

## Context
[0009](0009-brand-name-amore-cost.md) shipped a logo mark that was a
single continuous stroke merging alpha and percent. Oliver didn't like
it and generated a reference image via an external AI image tool: a
circular ring split into two colors (green, teal), with short
"speed-line" chevrons breaking through the ring at two points
(suggesting motion/growth), and a bold "α%" glyph centered inside.
Asked to make that image the actual app logo.

## Decision
Replaced `src/components/BrandMark.tsx` with a hand-coded SVG
recreation of the reference image (the source was a picture, not a
file Claude Code can embed directly, so it's a close rebuild rather
than a pixel-exact copy):
- A ring built from two stroked arcs — green (`#8BC34A`, upper-left,
  ~150°) and teal (`#0E4B57`, lower-right, ~150°) — with two small gaps
  where short chevron "speed lines" break through, matching color to
  the adjacent arc.
- A centered "α%" glyph (alpha as a loop + tail, percent as
  circle-diagonal-circle), monochrome teal, unlike the bicolor ring.
- The mark is now **inherently full-color**, not a single-color glyph
  tinted via a `color` prop — removed that prop, and removed the green
  `bg-accent` square badge that used to wrap it in the sidebar and the
  printable quotation (`Sidebar.tsx`,
  `documents/print/[id]/page.tsx`), since the ring is already a
  self-contained colored badge.
- `icon.tsx` (the 32px browser-tab favicon) uses a **simplified,
  ring-only** variant with no inner glyph and no chevrons.
  `apple-icon.tsx` (180px) and the in-app `BrandMark` (real DOM SVG,
  always crisp regardless of size) keep full detail.

## Why
Oliver's direct call on the new visual direction. The favicon
simplification follows the same legibility rule this project already
established with the first mark: render at the *real* target size
before shipping, not just a large preview. Full-detail (ring + two
chevron gaps + a two-character inner glyph) held up fine down to 32px,
but visibly turned into a blur once actually downscaled to 16px — a
browser tab's real rendered size once the OS shrinks the 32px asset.
Dropping to ring-only at that size kept it crisp; the fuller mark still
appears everywhere it's shown at 32px or larger (sidebar, apple-icon,
the printable quotation).

## Consequences
- The two mark colors (`#8BC34A` green, `#0E4B57` teal) are **not**
  pulled from the app's existing `--accent` CSS variable
  (`#1E8A5C`/`#35A578`) — they're the reference image's own palette,
  used as literal fixed hex values in `BrandMark.tsx`/`icon.tsx`/
  `apple-icon.tsx`, independent of the light/dark theme's accent color.
  If the app's overall accent color ever gets revisited to match, that
  should be a separate, deliberate decision — not a silent side effect
  of this one.
- This is the **second** logo mark in one day, on top of being the
  **second** brand-name change in three days. Same note as 0009: not a
  reason to block a further change if needed, but a real, repeated cost
  (redraw the mark, regenerate both icon routes, re-verify at every
  size) worth naming if a third iteration gets proposed.
- `docs/branding/logo-prompts.md`'s superseded-note (added for 0009)
  still holds: the shipped mark is programmatic SVG, not an embedded
  AI-generated image — even though this revision's *starting point*
  was a picture Oliver generated externally, what actually shipped is
  still a hand-coded recreation, not that image file itself.
