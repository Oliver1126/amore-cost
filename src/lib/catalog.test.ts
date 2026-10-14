import { describe, expect, it } from "vitest";
import { defaultState, newCostItem } from "./calculator";
import {
  checkoutCart,
  commitHistorySnapshot,
  duplicateCatalogItem,
  featuredState,
  isTransactionRefunded,
  logSale,
  marginStatus,
  mostRecentCatalogItem,
  newCatalogItem,
  refundTransaction,
  removeItem,
  updateItemState,
  updateItemStateLive,
  upsert,
} from "./catalog";

function stateWithCost(amount: number) {
  return {
    ...defaultState(),
    itemName: "Test item",
    costItems: [{ ...newCostItem("X"), amount }],
  };
}

describe("newCatalogItem", () => {
  it("seeds one history snapshot from the initial state", () => {
    const item = newCatalogItem(stateWithCost(100));
    expect(item.history).toHaveLength(1);
    expect(item.history[0].cost).toBe(100);
    expect(item.stockOnHand).toBe(0);
    expect(item.sales).toEqual([]);
  });
});

describe("updateItemState", () => {
  it("appends a history snapshot when cost actually changes", () => {
    let item = newCatalogItem(stateWithCost(100));
    item = updateItemState(item, stateWithCost(150));
    expect(item.history).toHaveLength(2);
    expect(item.history[1].cost).toBe(150);
  });

  it("does NOT append a snapshot when the state changes but cost/price don't", () => {
    let item = newCatalogItem(stateWithCost(100));
    const sameNumbers = { ...stateWithCost(100), itemName: "Renamed but same cost" };
    item = updateItemState(item, sameNumbers);
    expect(item.history).toHaveLength(1); // unchanged
    expect(item.state.itemName).toBe("Renamed but same cost"); // state itself still updates
  });

  it("records who made the change when a profile id is given", () => {
    let item = newCatalogItem(stateWithCost(100));
    item = updateItemState(item, stateWithCost(200), "profile-1");
    expect(item.updatedByProfileId).toBe("profile-1");
  });

  it("keeps the previous editor if no profile id is passed this time", () => {
    let item = newCatalogItem(stateWithCost(100));
    item = updateItemState(item, stateWithCost(200), "profile-1");
    item = updateItemState(item, stateWithCost(300));
    expect(item.updatedByProfileId).toBe("profile-1");
  });

  it("is exactly equivalent to updateItemStateLive followed by commitHistorySnapshot", () => {
    // updateItemState is now a thin composition of the two — this pins that
    // composition so the two halves can't silently drift apart. Same
    // `nextState` object reused for both, since a fresh stateWithCost(150)
    // call would mint a new random cost-line id each time and make the two
    // states differ for a reason that has nothing to do with the function
    // under test.
    const nextState = stateWithCost(150);
    const a = updateItemState(newCatalogItem(stateWithCost(100)), nextState, "profile-1");
    const b = commitHistorySnapshot(updateItemStateLive(newCatalogItem(stateWithCost(100)), nextState, "profile-1"));
    expect(a.history.map((h) => h.cost)).toEqual(b.history.map((h) => h.cost));
    expect(a.state).toEqual(b.state);
    expect(a.updatedByProfileId).toBe(b.updatedByProfileId);
  });
});

describe("updateItemStateLive", () => {
  it("updates state and updatedAt but never touches history — the per-keystroke-safe half of updateItemState", () => {
    const item = updateItemStateLive(newCatalogItem(stateWithCost(100)), stateWithCost(999));
    expect(item.state.costItems[0].amount).toBe(999);
    expect(item.history).toHaveLength(1); // still just the initial snapshot
    expect(item.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // a real timestamp was set
  });

  it("records who made the change, same as updateItemState", () => {
    const item = updateItemStateLive(newCatalogItem(stateWithCost(100)), stateWithCost(200), "profile-1");
    expect(item.updatedByProfileId).toBe("profile-1");
  });
});

describe("commitHistorySnapshot", () => {
  it("appends a snapshot of the item's current state when it actually differs from the last one", () => {
    let item = newCatalogItem(stateWithCost(100));
    item = updateItemStateLive(item, stateWithCost(150));
    item = commitHistorySnapshot(item);
    expect(item.history).toHaveLength(2);
    expect(item.history[1].cost).toBe(150);
  });

  it("does nothing when the current state already matches the last snapshot", () => {
    const item = newCatalogItem(stateWithCost(100));
    const committed = commitHistorySnapshot(item);
    expect(committed.history).toHaveLength(1);
    expect(committed).toEqual(item);
  });

  it("collapses several live updates into a single commit, matching the debounced-editor pattern", () => {
    // Simulates typing "1200" one digit at a time: each keystroke goes
    // through updateItemStateLive (no history change), and only a single
    // trailing commitHistorySnapshot() call — the debounced one — actually
    // records it.
    let item = newCatalogItem(stateWithCost(100));
    item = updateItemStateLive(item, stateWithCost(1));
    item = updateItemStateLive(item, stateWithCost(12));
    item = updateItemStateLive(item, stateWithCost(120));
    item = updateItemStateLive(item, stateWithCost(1200));
    expect(item.history).toHaveLength(1); // no snapshot appended yet
    item = commitHistorySnapshot(item);
    expect(item.history).toHaveLength(2); // exactly one, for the settled value
    expect(item.history[1].cost).toBe(1200);
  });
});

describe("duplicateCatalogItem", () => {
  it("gets a new id, appends (copy), resets stock/sales, and starts its own fresh cost history", () => {
    const original = updateItemState(logSale(newCatalogItem(stateWithCost(100)), 3), stateWithCost(150));
    const copy = duplicateCatalogItem(original);
    expect(copy.id).not.toBe(original.id);
    expect(copy.state.itemName).toBe("Test item (copy)");
    expect(copy.stockOnHand).toBe(0);
    expect(copy.sales).toEqual([]);
    // A fresh single snapshot of the copy's own current state, not a shared
    // reference to (or stale copy of) the original's own history — sharing
    // it would make a brand-new duplicate report cost changes that happened
    // to the original before this copy ever existed.
    expect(copy.history).toHaveLength(1);
    expect(copy.history).not.toBe(original.history);
    expect(copy.history[0].cost).toBe(150);
  });

  it("copies the channels array rather than sharing the original's reference", () => {
    const original = { ...newCatalogItem(stateWithCost(100)), channels: [{ id: "c1", name: "Shopee", feePercent: 6 }] };
    const copy = duplicateCatalogItem(original);
    expect(copy.channels).toEqual(original.channels);
    expect(copy.channels).not.toBe(original.channels);
  });
});

describe("logSale", () => {
  it("deducts stock and records a sale entry with the price/cost at time of sale", () => {
    let item = newCatalogItem(stateWithCost(100));
    item = { ...item, stockOnHand: 20 };
    item = logSale(item, 3);
    expect(item.stockOnHand).toBe(17);
    expect(item.sales).toHaveLength(1);
    expect(item.sales[0].quantity).toBe(3);
    expect(item.sales[0].unitCost).toBe(100);
  });

  it("never lets stock go negative", () => {
    let item = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 2 };
    item = logSale(item, 5);
    expect(item.stockOnHand).toBe(0);
  });

  it("aggregated across multiple sales matches units * price exactly (reporting invariant)", () => {
    let item = { ...newCatalogItem(stateWithCost(163)), stockOnHand: 20 };
    // margin 40% default -> price = 163 / 0.6 = 271.6666...
    item = logSale(item, 3);
    const revenue = item.sales.reduce((s, e) => s + e.unitPrice * e.quantity, 0);
    const cost = item.sales.reduce((s, e) => s + e.unitCost * e.quantity, 0);
    expect(revenue).toBeCloseTo(815.0, 1);
    expect(revenue - cost).toBeCloseTo(326.0, 1);
  });
});

describe("checkoutCart", () => {
  it("deducts stock and appends a sale entry per cart line", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const b = { ...newCatalogItem(stateWithCost(50)), stockOnHand: 5 };
    const { catalog } = checkoutCart(
      [a, b],
      [{ itemId: a.id, quantity: 2 }, { itemId: b.id, quantity: 1 }],
      "cash"
    );
    expect(catalog.find((i) => i.id === a.id)!.stockOnHand).toBe(8);
    expect(catalog.find((i) => i.id === b.id)!.stockOnHand).toBe(4);
    expect(catalog.find((i) => i.id === a.id)!.sales).toHaveLength(1);
    expect(catalog.find((i) => i.id === b.id)!.sales).toHaveLength(1);
  });

  it("shares one transactionId across every line in the same checkout", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const b = { ...newCatalogItem(stateWithCost(50)), stockOnHand: 5 };
    const { catalog, transactionId } = checkoutCart(
      [a, b],
      [{ itemId: a.id, quantity: 1 }, { itemId: b.id, quantity: 1 }],
      "gcash"
    );
    expect(catalog.find((i) => i.id === a.id)!.sales[0].transactionId).toBe(transactionId);
    expect(catalog.find((i) => i.id === b.id)!.sales[0].transactionId).toBe(transactionId);
  });

  it("records the payment method on every line", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog } = checkoutCart([a], [{ itemId: a.id, quantity: 1 }], "card");
    expect(catalog.find((i) => i.id === a.id)!.sales[0].paymentMethod).toBe("card");
  });

  it("never lets stock go negative", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 2 };
    const { catalog } = checkoutCart([a], [{ itemId: a.id, quantity: 5 }], "cash");
    expect(catalog.find((i) => i.id === a.id)!.stockOnHand).toBe(0);
  });

  it("leaves items not in the cart completely untouched", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const untouched = { ...newCatalogItem(stateWithCost(20)), stockOnHand: 3 };
    const { catalog } = checkoutCart([a, untouched], [{ itemId: a.id, quantity: 1 }], "cash");
    expect(catalog.find((i) => i.id === untouched.id)).toEqual(untouched);
  });

  it("skips a cart line whose itemId isn't in the catalog rather than throwing", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    expect(() =>
      checkoutCart([a], [{ itemId: "does-not-exist", quantity: 1 }], "cash")
    ).not.toThrow();
  });

  it("applies the Senior/PWD discount to a line marked seniorPwd, and records the flag on the sale entry", () => {
    // stateWithCost(100) -> default 40% margin, no tax -> regular price 166.67; senior/PWD = 20% off that = 133.33
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog } = checkoutCart([a], [{ itemId: a.id, quantity: 1, seniorPwd: true }], "cash");
    const entry = catalog.find((i) => i.id === a.id)!.sales[0];
    expect(entry.unitPrice).toBeCloseTo(133.33, 1);
    expect(entry.seniorPwdDiscount).toBe(true);
  });

  it("leaves the regular price and no flag on a line not marked seniorPwd", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog } = checkoutCart([a], [{ itemId: a.id, quantity: 1 }], "cash");
    const entry = catalog.find((i) => i.id === a.id)!.sales[0];
    expect(entry.unitPrice).toBeCloseTo(166.67, 1);
    expect(entry.seniorPwdDiscount).toBeUndefined();
  });
});

describe("refundTransaction / isTransactionRefunded", () => {
  it("restocks the item and appends a negative-quantity entry linked to the original", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a],
      [{ itemId: a.id, quantity: 2 }],
      "cash"
    );
    const original = afterSale.find((i) => i.id === a.id)!.sales[0];
    const { catalog: afterRefund, refundTransactionId } = refundTransaction(afterSale, transactionId);
    const item = afterRefund.find((i) => i.id === a.id)!;
    expect(item.stockOnHand).toBe(10);
    expect(item.sales).toHaveLength(2);
    const refundEntry = item.sales[1];
    expect(refundEntry.quantity).toBe(-2);
    expect(refundEntry.unitPrice).toBe(original.unitPrice);
    expect(refundEntry.unitCost).toBe(original.unitCost);
    expect(refundEntry.refundOf).toBe(original.id);
    expect(refundEntry.transactionId).toBe(refundTransactionId);
    expect(refundTransactionId).not.toBe(transactionId);
  });

  it("restocks only what was actually deducted, not the oversold quantity, so a refund can't inflate stock past what it ever held", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 2 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a],
      [{ itemId: a.id, quantity: 5 }], // deliberately oversold — decision 0030
      "cash"
    );
    expect(afterSale.find((i) => i.id === a.id)!.stockOnHand).toBe(0); // clamped, not negative
    const { catalog: afterRefund } = refundTransaction(afterSale, transactionId);
    const item = afterRefund.find((i) => i.id === a.id)!;
    // Only the 2 units actually taken out of stock come back — restocking
    // the full oversold 5 would leave more stock than the item ever had.
    expect(item.stockOnHand).toBe(2);
    expect(item.sales[1].quantity).toBe(-5); // revenue/reporting still nets out the full sold amount
  });

  it("nets the item's total units/revenue back toward zero once refunded", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a],
      [{ itemId: a.id, quantity: 2 }],
      "cash"
    );
    const { catalog: afterRefund } = refundTransaction(afterSale, transactionId);
    const item = afterRefund.find((i) => i.id === a.id)!;
    const netUnits = item.sales.reduce((sum, e) => sum + e.quantity, 0);
    const netRevenue = item.sales.reduce((sum, e) => sum + e.unitPrice * e.quantity, 0);
    expect(netUnits).toBe(0);
    expect(netRevenue).toBeCloseTo(0, 5);
  });

  it("refunds across multiple items rung up in the same transaction", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const b = { ...newCatalogItem(stateWithCost(50)), stockOnHand: 5 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a, b],
      [{ itemId: a.id, quantity: 1 }, { itemId: b.id, quantity: 2 }],
      "gcash"
    );
    const { catalog: afterRefund } = refundTransaction(afterSale, transactionId);
    expect(afterRefund.find((i) => i.id === a.id)!.stockOnHand).toBe(10);
    expect(afterRefund.find((i) => i.id === b.id)!.stockOnHand).toBe(5);
  });

  it("does not double-refund a transaction already refunded", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a],
      [{ itemId: a.id, quantity: 1 }],
      "cash"
    );
    const { catalog: afterFirstRefund } = refundTransaction(afterSale, transactionId);
    const { catalog: afterSecondRefund } = refundTransaction(afterFirstRefund, transactionId);
    const item = afterSecondRefund.find((i) => i.id === a.id)!;
    expect(item.stockOnHand).toBe(10);
    expect(item.sales).toHaveLength(2);
  });

  it("leaves an untouched item's stock and sales alone", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const untouched = { ...newCatalogItem(stateWithCost(20)), stockOnHand: 3 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a, untouched],
      [{ itemId: a.id, quantity: 1 }],
      "cash"
    );
    const { catalog: afterRefund } = refundTransaction(afterSale, transactionId);
    const item = afterRefund.find((i) => i.id === untouched.id)!;
    expect(item.stockOnHand).toBe(3);
    expect(item.sales).toHaveLength(0);
  });

  it("reports a transaction as not refunded before any refund happens", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog, transactionId } = checkoutCart([a], [{ itemId: a.id, quantity: 1 }], "cash");
    expect(isTransactionRefunded(catalog, transactionId)).toBe(false);
  });

  it("reports a transaction as refunded once every original line has a reversal", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const b = { ...newCatalogItem(stateWithCost(50)), stockOnHand: 5 };
    const { catalog: afterSale, transactionId } = checkoutCart(
      [a, b],
      [{ itemId: a.id, quantity: 1 }, { itemId: b.id, quantity: 1 }],
      "cash"
    );
    const { catalog: afterRefund } = refundTransaction(afterSale, transactionId);
    expect(isTransactionRefunded(afterRefund, transactionId)).toBe(true);
  });

  it("returns false for an unknown transactionId instead of throwing", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    expect(isTransactionRefunded([a], "does-not-exist")).toBe(false);
  });

  it("does nothing when the transaction has no matching entries", () => {
    const a = { ...newCatalogItem(stateWithCost(100)), stockOnHand: 10 };
    const { catalog } = refundTransaction([a], "does-not-exist");
    expect(catalog).toEqual([a]);
  });
});

describe("marginStatus", () => {
  it("is belowTarget when margin is under the target", () => {
    expect(marginStatus(25, 30)).toBe("belowTarget");
  });

  it("is onTarget when margin is above the target", () => {
    expect(marginStatus(35, 30)).toBe("onTarget");
  });

  it("is onTarget when margin exactly equals the target", () => {
    expect(marginStatus(30, 30)).toBe("onTarget");
  });
});

describe("upsert / removeItem", () => {
  it("adds a new item when its id isn't already present", () => {
    const a = newCatalogItem(stateWithCost(1));
    const list = upsert([], a);
    expect(list).toHaveLength(1);
  });

  it("replaces an existing item in place, preserving order", () => {
    const a = newCatalogItem(stateWithCost(1));
    const b = newCatalogItem(stateWithCost(2));
    const updatedA = { ...a, stockOnHand: 99 };
    const list = upsert([a, b], updatedA);
    expect(list).toHaveLength(2);
    expect(list[0].stockOnHand).toBe(99);
    expect(list[1].id).toBe(b.id);
  });

  it("removeItem drops only the matching id", () => {
    const a = newCatalogItem(stateWithCost(1));
    const b = newCatalogItem(stateWithCost(2));
    const list = removeItem([a, b], a.id);
    expect(list).toEqual([b]);
  });
});

describe("mostRecentCatalogItem", () => {
  it("returns undefined for an empty catalog", () => {
    expect(mostRecentCatalogItem([])).toBeUndefined();
  });

  it("returns the item with the latest updatedAt, not just the last in the array", () => {
    const older = { ...newCatalogItem(stateWithCost(1)), updatedAt: "2026-01-01T00:00:00.000Z" };
    const newer = { ...newCatalogItem(stateWithCost(2)), updatedAt: "2026-06-01T00:00:00.000Z" };
    // Deliberately array-ordered [newer, older] to prove it sorts rather than picking [0] or last.
    expect(mostRecentCatalogItem([newer, older])!.id).toBe(newer.id);
    expect(mostRecentCatalogItem([older, newer])!.id).toBe(newer.id);
  });
});

describe("featuredState", () => {
  it("prefers an in-progress draft with a name over any saved catalog item", () => {
    const draft = stateWithCost(1);
    const saved = newCatalogItem(stateWithCost(2));
    const result = featuredState(draft, [saved]);
    expect(result?.isDraft).toBe(true);
    expect(result?.state).toBe(draft);
  });

  it("falls back to the most recently touched catalog item when the draft is unnamed", () => {
    const draft = defaultState();
    const item = newCatalogItem(stateWithCost(2));
    const result = featuredState(draft, [item]);
    expect(result?.isDraft).toBe(false);
    expect(result?.catalogItem?.id).toBe(item.id);
  });

  it("returns undefined when there's no named draft and an empty catalog", () => {
    expect(featuredState(defaultState(), [])).toBeUndefined();
  });
});

describe("job status", () => {
  it("a new catalog item starts as 'quoted'", () => {
    expect(newCatalogItem(stateWithCost(100)).status).toBe("quoted");
  });

  it("duplicating an item resets its status back to 'quoted'", () => {
    const invoiced = { ...newCatalogItem(stateWithCost(100)), status: "invoiced" as const };
    expect(duplicateCatalogItem(invoiced).status).toBe("quoted");
  });
});
