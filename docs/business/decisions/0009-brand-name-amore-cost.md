---
number: 0009
date: 2026-08-18
status: accepted
supersedes: 0003
---

> **Logo portion superseded 2026-08-18** by
> [0010](0010-logo-mark-v2-ring-and-chevrons.md) — the single-stroke
> merged glyph described below didn't land with Oliver and was replaced
> by a two-tone ring + chevrons + α% design the same day. The **brand
> name** decided here, Amore Cost, is unaffected and still current.

# Brand name is Amore Cost, with a new synthetic Alpha+Percent logo mark

## Context
[0003](0003-brand-name-calcost.md) picked **Calcost**. Oliver asked to
change the name again to **Amore Cost**, along with a specific logo
direction: a synthetic symbol merging the Greek lowercase alpha (α)
with the percent sign (%) — not a stock icon, a custom mark.

## Decision
- Brand name is **Amore Cost**. Folder renamed `Calcost/` →
  `Amore Cost/`; `package.json`'s npm-safe name is `amore-cost`.
- New logo mark: a large ring (the percent sign's bigger circle,
  doubling as the alpha's bowl) connected by a curved tail — rather
  than a plain straight diagonal — to a smaller ring (the percent
  sign's second circle). The curve is what keeps it reading as alpha's
  ascender instead of a generic "%". Built as
  `src/components/BrandMark.tsx` (inline SVG, reused in the sidebar and
  the printable quotation) and regenerated as the actual favicon/app
  icon (`src/app/icon.tsx`, `apple-icon.tsx`, via `next/og`
  `ImageResponse`, which supports embedding real SVG — confirmed by
  fetching the generated `/icon` route directly, not just eyeballing
  code).

## Why
Oliver's direct call, both on the name and the specific merge concept
for the mark.

## Consequences
- **The first mark design failed at real icon sizes and was revised
  before shipping.** A first attempt added a separate decorative loop
  for "alpha-ness" on top of the percent shape (4 visual elements
  total) — it read fine large, but at 32px and 16px (actual favicon
  sizes) it looked like a key or wrench, not a percent/alpha merge.
  Simplified to 3 elements — big ring, small ring, one connecting
  stroke — where the connecting stroke's own curve (not a separate
  shape) carries the "alpha" character. Verified at 16px/32px/48px
  before committing, not just at a large preview size.
- **Internal identifiers deliberately were NOT renamed** — every
  `localStorage` key (`calcost:v0:catalog`, `calcost:theme`, etc.), the
  backup file format's internal `app: "calcost"` tag, and the
  `#calcost-units` datalist DOM id all keep their original values. None
  of these are user-facing; renaming them would add real risk (keeping
  `useLocalStorage` calls and the backup system's key list in sync) for
  zero user benefit. Every *user-facing* string — page titles, the
  sidebar wordmark, the printed quotation, confirm dialogs, downloaded
  filenames — was updated.
- **Historical decision records were not rewritten.** 0001–0008 still
  say "Calcost" where that's what the product was actually called at
  the time (per this workspace's own decisions-are-a-point-in-time-
  record convention) — only 0003's `status` and a pointer note changed,
  the same treatment 0002 got when *it* was superseded.
- This is the **second** rename in three days (RepricedIQ → Calcost →
  Amore Cost). Worth naming plainly: repeated renames have a real cost
  — every rename means auditing every doc, every user-facing string,
  the folder name, and the package name again. Not a reason to block
  the next one if a genuinely better name shows up, but worth surfacing
  if a third rename gets proposed.
- The name due-diligence checklist (domain/handles/trademark) in
  `../../roadmap/backlog.md` resets to "Amore Cost" — the earlier
  Calcost check (an obscure, unrelated Node.js library, low risk) no
  longer applies to the name actually in use.
