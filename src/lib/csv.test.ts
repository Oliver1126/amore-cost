import { describe, expect, it } from "vitest";
import { defaultState, newCostItem } from "./calculator";
import { newCatalogItem } from "./catalog";
import { catalogToCSV, costItemsToCSV, parseCostItemsCSV } from "./csv";

describe("parseCostItemsCSV", () => {
  it("parses label,quantity,unit,amount rows, skipping a header if present", () => {
    const csv = "label,quantity,unit,amount\nFlour,1,kg,45\nSugar,2,kg,60\n";
    const items = parseCostItemsCSV(csv);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ label: "Flour", quantity: 1, unit: "kg", amount: 45 });
    expect(items[1]).toMatchObject({ label: "Sugar", quantity: 2, unit: "kg", amount: 60 });
  });

  it("parses fine without a header row too", () => {
    const csv = "Eggs,12,pcs,96\n";
    const items = parseCostItemsCSV(csv);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ label: "Eggs", quantity: 12, unit: "pcs", amount: 96 });
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'label,quantity,unit,amount\n"Flour, all-purpose",1,kg,45\n';
    const items = parseCostItemsCSV(csv);
    expect(items[0].label).toBe("Flour, all-purpose");
  });

  it("skips blank lines and rows with no label", () => {
    const csv = "label,quantity,unit,amount\n\nFlour,1,kg,45\n,,,\n";
    const items = parseCostItemsCSV(csv);
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("Flour");
  });

  it("defaults missing quantity/unit sensibly", () => {
    const csv = "Flour,,,\n";
    const items = parseCostItemsCSV(csv);
    expect(items[0].quantity).toBe(1);
    expect(items[0].unit).toBe("pcs");
    expect(items[0].amount).toBe(0);
  });

  it("returns an empty array for empty input", () => {
    expect(parseCostItemsCSV("")).toEqual([]);
  });
});

describe("costItemsToCSV / parseCostItemsCSV round-trip", () => {
  it("survives a full export -> import cycle", () => {
    const items = [
      { ...newCostItem("Eggs"), quantity: 12, unit: "pcs", amount: 96 },
      { ...newCostItem("Flour, all-purpose"), quantity: 1, unit: "kg", amount: 45 },
    ];
    const csv = costItemsToCSV(items);
    const reimported = parseCostItemsCSV(csv);
    expect(reimported).toHaveLength(2);
    expect(reimported[0]).toMatchObject({ label: "Eggs", quantity: 12, unit: "pcs", amount: 96 });
    expect(reimported[1]).toMatchObject({
      label: "Flour, all-purpose",
      quantity: 1,
      unit: "kg",
      amount: 45,
    });
  });
});

describe("catalogToCSV", () => {
  it("summarizes each catalog item's real computed cost/price/margin", () => {
    const state = {
      ...defaultState(),
      itemName: "Leche Flan",
      costItems: [{ ...newCostItem("Eggs"), amount: 100 }],
      strategy: { type: "margin" as const, percent: 40 },
    };
    const item = { ...newCatalogItem(state), stockOnHand: 5 };
    const csv = catalogToCSV([item]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("item,vertical,true_cost,price,margin_percent,stock_on_hand");
    expect(lines[1]).toContain("Leche Flan");
    expect(lines[1]).toContain("100.00");
    expect(lines[1]).toContain("166.67");
    expect(lines[1]).toContain("5"); // stock
  });

  it("quotes item names containing commas", () => {
    const state = { ...defaultState(), itemName: "Flan, 12-pc box" };
    const csv = catalogToCSV([newCatalogItem(state)]);
    expect(csv).toContain('"Flan, 12-pc box"');
  });
});
