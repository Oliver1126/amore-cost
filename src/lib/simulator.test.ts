import { describe, expect, it } from "vitest";
import { simulateMargin } from "./simulator";

describe("simulateMargin", () => {
  it("walks revenue down to net profit", () => {
    const r = simulateMargin({ unitCost: 30, sellingPrice: 100, monthlyPortions: 500, monthlyOpex: 20000 });
    expect(r.revenue).toBe(50000);
    expect(r.ingredientCost).toBe(15000);
    expect(r.grossProfit).toBe(35000);
    expect(r.netProfit).toBe(15000);
    expect(r.grossMarginPercent).toBeCloseTo(70);
    expect(r.foodCostPercent).toBeCloseTo(30);
    expect(r.netMarginPercent).toBeCloseTo(30);
    expect(r.opexPerPortion).toBe(40);
  });

  it("rounds break-even up to a whole portion", () => {
    const r = simulateMargin({ unitCost: 30, sellingPrice: 100, monthlyPortions: 0, monthlyOpex: 1000 });
    expect(r.breakEvenPortions).toBe(15);
  });

  it("has no break-even when every portion sells at or below cost", () => {
    const r = simulateMargin({ unitCost: 100, sellingPrice: 90, monthlyPortions: 100, monthlyOpex: 1000 });
    expect(r.breakEvenPortions).toBeNull();
    expect(r.netProfit).toBe(-2000);
  });

  it("treats junk input as zero rather than producing NaN", () => {
    const r = simulateMargin({ unitCost: NaN, sellingPrice: -5, monthlyPortions: NaN, monthlyOpex: 0 });
    expect(r.revenue).toBe(0);
    expect(r.grossMarginPercent).toBe(0);
    expect(r.breakEvenPortions).toBeNull();
  });
});
