# Backlog

Real, concrete work not yet started, roughly ordered against what's
already here. Not a wishlist — move something in from
[../ideas/inbox.md](../ideas/inbox.md) only once it's concrete enough
to actually build. When something ships, **delete its line entirely**
and add a line to [completed.md](completed.md) — don't strikethrough
and leave it sitting here, same discipline Atlas Freelance uses.

1. **Real accounts + backend**, informed by Phase 1 signal — needed to
   fix Multi-User's lack of real security and to unlock true
   cross-device sync, which is also what real multi-register/
   multi-terminal sync for Point of Sale needs (decision 0015 — a
   single register works today, but two registers don't share a live
   cart/catalog view without this). Not worth building before
   validation confirms this is worth taking further (see
   [../product/scope-v1.md](../product/scope-v1.md)'s open pricing/
   gating question).
2. **Name due-diligence checklist** — `.ph`/`.com` domain, social
   handles, IPOPHL trademark search for "Amore Cost" (see the bottom of
   [../branding/options.md](../branding/options.md)).
3. **Memoize POS's `cartDetails`/`visibleItems`** — they currently
   recompute on every keystroke on the app's single most
   business-critical screen (checkout). Flagged by the 2026-08-21
   cross-page audit (decision 0030) as a performance finding, not a
   correctness one — deferred rather than folded into that batch so it
   gets its own careful pass on `useMemo` dependency correctness.

## Features that need real backend/API infrastructure first

Logged 2026-08-18 from the same feature-research pass that produced the
client-side batch in [completed.md](completed.md) — these were
deliberately **not** built alongside that batch because none of them
are achievable with the current local-only architecture. They need
item 1 above (real accounts + backend) first, not just more frontend
work:

4. **Shopee/Lazada order import** — auto-log a sale from a real
   marketplace order instead of typing a quantity manually on
   Inventory. Needs OAuth + API integration with each platform; no
   local-only version of this is meaningful.
5. **Receipt/invoice photo scan (OCR)** to auto-fill an ingredient's
   cost. Needs a vision/OCR API call — there's no client-side-only way
   to do this credibly.
6. **Real push or email notifications** for low stock or a margin
   dropping below target. A browser can show an in-tab toast without a
   backend, but a *real* push (works when the tab isn't open) or email
   needs a server and a notification service.
7. **A shareable public price-list link** — a URL a client can open
   without needing the same browser/device. Meaningless without a
   backend to host the shared data; the current architecture keeps
   everything in one browser's `localStorage` only.
8. **A client-facing quote-approval link** — same reason as item 7: a
   client accepting a quote online needs a URL that works outside the
   business owner's own browser, which needs a backend.

## Client-side-feasible, just not built yet

9. **Camera-based barcode scanning for Point of Sale** (decision
   0015) — the v1 scan/search input only supports keyboard-emulating
   scanner hardware (or manual typing). Scanning with a phone's own
   camera needs a barcode-decoding library and `getUserMedia` camera
   permission — a real, buildable addition, just deliberately left out
   of v1 since real POS hardware scanners don't need it.
