# Roadmap

The full sequence, from where Amore Cost stands today through a validated
launch and into growth. [next-steps.md](../next-steps.md) is the pinned
excerpt of **Phase 0** below — read that first for the single most
immediate action. This file is the whole map behind it.

**Current phase: 2, 3, and 4 are all built and the app is deployed;
Phase 1 — Validate, still not run.** Fork, name, lead vertical, and
visual direction are all resolved (see
[business/decisions/](../business/decisions/CONTEXT.md) 0001, 0009,
0004, 0010); the name due-diligence checklist is the one Phase 0 item
still open. **Every module in every phase through Phase 4 is now real,
working code** (see [decision 0006](../business/decisions/0006-all-modules-built-local-only.md)),
**and it's reachable at https://amore-cost.vercel.app** (decision
0031, 2026-08-21) — built and shipped entirely ahead of Phase 1
validation, which is now the single most important open item, not just
"the next one." The build has outpaced validation many times over now:
v0 before Phase 1, v1+v2's entire scope the same day, a rename and two
logo iterations, a full Tagalog/English toggle, a whole Catalog
Management rework, a cross-page correctness audit (decision 0030), and
now deployment itself (decision 0031) — see
[completed.md](completed.md) for the full list. Phases 6–8 were
previously just implied as "open questions" inside Phases 3/4/5, now
given an actual home so they stop getting silently re-discovered every
time someone asks "what's left." Phase 9 (mobile app packaging) is a
genuinely new idea, added 2026-08-22, not a renamed old one.

## Phase process, at a glance

| Phase | What it is | Status |
|---|---|---|
| **0 — Decide** | Lock the fork, name, vertical, and visual identity before writing product code | 🟡 Mostly done — fork/name/vertical/logo all resolved (0001, 0009, 0004, 0010); only the name due-diligence checklist (domain/handles/trademark) is still open |
| **1 — Validate** | Show the pitch (now the live app) to real PH business owners, ask "would this replace your spreadsheet" | 🔴 **Not run** — the single most overdue item on this whole roadmap, no longer blocked by anything technical |
| **2 — Build v0** | The free, no-signup calculator (Costing & Pricing, Break-Even) | 🟢 Built 2026-08-17, ahead of Phase 1; **deployed** 2026-08-21 (decision 0031) |
| **3 — Build v1** | Catalog, Inventory, Cost History, Documents — "the reason to create an account" | 🟢 Built 2026-08-17, same day as v0, still simulated on `localStorage` (no real accounts) |
| **4 — Monetize (features)** | Multi-User, Multi-Channel Pricing, Margin Alerts, Reporting | 🟢 Built 2026-08-17 — the features exist; the paid *tier* itself moved to Phase 7, since it needs Phase 6 first |
| **5 — Grow (marketing)** | Content marketing, referrals, the Fork 3 partnership option, the Atlas Freelance tie-in | 🔴 Not started — correctly gated behind real validation signal |
| **6 — Real accounts & backend** *(new)* | Auth, database, and the `localStorage` → account migration — unlocks real Multi-User security and multi-register POS sync | 🔴 Not started — [backlog.md](backlog.md) item 1; needs Phase 1 signal first |
| **7 — Launch a paid tier** *(new)* | Actually gate something behind payment and take money | 🔴 Not started — depends on Phase 6 existing and Phase 1 confirming willingness to pay; draft ₱199–499/month range is unvalidated |
| **8 — Ecosystem & integrations** *(new)* | Shopee/Lazada order import, receipt OCR, real push/email notifications, shareable client-facing links, camera barcode scanning, the Atlas Freelance tie-in | 🔴 Not started — [backlog.md](backlog.md) items 4–9; all but barcode scanning need Phase 6's backend first |
| **9 — Mobile app packaging** *(new)* | Wrap the existing web app for Google Play (TWA) and the Apple App Store (Capacitor) | 🔴 Not started — no rewrite needed, but gated on Phase 1 signal first, same as everything else; most valuable once Phase 6 exists |

Everything green happened **before** the one red item that was supposed to gate it (Phase 1). That inversion is a known, named risk in this file, not an oversight — see each phase section below for the full reasoning and what it does/doesn't change about what happens next.

## Phase 0 — Decide (now, before anything else)

1. ~~Re-decide the lead vertical~~ — **resolved, twice:** unified food +
   service + retail first
   ([decision 0004](../business/decisions/0004-lead-vertical-unified.md)),
   then narrowed to food-only
   ([decision 0038](../business/decisions/0038-food-only-vertical-removed.md),
   2026-09-03) as a deliberate staged rollout, not a reversal made
   lightly. This is also why [product/modules.md](../product/modules.md) now
   includes a dedicated Inventory module — going after the food
   vertical directly means matching iCost's real-time inventory
   feature, not just its costing math.
2. **Clear the name due-diligence checklist** — `.ph`/`.com` domain,
   social handles (Facebook/Instagram/TikTok, where this ICP actually
   lives), and an IPOPHL trademark search for "Amore Cost." A quick check
   already found only an obscure, unrelated Node.js library sharing the
   *previous* name, Calcost (see
   [business/decisions/0003-brand-name-calcost.md](../business/decisions/0003-brand-name-calcost.md))
   — that check needs re-running against "Amore Cost" (see
   [decision 0009](../business/decisions/0009-brand-name-amore-cost.md)),
   not yet formally cleared either way.
3. ~~Pick a visual direction~~ — **resolved:** a custom two-tone ring +
   α% mark, built as real code
   (`src/components/BrandMark.tsx`) rather than a static image dropped
   in `branding/logo/` as originally planned here. Went through two
   iterations the same day — see
   [decision 0009](../business/decisions/0009-brand-name-amore-cost.md)
   (v1, superseded) and
   [decision 0010](../business/decisions/0010-logo-mark-v2-ring-and-chevrons.md)
   (v2, current).

## Phase 1 — Validate (before writing any product code)

- Use [branding/pitch-one-pager.html](../branding/pitch-one-pager.html)
  (or a screenshot of it) as the validation artifact — it's built to be
  shareable as-is.
- Post it into the channels already identified in
  [business/market-research.md](../business/market-research.md)'s
  "Distribution channels worth testing first": PH Business
  Network-adjacent communities, Filipino small-business Facebook
  groups, r/phcareers, OnlineJobs.ph-adjacent spaces. Position it as
  "the upgrade path from the sheet you already bought," not a frontal
  attack on the community where the competing template is sold.
- The ask is **"would this replace your spreadsheet,"** not "would you
  pay" — the same soft-validation move Atlas Freelance's own Phase 1
  used before any monetization signal was expected.
- Specifically resolve the open question in
  [business/concept.md](../business/concept.md): is monthly
  willingness-to-pay real here, or does this market only accept
  one-time pricing? This decides whether Phase 4's pricing model
  survives contact with reality.
- Decide go/no-go criteria for moving to Phase 2 *before* posting, not
  after — so the bar doesn't quietly move to match whatever response
  comes in.

## Phase 2 — Build v0 (the free, no-signup calculator)

**Built 2026-08-17, ahead of Phase 1 validation** — Oliver asked for a
working local build before the pitch was shared anywhere, so the
sequence ran 2 before 1 in practice. That's a real reordering, not a
correction to this file: Phase 1's validation still needs to happen
before Phase 3, ideally now pointing at the actual running app
(`npm run dev`, see root `CLAUDE.md`) instead of only the static pitch
page.

Scope, as drafted in [product/scope-v1.md](../product/scope-v1.md)'s "v0"
section, is built in `src/`: one calculator engine — originally
tab-switchable across food/service/resale, narrowed to food-only as of
[decision 0038](../business/decisions/0038-food-only-vertical-removed.md)
(see [product/modules.md](../product/modules.md)'s "Food-only" note) —
all three pricing strategies (markup / margin / fixed profit), the
VAT / non-VAT tax toggle, and a break-even calculator — all
`localStorage`-only, no login. Stack: Next.js + TypeScript + Tailwind,
matching Atlas Freelance's stack per that file's own suggestion.

- **Deployed 2026-08-21** (decision 0031): **https://amore-cost.vercel.app**,
  via CLI deploy (no git repo yet, so redeploys are manual —
  `vercel --prod` from the project folder). Was tracked in
  [backlog.md](backlog.md) item 1, explicitly deferred 2026-08-18 in
  favor of the ingredient library and a test suite, both of which
  landed first (see [completed.md](completed.md)).

## Phase 3 — Build v1 (the reason to create an account)

**Built 2026-08-17, same day as Phase 2, ahead of Phase 1 validation**
(decision 0006) — Catalog, Inventory, Cost History, and Documents
(CSV + printable quotations) are all real, but simulated with
`localStorage` rather than real accounts. See
[product/scope-v1.md](../product/scope-v1.md) and
[product/modules.md](../product/modules.md) for exactly what shipped and
which parts are simplified (Inventory tracks per-item stock, not a
shared ingredient pool).

Real accounts (auth, backend, database, the localStorage → account
migration path) are **still not built** — this phase's original
premise ("the reason to create an account") was satisfied without
actually needing one yet. That work now has its own home, Phase 6, not
an assumed next step — see `product/scope-v1.md`'s "open question this
leaves."

## Phase 4 — Monetize the features (v2)

**Built 2026-08-17** (decision 0006) — Multi-User (a local profile
switcher, explicitly *not* real access control), Multi-Channel
Pricing, Margin Alerts, and Sales & Profit Reporting are all real.
These are the features Phase 7 will eventually gate behind payment —
this phase is just "build the thing," not "charge for it." See Phase 7
for the actual paid-tier decision, which needs Phase 6's backend to
even be possible.

## Phase 5 — Grow (marketing)

- Content marketing aimed at the ICP — how-to-price and how-to-cost
  content is exactly what this audience already searches for, mirroring
  Atlas Freelance's own Phase 3 playbook. See
  [../marketing/content-ideas.md](../marketing/content-ideas.md) for
  the actual backlog of pieces.
- A referral program — this market clusters in communities, so word of
  mouth compounds fast (same logic as Atlas Freelance's Phase 3).
- Revisit **Fork 3** opportunistically — a PH Business Network
  partnership conversation (see
  [business/strategic-forks.md](../business/strategic-forks.md)) is a much
  easier pitch once there's a real, validated product to show instead
  of just an idea.

This phase can start as soon as Phase 1 validates — it doesn't need
Phases 6–8 first, since it's marketing the free tool that already
exists and is deployed.

## Phase 6 — Real accounts & backend

**Not started** — [backlog.md](backlog.md) item 1. Auth, a real
database, and the `localStorage` → account migration path. This is
what actually unlocks:
- Fixing Multi-User's documented lack of real security (it says so on
  the page itself — decision 0022's scope note).
- True multi-register/multi-terminal sync for Point of Sale (decision
  0015 already scoped a single register as v1's deliberate limit).
- A pooled raw-ingredient stock across products, instead of Inventory's
  current per-finished-item tracking.
- Everything in Phase 8 except barcode scanning.

This was previously buried as an "open question" inside the original
Phase 3/4 text rather than given its own phase — pulled out here so it
has a real home instead of getting silently re-discovered. Gated on
Phase 1 signal: building this before knowing anyone wants to pay for
sync/multi-device would be building ahead of validation for a fifth
time.

## Phase 7 — Launch a paid tier

**Not started** — depends on Phase 6 existing and Phase 1 confirming
real willingness to pay (the open question in
[business/concept.md](../business/concept.md): is monthly billing
viable in this market, or does it only accept one-time pricing?).
Deciding *what* to gate is itself an open decision, not assumed:
either (a) keep the whole local-only product free forever and monetize
a future accounts-based sync tier instead, or (b) retroactively gate
some of what Phase 4 already built behind a paid unlock. Either way,
not the draft ₱199–499/month range on its own — that figure is still
unvalidated (see `product/scope-v1.md` and the pitch page).

## Phase 8 — Ecosystem & integrations

**Not started** — [backlog.md](backlog.md) items 4–9, logged
2026-08-18 from a feature-research pass but deliberately not built
since none of them (except barcode scanning) are achievable on the
current local-only architecture:
- Shopee/Lazada order import (needs OAuth + API integration per
  platform).
- Receipt/invoice photo scan (OCR) to auto-fill an ingredient's cost.
- Real push or email notifications for low stock or a margin dropping
  below target (a backend + notification service, not just an in-tab
  toast).
- A shareable public price-list link and a client-facing quote-approval
  link — both need a backend to host data outside one browser's
  `localStorage`.
- Camera-based barcode scanning for Point of Sale — the one item here
  that's client-side-feasible today (a barcode-decoding library +
  `getUserMedia`), not blocked on Phase 6, just not built yet.
- The **Atlas Freelance ecosystem tie-in** — weaker since decision
  0038 (Amore Cost no longer serves service providers, the original
  overlap this was reasoned from), but still real for a food business
  costing a catering job or bulk order and turning it straight into an
  Atlas Freelance proposal/invoice (see market-research.md's edge #4)
  — once both products are far enough along to support the handoff.

## Phase 9 — Mobile app packaging (Play Store / App Store)

**Not started, not urgent** — a distribution decision, not a rebuild.
Added 2026-08-22 after Oliver asked whether this was possible; the
existing web app doesn't need to be rewritten to get onto app stores:

- **Android (Google Play):** wrap the deployed site as a Trusted Web
  Activity (TWA) — a thin native shell around
  [amore-cost.vercel.app](https://amore-cost.vercel.app). Google Play's
  developer account is a one-time $25 fee; review is comparatively fast
  (days, not weeks).
- **iOS (Apple App Store):** wrap via Capacitor (or similar) instead —
  iOS has no TWA equivalent. Apple charges $99/year for a developer
  account, and review is stricter: App Store Review Guideline 4.2 can
  reject an app that reads as "just a website in a shell" without
  enough native-feeling functionality (offline behavior, push
  notifications, native UI touches). This is a real rejection risk to
  plan for, not assume away.
- Either path still runs on today's `localStorage`-only data model —
  each install's data lives on that one device only, same limit as the
  browser version today. A native app matters more once **Phase 6**
  (real accounts) exists, since that's what makes "I have this on my
  phone *and* my laptop" actually useful instead of two disconnected
  copies of the same tool.
- **Gated on Phase 1 the same way everything else has been** —
  packaging this before validation would be building ahead of the
  evidence yet again. Once Phase 1 validates, this is a real, cheap
  (~$25–$124 total, no rewrite) move — most valuable once Phase 6 is
  also in place, but technically doable any time after Phase 1.

## How to use this file, and the rest of this folder

- `../next-steps.md` stays the short "what's actually next" pointer;
  update *this* file's phase list and "Current phase" line as work
  actually moves, and keep the two consistent.
- [backlog.md](backlog.md) is concrete not-yet-started work, roughly
  ordered. [completed.md](completed.md) is the flat shipped changelog.
  Ship something from the backlog → delete its line there, add a line
  to `completed.md`, same session — same discipline as Atlas
  Freelance's split.
- Log real decisions in
  [business/decisions/](../business/decisions/CONTEXT.md), not here — this
  file is the sequence, not the record of why each choice was made.
