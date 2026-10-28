# QA manual — Amore Cost

The actual test checklist and bug-reporting process. Setup: `npm install`
then `npm run dev`, open http://localhost:3003/dashboard (or test the live
https://amore-cost.vercel.app). Five pages — see
[../product/modules.md](../product/modules.md).

## Purpose

Confirm the app works as built — every page does what
[../product/modules.md](../product/modules.md) says it does, in both
languages, in both themes, and across a reload. This is **not** the
same as validating whether the app is worth building in the first
place — that's Phase 1 in [../roadmap/roadmap.md](../roadmap/roadmap.md),
still not run, and a clean QA pass doesn't substitute for it.

## Read this before filing anything as a bug

These are **known, deliberate simplifications**, not bugs — each one
says so directly in the app or in `modules.md`:

- **The simulators never save anything.** The Receipt Simulator and
  Margin & POS Simulator are sandboxes — reloading clears the order and
  any price/volume you typed. That's by design: they're for "what if,"
  not for recording real sales.
- **Senior/PWD applies to the whole simulated receipt.** In real life the
  discount covers only the Senior/PWD's own order; the page says so. Not
  a bug.
- **The simulators use direct cost, not full recipe cost.** A recipe's
  per-unit *overhead* line is left out of the receipt and margin math,
  because monthly OPEX is subtracted separately — counting both would
  charge the same rent twice. So "Direct cost" can be lower than the
  "Cost / serving" shown on Input.
- **No accounts, no backend, no cross-device sync.** Everything is
  `localStorage`, scoped to one browser — back up from the Dashboard.
- **Full Tagalog coverage** as of this writing — English text with the
  toggle on TL is a real bug.

If you're not sure whether something is a known limitation or a real
bug, check `../product/modules.md` for that page's notes before filing it.

## Test checklist, per page

Five pages as of decision 0040 (the 11-module checklist is archived at
`../archive/eleven-modules-2026-10/qa-manual.md`). For each page: test
the happy path, the empty state (before any data exists), then reload
and confirm the data survived.

- [ ] **Dashboard** (`/dashboard`) — 4 KPI cards (Active recipes,
      Monthly OPEX with contingency, Avg food cost % against the
      28–32% target — red above 32%, Ingredients in library); the
      "Needs your attention" panel appears once a recipe is below its
      target margin; Recent recipes table's "Edit" opens that recipe's
      breakdown on Input; Dish overhead allocation edits the same
      monthly-sales number OPEX uses; Download backup produces a JSON
      file and Restore asks for confirmation before replacing data.
- [ ] **Input** (`/input`) — "+ New recipe" creates a recipe *and opens
      its breakdown editor immediately*; every breakdown edit live-saves;
      search and the All / On target / Below target filter narrow the
      cards; Duplicate and Delete (with confirm) work; the Ingredient
      Library button opens the shared library and a cost change there
      cascades into every linked recipe; `/input?edit=<id>` opens that
      recipe directly.
- [ ] **OPEX & Overhead** (`/opex`) — add/remove/edit expenses with a
      category; category breakdown bars and percentages sum correctly;
      contingency % raises the buffered total; Overhead per dish =
      buffered OPEX ÷ monthly dishes, and reads ₱0.00 (not a crash or
      NaN) when dishes is blank. Items saved before categories existed
      show as "Other."
- [ ] **Receipt Simulator** (`/receipt`) — add the same recipe twice and
      confirm it merges into one line; edit a line's quantity; VAT
      inclusive vs. exclusive changes how prices display and the total;
      Senior/PWD removes VAT and takes 20% off the VAT-exclusive amount
      (check: total = net × 0.8 + service charge); service charge is
      computed on the post-discount net; the Dish margin analysis box
      excludes VAT and service charge; nothing here changes saved recipes
      or data. **Footing:** VATable (or VAT-exempt) sales + VAT + service
      charge must equal TOTAL DUE to the centavo. **Receipt header:**
      business name / address / TIN fields persist across reloads, and a
      blank TIN shows no TIN line. **Print:** only the receipt prints, and
      the margin box is not on it. **Phone:** at 360px nothing is cut off
      on either side, long dish names wrap, and the paper stays light in
      dark mode.
- [ ] **Margin & POS Simulator** (`/simulator`) — defaults to the
      recipe's suggested price and OPEX's monthly-dishes number; the price
      field and slider stay in sync; "Reset to suggested" appears only
      after an override; the waterfall bars reconcile (Revenue − Direct
      cost = Gross profit; Gross − OPEX = Net); break-even = OPEX share ÷
      (price − direct cost), rounded up; a price at or below direct cost
      shows "—" and the no-break-even message instead of a number.
- [ ] **Redirects** — `/costing`, `/catalog`, `/ingredients` → Input;
      `/costing?id=<id>` → that recipe's breakdown; `/break-even` →
      Simulator; `/pos` → Receipt Simulator; `/inventory`, `/history`,
      `/documents`, `/multi-user`, `/multi-channel`, `/alerts`,
      `/reporting` → Dashboard.

## Cross-cutting checks (do these on every page)

- [ ] **Language toggle (EN/TL)** — switch mid-session, confirm text
      updates immediately without a reload, and nothing overflows its
      container or shows up blank in either language.
- [ ] **Theme toggle (Light/Dark/Auto)** — check contrast/readability
      in both Light and Dark, and that Auto follows the OS setting.
- [ ] **Reload persistence** — refresh the browser after entering data
      anywhere; nothing should be lost (this is the entire point of
      `localStorage`-only architecture working correctly).
- [ ] **Empty states** — every page should say something sensible
      before any data exists, not show a blank page or an error.

## How to report a bug

For each issue found, include:

1. **Page** (e.g. "Input, `/input`")
2. **Language and theme** at the time (EN or TL, Light/Dark/Auto)
3. **Steps to reproduce**, as a numbered list
4. **Expected vs. actual behavior**
5. **Screenshot**, if visual
6. **Browser and OS**

## Out of scope for this build — expected, not a defect

- No real accounts, login, or backend of any kind
- No automated test coverage of components/pages (only pure logic is
  tested — see `../product/modules.md`)
- No Shopee/Lazada order sync, receipt OCR, real push/email
  notifications, or shareable client-facing links (all tracked in
  `../roadmap/backlog.md`, all explicitly deferred pending a real
  backend)
- No real point-of-sale checkout, inventory tracking, sales history, or
  multi-user profiles — removed in decision 0040 to keep the app to five
  pages; the Receipt and Margin & POS Simulators are sandboxes that never
  record a sale. The full 11-module version is the `v1-full-11-modules`
  git tag.
