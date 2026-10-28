# KwentaPOS vs. Amore Cost — what they have that we don't

**Researched:** 2026-10-28, from kwentapos.com (home page, pricing, and
the `/pos-for/restaurant`, `/cafe`, `/bakery` pages). Everything below
is what their **marketing pages claim**. Nobody has tested the product
or signed up for it. Re-check before quoting any of it to a customer.
For the wider competitor table, see
[competitive-landscape.md](competitive-landscape.md).

## The one-line answer

KwentaPOS is a **cloud POS that runs the store** (selling, stock, utang,
staff, branches). Amore Cost is a **pricing tool that tells you what to
charge** (cost, margin, VAT/Senior-PWD math, OPEX, simulations). Most
of what KwentaPOS has and we don't is the *running-the-store* layer.
The real threat is the one overlap: **KwentaPOS also does recipe
costing and food cost per menu item**, but only on its Pro plan
(₱299/mo) and above.

## What KwentaPOS is

| | |
|---|---|
| Who it's for | PH small businesses: sari-sari stores, cafés, milk tea shops, restaurants, bakeries, food carts, mini groceries, hardware stores |
| Platforms | Android, iPhone/iPad, any browser; installs as a PWA with no app store needed; claims it runs on "a ₱4k Android" |
| Hardware | Optional 58mm/80mm thermal printers (Bluetooth/USB), barcode scanning, no hardware fee |
| Pricing | **Lite ₱59/mo** (50 products, 100 sales/day, 1 user) · **Pro ₱299/mo** (500 products, 350 sales/day, 3 users) · **Business ₱999/mo** (unlimited, 10 users, 2 branches, +₱599 per extra branch). 15-day free trial, no card. 10% off quarterly, 20% off yearly |
| BIR | **The site never mentions BIR accreditation.** Competitors such as UTAK and Klikit advertise it; KwentaPOS doesn't |

## Systems KwentaPOS has that Amore Cost doesn't

The Status column means:
- **Cut in 0040:** we had it in the `v1-full-11-modules` tag and removed it on purpose.
- **Never built:** we have never had it.
- **Backlog:** it's already on our backlog.

| # | System | What KwentaPOS does | Amore Cost today | Status |
|---|---|---|---|---|
| 1 | **Real POS checkout** | Barcode or tap-tile cart, one-button checkout, change computation, receipt, stock moves automatically | Receipt *Simulator* only. Nothing is sold or recorded | Cut in 0040 |
| 2 | **Real thermal receipt printing** | Prints to 58/80mm printers over Bluetooth/USB/Web Serial | Browser print of a simulated slip, marked "not a valid receipt" | Never built |
| 3 | **Inventory and stock levels** | Stock count per product, auto-deducted on sale, tingi packs | None | Cut in 0040 |
| 4 | **Ingredient deduction on sale** | Selling a dish deducts its recipe's ingredients from stock | Recipes have ingredients, but there's no stock to deduct from | Never built |
| 5 | **Purchase orders / receiving** | Log supplier deliveries so stock goes up on arrival | Ingredient Library holds supplier *prices* only | Never built |
| 6 | **Utang (customer credit) ledger** | Per-customer balance, due date, partial payments, credit limits, utang receipts | None | Never built |
| 7 | **Payment methods + e-wallet reconciliation** | Cash, GCash, Maya, card, split bills; records GCash/Maya reference numbers and reconciles them at end of day | None | Cut in 0040 (old POS had a payment-method tag only) |
| 8 | **Shifts and cash variance** | Open/close shifts per cashier, cash-drawer variance report | None | Never built |
| 9 | **Staff accounts and roles** | 1 / 3 / 10 users with role permissions; built-in DTR (staff time-in) | Single user, one browser | Cut in 0040 (old Multi-User was local profiles, no logins) |
| 10 | **Multi-branch** | Branch switching, inter-branch stock transfers with approval, consolidated reports | None | Never built |
| 11 | **Sales reports and analytics** | Daily/monthly sales, sales by hour/day, shift reports, "advanced analytics" | None. The simulators are what-ifs, not history | Cut in 0040 |
| 12 | **Kitchen / barista display** | Paid orders appear on a spare tablet in sequence; staff mark items in progress or done | None | Never built |
| 13 | **Modifiers and variants** | Sizes, hot/iced, add-ons, each with its own price | One price per recipe | Never built |
| 14 | **Wholesale price tiers** | Different prices for bulk buyers (Pro and above) | One suggested price. Old Multi-Channel Pricing was per channel, not per quantity | Never built |
| 15 | **Cloud sync and offline mode** | Works fully offline, syncs when back online, data on any device | Works offline (it's all local) but **no sync**. Data lives in one browser, protected only by a manual backup file | Never built (needs the backend decision) |
| 16 | **Accounts, billing and a trial funnel** | Sign-up, 15-day trial, paid plans | No accounts, no payment, no paid tier decided | Never built |

## What Amore Cost has that KwentaPOS doesn't (our differentiation)

Based on what their pages say. "Not mentioned" doesn't prove they lack
it, only that they don't sell it.

| What we have | KwentaPOS |
|---|---|
| **Suggested selling price** from a chosen margin, markup or fixed profit | Shows margin on the price *you* set. No price-suggestion engine is mentioned |
| **VAT 12% inclusive/exclusive math**, Percentage Tax, custom tax | VAT not mentioned anywhere |
| **Senior/PWD pricing** (20% off the VAT-exclusive price, VAT-exempt, per RA 9994/10754) on the price card and the receipt | Not mentioned |
| **Service charge handled per RA 11360** (excluded from profit) | Not mentioned |
| **OPEX & overhead allocation**: monthly rent, utilities and labor spread into overhead per dish, with a contingency buffer | No expense or overhead tracking mentioned |
| **Margin & POS Simulator**: try a price, see break-even portions and a P&L waterfall (Revenue → Direct cost → OPEX → Net profit) | Not offered |
| **Food cost % against the 28–32% industry target**, flagged per recipe | Shows "food cost and margin" but no target benchmark mentioned |
| **Yield % / waste** per ingredient line (new, decision 0041) | Not mentioned |
| **Menu price rounding** (ends in 9, ₱5, ₱10) with profit recomputed (new, 0041) | Not mentioned |
| **Unit conversion** (recipe in grams, ingredient bought per kg) and **package breakdown** (sack price + delivery ÷ quantity) | Units mentioned; package breakdown not |
| **Ingredient price cascade**: change one price, every recipe recalculates, with supplier quotes | They say margin updates "as ingredient prices change", so this is likely matched |
| **Free, no sign-up**: works instantly in the browser | 15-day trial, then ₱59–999/mo; recipe costing needs Pro (₱299) |
| **English + Tagalog UI** | English site. Taglish words ("tindahan", "utang", "tingi") but no Tagalog UI mentioned |

## What this means for Amore Cost

1. **Don't chase the POS list.** Items 1–14 are what decision 0040 cut
   on purpose. Rebuilding them means competing head-on with KwentaPOS,
   whose Lite plan costs ₱59/mo, plus Loyverse, StoreHub, UTAK and
   others, as a solo founder. That's a losing fight.
2. **The overlap is the real risk.** KwentaPOS sells "food cost
   calculator + margin per menu item" inside a POS the owner already
   uses daily. Our answer has to be *depth of pricing*, which they
   don't advertise at all: suggested price, VAT and Senior/PWD
   compliance, OPEX allocation, break-even, and what-if simulation.
3. **Position as complementary, not a replacement.** "Use Amore Cost to
   decide your prices, then type them into whatever POS you use
   (KwentaPOS, Loyverse, UTAK)." That's honest and avoids a feature
   war. One cheap way to back it up: a CSV export of the price list
   (backlog item 14).
4. **Close the one structural gap: data that lives in one browser.**
   Item 15 (sync) is the only gap that hurts our own core job. An owner
   who clears their browser loses every recipe. This is the strongest
   argument for the accounts/backend decision, and probably the
   prerequisite for any paid tier.
5. **Watch for them adding VAT/Senior-PWD.** If KwentaPOS adds
   compliant receipt math, our compliance edge narrows to OPEX and the
   simulators. Re-check their site quarterly.

## Sources

- [kwentapos.com](https://www.kwentapos.com/): features, pricing, FAQ
- [kwentapos.com/pos-for/restaurant](https://www.kwentapos.com/pos-for/restaurant): kitchen screen, recipe costing, ingredient deduction, payments
- [kwentapos.com/pos-for/cafe](https://www.kwentapos.com/pos-for/cafe): modifiers, barista display, DTR, shift reports
- [kwentapos.com/pos-for/bakery](https://www.kwentapos.com/pos-for/bakery): recipes and ingredients are Pro-only
- BIR context for other PH POS vendors (these are vendor marketing pages): [StoreHub](https://www.storehub.com/ph/blog/bir-accredited-pos-system-philippines), [Klikit](https://klikit.io/en/learn/bir-compliant-restaurant-pos-philippines), [HashMicro vs UTAK](https://www.hashmicro.com/ph/blog/hashmicro-vs-utak/)
