import { describe, expect, it } from "vitest";
import { newOpexItem, totalOpex, opexWithContingency } from "./opex";

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
