# Backlog

Real, concrete work not yet started, roughly ordered against what's
already here. Not a wishlist — move something in from
[../ideas/inbox.md](../ideas/inbox.md) only once it's concrete enough
to actually build. When something ships, **delete its line entirely**
and add a line to [completed.md](completed.md) — don't strikethrough
and leave it sitting here, same discipline Atlas Freelance uses.

Item numbers are stable IDs (other docs cite "backlog item 14"), so
gaps where something shipped or was dropped are expected. Each item
names the [roadmap.md](roadmap.md) stage it belongs to — don't build a
later stage's item before the earlier stage's gate is met.

## Launch and validation (Stages 0–1)

2. **Name due-diligence checklist** — `.ph`/`.com` domain, social
   handles, IPOPHL trademark search for "Amore Cost" (see the bottom of
   [../branding/options.md](../branding/options.md)). *Stage 0.*
3. **Analytics + in-app feedback link** — privacy-friendly analytics
   (Vercel Web Analytics) tracking visits, "Try with sample recipes" and
   "+ New recipe" clicks, plus a feedback form link inside the app.
   Needed to measure Stage 1's gate. *Stage 0.*

## Needs real accounts + backend

1. **Real accounts + backend** — optional sign-in, cloud sync across
   devices, and importing existing `localStorage` data on first sign-in.
   The no-signup free tool stays. This is the fix for the app's biggest
   real weakness (data lives in one browser) and the prerequisite for
   the paid tier. Write a decision record first. *Stage 3, gated on
   Stage 1.*
5. **Receipt/invoice photo scan (OCR)** to auto-fill an ingredient's
   cost. Needs a vision/OCR API call — there's no client-side-only way
   to do this credibly. *Stage 4.*
6. **Price / margin alerts** (push or email) when an ingredient price
   change drops a recipe below target margin. Needs a server and a
   notification service; part of the paid tier. *Stage 3–4.*
7. **A shareable public price-list link** — a URL a customer can open
   without needing the same browser/device. Meaningless without a
   backend to host the shared data. *Stage 4.*
16. **Ingredient price index** — Metro Manila staples from public DA
    price monitoring (verify format and terms first) plus anonymized
    user-entered prices, feeding alerts (item 6). The moat in
    [roadmap.md](roadmap.md) Move 4. *Stage 4.*

**Dropped 2026-10-29** (decision 0040 removed what they depended on):
Shopee/Lazada order import (no sales logging exists any more), the
client-facing quote-approval link (quotations went with Documents), and
the Multi-User security / multi-register POS sync reasons formerly
listed under item 1.

## Feature gaps — audit of the five-page app (2026-10-28)

Found by reviewing the five-page app (decision 0040) against the
food-cost-tau reference and how PH food sellers actually price. The
three highest-value items from the same audit — demo kitchen, yield %,
and menu price rounding — shipped the same day (decision 0041, see
`completed.md`). Point of Sale's old memoization and camera-scanning
items were dropped from this list: POS no longer exists.

9. **Labor double-count guard** — a recipe's prep labor and an OPEX
   "Labor" wage both feed the simulators, so an owner who fills in both
   pays the helper twice. Same trap `directCost()` already closes for
   overhead. Small. *Any stage — correctness.*
10. **Sub-recipes** — use one recipe (garlic rice, a sauce) as an
    ingredient of others, so a cost change flows through. Medium.
    *Stage 2+.*
11. **Delivery-app commission** in the Margin & POS Simulator
    (GrabFood/foodpanda take ~20–30%). Existed as Multi-Channel Pricing
    in the `v1-full-11-modules` tag. Small. *Stage 2.*
12. **Whole-menu break-even** — plates per day across every dish, not
    one dish with an "OPEX share" workaround. Medium. *Stage 2+.*
13. **Printable recipe card (PDF)** — kitchen sheet with ingredients,
    portions, cost; the reference has one. Small. *Stage 2.*
14. **CSV / price-list export** for accountants, extended with the
    import formats of Loyverse, KwentaPOS and UTAK ("price it in Amore
    Cost, sell it in your POS" — [roadmap.md](roadmap.md) Move 3).
    Existed in Documents (`v1-full-11-modules` tag). Small. *Stage 2.*
15. **Cost-change note on recipe cards** ("cost up 18% since June") —
    Cost History snapshots are still recorded, just not shown. Small.
    *Stage 2+.*
