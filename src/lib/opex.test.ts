import { describe, expect, it } from "vitest";
import { newOpexItem, totalOpex, opexWithContingency, totalsByCategory, overheadPerDish } from "./opex";

describe("totalOpex / opexWithContingency", () => {
  it("sums every opex item's monthly amount", () => {
    const items = [
      { ...newOpexItem("Rent"), amountPerMonth: 10000 },
      { ...newOpexItem("Utilities"), amountPerMonth: 3000 },
    ];
    expect(totalOpex(items)).toBe(13000);
  });

  it("ignores non-finite amounts defensively", () => {
    const items = [
      { ...newOpexItem("Bad"), amountPerMonth: NaN },
      { ...newOpexItem("Good"), amountPerMonth: 500 },
    ];
    expect(totalOpex(items)).toBe(500);
  });

  it("adds a percentage contingency buffer on top of the raw total", () => {
    const items = [{ ...newOpexItem("Rent"), amountPerMonth: 10000 }];
    expect(opexWithContingency(items, 10)).toBe(11000);
  });

  it("treats zero or missing contingency as no buffer", () => {
    const items = [{ ...newOpexItem("Rent"), amountPerMonth: 10000 }];
    expect(opexWithContingency(items, 0)).toBe(10000);
  });
});

describe("totalsByCategory", () => {
  it("sums by category and reads uncategorized items as other", () => {
    const totals = totalsByCategory([
      { id: "a", label: "Rent", amountPerMonth: 8000, category: "rent" },
      { id: "b", label: "Old item", amountPerMonth: 500 },
      { id: "c", label: "Canva", amountPerMonth: 300, category: "software" },
    ]);
    expect(totals.rent).toBe(8000);
    expect(totals.other).toBe(500);
    expect(totals.software).toBe(300);
    expect(totals.labor).toBe(0);
  });
});

describe("overheadPerDish", () => {
  it("divides monthly OPEX across dishes sold", () => {
    expect(overheadPerDish(20000, 1000)).toBe(20);
  });
  it("is zero until a sales volume is entered", () => {
    expect(overheadPerDish(20000, 0)).toBe(0);
  });
});
