# Financial strategy

**This is the strategy layer — the options on the table and what has to
be decided, in order. It is deliberately not a financial *model*** (real
projected revenue, CAC, LTV) — [document-inventory.md](document-inventory.md)
correctly flags that building one before validation would be
modeling fiction, per [strategy.md](strategy.md)'s own financial
summary. Every number below is a scenario to stress-test once real data
exists, not a forecast to act on now.

## 1. Cost structure today (real, not a scenario)

- **Hosting: effectively ₱0.** Deployed 2026-08-21 (decision 0031) to
  Vercel's free tier — **https://amore-cost.vercel.app** — which covers
  early traffic with no real cost. (As of 2026-10-29 the live site
  predates decisions 0040/0041; redeploy is `vercel --prod`.) Code is
  on GitHub at https://github.com/Oliver1126/amore-cost.
- **Team: one person.** No payroll, no contractors.
- **No external funding sought.** Bootstrapped by the founder — if this
  assumption is wrong, the rest of this file needs revisiting.

This means the usual "runway" framing (cash burn against a funding
round) doesn't really apply yet. The actual scarce resource right now
is **founder time**, not cash — worth naming plainly rather than
forcing a startup-finance template that assumes something this isn't.

## 2. The fork this still hasn't resolved

Same fork already named in [product/scope-v1.md](../product/scope-v1.md)
and [strategy.md](strategy.md) — restated here because every revenue
scenario below depends on which way it goes:

- **(A) Stay free forever**, monetize a *different* layer entirely —
  real accounts + cross-device sync as the paid unlock, or a B2B angle
  (PH Business Network, DTI programs, schools, consultants).
- **(B) Retroactively gate** some of what's already built behind a
  paid tier.

**Leaning (A), not decided.** The 2026-10-28 roadmap proposes keeping
everything the five-page app does on one device free, and testing a
**Plus** tier (₱99/mo or ₱899/yr) for sync, price alerts, history, PDF
menu, and delivery pricing — features that need the backend anyway.
(B) has also shrunk: Inventory, Cost History, Multi-User, and POS were
cut at decision 0040, so there's little left to gate. Stage 1
validation and Stage 3's real conversion data decide it — record the
outcome as a decision.

## 3. Revenue model scenarios

None of these are chosen — each is what would follow from a specific
validation answer to [concept.md](concept.md)'s open question: *is monthly
willingness-to-pay real here, or does this market only accept one-time
pricing?*

| Scenario | If validation shows... | What it needs |
|---|---|---|
| **A — Monthly subscription** (Plus, test ₱99/mo or ₱899/yr — unvalidated; replaces the older ₱199–499 placeholder) | Recurring willingness-to-pay is real | Real accounts, a backend, a payment gateway (PayMongo/Xendit are the standard PH-friendly options), recurring billing logic |
| **B — One-time unlock** (roadmap tests a ~₱1,499 "Lifetime Starter" with the first 50 users) | This market only accepts one-time pricing (a real, named risk in `strategy.md`'s Threats) | A payment gateway, but no recurring-billing complexity — a materially smaller build than A |
| **C — Stay free, monetize elsewhere** | Neither A nor B validates for direct consumer payment | The PH Business Network partnership (Fork 3) or a similar B2B angle, pursued as a Stage 4–5 move, not a Stage 1 dependency |

## 4. What it would cost to run this, once monetized

The same break-even logic this app teaches its own users, applied to
the business itself — a useful frame *because* it's the exact math
already built into the [Margin & POS Simulator](../product/modules.md)
(break-even portions = OPEX ÷ profit per dish):

```
Subscribers needed to cover monthly costs = Monthly OPEX ÷ Profit per paying user
```

Once real accounts + a backend exist, monthly OPEX stops being ₱0 —
realistic categories to expect (not committed figures): database/
backend hosting, a payment gateway's per-transaction fee (~3–4% is
typical for PH payment processors), and possibly email/notification
infrastructure. None of these have real figures yet because none of
the infrastructure exists yet — this section is the *shape* of the
calculation to run once it does, not the calculation itself.

## 5. Unit economics — a framework to fill in, not numbers to invent

| Metric | Status |
|---|---|
| CAC (customer acquisition cost) | Assumed ~₱0 today — the whole go-to-market motion (`go-to-market.md`) is organic/community-led, explicitly no ad budget. Stops being ₱0 only if paid channels are ever tested, which the roadmap rules out until retention is proven (Stage 4+). |
| LTV (lifetime value) | Unknown — cannot be honestly estimated without real retention data. |
| Churn | Unknown, same reason. |
| Free → paid conversion | Unknown. iCost's own model (a time-boxed free trial of the paid tier, no card required — already noted in `go-to-market.md`) is the closest real reference point in this market, worth benchmarking against once there's real data to compare. |

Resist the urge to fill these with placeholder numbers dressed up as
estimates — an honest blank is more useful than a confident guess that
gets treated as fact later.

## 6. Risks specific to the money side

Cross-referencing [strategy.md](strategy.md)'s Risks rather than
repeating them — the financially-relevant ones:

- **Risk: this market may only accept one-time pricing.** Directly
  determines whether Scenario A above is viable at all — this is the
  single biggest swing factor in this whole document.
- **Risk: solo-founder bandwidth.** A monetized, supported product
  (billing issues, payment failures, refund requests) is a different
  ongoing commitment than a free tool with no money changing hands —
  worth being honest about before choosing Scenario A or B over C.

## What to actually decide, in order

1. **Run Stage 1 validation** (roadmap) — still the standing top
   priority (`next-steps.md`), and the input every scenario above needs.
2. **Resolve the free-forever-vs-retroactive-gating fork** (§2), using
   real signal, not a guess.
3. **Commit to one revenue scenario** (§3) and a real price — only
   after 1 and 2, not before.
4. **Build accounts/payments infrastructure** only after step 3 is
   decided — building it on spec, before a model is chosen, risks
   building the wrong one.
