import type { CalculatorState } from "./calculator";
import { computePriceBreakdown, seniorPwdPrice } from "./calculator";

export interface ChannelPrice {
  id: string;
  name: string;
  feePercent: number;
}

export interface CostSnapshot {
  savedAt: string;
  cost: number;
  price: number;
  marginPercent: number;
}

export type PaymentMethod = "cash" | "gcash" | "card" | "other";

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "gcash", "card", "other"];

export interface SaleEntry {
  id: string;
  date: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  profileId?: string;
  /** Shared across every line rung up in the same POS checkout, so they print as one receipt and can be reported by payment method — not a separate top-level "Order" record. */
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  /** Whether this line was rung up at the Senior Citizen/PWD discounted price (RA 9994/RA 10754) — `unitPrice` already reflects the discount when true; kept as its own flag purely so a receipt or report can say so honestly, not to recompute anything. */
  seniorPwdDiscount?: boolean;
  /** Id of the original SaleEntry this one reverses. Only present on a refund entry, which carries a negative `quantity` so revenue/profit/units-sold totals net out correctly wherever `SaleEntry[]` is summed — no separate refund-aware aggregation needed anywhere else. */
  refundOf?: string;
  /** How much stock this sale actually removed — may be less than `quantity` when the sale oversold (checkoutCart clamps the stock deduction at 0 but still records the full sold `quantity` for accurate revenue). Kept separate from `quantity` so a refund restocks only what was actually taken out, not the oversold amount, which would otherwise inflate stock above any level the item ever held. Optional/undefined on entries created before this field existed — refundTransaction falls back to `quantity` for those. */
  stockDeducted?: number;
}

/** Lightweight pipeline status for service-style work — most useful on the Costing & Pricing / service-quoting vertical. */
export type JobStatus = "quoted" | "accepted" | "in_progress" | "invoiced";

export const JOB_STATUSES: JobStatus[] = ["quoted", "accepted", "in_progress", "invoiced"];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  quoted: "Quoted",
  accepted: "Accepted",
  in_progress: "In progress",
  invoiced: "Invoiced",
};

export interface CatalogItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  updatedByProfileId?: string;
  state: CalculatorState;
  stockOnHand: number;
  lowStockThreshold: number;
  targetMarginPercent: number;
  channels: ChannelPrice[];
  history: CostSnapshot[];
  sales: SaleEntry[];
  status: JobStatus;
  /** An optional short code/barcode the owner assigns so a POS checkout (keyboard-emulating scanner or manual search) has something stable to match against. Not required — items without one just aren't scannable yet. */
  sku?: string;
}

export const CATALOG_STORAGE_KEY = "calcost:v0:catalog";
/** The in-progress POS cart, kept separately from Catalog itself so an abandoned or accidentally-refreshed sale doesn't touch real Catalog/Inventory data until checkout actually completes. */
export const POS_CART_STORAGE_KEY = "calcost:v0:pos-cart";

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function snapshotOf(state: CalculatorState): CostSnapshot {
  const b = computePriceBreakdown(state);
  return {
    savedAt: new Date().toISOString(),
    cost: b.cost,
    price: b.priceCustomerPays,
    marginPercent: b.marginPercent,
  };
}

export function newCatalogItem(state: CalculatorState): CatalogItem {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    state,
    stockOnHand: 0,
    lowStockThreshold: 5,
    targetMarginPercent: 30,
    channels: [],
    history: [snapshotOf(state)],
    sales: [],
    status: "quoted",
  };
}

/** Bumps `state`/`updatedAt`/`updatedByProfileId` without touching Cost History — the "instant" half of `updateItemState`, split out so a caller that fires on every keystroke (Costing & Pricing, Catalog Management's "Edit & Breakdown") can keep the displayed state live without appending a snapshot per digit typed. Pair with a debounced call to `commitHistorySnapshot` once the user actually pauses. */
export function updateItemStateLive(
  item: CatalogItem,
  state: CalculatorState,
  profileId?: string
): CatalogItem {
  return {
    ...item,
    state,
    updatedAt: new Date().toISOString(),
    updatedByProfileId: profileId ?? item.updatedByProfileId,
  };
}

/** Appends a Cost History snapshot of `item`'s *current* state, only if it actually differs from the last recorded one — the debounced half of the live/history split above. */
export function commitHistorySnapshot(item: CatalogItem): CatalogItem {
  const snap = snapshotOf(item.state);
  const last = item.history[item.history.length - 1];
  const changed =
    !last || Math.abs(last.cost - snap.cost) > 0.001 || Math.abs(last.price - snap.price) > 0.001;
  return changed ? { ...item, history: [...item.history, snap] } : item;
}

/** Atomic state-plus-history update — for callers that fire once per real edit (e.g. `propagateIngredientChange`'s cascade), not per keystroke. Just composes the two functions above; see `updateItemStateLive` for the per-keystroke-safe alternative. */
export function updateItemState(
  item: CatalogItem,
  state: CalculatorState,
  profileId?: string
): CatalogItem {
  return commitHistorySnapshot(updateItemStateLive(item, state, profileId));
}

export function duplicateCatalogItem(item: CatalogItem): CatalogItem {
  const now = new Date().toISOString();
  const state = { ...item.state, itemName: `${item.state.itemName} (copy)` };
  return {
    ...item,
    id: newId(),
    createdAt: now,
    updatedAt: now,
    state,
    // A fresh snapshot of *this* item's own current state, not a copy of the
    // original's history array — sharing that reference (or even copying its
    // old entries) would make a brand-new duplicate report cost changes that
    // happened to the original before this copy ever existed.
    history: [snapshotOf(state)],
    channels: [...item.channels],
    stockOnHand: 0,
    sales: [],
    status: "quoted",
  };
}

export function logSale(item: CatalogItem, quantity: number, profileId?: string): CatalogItem {
  const b = computePriceBreakdown(item.state);
  const entry: SaleEntry = {
    id: newId(),
    date: new Date().toISOString(),
    quantity,
    unitPrice: b.priceCustomerPays,
    unitCost: b.cost,
    profileId,
  };
  return {
    ...item,
    stockOnHand: Math.max(0, item.stockOnHand - quantity),
    sales: [...item.sales, entry],
    updatedAt: entry.date,
  };
}

export interface CartLine {
  itemId: string;
  quantity: number;
  /** Applies the Senior Citizen/PWD discount (RA 9994/RA 10754) to this line only — kept per line rather than per whole checkout, since a discount ID only covers that person's own purchase, not every item rung up alongside it in the same transaction. */
  seniorPwd?: boolean;
}

/**
 * Rings up every cart line in one POS checkout: deducts stock and
 * appends a `SaleEntry` per line (same math as `logSale`), all sharing
 * one generated `transactionId` so they print as a single receipt and
 * roll up together in reporting by payment method. Lines whose
 * `itemId` isn't found in `catalog` are silently skipped rather than
 * throwing — the cart is built from a live catalog scan/search, so a
 * stale reference shouldn't abort the whole sale.
 */
export function checkoutCart(
  catalog: CatalogItem[],
  cartLines: CartLine[],
  paymentMethod: PaymentMethod,
  profileId?: string
): { catalog: CatalogItem[]; transactionId: string } {
  const transactionId = newId();
  const nextCatalog = catalog.map((item) => {
    const line = cartLines.find((l) => l.itemId === item.id);
    if (!line || line.quantity <= 0) return item;
    const b = computePriceBreakdown(item.state);
    // Overselling is allowed (decision 0030 — flag it, don't block it), so
    // the stock actually removed can be less than the quantity sold. Record
    // both: `quantity` stays the true sold amount for accurate revenue,
    // `stockDeducted` is what a later refund should actually give back.
    const deducted = Math.min(item.stockOnHand, line.quantity);
    const entry: SaleEntry = {
      id: newId(),
      date: new Date().toISOString(),
      quantity: line.quantity,
      unitPrice: line.seniorPwd ? seniorPwdPrice(b.priceBeforeTax) : b.priceCustomerPays,
      unitCost: b.cost,
      profileId,
      transactionId,
      paymentMethod,
      seniorPwdDiscount: line.seniorPwd || undefined,
      stockDeducted: deducted,
    };
    return {
      ...item,
      stockOnHand: item.stockOnHand - deducted,
      sales: [...item.sales, entry],
      updatedAt: entry.date,
    };
  });
  return { catalog: nextCatalog, transactionId };
}

/** Same threshold Margin Alerts already uses (`margin < item.targetMarginPercent`) — kept here too since Catalog Management's filter and per-row status pill both need the same on/below-target call. A small epsilon absorbs floating-point drift from `computePriceBreakdown`'s division chain (e.g. a price computed to hit exactly 45% margin can round-trip to 44.99999999999999) — without it, an item priced exactly on target is misclassified as belowTarget from rounding alone, not a real gap. */
export function marginStatus(
  marginPercent: number,
  targetMarginPercent: number
): "onTarget" | "belowTarget" {
  return marginPercent >= targetMarginPercent - 0.01 ? "onTarget" : "belowTarget";
}

/**
 * A transaction counts as refunded only once every original (non-refund)
 * entry sharing its `transactionId` has a matching reversal entry
 * elsewhere in the catalog pointing back at it via `refundOf`. Returns
 * `false` for an unknown transactionId rather than throwing, since the
 * receipt page calls this before knowing whether the id is real.
 */
export function isTransactionRefunded(catalog: CatalogItem[], transactionId: string): boolean {
  const originals: SaleEntry[] = [];
  const refundedOriginalIds = new Set<string>();
  for (const item of catalog) {
    for (const entry of item.sales) {
      if (entry.refundOf) {
        refundedOriginalIds.add(entry.refundOf);
      } else if (entry.transactionId === transactionId) {
        originals.push(entry);
      }
    }
  }
  return originals.length > 0 && originals.every((e) => refundedOriginalIds.has(e.id));
}

/**
 * Reverses every not-yet-refunded original entry in a transaction:
 * restocks its quantity and appends a new negative-quantity `SaleEntry`
 * (same unitPrice/unitCost as the original, linked via `refundOf`) under
 * a freshly generated transactionId, so the original receipt stays an
 * unaltered record of what was actually sold and a separate refund
 * receipt can be printed for this one. Silently skips entries already
 * refunded rather than double-reversing them.
 */
export function refundTransaction(
  catalog: CatalogItem[],
  transactionId: string
): { catalog: CatalogItem[]; refundTransactionId: string } {
  const refundTransactionId = newId();
  const nextCatalog = catalog.map((item) => {
    const alreadyRefundedIds = new Set(
      item.sales.filter((e) => e.refundOf).map((e) => e.refundOf)
    );
    const toRefund = item.sales.filter(
      (e) => e.transactionId === transactionId && !e.refundOf && !alreadyRefundedIds.has(e.id)
    );
    if (toRefund.length === 0) return item;
    const refundEntries: SaleEntry[] = toRefund.map((orig) => ({
      id: newId(),
      date: new Date().toISOString(),
      quantity: -orig.quantity,
      unitPrice: orig.unitPrice,
      unitCost: orig.unitCost,
      profileId: orig.profileId,
      transactionId: refundTransactionId,
      paymentMethod: orig.paymentMethod,
      seniorPwdDiscount: orig.seniorPwdDiscount,
      refundOf: orig.id,
    }));
    const restockQty = toRefund.reduce((sum, e) => sum + (e.stockDeducted ?? e.quantity), 0);
    return {
      ...item,
      stockOnHand: item.stockOnHand + restockQty,
      sales: [...item.sales, ...refundEntries],
      updatedAt: refundEntries[0].date,
    };
  });
  return { catalog: nextCatalog, refundTransactionId };
}

export function upsert(items: CatalogItem[], item: CatalogItem): CatalogItem[] {
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx === -1) return [...items, item];
  const next = [...items];
  next[idx] = item;
  return next;
}

export function removeItem(items: CatalogItem[], id: string): CatalogItem[] {
  return items.filter((i) => i.id !== id);
}

export interface ItemSalesTotals {
  units: number;
  revenue: number;
  cost: number;
  profit: number;
}

/** Aggregates one item's own `sales` log into units/revenue/cost/profit — a refund's negative quantity nets out automatically, same as every other sum over `SaleEntry[]` in this app. Extracted once this was needed in a second place (insights.ts) — Sales & Profit Reporting had this inline first. */
export function itemSalesTotals(item: CatalogItem): ItemSalesTotals {
  return item.sales.reduce(
    (acc, e) => ({
      units: acc.units + e.quantity,
      revenue: acc.revenue + e.unitPrice * e.quantity,
      cost: acc.cost + e.unitCost * e.quantity,
      profit: acc.profit + (e.unitPrice - e.unitCost) * e.quantity,
    }),
    { units: 0, revenue: 0, cost: 0, profit: 0 }
  );
}

export function mostRecentCatalogItem(catalog: CatalogItem[]): CatalogItem | undefined {
  return catalog.length
    ? [...catalog].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    : undefined;
}

/**
 * The single "what should this page be showing right now" rule, shared
 * by every page that needs a state to display when there's no
 * explicit `?id=` in the URL: prefer an in-progress unsaved draft;
 * otherwise fall back to the most recently touched catalog item, so
 * a page stays meaningful once someone adopts "Save to Catalog"
 * instead of leaving items as one-off drafts. Extracted once this was
 * needed in a second place (Break-Even) — Overview had it inline
 * first, and the two had started to disagree.
 */
export function featuredState(
  draft: CalculatorState,
  catalog: CatalogItem[]
): { state: CalculatorState; isDraft: boolean; catalogItem?: CatalogItem } | undefined {
  if (draft.itemName.trim().length > 0) return { state: draft, isDraft: true };
  const item = mostRecentCatalogItem(catalog);
  return item ? { state: item.state, isDraft: false, catalogItem: item } : undefined;
}
