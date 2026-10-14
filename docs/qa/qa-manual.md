# QA manual — Amore Cost

The actual test checklist and bug-reporting process. Read
[instructions.md](instructions.md) first if you haven't set up or used
the app yet.

## Purpose

Confirm the app works as built — every module does what
[../product/modules.md](../product/modules.md) says it does, in both
languages, in both themes, and across a reload. This is **not** the
same as validating whether the app is worth building in the first
place — that's Phase 1 in [../roadmap/roadmap.md](../roadmap/roadmap.md),
still not run, and a clean QA pass doesn't substitute for it.

## Read this before filing anything as a bug

These are **known, deliberate simplifications**, not bugs — each one
says so directly in the app or in `modules.md`:

- **Multi-User has zero real security.** Anyone using the browser can
  switch profiles or add new ones freely — no password, no server
  check. The page states this itself. Don't file "anyone can switch
  profiles" as a bug.
- **Inventory tracks stock per finished Catalog item, not a shared pool
  per ingredient.** Two products using the same ingredient do **not**
  draw down a shared stock count. Only *cost* is shared via the
  Ingredient Library, not stock quantity.
- **Margin Alerts has no push or email notification.** It only shows
  which items are below target while the page is open — there's no
  "you'll get pinged" feature yet.
- **The printed quotation (`/documents/print/[id]`) shows only the
  final price**, not the cost or margin breakdown — that's intentional,
  since a real client should never see your internal margin.
- **Nothing is deployed.** `localhost:3003` only, no live URL to test
  from another device.
- **No accounts, no backend, no cross-device sync.** Everything is
  `localStorage`, scoped to one browser — this is also why Point of
  Sale is single-register only.
- **Point of Sale has no cash-drawer or thermal-printer-specific
  integration.** Receipts print via the browser's normal print dialog,
  same as Documents' quotations — that's the intended behavior, not a
  missing feature. It also only supports keyboard-emulating barcode
  scanners (real POS hardware), not a phone camera.
- **Refunds are full-transaction only.** There's no partial-quantity
  refund UI yet (decision 0021) — refunding a multi-line sale reverses
  every line in it, not a chosen subset.
- **All 11 modules have full Tagalog coverage** as of this writing —
  if you spot English text while the toggle is set to TL, that's a
  real bug, not a known gap; check `../roadmap/backlog.md` in case
  something's changed since this was last updated.

If you're not sure whether something is a known limitation or a real
bug, check `modules.md` for that module's notes before filing it.

## Test checklist, per module

For each module: test the happy path, then the empty state (before any
data exists), then reload the page and confirm the data survived.

- [ ] **Overview** — empty state before anything is costed; fills in
      correctly after Costing & Pricing has a saved or draft item;
      "All modules" hub cards link to the right pages.
      **Insights panel** (`src/lib/insights.ts`, added 2026-09-02):
      hidden entirely with an empty catalog; shows the "nothing needs
      attention" empty state with a catalog but no insights actually
      firing; each insight type fires on realistic seeded data — a
      below-target item with rising cost history, a fast-selling item
      close to running out of stock, a portfolio item dominating
      profit, a high-fee channel gap — and clicking an insight with an
      `itemId` opens that item on Costing & Pricing. Check both EN/TL
      wording and both light/dark severity colors.
- [ ] **Costing & Pricing** — all three business types (Food/Service/
      Resale) show the right terminology; all three pricing strategies
      (Margin %/Markup %/Fixed profit) compute a sensible price; all
      four tax presets (No tax/VAT/Percentage Tax/Custom) apply
      correctly; adding/removing cost lines; batch-size scaling; saving
      and loading a quote template; "Save to Catalog" then reopening
      that saved item via its Catalog link; **Senior/PWD price
      (decision 0020)** — confirm it shows on the Suggested Price card
      and equals exactly 80% of the pre-tax price, not 80% of the
      tax-inclusive price.
- [ ] **Catalog Management** (`/catalog`, decision 0022 — Ingredient
      Library merged in; 0023/0025 — in-page editor and its own
      lightweight create popup; 0027 — Ingredient Library as a modal)
      — **Products:** job-status dropdown persists; duplicate creates
      an independent copy; QR code renders and encodes something
      reasonable; delete asks for confirmation first; the name/SKU
      search box filters correctly; the margin filter (All/On target/
      Below target) correctly splits items against each one's own
      target margin; a row's "N ingredient(s) linked" / "Not linked
      yet" badge expands a *read-only* cost breakdown per line
      (em-dashes for fields that don't apply to a linked line).
      **"+ New item" (decision 0025):** opens a small popup — name,
      vertical, batch size, target margin only — separate from the
      full editor; Create stays disabled until a name is entered;
      confirm the new card carries all four fields correctly into
      "Edit & Breakdown". **Edit & Breakdown modal (0023, table
      redesign 0028):** clicking a row's name opens the full editor —
      vertical picker, a cost-line **table** (Name/Supplier/Package
      price/Qty per pack/Shipping fee/**Pack unit**/Portion qty/Portion
      unit/Unit cost `AUTO`/Line cost `AUTO`), labor, packaging,
      overhead, tax, pricing strategy, and a Target margin % field —
      confirm it matches the standalone Costing & Pricing page exactly
      (they share the same component); test a linked-ingredient line, a
      package-priced line with **matching** pack/portion units, a
      package-priced line with **different but convertible** units
      (e.g. a kg-priced sack portioned in grams — confirm the math, not
      just that the field exists), and a plain manual line, all in the
      same table. **Ingredient Library modal (0026/0027):** its own
      "Ingredient Library" button opens a popup with the full
      add/edit/delete/supplier/similar/used-in feature set unchanged;
      "Add ingredient" inside it is its own nested popup (0026); confirm
      no duplicate-id console warnings when both are open at once, and
      that a newly-added ingredient is immediately selectable from a
      cost line's "link to library" dropdown. **Redirect:** visiting
      `/ingredients` directly lands on `/catalog`.
- [ ] **Break-Even** — empty state before any item is priced (**OPEX
      must still be visible and editable here**, not hidden along with
      the price/units-needed cards — regression check for decision
      0017's same-day addendum); units-needed math against a real
      priced item; the "not reachable" message when the price doesn't
      cover true cost; **OPEX persistence (regression check for
      decision 0017)** — enter OPEX lines, save the current item to
      Catalog, start pricing a *different* item, and confirm the OPEX
      list is still there unchanged, not reset to empty.
- [ ] **Inventory** — add stock increases the on-hand count; logging a
      sale decreases it and shows up on Reporting; low-stock threshold
      flags correctly at and below the line.
- [ ] **Point of Sale** — assign a SKU on Catalog, then confirm both
      "scan" (type SKU + Enter) and clicking a tile add the right item
      to the cart; quantity +/-/remove; the low-stock warning appears
      without blocking checkout; each payment method selects correctly;
      "Complete sale" deducts stock and the sale appears on Reporting;
      the printed receipt (`/pos/receipt/[transactionId]`) shows the
      right items/total/payment method and the "not a BIR-registered
      official receipt" disclaimer; a stale/nonexistent receipt URL
      shows the "doesn't exist anymore" message instead of crashing;
      **Senior/PWD discount (decision 0020)** — check the box on one
      line in a multi-line cart, confirm only that line's price drops
      by 20% (with no separate tax shown on it) while other lines stay
      regular, and confirm the receipt tags the discounted line;
      **refunds (decision 0021)** — from a completed sale's receipt,
      click "Refund this sale," confirm the item restocks, the original
      receipt gets a "Refunded" badge and stays otherwise unchanged, the
      new refund receipt shows negative quantity/total with a link back
      to the original, Sales & Profit Reporting nets the units/revenue/
      profit back down, and the refund button doesn't reappear (no
      double-refunding).
- [ ] **Cost History** — a snapshot appears only when cost/price
      actually changed, not on every save; the trend sparkline direction
      matches the numbers.
- [ ] **Documents** — CSV import from a `label,quantity,unit,amount`
      file creates a new catalog item; CSV export opens correctly in a
      spreadsheet; full backup download then restore round-trips
      without losing data; the printed quotation shows a sensible total.
- [ ] **Multi-User** — add/remove a profile; switching the active
      profile changes who Catalog/Inventory edits get attributed to.
- [ ] **Multi-Channel Pricing** — each preset channel (Shopee 6%/
      Lazada 8%/In-person 0%) computes a different charge price for the
      same item; removing a channel works.
- [ ] **Margin Alerts** — target-margin input persists; "Below target"
      vs "On target" reflects the actual computed margin correctly.
- [ ] **Sales & Profit Reporting** — totals match the sum of logged
      sales; per-item and recent-sales tables sort correctly.

## Cross-cutting checks (do these regardless of module)

- [ ] **Language toggle (EN/TL)** — switch mid-session, confirm text
      updates immediately without a reload, and nothing overflows its
      container or shows up blank in either language.
- [ ] **Theme toggle (Light/Dark/Auto)** — check contrast/readability
      in both Light and Dark, and that Auto follows the OS setting.
- [ ] **Reload persistence** — refresh the browser after entering data
      anywhere; nothing should be lost (this is the entire point of
      `localStorage`-only architecture working correctly).
- [ ] **Empty states** — every module should say something sensible
      before any data exists, not show a blank page or an error.

## How to report a bug

For each issue found, include:

1. **Module/page** (e.g. "Catalog Management, `/catalog`")
2. **Language and theme** at the time (EN or TL, Light/Dark/Auto)
3. **Steps to reproduce**, as a numbered list
4. **Expected vs. actual behavior**
5. **Screenshot**, if visual
6. **Browser and OS**

## Out of scope for this build — expected, not a defect

- No deployed/hosted version to test from another device
- No real accounts, login, or backend of any kind
- No automated test coverage of components/pages (only pure logic is
  tested — see `../product/modules.md`'s "Test coverage" section)
- No Shopee/Lazada order sync, receipt OCR, real push/email
  notifications, or shareable client-facing links (all tracked in
  `../roadmap/backlog.md`, all explicitly deferred pending a real
  backend)
- No cash-drawer hardware signal, thermal-printer-specific formatting,
  camera-based barcode scanning, or multi-register sync (all tracked in
  `../roadmap/backlog.md`)
