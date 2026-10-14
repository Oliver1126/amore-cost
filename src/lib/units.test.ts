import { describe, expect, it } from "vitest";
import { areUnitsConvertible, convertQuantity } from "./units";

describe("convertQuantity", () => {
  it("converts within the mass category", () => {
    expect(convertQuantity(500, "g", "kg")).toBeCloseTo(0.5, 6);
    expect(convertQuantity(0.5, "kg", "g")).toBeCloseTo(500, 6);
  });

  it("converts within the volume category", () => {
    expect(convertQuantity(250, "mL", "L")).toBeCloseTo(0.25, 6);
  });

  it("converts within the count category", () => {
    expect(convertQuantity(2, "dozen", "pcs")).toBe(24);
    expect(convertQuantity(24, "pcs", "dozen")).toBe(2);
  });

  it("is a no-op when units are identical", () => {
    expect(convertQuantity(7, "kg", "kg")).toBe(7);
  });

  it("returns null across categories (mass vs count)", () => {
    expect(convertQuantity(1, "kg", "pcs")).toBeNull();
  });

  it("returns null for an unrecognized unit like 'pack' or 'box'", () => {
    expect(convertQuantity(1, "pack", "box")).toBeNull();
    expect(convertQuantity(1, "kg", "pack")).toBeNull();
  });
});

describe("areUnitsConvertible", () => {
  it("is true within a category, false across or for unknown units", () => {
    expect(areUnitsConvertible("g", "kg")).toBe(true);
    expect(areUnitsConvertible("g", "mL")).toBe(false);
    expect(areUnitsConvertible("pack", "box")).toBe(false);
  });
});
