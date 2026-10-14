# QA instructions — setup and walkthrough

For anyone testing Amore Cost who hasn't used it before. Read
[qa-manual.md](qa-manual.md) next for the actual checklist and bug-
reporting format — this file is just "how do I get it running and find
my way around."

## 1. Setup

```bash
npm install     # first time only
npm run dev     # → http://localhost:3003
npm test        # optional — runs the automated logic tests (see note below)
```

- The app only runs locally right now — there is no deployed link to
  test against yet (tracked in `../roadmap/backlog.md`).
- `npm test` runs 115 Vitest tests, but they only cover pricing/tax
  math, catalog data logic, and the ingredient cascade — **not** the
  UI. That automated suite is not a substitute for the manual
  walkthrough below.

## 2. There is no login and no account

Everything is saved in your browser's `localStorage` — nothing is sent
to a server, nothing is shared between browsers or devices. This means:

- To start from a completely clean slate, open a new private/incognito
  window (or clear the `calcost:*` keys in DevTools → Application →
  Local Storage).
- Data you enter in one browser won't show up if you open the app in a
  different browser, a different device, or someone else's machine —
  that's expected, not a bug.
- The top-right corner has a language toggle (**EN** / **TL**) and a
  theme toggle (**Light** / **Dark** / **Auto**) — both are saved
  per-browser the same way.

## 3. A walkthrough through every module

Go through these roughly in order — several later modules need data
from an earlier one (e.g. Inventory needs a saved Catalog item).

1. **Overview** (`/dashboard`) — the home dashboard (note: `/` itself
   is now the public marketing landing page, not part of the app — its
   "Open Dashboard" button is what gets you here). Empty at first; it
   fills in once you've costed something.
2. **Costing & Pricing** (`/costing`) — the core calculator. Pick a
   business type (Food & beverage / Service / Resale), name an item,
   add a few cost lines, set labor/packaging/overhead, pick a pricing
   strategy (Margin % / Markup % / Fixed profit) and a tax preset, then
   **Save to Catalog**.
3. **Break-Even** (`/break-even`) — enter a monthly fixed-cost figure
   and confirm it computes units-needed-per-month against your most
   recently costed item.
4. **Catalog Management** (`/catalog`, decision 0022 — merges what used
   to be two separate pages, Ingredient Library and Catalog; visiting
   the old `/ingredients` URL now redirects here). Under **Products**:
   the item you saved in step 2 should be listed — try changing its job
   status, duplicating it, generating its QR code, searching for it by
   name/SKU, cycling the margin filter (All/On target/Below target),
   and expanding its "N ingredient(s) linked" (or "Not linked yet")
   badge to see its read-only cost breakdown. Then click the item's
   name (or **+ New item**) to open the **Edit & Breakdown** modal
   (decision 0023) — this is the same full editor as Costing & Pricing
   (cost lines, labor/packaging/overhead, tax, pricing strategy)
   embedded right here, plus a Target margin % field; edit something
   and confirm it's still there after closing and reopening the modal.
   Under **Ingredient Library**: add an ingredient (e.g. "Eggs", unit
   "dozen", a cost). Go back to Costing & Pricing (or the item's Edit &
   Breakdown modal — either works, they're the same editor) and link a
   cost line to it via the dropdown above that row. Then come back here
   and change the ingredient's cost — the linked item's price should
   update automatically, a snapshot should appear on Cost History, and
   the ingredient's "used in" count should be clickable to the real
   product name.
5. **Inventory** (`/inventory`) — add stock to an item, then log a sale
   against it and confirm stock goes down. Set a low threshold and
   confirm the "Low stock" flag appears.
6. **Point of Sale** (`/pos`) — on Catalog Management, give an item a
   SKU (the small "+ SKU/barcode" field under its name), then here:
   type that SKU + Enter (simulating a scan), or just click an item's
   tile, to add it to the cart. Adjust quantity, try adding more than
   what's in stock (a soft warning, not a block), pick a payment
   method, and **Complete sale** — confirm stock dropped on Catalog
   Management/Inventory and the sale shows up on Sales & Profit
   Reporting. Try **Print receipt** too (opens
   `/pos/receipt/[transactionId]`), then try **Refund this sale** from
   the receipt and confirm the item restocks, the original receipt gets
   a "Refunded" badge, and a new refund receipt appears.
7. **Cost History** (`/history`) — after step 4's ingredient-cost
   change, this item should show a snapshot with a trend sparkline.
8. **Documents** (`/documents`) — try a full backup download, a CSV
   export of your catalog, and printing a quotation for one item
   (opens `/documents/print/[id]` in a new tab — this is what a real
   client would see, so it deliberately shows only the final price, not
   your cost or margin).
9. **Multi-User** (`/multi-user`) — add a second profile, switch the
   active one, and note the page's own warning that this is **not**
   real access control.
10. **Multi-Channel Pricing** (`/multi-channel`) — add Shopee/Lazada/
    In-person channels to an item and confirm each shows a different
    charge price reflecting that channel's fee.
11. **Margin Alerts** (`/alerts`) — set a target margin above an item's
    actual margin and confirm it flags as "Below target."
12. **Sales & Profit Reporting** (`/reporting`) — after steps 5 and 6's
    logged sales, confirm both show up here with real revenue/profit
    numbers.

## 4. If something looks broken, check `qa-manual.md` first

A few things that look like bugs are actually documented, deliberate
simplifications for this stage of the build (no real accounts yet, no
backend). `qa-manual.md`'s "known simplifications" list exists
specifically so you don't spend time reporting those — it also has the
actual bug-report format for everything else.
