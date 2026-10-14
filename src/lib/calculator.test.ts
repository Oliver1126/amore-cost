import { describe, expect, it } from "vitest";
import {
  computeBatchTotals,
  computeBreakEven,
  computePriceBreakdown,
  channelAdjustedPrice,
  defaultState,
  effectiveTax,
  marginPercentToMarkupPercent,
  materialsCost,
  newCostItem,
  packageLineAmount,
  packageUnitCost,
  priceBeforeTax,
  seniorPwdPrice,
  trueCost,
  type CalculatorState,
} from "./calculator";

function stateWith(overrides: Partial<CalculatorState>): CalculatorState {
  return { ...defaultState(), ...overrides };
}

describe("materialsCost / trueCost", () => {
  it("sums cost items plus labor, packaging, and overhead", () => {
    const state = stateWith({
      costItems: [
        { ...newCostItem("Eggs"), amount: 96 },
        { ...newCostItem("Condensed milk"), amount: 58 },
      ],
      laborHours: 0.5,
      laborRate: 80,
      packaging: 25,
      overhead: 18,
    });
    expect(materialsCost(state.costItems)).toBe(154);
    expect(trueCost(state)).toBe(154 + 40 + 25 + 18); // 237
  });

  it("ignores non-finite amounts defensively", () => {
    const items = [{ ...newCostItem("Bad"), amount: NaN }, { ...newCostItem("Good"), amount: 10 }];
    expect(materialsCost(items)).toBe(10);
  });
});

describe("priceBeforeTax", () => {
  const cost = 237;

  it("margin strategy divides by (1 - margin%)", () => {
    expect(priceBeforeTax(cost, { type: "margin", percent: 40 })).toBeCloseTo(395, 5);
  });

  it("markup strategy multiplies by (1 + markup%)", () => {
    expect(priceBeforeTax(cost, { type: "markup", percent: 40 })).toBeCloseTo(331.8, 5);
  });

  it("fixedProfit strategy adds a flat peso amount", () => {
    expect(priceBeforeTax(cost, { type: "fixedProfit", amount: 100 })).toBe(337);
  });

  it("margin at or above 100% is treated as unreachable (Infinity), not divide-by-negative", () => {
    expect(priceBeforeTax(cost, { type: "margin", percent: 100 })).toBe(Infinity);
    expect(priceBeforeTax(cost, { type: "margin", percent: 150 })).toBe(Infinity);
  });
});

describe("effectiveTax", () => {
  it("resolves preset rates and labels", () => {
    expect(effectiveTax({ preset: "none", customLabel: "", customRate: 0 })).toEqual({
      label: "No tax",
      rate: 0,
    });
    expect(effectiveTax({ preset: "vat", customLabel: "", customRate: 0 })).toEqual({
      label: "VAT",
      rate: 12,
    });
    expect(effectiveTax({ preset: "percentage", customLabel: "", customRate: 0 })).toEqual({
      label: "Percentage Tax",
      rate: 3,
    });
  });

  it("uses the custom label/rate when preset is custom", () => {
    expect(
      effectiveTax({ preset: "custom", customLabel: "Local Business Tax", customRate: 2 })
    ).toEqual({ label: "Local Business Tax", rate: 2 });
  });

  it("falls back to a generic label when custom label is blank", () => {
    expect(effectiveTax({ preset: "custom", customLabel: "  ", customRate: 5 })).toEqual({
      label: "Custom tax",
      rate: 5,
    });
  });
});

describe("computePriceBreakdown", () => {
  it("matches the worked example from the pitch (Leche Flan)", () => {
    const state = stateWith({
      costItems: [
        { ...newCostItem("Eggs"), amount: 96 },
        { ...newCostItem("Condensed milk"), amount: 58 },
      ],
      laborHours: 0.5,
      laborRate: 80,
      packaging: 25,
      overhead: 18,
      strategy: { type: "margin", percent: 40 },
      tax: { preset: "none", customLabel: "", customRate: 0 },
    });
    const b = computePriceBreakdown(state);
    expect(b.cost).toBe(237);
    expect(b.priceBeforeTax).toBeCloseTo(395, 5);
    expect(b.priceCustomerPays).toBeCloseTo(395, 5);
    expect(b.profitPerUnit).toBeCloseTo(158, 5);
    expect(b.markupPercent).toBeCloseTo(66.666, 2);
  });

  it("adds VAT on top without changing profitPerUnit (VAT isn't profit)", () => {
    const state = stateWith({
      costItems: [{ ...newCostItem("Eggs"), amount: 100 }],
      strategy: { type: "margin", percent: 40 },
      tax: { preset: "vat", customLabel: "", customRate: 0 },
    });
    const b = computePriceBreakdown(state);
    expect(b.priceBeforeTax).toBeCloseTo(166.666, 2);
    expect(b.taxAmount).toBeCloseTo(b.priceBeforeTax * 0.12, 5);
    expect(b.priceCustomerPays).toBeCloseTo(b.priceBeforeTax * 1.12, 5);
    expect(b.profitPerUnit).toBeCloseTo(66.666, 2); // unaffected by tax
  });

  it("applies a fully custom tax by name and rate", () => {
    const state = stateWith({
      costItems: [{ ...newCostItem("X"), amount: 100 }],
      strategy: { type: "fixedProfit", amount: 0 },
      tax: { preset: "custom", customLabel: "Local Business Tax", customRate: 2 },
    });
    const b = computePriceBreakdown(state);
    expect(b.taxLabel).toBe("Local Business Tax");
    expect(b.taxRate).toBe(2);
    expect(b.taxAmount).toBeCloseTo(2, 5); // 2% of 100
  });

  it("reports exactly zero profit as zero, not a negative loss", () => {
    const state = stateWith({
      costItems: [{ ...newCostItem("X"), amount: 100 }],
      strategy: { type: "fixedProfit", amount: 0 },
    });
    const b = computePriceBreakdown(state);
    expect(b.profitPerUnit).toBe(0);
  });
});

describe("channelAdjustedPrice", () => {
  it("charges more on a fee-taking channel to net the same profit", () => {
    // From the multi-channel verification: cost 163, margin 40% -> pre ~271.6667, 6% fee -> ~289.01
    const pre = 163 / 0.6;
    const adjusted = channelAdjustedPrice({ priceBeforeTax: pre, taxRate: 0 }, 6);
    expect(adjusted.final).toBeCloseTo(289.0071, 3);
  });

  it("a 0% fee channel charges exactly the base price", () => {
    const adjusted = channelAdjustedPrice({ priceBeforeTax: 200, taxRate: 0 }, 0);
    expect(adjusted.final).toBe(200);
  });
});

describe("computeBreakEven", () => {
  it("divides fixed costs by profit per unit, rounding up", () => {
    expect(computeBreakEven(15000, 158).unitsPerMonth).toBe(95); // 94.9... -> 95
    expect(computeBreakEven(15000, 158).achievable).toBe(true);
  });

  it("is not achievable at exactly zero profit", () => {
    const result = computeBreakEven(15000, 0);
    expect(result.achievable).toBe(false);
    expect(result.unitsPerMonth).toBe(0);
  });

  it("is not achievable when losing money per unit", () => {
    const result = computeBreakEven(15000, -10);
    expect(result.achievable).toBe(false);
  });

  it("zero fixed costs needs zero units", () => {
    expect(computeBreakEven(0, 50).unitsPerMonth).toBe(0);
    expect(computeBreakEven(0, 50).achievable).toBe(true);
  });
});

describe("computeBatchTotals", () => {
  it("scales cost, revenue, and profit linearly by batch size", () => {
    const state = stateWith({
      costItems: [{ ...newCostItem("Eggs"), amount: 100 }],
      strategy: { type: "margin", percent: 40 },
    });
    const b = computePriceBreakdown(state);
    const totals = computeBatchTotals(b, 5);
    expect(totals.totalCost).toBeCloseTo(b.cost * 5, 5);
    expect(totals.totalRevenue).toBeCloseTo(b.priceCustomerPays * 5, 5);
    expect(totals.totalProfit).toBeCloseTo(b.profitPerUnit * 5, 5);
  });

  it("treats a batch size below 1 as 1, never scaling down", () => {
    const b = computePriceBreakdown(stateWith({ costItems: [{ ...newCostItem("X"), amount: 50 }] }));
    expect(computeBatchTotals(b, 0).batchSize).toBe(1);
    expect(computeBatchTotals(b, -3).batchSize).toBe(1);
  });
});

describe("packageUnitCost", () => {
  it("splits package price plus shipping across qty per pack", () => {
    // ₱1200 sack + ₱50 delivery, split across 25kg = ₱50/kg
    expect(packageUnitCost(1200, 25, 50)).toBe(50);
  });

  it("ignores shipping when it's zero", () => {
    expect(packageUnitCost(100, 10, 0)).toBe(10);
  });

  it("returns 0 when qty per pack is missing or non-positive", () => {
    expect(packageUnitCost(100, 0, 10)).toBe(0);
    expect(packageUnitCost(100, -5, 10)).toBe(0);
  });
});

describe("packageLineAmount", () => {
  it("multiplies the per-unit cost by quantity directly when no pack unit is set", () => {
    // ₱1200 sack + ₱50 delivery / 25kg = ₱50/kg; 2 (unitless) portions -> ₱100
    expect(packageLineAmount(1200, 25, 50, 2, "kg")).toBe(100);
  });

  it("behaves the same when pack unit equals the portion unit", () => {
    expect(packageLineAmount(1200, 25, 50, 2, "kg", "kg")).toBe(100);
  });

  it("converts the portion quantity into the pack's unit when they differ", () => {
    // Same ₱50/kg sack, but portions are measured in grams: 500g = 0.5kg -> ₱25
    expect(packageLineAmount(1200, 25, 50, 500, "g", "kg")).toBe(25);
  });

  it("falls back to the raw quantity when the units aren't convertible", () => {
    // "pcs" (count) and "kg" (mass) aren't the same category
    expect(packageLineAmount(1200, 25, 50, 2, "pcs", "kg")).toBe(100);
  });
});

describe("marginPercentToMarkupPercent", () => {
  it("converts a 40% margin (the app's own default) to ~66.7% markup", () => {
    expect(marginPercentToMarkupPercent(40)).toBeCloseTo(66.67, 1);
  });

  it("gives the same result at 0%", () => {
    expect(marginPercentToMarkupPercent(0)).toBe(0);
  });

  it("returns a bigger number than the margin itself, always (markup > margin for the same profit)", () => {
    expect(marginPercentToMarkupPercent(30)).toBeGreaterThan(30);
    expect(marginPercentToMarkupPercent(50)).toBeGreaterThan(50);
  });

  it("returns Infinity at 100% margin, since that implies a free product with infinite markup", () => {
    expect(marginPercentToMarkupPercent(100)).toBe(Infinity);
  });
});

describe("seniorPwdPrice", () => {
  it("applies 20% off the pre-tax price, with no tax re-added", () => {
    expect(seniorPwdPrice(100)).toBe(80);
  });

  it("computePriceBreakdown includes it, derived from the pre-tax price not the tax-inclusive one", () => {
    const state = stateWith({
      costItems: [{ ...newCostItem("X"), amount: 100 }],
      strategy: { type: "margin", percent: 20 },
      tax: { preset: "vat", customLabel: "", customRate: 0 },
    });
    const b = computePriceBreakdown(state);
    // cost 100, margin 20% -> pre-tax price 125, VAT 12% -> priceCustomerPays 140
    expect(b.priceBeforeTax).toBeCloseTo(125, 5);
    expect(b.priceCustomerPays).toBeCloseTo(140, 5);
    // senior/PWD: 20% off the pre-tax 125, not off the VAT-inclusive 140
    expect(b.seniorPwdPrice).toBeCloseTo(100, 5);
  });
});
