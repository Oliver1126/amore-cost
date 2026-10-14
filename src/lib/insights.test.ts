import { describe, expect, it } from "vitest";
import { defaultState, newCostItem, type CalculatorState } from "./calculator";
import { newCatalogItem, type CatalogItem, type SaleEntry } from "./catalog";
import {
  belowTargetMarginInsights,
  channelGapInsights,
  generateInsights,
  portfolioInsights,
  stockRunwayInsights,
} from "./insights";

function stateWithCost(amount: number, name = "Test item"): CalculatorState {
  return {
    ...defaultState(),
    itemName: name,
    costItems: [{ ...newCostItem("X"), amount }],
  };
}

function sale(quantity: number, unitPrice: number, unitCost: number, daysAgo = 0): SaleEntry {
  return {
    id: `sale-${Math.random()}`,
    date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    quantity,
    unitPrice,
    unitCost,
  };
}

describe("belowTargetMarginInsights", () => {
  it("says nothing about an item at or above its own target margin", () => {
    // defaultState() uses a 40% margin strategy, so a plain item is already at 40%.
    const item = { ...newCatalogItem(stateWithCost(100)), targetMarginPercent: 40 };
    expect(belowTargetMarginInsights([item], "en")).toEqual([]);
  });

  it("flags an item priced below its target, with how much to raise it by", () => {
    const item = { ...newCatalogItem(stateWithCost(100, "Cookies")), targetMarginPercent: 55 };
    const insights = belowTargetMarginInsights([item], "en");
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("critical"); // 15-point gap: 40% actual vs 55% target
    expect(insights[0].message).toContain("Cookies");
    expect(insights[0].message).toContain("Raise price by");
  });

  it("names the cost increase when Cost History shows the cost actually rose", () => {
    let item = newCatalogItem(stateWithCost(100, "Candle"));
    item = { ...item, state: stateWithCost(130, "Candle"), targetMarginPercent: 50 };
    const insights = belowTargetMarginInsights([item], "en");
    expect(insights[0].message).toMatch(/cost rose/i);
  });

  it("computes the raise-by amount against the tax-inclusive price, not the pre-tax one", () => {
    const state: CalculatorState = {
      ...defaultState(),
      itemName: "Taxed Item",
      costItems: [{ ...newCostItem("X"), amount: 100 }],
      strategy: { type: "margin", percent: 20 },
      tax: { preset: "vat", customLabel: "", customRate: 0 },
    };
    const item = { ...newCatalogItem(state), targetMarginPercent: 40 };
    const insights = belowTargetMarginInsights([item], "en");
    // cost 100, 20% margin -> pre-tax 125, +12% VAT -> visible price 140.
    // Target 40% margin -> pre-tax target 166.666..., inclusive of VAT -> 186.666...
    // raiseBy = 186.666... - 140 = 46.666...
    expect(insights[0].message).toContain("₱46.67");
  });

  it("ignores items with no target margin set", () => {
    const item = { ...newCatalogItem(stateWithCost(100)), targetMarginPercent: 0 };
    expect(belowTargetMarginInsights([item], "en")).toEqual([]);
  });

  it("renders in Tagalog when asked", () => {
    const item = { ...newCatalogItem(stateWithCost(100, "Cookies")), targetMarginPercent: 50 };
    const insights = belowTargetMarginInsights([item], "tl");
    expect(insights[0].message).toContain("Cookies");
    expect(insights[0].message).not.toMatch(/Raise price/i);
  });
});

describe("portfolioInsights", () => {
  it("does nothing with fewer than two items that have real sales", () => {
    const item = { ...newCatalogItem(stateWithCost(50, "Solo")), sales: [sale(5, 100, 50)] };
    expect(portfolioInsights([item], "en")).toEqual([]);
  });

  it("flags the item generating at least half of total logged profit", () => {
    const star = {
      ...newCatalogItem(stateWithCost(50, "Star Item")),
      sales: [sale(100, 100, 50)], // profit 5000
    };
    const other = {
      ...newCatalogItem(stateWithCost(50, "Side Item")),
      sales: [sale(10, 100, 50)], // profit 500
    };
    const insights = portfolioInsights([star, other], "en");
    expect(insights.some((i) => i.message.includes("Star Item") && i.message.includes("generates"))).toBe(true);
  });

  it("flags a below-target item that is also a slow seller as a reconsider candidate", () => {
    const slowAndCheap: CatalogItem = {
      ...newCatalogItem(stateWithCost(100, "Slow Mover")),
      targetMarginPercent: 60, // well above its actual 40% margin
      sales: [sale(2, 100, 50)],
    };
    const fastSeller: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Fast Seller")),
      targetMarginPercent: 30,
      sales: [sale(50, 100, 50)],
    };
    const insights = portfolioInsights([slowAndCheap, fastSeller], "en");
    expect(insights.some((i) => i.message.includes("Slow Mover") && i.message.includes("slower sellers"))).toBe(
      true
    );
  });

  it("never reports a profit share above 100%, even when a loss-making sibling shrinks the total", () => {
    const winner = {
      ...newCatalogItem(stateWithCost(50, "Winner")),
      sales: [sale(100, 100, 50)], // profit +5000
    };
    const loser = {
      ...newCatalogItem(stateWithCost(50, "Loser")),
      sales: [sale(80, 10, 60, 0)], // profit -4000 (sold below cost)
    };
    const insights = portfolioInsights([winner, loser], "en");
    expect(insights.some((i) => /\d{3,}%/.test(i.message))).toBe(false);
  });
});

describe("channelGapInsights", () => {
  it("flags a high-fee channel where the usual price would miss the target margin", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(100, "Candle")),
      targetMarginPercent: 40, // actual margin is also 40%, but the fee below eats into it
      channels: [{ id: "c1", name: "Shopee", feePercent: 20 }],
    };
    const insights = channelGapInsights([item], "en");
    expect(insights).toHaveLength(1);
    expect(insights[0].message).toContain("Shopee");
    expect(insights[0].message).toContain("Candle");
  });

  it("fires at the real preset fees the app actually offers (Shopee 6%, Lazada 8%) — not just a synthetic high fee", () => {
    // Multi-Channel Pricing's only channel-creation UI offers 6%/8%/0%
    // presets with no custom-fee input — this generator has to actually
    // trigger at those real values or it can never fire in production.
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(100, "Soap")),
      targetMarginPercent: 40,
      channels: [{ id: "c1", name: "Lazada", feePercent: 8 }],
    };
    expect(channelGapInsights([item], "en")).toHaveLength(1);
  });

  it("ignores a low fee that doesn't meaningfully change the margin", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(100, "Candle")),
      targetMarginPercent: 40,
      channels: [{ id: "c1", name: "Store", feePercent: 2 }],
    };
    expect(channelGapInsights([item], "en")).toEqual([]);
  });

  it("ignores an item with no channels configured", () => {
    const item: CatalogItem = { ...newCatalogItem(stateWithCost(100)), targetMarginPercent: 40, channels: [] };
    expect(channelGapInsights([item], "en")).toEqual([]);
  });
});

describe("stockRunwayInsights", () => {
  const now = Date.now();
  const daysAgoIso = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
  // An item old enough that "days tracked" is capped at the full 30-day
  // window, not limited by the item's own age — isolates the pace math
  // from the age-aware fix below.
  const oldEnough = { createdAt: daysAgoIso(60) };

  it("flags an item selling fast enough to run out within 2 weeks", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Fast Mover")),
      ...oldEnough,
      stockOnHand: 5,
      sales: [sale(30, 100, 50, 5)], // 30 units in the last 30 days -> 1/day -> 5 days of runway
    };
    const insights = stockRunwayInsights([item], "en", now);
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("critical");
    expect(insights[0].message).toContain("Fast Mover");
  });

  it("says nothing when there's plenty of runway", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Slow Mover")),
      ...oldEnough,
      stockOnHand: 100,
      sales: [sale(3, 100, 50, 5)],
    };
    expect(stockRunwayInsights([item], "en", now)).toEqual([]);
  });

  it("ignores items with no stock on hand (e.g. services)", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Consulting")),
      ...oldEnough,
      stockOnHand: 0,
      sales: [sale(10, 100, 50, 1)],
    };
    expect(stockRunwayInsights([item], "en", now)).toEqual([]);
  });

  it("ignores sales older than 30 days", () => {
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Old Sales Only")),
      ...oldEnough,
      stockOnHand: 5,
      sales: [sale(30, 100, 50, 45)],
    };
    expect(stockRunwayInsights([item], "en", now)).toEqual([]);
  });

  it("uses the item's real age, not a flat 30 days, so a brand-new fast seller isn't diluted", () => {
    // Item created 3 days ago, sold 30 units in those 3 days: real pace is
    // 10/day. Dividing by a flat 30 would wrongly compute 1/day and a
    // 5-day runway that clears the >=14 skip threshold — the alert would
    // never fire even though the real runway is 2 days.
    const item: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "New Fast Seller")),
      createdAt: daysAgoIso(3),
      stockOnHand: 20,
      sales: [sale(30, 100, 50, 1)],
    };
    const insights = stockRunwayInsights([item], "en", now);
    expect(insights).toHaveLength(1);
    expect(insights[0].message).toMatch(/2 days/);
  });
});

describe("generateInsights", () => {
  it("combines every generator, ranked critical before warning before info, capped to maxCount", () => {
    const critical: CatalogItem = {
      ...newCatalogItem(stateWithCost(100, "Critical Item")),
      targetMarginPercent: 90, // far below target -> critical
    };
    const info: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Star")),
      sales: [sale(100, 100, 50)],
    };
    const infoOther: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Side")),
      sales: [sale(5, 100, 50)],
    };
    const insights = generateInsights([critical, info, infoOther], "en", 2);
    expect(insights).toHaveLength(2);
    expect(insights[0].severity).toBe("critical");
  });

  it("doesn't let one generator's same-severity insights starve an equally critical one from another generator", () => {
    const now = Date.now();
    const daysAgoIso = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
    // Six items all far below target -> six "critical" belowTargetMargin
    // insights, which alone would fill a cap of 6 by concatenation order.
    const criticallyUnderpriced: CatalogItem[] = Array.from({ length: 6 }, (_, i) => ({
      ...newCatalogItem(stateWithCost(100, `Underpriced ${i}`)),
      targetMarginPercent: 90,
    }));
    // A critical stock-runway insight from a different generator entirely.
    const aboutToRunOut: CatalogItem = {
      ...newCatalogItem(stateWithCost(50, "Almost Out")),
      createdAt: daysAgoIso(3),
      stockOnHand: 2,
      sales: [sale(30, 100, 50, 1)],
    };
    const insights = generateInsights([...criticallyUnderpriced, aboutToRunOut], "en", 6);
    expect(insights.some((i) => i.message.includes("Almost Out"))).toBe(true);
  });
});
