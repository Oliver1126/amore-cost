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

describe("simulateReceipt — centavo footing", () => {
  // The Classic Pork Adobo from the reference receipt: ₱65 direct cost at 66.4% margin.
  const adobo = line(65 / (1 - 0.664), 1, 65);

  it("prints lines that add up to the total exactly, like a real POS", () => {
    const r = simulateReceipt([adobo], base);
    expect(r.subtotal).toBe(216.67);
    expect(r.vatableSales).toBe(193.46);
    expect(r.vat).toBe(23.21);
    expect(Math.round((r.vatableSales + r.vat) * 100) / 100).toBe(r.totalDue);
  });

  it("keeps Senior/PWD lines footing too, with service charge", () => {
    const r = simulateReceipt([adobo, line(197.14, 3, 69)], { ...base, seniorPwd: true, serviceChargePercent: 10 });
    const lessVat = Math.round((r.subtotal - r.netSales) * 100) / 100;
    expect(Math.round((r.subtotal - lessVat - r.discount) * 100) / 100).toBe(r.vatExemptSales);
    expect(Math.round((r.vatExemptSales + r.serviceCharge) * 100) / 100).toBe(r.totalDue);
  });
});
