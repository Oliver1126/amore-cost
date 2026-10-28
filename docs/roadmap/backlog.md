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

## Feature gaps — audit of the five-page app (2026-10-28)

Found by reviewing the five-page app (decision 0040) against the
food-cost-tau reference and how PH food sellers actually price. The
three highest-value items from the same audit — demo kitchen, yield %,
and menu price rounding — shipped the same day (see `completed.md`).
Point of Sale's old memoization and camera-scanning items were dropped
from this list: POS no longer exists.

9. **Labor double-count guard** — a recipe's prep labor and an OPEX
   "Labor" wage both feed the simulators, so an owner who fills in both
   pays the helper twice. Same trap `directCost()` already closes for
   overhead. Small.
10. **Sub-recipes** — use one recipe (garlic rice, a sauce) as an
    ingredient of others, so a cost change flows through. Medium.
11. **Delivery-app commission** in the Margin & POS Simulator
    (GrabFood/foodpanda take ~20–30%). Existed as Multi-Channel Pricing
    in the `v1-full-11-modules` tag. Small.
12. **Whole-menu break-even** — plates per day across every dish, not
    one dish with an "OPEX share" workaround. Medium.
13. **Printable recipe card (PDF)** — kitchen sheet with ingredients,
    portions, cost; the reference has one. Small.
14. **CSV / spreadsheet export** for accountants. Existed in Documents
    (`v1-full-11-modules` tag). Small.
15. **Cost-change note on recipe cards** ("cost up 18% since June") —
    Cost History snapshots are still recorded, just not shown. Small.
