# Amore Cost — Master Plan

*A consolidated reading copy of the roadmap and go-to-market plan, as
of 2026-08-22. Live app:* **[amore-cost.vercel.app](https://amore-cost.vercel.app)**

> **This file is a convenience snapshot, not the source of truth.**
> The canonical, always-current versions are
> [docs/roadmap/roadmap.md](docs/roadmap/roadmap.md),
> [docs/business/go-to-market.md](docs/business/go-to-market.md), and
> [docs/marketing/](docs/marketing/CONTEXT.md). If this file and those
> ever disagree, the `docs/` versions win — ask for this file to be
> regenerated from them rather than hand-editing both.
>
> For the concrete per-page feature plan (what to add/edit on each
> module, checked against real code gaps and market research), see
> [docs/product/module-upgrade-plan.md](docs/product/module-upgrade-plan.md) —
> not duplicated here since it's a working punch list, not a summary.

---

## Where things stand, in one paragraph

Amore Cost is a costing, pricing, and break-even calculator built for Philippine small businesses across three verticals — food, services, and resale. Every module through **Phase 4** is real, working code, and the app has been **deployed and reachable since 2026-08-21**. As of 2026-09-02 it also has a real **insights engine** — Overview shows specific, personalized recommendations (why a price is below target and the exact fix, which item drives most profit, a channel-fee margin gap, a stock-runway estimate) instead of just raw numbers, the first part of the app that acts as an advisor rather than a calculator (see `docs/business/product-depth-analysis.md` and decision 0032). What hasn't happened yet is still the single most important thing: **showing it to a real business owner and asking if it would replace their spreadsheet.** That's Phase 1, and it's the one phase that's overdue — everything else got built ahead of it. This document lays out all ten phases end to end, and the full marketing plan for actually getting this in front of people.

---

## Part One — The Full Roadmap

Ten phases, numbered 0 through 9. Phases 6, 7, and 8 were originally just "open questions" buried inside other phases, now separated out. Phase 9 (mobile app packaging) is a genuinely new addition, from 2026-08-22.

| # | Phase | Status |
|---|---|---|
| 0 | Decide | 🟡 Mostly done |
| 1 | Validate | 🔴 Overdue |
| 2 | Build v0 | 🟢 Done + deployed |
| 3 | Build v1 | 🟢 Done |
| 4 | Monetize — the features | 🟢 Done |
| 5 | Grow — marketing | 🔴 Not started |
| 6 | Real accounts & backend | 🔴 Not started |
| 7 | Launch a paid tier | 🔴 Not started |
| 8 | Ecosystem & integrations | 🔴 Not started |
| 9 | Mobile app packaging | 🔴 Not started |

### Phase 0 — Decide

Lock the fork, name, vertical, and visual identity before writing product code.

- **Resolved:** the product covers all three verticals — food, services, and resale — in one unified account, not a single lead vertical.
- **Resolved:** the name is **Amore Cost** (an earlier name, Calcost, was retired).
- **Resolved:** visual identity is a custom two-tone ring + α mark, built as real code rather than a static logo file.
- **Still open:** the name due-diligence checklist — a `.ph`/`.com` domain check, social handles on Facebook/Instagram/TikTok (where this audience actually lives), and an IPOPHL trademark search specifically for "Amore Cost." A quick check already cleared the *old* name, Calcost, against an unrelated Node.js library — that check has not yet been re-run against the current name.

### Phase 1 — Validate

Show the live app to real PH business owners and ask **"would this replace your spreadsheet."**

This is the single most overdue item on the entire roadmap — every phase below through Phase 4 got built before this ran. It's no longer blocked by anything technical: the app is deployed, so the only remaining step is posting it and asking.

Validating this also resolves two open questions that everything downstream depends on:
- Is **monthly** willingness-to-pay real in this market, or does it only accept one-time pricing?
- Are real accounts (Phase 6) worth building at all before this signal exists?

**Decide the go/no-go bar in writing, before posting** — pick a number now (e.g. "10+ out of the first 50 people say 'I'd use this'") so it can't quietly move to match whatever response actually comes in.

### Phase 2 — Build v0

The free, no-signup calculator: Costing & Pricing, and Break-Even.

Built 2026-08-17, ahead of Phase 1 validation. One unified calculator across all three verticals (tab-switchable, shared engine), all three pricing strategies (markup %, margin %, fixed profit), a VAT/non-VAT tax toggle, and a break-even calculator — entirely `localStorage`-only, no login required.

**Deployed 2026-08-21** — **[amore-cost.vercel.app](https://amore-cost.vercel.app)**, via a direct CLI deploy (the project isn't under git yet, so future changes need a manual `vercel --prod` redeploy rather than an automatic one).

### Phase 3 — Build v1

Catalog, Inventory, Cost History, and Documents (CSV export + printable quotations) — "the reason to create an account."

Built the same day as Phase 2, all real, but simulated with `localStorage` rather than actual user accounts. Inventory currently tracks stock per finished catalog item, not a shared pool of raw ingredients — that's a known simplification, not a bug. Real accounts, and everything that depends on them, now live in Phase 6 rather than being an assumption baked into this phase.

### Phase 4 — Monetize the features

Multi-User (a local profile switcher — explicitly *not* real access control, and the app says so on the page itself), Multi-Channel Pricing, Margin Alerts, and Sales & Profit Reporting.

All four are real, working modules, built 2026-08-17. This phase only means "the features exist" — actually charging money for any of it moved to Phase 7, since that needs Phase 6's backend to be possible at all.

### Phase 5 — Grow (marketing)

Full detail in Part Two below. In short: content marketing aimed at this audience's actual search habits, a referral mechanic once there's a paid base, and revisiting a PH Business Network partnership once there's a validated product to show. This phase doesn't need Phases 6–8 first — it's marketing the free tool that already exists and is live today.

### Phase 6 — Real accounts & backend

Auth, a real database, and the `localStorage` → account migration path.

Not started — deliberately gated on Phase 1 signal, since building this before knowing anyone actually wants cross-device sync would mean building ahead of validation yet again. This is what unlocks:
- Fixing Multi-User's documented lack of real security.
- True multi-register/multi-terminal sync for Point of Sale (today's Point of Sale deliberately scopes to a single register).
- A pooled raw-ingredient stock shared across products, instead of Inventory's current per-item tracking.
- Nearly everything in Phase 8.

### Phase 7 — Launch a paid tier

Actually gating something behind payment and taking money.

Depends on Phase 6 existing and Phase 1 confirming real willingness to pay. What to gate is itself an open decision — either (a) keep the whole local-only product free forever and monetize a future accounts-based sync tier instead, or (b) retroactively gate some of what Phase 4 already built behind a paid unlock. Either way, the draft **₱199–499/month** range is unvalidated and shouldn't be treated as settled.

### Phase 8 — Ecosystem & integrations

- **Shopee/Lazada order import** — auto-log a sale from a real marketplace order. Needs OAuth + API integration per platform.
- **Receipt/invoice photo scan (OCR)** to auto-fill an ingredient's cost. Needs a vision/OCR API call.
- **Real push or email notifications** for low stock or a margin dropping below target — a browser can show an in-tab toast without a backend, but a real push or email needs a server.
- **A shareable public price-list link** and **a client-facing quote-approval link** — both need a backend to host data outside one browser's `localStorage`.
- **Camera-based barcode scanning** for Point of Sale — the one item here that's client-side-feasible *today*, not blocked on Phase 6, just not built yet.
- **The Atlas Freelance ecosystem tie-in** — a service provider costing a job in Amore Cost and turning it straight into an Atlas Freelance proposal or invoice, once both products are far enough along to support the handoff.

### Phase 9 — Mobile app packaging (Play Store / App Store)

A distribution decision, not a rebuild — the existing web app doesn't need to be rewritten to get onto app stores.

- **Android (Google Play):** wrap the deployed site as a Trusted Web Activity (TWA) — a thin native shell. One-time $25 developer fee; review is comparatively fast.
- **iOS (Apple App Store):** wrap via Capacitor instead — iOS has no TWA equivalent. $99/year developer account, and stricter review: Apple's Guideline 4.2 can reject an app that reads as "just a website in a shell" without enough native-feeling functionality. A real rejection risk, not something to assume away.
- Either path still runs on today's `localStorage`-only data model — each install's data lives on that device only. A native app matters more once **Phase 6** (real accounts) exists, so "on my phone and my laptop" is actually one synced tool, not two disconnected copies.
- **Gated on Phase 1**, same as everything else — packaging this before validation would be building ahead of the evidence again. Once Phase 1 validates, this is a cheap (~$25–$124 total, no rewrite) move, most valuable once Phase 6 is also in place.

---

## Part Two — The Marketing Plan

### The offer

Two tiers:

- **Free, forever, no signup** — the full calculator: cost, price, and break-even, across all three verticals. This is the hook, not a crippled trial. It has to be good enough on its own that someone tells a friend about it before ever creating an account.
- **Paid, ₱199–499/month (draft, unvalidated)** — would unlock the ingredient library, inventory, cost history, PDF export, and multi-user. Blocked on Phases 6–7; not something to sell today.

### The pitch

Lead with breadth, stated plainly: **"the only Philippine costing tool that covers food, services, and resale in one account."**

In direct conversation (not necessarily in public copy), anchor against the two real alternatives:
- vs. spreadsheet templates: *"stays current when your costs change, instead of going stale the day flour goes up."*
- vs. single-vertical costing apps: *"does your food costing and your service quotes and your resale margins — not just one of those."*

Position everything as **"the upgrade from the sheet you already bought,"** never as a frontal attack on the community where a competing template is sold.

### Where to post, in order

1. **PH freelancer/small-business Facebook groups, r/phcareers, OnlineJobs.ph-adjacent communities.** Lowest friction, most likely real audience overlap.
2. **PH Business Network** — same audience, ~160K members. A bigger room, so mind the positioning care-point before posting here specifically.
3. **TikTok/short-form, creator-adjacent — not paid ads.** Creators like JR Quilantang and Recurra already prove this audience responds to creator-led financial content over advertising. The goal is finding a similar voice or angle, not necessarily posting under Amore Cost's own account first.

### The sales motion for a solo founder

No sales team, no ad budget — the motion has to be founder-led and organic:

1. **The product does the selling.** The zero-signup free tier is the primary "sales" mechanism — no one needs to talk to the founder to get value from it.
2. **Do things that don't scale, early.** For the first real cohort — realistically the first 20–50 people who actually try it — personally help them use it (a DM, a quick call, a walkthrough) rather than waiting for a self-serve funnel. The payoff is real testimonials and named case studies (e.g. "a home baker in Quezon City" style) for the next round of community posts.
3. **Community over ads.** This audience trusts community and creator recommendations over advertising. No ad spend before organic community signal is confirmed.
4. **Referral, once there's a base.** A simple mechanic (e.g. both sides get a free month) once there's a real paid user base to refer from — not before.
5. **The partnership option stays a background lever.** A PH Business Network conversation is the highest-leverage single move available given their existing audience, but it's a Phase 5 conversation, not a Phase 1 dependency.

### What success looks like, by phase

| Phase | The one real signal |
|---|---|
| 1 — Validate | A real number of business owners who reacted with "I'd use this" — not likes or shares. |
| 2 — v0 live | Repeat use of the free tool by the same person across more than one session — proof it replaced a habit, not a one-time curiosity click. |
| 3–4 — v1, paid | Conversion from free use to a paid account. |
| 5 — Grow | Referral share of new signups — the cheapest, most durable channel in a community-dense market. |

### Ready-to-post copy (Facebook / community groups)

*Updated per [decision 0037](docs/business/decisions/0037-reposition-to-lead-with-food.md) — leads with food, mentions service/resale as a bonus rather than co-equal.*

> Nagtatry ako mag-build ng libreng recipe costing tool para sa mga food business — home bakers, carinderia, online food sellers. Costing, pricing, at break-even calculator sa isang lugar. (Pwede rin pala for service o resale kung kailangan niyo.)
>
> Walang login, walang bayad. Gusto ko lang malaman kung ito yung palit ng ginagamit niyong spreadsheet o Google Sheets template ngayon.
>
> Try niyo: amore-cost.vercel.app
>
> Honest feedback lang — kung hindi kayo maco-convince, sabihin niyo rin bakit.

### Content backlog for Phase 5 (a queue, not written yet)

Each idea traces to a real feature already built, not generic small-business advice:

- **"Margin % vs. Markup %: they're not the same number"** — reuses the explainer already built into Costing & Pricing.
- **"How much of your rent is really in that price?"** — the overhead-allocation connection, with a clear before/after example.
- **"Buying in bulk? Here's your real per-unit cost"** — the sack-of-flour-plus-delivery example already used internally.
- **"What does it actually cost to sell one more unit?"** — break-even plus a contingency buffer, framed around the anxiety this audience already has: *"paano ko malalaman kung tama ang presyo ko."*

Format-wise: short-form video walking through one calculation live matches where this audience already is; a plain "before you post that spreadsheet-template price, check this" piece directly supports the switching-cost pitch above. Nothing here should reference a paid tier or price — no pricing is real yet, so content should sell the free tool, not a plan that isn't built.

### What this plan is explicitly not, right now

- **Not a paid-ads plan.** No ad spend before organic community signal confirms it's worth it.
- **Not a referral program yet.** That's a Phase 5 move once there's a real paid base to refer from.
- **Not the PH Business Network partnership conversation.** That's a background lever for later, once there's a validated product to show.

---

## What to do this week

1. Write down the go/no-go bar for Phase 1, in a real number, before posting anything.
2. Post the ready-to-post copy above into the first Facebook group on the list.
3. Personally respond to every single reaction — this *is* the validation, not a side effect of it.
4. In parallel, run the Phase 0 name due-diligence checklist (domain, handles, trademark) — it doesn't block posting, but it's the one item still open from the earliest phase.

---

*Sources: `docs/roadmap/roadmap.md`, `docs/business/go-to-market.md`, `docs/marketing/launch-checklist.md`, `docs/marketing/content-ideas.md` — Amore Cost, a multibook workspace.*
