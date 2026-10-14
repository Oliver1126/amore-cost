/**
 * Operating expenses (rent, salaries, utilities, etc.) are a property
 * of the business, not of any one product — so unlike `CostItem` (which
 * lives inside a specific `CalculatorState`), OPEX is its own shared
 * store, entered once and read by every break-even calculation
 * regardless of which item is being priced. Same pattern as the
 * Ingredient Library (`src/lib/ingredients.ts`): a single list, not
 * duplicated per item.
 */
export interface OpexItem {
  id: string;
  label: string;
  amountPerMonth: number;
}

export function newOpexItem(label = ""): OpexItem {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `opex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    amountPerMonth: 0,
  };
}

export function totalOpex(items: OpexItem[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.amountPerMonth) ? item.amountPerMonth : 0), 0);
}

/** Total OPEX plus a contingency buffer (a % safety margin for unexpected costs) — this, not the raw OPEX total, is what should actually be covered by break-even. */
export function opexWithContingency(items: OpexItem[], contingencyPercent: number): number {
  const base = totalOpex(items);
  const pct = Number.isFinite(contingencyPercent) ? contingencyPercent : 0;
  return base * (1 + pct / 100);
}

export interface OpexSettings {
  items: OpexItem[];
  contingencyPercent: number;
}

export const OPEX_STORAGE_KEY = "calcost:v0:opex";

export function defaultOpexSettings(): OpexSettings {
  return { items: [newOpexItem()], contingencyPercent: 0 };
}
