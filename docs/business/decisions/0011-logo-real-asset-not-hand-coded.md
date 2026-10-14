---
number: 0011
date: 2026-08-18
status: accepted
supersedes: 0010 (rendering approach only — the ring+chevrons+α% design itself is unchanged)
---

# Logo now renders the real designed asset, not a hand-coded SVG recreation

## Context
[0010](0010-logo-mark-v2-ring-and-chevrons.md) hand-recreated the ring +
chevrons + α% mark in SVG because Claude Code can't embed a picture
shared directly in chat as a file. Oliver later supplied the actual
Figma export: first `small Logo.png` (32×20px — too low-res to use
anywhere above a few pixels), then `medium.png` (250×154px, usable
quality), asking to put the real logo in the app.

## Decision
- `medium.png` copied into the repo as `public/brand-mark.png` — this
  is now the single source of truth for the mark, not
  `src/components/BrandMark.tsx`'s old hand-drawn paths.
- `BrandMark.tsx` now renders `<img src="/brand-mark.png">` at a
  caller-supplied width, height following the source's own aspect
  ratio (154/250) so it's never stretched. No more `color` or
  `simplified` props — those only made sense for a programmatic
  stroke-based SVG.
- `icon.tsx` (32px favicon) and `apple-icon.tsx` (180px) now embed the
  same PNG as a base64 data URI inside `next/og`'s `ImageResponse`
  (read once at module scope via `fs.readFileSync`, not fetched over
  the network — avoids any loopback-fetch reliability issue in a
  server-rendered route).

## Why
The real designed asset is materially cleaner than the hand-coded
recreation — proper anti-aliasing instead of stroked-path
approximations of the α and % glyphs. Once a real file existed, letting
Claude Code's own guess remain the source of truth stopped making
sense.

## Consequences
- **Verified this asset still holds up at real favicon size before
  shipping** — same discipline as 0009/0010. At true 16px (after the
  browser downscales the 32px icon route) the ring and rough α%
  shape are still legible, and it looks *cleaner* than the old
  hand-coded version did at the same size before that one needed a
  ring-only simplification — so no fallback/simplified variant was
  needed this time.
- **250×154px is the ceiling on quality** — it's a Figma export, not a
  vector file. It reads crisp through 180px (apple-icon) with only
  mild upscaling, but if a future need calls for an even larger render
  (e.g. print materials, a large hero image), ask for a proper SVG or
  a much larger PNG/2x export rather than upscaling this file further.
- `src/components/BrandMark.tsx`'s hand-coded arc-path math (from 0010)
  is gone — if the visual design ever needs to change again, it either
  needs a new asset file dropped in the same way, or a fresh from-
  scratch SVG recreation, not an edit to the old paths.
