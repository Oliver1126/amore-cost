---
number: 0005
date: 2026-08-17
status: accepted
supersedes:
---

# The app dashboard uses a clean fintech-dashboard identity, not the pitch page's ledger theme

## Context
The pitch one-pager (`docs/branding/pitch-one-pager.html`) uses a
deliberate "ledger" identity — ruled paper, ink, a rubber-stamp accent,
a typewriter display face. When `src/` was first built, it reused that
same identity so the app and the marketing page would look like one
brand. Oliver then asked for the actual dashboard to be redesigned
around a clean reference image (a white-card, green-accent fintech
dashboard) and confirmed the one-pager should stay as-is, unchanged.

## Decision
The two now intentionally use **different visual systems**: the
one-pager keeps its ledger identity untouched; `src/` (the real app)
uses a clean, white/light-gray canvas with white rounded cards, a
single green accent, and plain modern sans typography throughout — no
ruled-paper texture, no typewriter face, no rubber-stamp motif.

## Why
Oliver's direct call, via a reference image of a clean SaaS dashboard.
The ledger identity was chosen for the *pitch* to read as warm/credible
to the target ICP (see
[branding/options.md](../../branding/options.md)'s visual-direction
notes) — that reasoning doesn't necessarily extend to the working tool
itself, where clarity and scannability (a real dashboard, used
repeatedly) matter more than a distinctive first-impression aesthetic.

## Consequences
- The brand no longer presents one consistent visual system end to end
  — a prospect who sees the pitch page and then opens the app will
  notice the shift. Worth a conscious decision later about whether to
  reconcile them (e.g. redesign the pitch page to match the app once
  the app's identity is more proven) rather than letting the split
  persist by default.
- `src/app/fonts.ts` now only loads Work Sans — Special Elite and
  Courier Prime were removed from the app (they remain, self-contained,
  inside `pitch-one-pager.html`, which embeds its own copies).
- Numbers in the app use `font-variant-numeric: tabular-nums` on the
  body font rather than a separate monospace face — a lighter-weight
  way to get column alignment without committing to a typewriter look.
