# Roadmap: how Amore Cost starts, scales, and wins

**Written:** 2026-10-28, after the cut to five pages (decision 0040), the
pricing aids (decision 0041), and the
[KwentaPOS comparison](../business/kwentapos-comparison.md).
**It replaces** the old phase-by-phase roadmap, which described the
11-module app. That version is archived at
[../archive/eleven-modules-2026-10/roadmap.md](../archive/eleven-modules-2026-10/roadmap.md).

[next-steps.md](../next-steps.md) is the pinned "do this now" excerpt.
This file is the whole plan behind it.

> **Every number in this file is a target or an assumption, not a fact.**
> Nothing here has been validated with a real customer yet. Each stage
> has a gate, and you only move on when the gate is met.

---

## 1. The situation in one paragraph

Philippine food businesses already have choices:
- POS apps that also cost recipes: KwentaPOS from ₱59/mo (recipe costing
  needs Pro, ₱299/mo); Loyverse, StoreHub and UTAK at various prices.
- A recipe-costing app: iCost, ₱299–599/mo.
- ₱200–₱1,000 spreadsheet templates.

Amore Cost is one founder, ₱0 budget, zero users, and a free web app
that does **pricing** better than any of them. It doesn't do selling,
stock, or staff, and it shouldn't try to.

## 2. The way to win (the strategy)

**Don't fight the POS war. Own the question every food seller asks
before they need a POS: "Magkano dapat ang presyo ko?"**

Five moves, in order of importance:

### Move 1: Be the "pricing brain," not another POS

- POS apps record what you sold.
- Amore Cost tells you **what to charge and whether you're actually
  earning**. That means:
  - the suggested price;
  - VAT, Senior/PWD discount and service charge done correctly;
  - OPEX per dish and break-even;
  - yield (waste);
  - menu rounding.
- None of the POS apps sell this depth. Keep Amore Cost narrow, deep
  and excellent at this one job.
- **The rule:** if a feature helps an owner *price better*, it's a
  candidate. If it helps them *operate the store* (checkout, stock,
  utang, shifts, branches), the answer is no. Point them to a POS.

### Move 2: Catch owners earlier than the POS apps do

KwentaPOS's customer already has a store running. Our customer is:
- the home baker deciding what to charge for a cake;
- the food-cart starter pricing their first menu;
- the carinderia owner who suspects the adobo is losing money.

That's the **start of the business journey**. Free, no sign-up, Tagalog,
and a one-click sample menu make Amore Cost the first tool they touch.
Whoever helps them price first earns their trust when they later need
more.

### Move 3: Partner with POS apps instead of fighting them

- **Message:** "Price it in Amore Cost, sell it in your POS."
- **Build:** export the price list as CSV in the import formats of
  Loyverse, KwentaPOS and UTAK (backlog item 14, extended).
- **Effect:** every POS becomes a distribution channel instead of a
  competitor. Later, pitch a referral deal to POS vendors. They lack
  pricing depth, and we send them users who are ready for a POS.

### Move 4: Build the one moat a POS won't build: live ingredient prices

- Every owner retypes the price of chicken, pork, rice and eggs.
- The Department of Agriculture publishes market price monitoring for
  Metro Manila (verify the current format and usage terms before
  building).
- Once accounts exist (Stage 3), combine that public data with
  anonymized prices owners enter. The result is a **live Philippine
  ingredient price index** that can say: *"Pork is up 8% this week. 3
  of your recipes dropped below target margin. Suggested new price:
  ₱189."*
- POS apps compete on checkout speed and won't build this. It gets
  better with every user, which is a real network effect.

### Move 5: Win on content and community, not on ads

- The audience learns from short videos and Facebook groups.
- "Magkano dapat ang presyo ng ___?" is endlessly repeatable content,
  and every video ends at a free tool that answers it.
- This ties directly into your existing YouTube/content skills.

### What you must NOT do

| Don't | Why |
|---|---|
| Rebuild POS, inventory, utang, shifts, multi-branch | Decision 0040 cut these on purpose. It's a crowded market with ₱59/mo competitors, and you're solo |
| Chase BIR accreditation | Only needed for an actual POS issuing receipts. Amore Cost simulates; it doesn't sell |
| Start a price war under ₱59 | You can't out-cheap a funded POS. Compete on value, keep the core free |
| Build another feature before Stage 1's gate | This project has built ahead of validation many times. The next win is customers, not code |
| Spend on paid ads before retention is proven | Ads amplify retention; they don't create it |

---

## 3. The stages

| Stage | When (target) | Goal | Gate to move on |
|---|---|---|---|
| **0: Launch-ready** | Week 1 | The live site matches the code, you can see who uses it, users can reach you | Deployed + analytics + feedback link live |
| **1: Validate** | Weeks 2–6 | 20 real food owners try it on their own recipes | See gate below |
| **2: Content engine** | Months 2–4 | Steady free users from content and groups | 300+ monthly users, 20%+ come back within 30 days |
| **3: Accounts + paid tier** | Months 4–6 | Cloud sync, first paying customers | 20+ paying customers |
| **4: Scale the moat** | Months 6–12 | Price index, POS exports, partnerships, app stores | ₱20k+ MRR (target, unvalidated) |
| **5: Expand** | Year 2 | Multi-outlet, consultants, institutions | Decided by Stage 4 data |

### Stage 0: Launch-ready (week 1, mostly free)

1. **Deploy** the current build (`vercel --prod`). The live site is
   behind the code (no yield, rounding or sample recipes yet).
2. **Turn on privacy-friendly analytics.** Vercel Web Analytics is free
   at this scale. Track visits, "Try with sample recipes" clicks, and
   "+ New recipe" clicks.
3. **Add a feedback link** in the app, e.g. a Google Form: "What did
   you price? Did the suggested price feel right? Would you pay for
   sync?"
4. **Finish the name check:** domain, Facebook/TikTok/Instagram handles,
   IPOPHL trademark search for "Amore Cost". This item has been open
   since the start.
5. **Create the Facebook page** and one TikTok/Reels account under the
   brand.

### Stage 1: Validate (weeks 2–6)

**Set the gate before you start, so the bar can't move to fit the
results:**

- Talk to **20 food owners**: home bakers, carinderias, food carts,
  online sellers. Start in person nearby (Parañaque and neighboring
  areas), then go online.
- **Script:**
  1. Open the app on their phone.
  2. Tap "Try with sample recipes."
  3. Ask them to add **one of their own dishes**.
  4. Ask: *"Is the suggested price close to what you charge? Did
     anything surprise you?"*
  5. Ask: *"Would you pay ₱99/month to keep this on all your devices
     and get price alerts?"*
- **Gate (all three must be true):**
  - ≥ 10 of 20 enter at least one real recipe without your help;
  - ≥ 5 come back on their own within 7 days (ask them, or check
    analytics);
  - ≥ 3 say yes to a specific price, or ask you "when can I pay?"
- **If the gate fails:** don't build. Read the notes, find what
  confused or bored them, and fix *that* (usually onboarding or wording,
  not features). Rerun with 10 new people. If it fails twice, write a
  decision record on whether to pivot. One option: a pricing *service*
  you do for owners using the tool, instead of a SaaS.
- **Log every conversation** as a short note in `docs/business/` (new
  file `validation-log.md`). It's the most valuable data this project
  will ever have.

### Stage 2: Content engine (months 2–4, about ₱0–2k/month)

- **3 short videos per week.** Format: "Magkano dapat ang presyo ng
  [dish]?", where you cost it live in Amore Cost and reveal the suggested
  price. Variations:
  - "Lugi ka ba sa ___?"
  - "Bakit 30% lang dapat ang food cost mo"
  - "Senior/PWD discount: tama ba ang kwenta mo?"
- **"Presyo Check" posts:** invite owners to send a recipe; you price it
  publicly with permission. This gets you content, leads and
  testimonials at once.
- **Facebook groups:** help first, link second. Answer pricing questions
  in home-baker, carinderia and food-business groups, and share the
  sample-recipe link when it fits.
- **Free lead magnets** that point back to the app:
  - "Food cost cheat sheet (PH 2026)"
  - "Senior/PWD discount explained"
- **Small builds allowed in this stage** (each one makes content or
  sharing easier):
  - CSV/price-list export (backlog 14);
  - printable recipe card (backlog 13);
  - delivery-app commission in the simulator (backlog 11).
- **Gate:** 300+ monthly users, with 20%+ returning within 30 days.

### Stage 3: Accounts + paid tier (months 4–6)

- **Backend:** Supabase (you already know it from the Sales Agent
  project). Write a decision record first, as root `CLAUDE.md`
  requires.
  - Accounts are **optional**. The no-sign-up free tool stays.
  - Import existing localStorage data on first sign-in.
- **What stays free forever:** everything the app does today on one
  device. This is the hook and the content engine's destination.
- **Amore Cost Plus**, test **₱99/mo or ₱899/yr** (below iCost and
  KwentaPOS Pro, above "free"):
  - cloud sync across phone and laptop, so data is never lost to a
    cleared browser (the #1 real weakness today);
  - ingredient price alerts ("your margin slipped");
  - unlimited saved price history;
  - branded PDF menu or price list;
  - delivery-app pricing (GrabFood/foodpanda commission built in).
- **Also test a one-time "Lifetime Starter"** (e.g. ₱1,499) with the
  first 50 users. The concept doc's open question is whether this
  market prefers one-time payments, so measure it instead of guessing.
- **Payments:** a PH-friendly gateway that takes GCash/Maya (e.g.
  PayMongo or Xendit). Compare fees at decision time.
- **Gate:** 20+ paying customers.

### Stage 4: Scale the moat (months 6–12)

1. **Ingredient price index (Move 4):**
   - Start with Metro Manila staples from public DA data plus
     user-entered prices.
   - Weekly "presyo ng bilihin" content writes itself from the index.
2. **POS exports + partnerships (Move 3):**
   - CSV formats for Loyverse, KwentaPOS and UTAK.
   - Approach one POS vendor for a referral swap.
3. **Distribution partners:**
   - DTI Negosyo Centers and LGU livelihood programs: a free tool they
     can teach in seminars;
   - culinary and baking schools: a pricing module for students;
   - ingredient suppliers and baking-supply stores: co-branded "price
     your recipes" QR at the counter.
4. **Mobile app stores:** wrap the web app for Google Play (TWA, $25
   one-time). iOS later, since Apple review risks rejecting a "website
   in a shell."
5. **Referral loop:** "Give a friend 1 month of Plus, get 1 month."
   This market spreads through barkadas and groups.
- **Target:** ₱20k+ MRR, about 200 Plus users at ₱99. This is a target,
  not a forecast. Revisit with real conversion data from Stage 3.

### Stage 5: Expand (year 2, only if Stage 4 works)

- **Multi-outlet / small franchise costing:** one menu across several
  branches, with prices adjusted per location. This is *costing*
  across branches, not a POS.
- **Consultant tier** (~₱499/mo): food-business coaches and franchise
  consultants who price menus for many clients.
- **Institutional licenses:** schools, DTI programs, cooperatives.
- **Regional price indexes** (Cebu, Davao) once there are users there.

---

## 4. Battlecards: what to say against each alternative

| When they say… | You say… |
|---|---|
| "I already use KwentaPOS / Loyverse." | "Keep it. Use Amore Cost to set the right price first, including VAT, Senior/PWD and your rent per dish, then put that price in your POS." |
| "iCost already does recipe costing." | "Amore Cost is free with no sign-up, works in Tagalog, and shows OPEX per dish, break-even, and a profit-and-loss simulator." |
| "I have a spreadsheet." | "Your sheet goes stale the day chicken goes up. Here, change one price and every recipe updates." |
| "I just copy my competitor's price." | "Their costs aren't your costs. Let's check your adobo: 2 minutes, free." |

## 5. Risks and what to do if they happen

| Risk | Early sign | Response |
|---|---|---|
| KwentaPOS or iCost adds VAT/Senior-PWD pricing depth | Their site or changelog mentions it | Lean harder on the free tier, content, and the price index. Speed and focus are the defense. Re-check competitors every quarter |
| Owners like it but won't pay | Stage 3 conversion under 2% | Test one-time pricing. Test B2B (schools, DTI, consultants) as the payer instead of the owner |
| Validation keeps failing | Stage 1 gate missed twice | Decision record: pivot to a done-for-you pricing service, or pause |
| Founder time spread across too many ventures | Stage 2 videos stop | Cut scope to 1 video/week + 3 group answers/week. Consistency beats volume |
| Data loss (localStorage) hurts trust before Stage 3 | Users report lost recipes | Make "Download backup" more visible. Pull sync forward |

## 6. The scoreboard (review every Sunday)

| Metric | Where to get it | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|---|
| Owners interviewed | validation-log.md | 20 | — | — | — |
| Monthly users | Analytics | — | 300 | 1,000 | 5,000 |
| Users who add their own recipe | Analytics | 50% | 40% | 40% | 40% |
| 30-day return rate | Analytics | — | 20% | 25% | 30% |
| Paying customers | Payment dashboard | — | — | 20 | 200 |
| Videos published | Content log | — | 3/week | 3/week | 3/week |

All targets are starting guesses. Replace them with real baselines
after Stage 1.

---

## How this file stays useful

- When a stage's gate is met, mark it done here and in
  [next-steps.md](../next-steps.md), and add a line to
  [completed.md](completed.md).
- Concrete build tasks live in [backlog.md](backlog.md). This file says
  *which stage* a task belongs to, not how to build it.
- Real choices (price point, backend, a pivot) get a numbered record in
  [../business/decisions/](../business/decisions/CONTEXT.md).
- Competitor facts live in
  [../business/competitive-landscape.md](../business/competitive-landscape.md)
  and [../business/kwentapos-comparison.md](../business/kwentapos-comparison.md).
  Link to them; don't copy them.
