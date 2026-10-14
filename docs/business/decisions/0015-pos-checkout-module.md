---
number: 0015
date: 2026-08-19
status: accepted
---

# Point of Sale — a scoped checkout module, not a full retail POS system

## Context
Oliver asked whether a full POS system could be built into Amore Cost.
Before writing any code, this was scoped honestly: real hardware
integration (cash-drawer kick signals, thermal-printer-specific ESC/POS
commands, multi-register real-time sync) can't be done from a browser
tab alone, but a checkout screen, keyboard-emulating barcode scanning,
and browser-print receipts genuinely can — and much of the plumbing
already existed (Inventory's `logSale`, Catalog, Sales & Profit
Reporting). Oliver approved a written plan for exactly that scoped
version before implementation started (see the approved plan in this
session — a v1 checkout screen reusing existing modules rather than a
parallel system).

## Decision
- **`src/lib/catalog.ts`** gains: `CatalogItem.sku?: string` (an
  optional code the owner assigns per item so a scanner or manual
  search has something stable to match); `SaleEntry.transactionId?`
  and `SaleEntry.paymentMethod?: "cash" | "gcash" | "card" | "other"`;
  and a new pure function `checkoutCart(catalog, cartLines,
  paymentMethod, profileId)` that rings up every cart line in one
  checkout — same stock-deduction math as the existing `logSale`, all
  lines sharing one generated `transactionId`. Covered by 5 new tests
  in `catalog.test.ts` (92 tests total across the suite).
- **`src/app/(dashboard)/pos/page.tsx`** (new): an always-focused
  search/scan input (matches by SKU first, then item name — a real
  barcode scanner is just a keyboard that types fast + Enter, so this
  needed no camera or vision library), a cart (persisted to
  `localStorage` via a new `POS_CART_STORAGE_KEY` so an accidental
  refresh mid-sale doesn't lose it — now also included in
  `backup.ts`'s `BACKUP_KEYS`), a soft non-blocking low-stock warning,
  and a payment method selector naming GCash explicitly (the dominant
  PH e-wallet). "Complete sale" calls `checkoutCart` and hands off to a
  confirmation screen with a "Print receipt" link.
- **`src/app/(dashboard)/pos/receipt/[transactionId]/page.tsx`** (new):
  same print pattern as `documents/print/[id]/page.tsx` (`BrandMark`,
  `window.print()`, print-only CSS) — collects every `SaleEntry` across
  the Catalog matching that `transactionId` and renders them as one
  receipt. Uses each entry's *recorded* `unitPrice`/`unitCost` (frozen
  at sale time), not a live recompute from the item's current state —
  a receipt is a historical record, not today's price.
- **`src/app/(dashboard)/catalog/page.tsx`**: a small inline-editable
  SKU field added per row, since POS needs something to scan/search
  against before it's useful at all.
- Registered as the 12th module in `src/lib/modules.ts` (slug `pos`,
  icon `ShoppingCart`) and `docs/product/modules.md`, fully translated
  EN/TL in `src/lib/i18n.tsx` — same bar as every other module.

## Why
Oliver's direct ask, scoped down from "a full POS machine" to what's
actually achievable and honest inside a `localStorage`-only, no-backend
app, with his explicit sign-off on that scope before implementation.

## Consequences
- **The receipt is explicitly not a BIR-registered official receipt**
  (states so directly on the printed page) — this app has no
  fiscalization or BIR accreditation, and claiming otherwise would be a
  real compliance problem for anyone using it for actual retail sales,
  not just an honesty nicety.
- **`SaleEntry` grew two optional fields instead of introducing a new
  top-level "Order" entity.** A transaction is still just N `SaleEntry`
  records sharing an ID — this keeps Sales & Profit Reporting, Cost
  History, and everything else that already reads `CatalogItem.sales`
  completely unchanged; they didn't need to know POS exists to keep
  working correctly, and were verified working end-to-end (stock
  deducted, sale reflected in Reporting) without touching either file.
- **Explicitly out of scope, stated rather than silently dropped**
  (mirrors the wording already in `modules.ts`'s `note` field so the
  in-app UI itself says this, not just docs): cash-drawer hardware,
  thermal-printer-specific formatting, camera-based barcode scanning,
  multi-register sync, and refunds/voids. The first three are real
  hardware/library additions for a future pass; multi-register sync is
  the same accounts+backend gap already tracked for Multi-User
  (`roadmap/backlog.md` item 2).
- Verified live end-to-end before calling this done: seeded a catalog
  with SKUs, simulated both a scan (type SKU + Enter) and a manual add,
  triggered the low-stock warning by overselling, completed a sale,
  confirmed stock deduction on Catalog, confirmed the sale appeared
  correctly on Sales & Profit Reporting, and printed the receipt — all
  checked in both English/Tagalog and light/dark.
