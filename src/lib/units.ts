/**
 * Unit conversion for cost items linked to an Ingredient Library entry.
 * Only units within the same category convert; anything else (a
 * custom unit like "pack" or "set") is left alone rather than guessed.
 */

type UnitCategory = "mass" | "volume" | "count";

const UNIT_TO_BASE: Record<string, { category: UnitCategory; toBase: number }> = {
  g: { category: "mass", toBase: 1 },
  kg: { category: "mass", toBase: 1000 },
  mL: { category: "volume", toBase: 1 },
  L: { category: "volume", toBase: 1000 },
  pcs: { category: "count", toBase: 1 },
  dozen: { category: "count", toBase: 12 },
};

export function areUnitsConvertible(a: string, b: string): boolean {
  const from = UNIT_TO_BASE[a];
  const to = UNIT_TO_BASE[b];
  return !!from && !!to && from.category === to.category;
}

/**
 * Converts a quantity from one unit to another. Returns null when the
 * units aren't both known or aren't in the same category — callers
 * should fall back to treating the quantity as already being in the
 * target unit, rather than blocking on an unrecognized unit.
 */
export function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return quantity;
  const from = UNIT_TO_BASE[fromUnit];
  const to = UNIT_TO_BASE[toUnit];
  if (!from || !to || from.category !== to.category) return null;
  return (quantity * from.toBase) / to.toBase;
}
