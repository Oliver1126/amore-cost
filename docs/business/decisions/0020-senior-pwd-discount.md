---
number: 0020
date: 2026-08-19
status: accepted
---

# Senior Citizen / PWD discount (RA 9994 / RA 10754)

## Context
Reviewing a competitor (food-cost-tau.vercel.app) surfaced a real gap:
Amore Cost had no handling at all for the Senior Citizen / PWD discount
— a genuine Philippine legal requirement (RA 9994 Expanded Senior
Citizens Act, RA 10754 PWD Act) for food and many service businesses,
not an optional nice-to-have. Oliver asked to build it.

## Decision
- New pure function `seniorPwdPrice(priceBeforeTax)` in
  `src/lib/calculator.ts`: 20% off the app's own pre-tax price
  (`SENIOR_PWD_DISCOUNT_PERCENT = 20`), with **no tax re-added** —
  senior/PWD qualified purchases are VAT-exempt by law, so the app's
  existing pre-tax figure *is* the correct exempt base, rather than
  deriving a separate exemption calculation per tax preset.
- `PriceBreakdown` (returned by `computePriceBreakdown`, used
  everywhere pricing is shown) gains a `seniorPwdPrice` field — every
  consumer gets it for free, no separate call needed.
- **Costing & Pricing** (`StatCards.tsx`) shows it as a line under the
  Suggested Price card, so an owner can see it upfront while pricing.
- **Point of Sale** is where this is actually useful in practice: each
  cart line (`CartLine`, `src/lib/catalog.ts`) gets a `seniorPwd?:
  boolean` flag and a checkbox in the cart UI. `checkoutCart` applies
  the discount only to flagged lines, so a single transaction can mix
  a senior/PWD customer's items with anyone else's without forcing an
  all-or-nothing choice. `SaleEntry` gains a matching
  `seniorPwdDiscount?: boolean` so the receipt and any future reporting
  can say honestly which sales were discounted, without needing to
  recompute anything after the fact.
- The **receipt** (`pos/receipt/[transactionId]/page.tsx`) shows a
  "Senior/PWD" tag next to any discounted line item.

## Why
A real compliance gap for the exact ICP this product targets — food
sellers and service providers legally required to honor this discount
— not a feature nice-to-have. Found by deliberately reviewing a
competitor rather than assuming Amore Cost's feature set was complete.

## Consequences
- **This is a general implementation for a VAT-registered seller, not
  tax advice.** The doc comment on `seniorPwdPrice` says so directly —
  a Percentage Tax filer or other non-VAT setup may need different
  treatment, and should confirm with an accountant. Same disclaimer
  register as the app's existing "pricing is an estimate, not tax
  advice" line.
- **The discount is per cart line, not per whole transaction** — a
  deliberate choice, since a senior/PWD ID only covers that person's
  own purchase, not everything rung up alongside it in the same
  checkout.
- New tests: `seniorPwdPrice` and `computePriceBreakdown`'s new field
  (`calculator.test.ts`), plus `checkoutCart` applying and recording
  the discount correctly (`catalog.test.ts`) — 4 new tests, 100 total.
- Verified live in both EN and TL: priced an item (₱166.67 regular),
  confirmed the Senior/PWD price showed correctly (₱133.33) on Costing
  & Pricing, toggled it on in a POS cart and watched the line total
  update live, completed the sale, and confirmed the printed receipt
  carried the discounted price and the "Senior/PWD" tag.
