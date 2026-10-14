import { describe, expect, it } from "vitest";
import { peso, pesoSigned } from "./format";

describe("peso", () => {
  it("always shows exactly 2 decimal places", () => {
    expect(peso(5)).toBe("5.00");
    expect(peso(5.5)).toBe("5.50");
    expect(peso(5.999)).toBe("6.00");
  });

  it("groups thousands", () => {
    expect(peso(1234567)).toBe("1,234,567.00");
  });
});

describe("pesoSigned", () => {
  it("puts the minus sign before the peso sign for a negative amount", () => {
    expect(pesoSigned(-333.33)).toBe("-₱333.33");
  });

  it("formats a positive amount the same as a plain peso string", () => {
    expect(pesoSigned(333.33)).toBe("₱333.33");
  });

  it("normalizes negative zero to a plain zero", () => {
    expect(pesoSigned(-0)).toBe("₱0.00");
  });
});
