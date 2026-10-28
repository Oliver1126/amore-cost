import { describe, expect, it } from "vitest";
import { simulateReceipt, type ReceiptLine, type ReceiptSettings } from "./receipt";

const line = (unitNetPrice: number, quantity: number, unitCost = 0): ReceiptLine => ({
  id: `l-${unitNetPrice}-${quantity}`,
  name: "Dish",
  quantity,
  unitNetPrice,
  unitCost,
});

const base: ReceiptSettings = { pricingModel: "inclusive", vatRate: 12, serviceChargePercent: 0, seniorPwd: false };

describe("simulateReceipt", () => {
  it("folds VAT into menu prices under the inclusive model, so the total matches the subtotal", () => {
    const r = simulateReceipt([line(100, 2)], base);
    expect(r.subtotal).toBeCloseTo(224);
    expect(r.vatableSales).toBeCloseTo(200);
    expect(r.vat).toBeCloseTo(24);
    expect(r.totalDue).toBeCloseTo(224);
  });

  it("adds VAT on top under the exclusive model", () => {
    const r = simulateReceipt([line(100, 2)], { ...base, pricingModel: "exclusive" });
    expect(r.subtotal).toBeCloseTo(200);
    expect(r.totalDue).toBeCloseTo(224);
  });

  it("gives Senior/PWD 20% off the VAT-exclusive price and drops VAT entirely", () => {
    const r = simulateReceipt([line(100, 1)], { ...base, seniorPwd: true });
    expect(r.discount).toBeCloseTo(20);
    expect(r.vat).toBe(0);
    expect(r.vatableSales).toBe(0);
    expect(r.vatExemptSales).toBeCloseTo(80);
    expect(r.totalDue).toBeCloseTo(80);
  });

  it("computes service charge on the net, post-discount amount and keeps it out of profit", () => {
    const r = simulateReceipt([line(100, 1, 30)], { ...base, serviceChargePercent: 10 });
    expect(r.serviceCharge).toBeCloseTo(10);
    expect(r.totalDue).toBeCloseTo(122);
    expect(r.netRevenue).toBeCloseTo(100);
    expect(r.netProfit).toBeCloseTo(70);
  });

  it("reports food cost % against what the business actually keeps", () => {
    const r = simulateReceipt([line(100, 2, 30)], { ...base, seniorPwd: true });
    expect(r.directCost).toBeCloseTo(60);
    expect(r.netRevenue).toBeCloseTo(160);
    expect(r.foodCostPercent).toBeCloseTo(37.5);
  });

  it("returns all zeros for an empty order instead of dividing by zero", () => {
    const r = simulateReceipt([], base);
    expect(r.totalDue).toBe(0);
    expect(r.foodCostPercent).toBe(0);
  });
});
