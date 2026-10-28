/**
 * Operating expenses (rent, salaries, utilities, etc.) are a property
 * of the business, not of any one product — so unlike `CostItem` (which
 * lives inside a specific `CalculatorState`), OPEX is its own shared
 * store, entered once and read by every break-even calculation
 * regardless of which item is being priced. Same pattern as the
 * Ingredient Library (`src/lib/ingredients.ts`): a single list, not
 * duplicated per item.
 */
export const OPEX_CATEGORIES = ["rent", "utilities", "labor", "marketing", "software", "other"] as const;
export type OpexCategory = (typeof OPEX_CATEGORIES)[number];

export interface OpexItem {
  id: string;
  label: string;
  amountPerMonth: number;
  /** Optional — items saved before categories existed read as "other". */
  category?: OpexCategory;
}

export function totalsByCategory(items: OpexItem[]): Record<OpexCategory, number> {
  const totals = Object.fromEntries(OPEX_CATEGORIES.map((c) => [c, 0])) as Record<OpexCategory, number>;
  for (const item of items) {
    totals[item.category ?? "other"] += Number.isFinite(item.amountPerMonth) ? item.amountPerMonth : 0;
  }
  return totals;
}

/** Monthly overhead each dish has to carry — the reference's "OpEx / Dish." Zero until a sales volume is entered, rather than dividing by a made-up default. */
export function overheadPerDish(monthlyOpex: number, monthlyDishSales: number): number {
  return monthlyDishSales > 0 ? monthlyOpex / monthlyDishSales : 0;
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
  /** Estimated dishes sold per month, shared by OPEX allocation, Dashboard, and the Margin & POS Simulator's default. */
  monthlyDishSales?: number;
}

export const OPEX_STORAGE_KEY = "calcost:v0:opex";

export function defaultOpexSettings(): OpexSettings {
  return { items: [newOpexItem()], contingencyPercent: 0 };
}
