import { convertQuantity } from "./units";

export const STORAGE_KEY = "calcost:v0:calculator";

/** Food-only as of decision 0038 — was `"food" | "service" | "resale"` (decision 0004). Kept as a type (not removed from `CalculatorState`) rather than deleting the field outright, since that would touch every reader of `state.vertical` for no real benefit — there's nothing left to switch on. */
export type Vertical = "food";

export interface CostItem {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  amount: number;
  /** Set when this line is linked to a shared Ingredient Library entry — label/unit/amount then follow that ingredient instead of being typed manually. */
  ingredientId?: string;
  /** Optional package-purchase breakdown for deriving a per-unit cost from how it's actually bought (e.g. a ₱1200 sack of flour + ₱50 delivery, split across 25kg). Set only when not linked to an Ingredient Library entry — when `qtyPerPack` is present, `amount` is derived from these instead of typed directly. */
  supplier?: string;
  packagePrice?: number;
  qtyPerPack?: number;
  shippingFee?: number;
  /** The unit the package itself is measured in (e.g. "kg" for a 25kg sack) — separate from `unit`, which is the portion's own unit. Only meaningful alongside `qtyPerPack`; when unset or equal to `unit`, no conversion is attempted. */
  packUnit?: string;
}

/** Per-unit cost implied by a package purchase: package price plus shipping, split across how many usable units the package contains. */
export function packageUnitCost(packagePrice: number, qtyPerPack: number, shippingFee: number): number {
  if (!qtyPerPack || qtyPerPack <= 0) return 0;
  return (packagePrice + shippingFee) / qtyPerPack;
}

/**
 * Cost contribution of a package-priced line, converting the portion
 * quantity into the pack's own unit when they differ — mirrors
 * `linkedCostAmount`'s (src/lib/ingredients.ts) convert-then-multiply
 * shape so a package-priced line can be bought in one unit (a sack in
 * kg) and used in portions of a different one (grams), the same way a
 * linked Ingredient Library entry already can. Falls back to the raw
 * quantity, unconverted, when `packUnit` is unset or the two units
 * aren't in a convertible category — same fallback rule `linkedCostAmount` uses.
 */
export function packageLineAmount(
  packagePrice: number,
  qtyPerPack: number,
  shippingFee: number,
  quantity: number,
  unit: string,
  packUnit?: string
): number {
  const unitCost = packageUnitCost(packagePrice, qtyPerPack, shippingFee);
  if (!packUnit || packUnit === unit) return unitCost * quantity;
  const converted = convertQuantity(quantity, unit, packUnit);
  return unitCost * (converted ?? quantity);
}

export const COMMON_UNITS = [
  "pcs",
  "kg",
  "g",
  "L",
  "mL",
  "pack",
  "box",
  "dozen",
  "roll",
  "meter",
  "set",
  "unit",
];

export type PricingStrategy =
  | { type: "markup"; percent: number }
  | { type: "margin"; percent: number }
  | { type: "fixedProfit"; amount: number };

export type TaxPreset = "none" | "vat" | "percentage" | "custom";

export interface TaxState {
  preset: TaxPreset;
  customLabel: string;
  customRate: number;
}

export const TAX_PRESET_RATES: Record<Exclude<TaxPreset, "custom">, number> = {
  none: 0,
  vat: 12,
  percentage: 3,
};

export const TAX_PRESET_LABELS: Record<Exclude<TaxPreset, "custom">, string> = {
  none: "No tax",
  vat: "VAT",
  percentage: "Percentage Tax",
};

export function effectiveTax(tax: TaxState): { label: string; rate: number } {
  if (tax.preset === "custom") {
    return { label: tax.customLabel.trim() || "Custom tax", rate: tax.customRate };
  }
  return { label: TAX_PRESET_LABELS[tax.preset], rate: TAX_PRESET_RATES[tax.preset] };
}

export interface CalculatorState {
  vertical: Vertical;
  itemName: string;
  costItems: CostItem[];
  laborHours: number;
  laborRate: number;
  packaging: number;
  overhead: number;
  strategy: PricingStrategy;
  tax: TaxState;
  /** How many units a "batch" produces — every per-unit cost/labor/packaging/overhead entered above is assumed to already be for one unit, so this only scales the totals shown, not the per-unit truth. */
  batchSize: number;
}

export function laborCost(state: Pick<CalculatorState, "laborHours" | "laborRate">): number {
  return state.laborHours * state.laborRate;
}

export function materialsCost(items: CostItem[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function trueCost(state: CalculatorState): number {
  return (
    materialsCost(state.costItems) +
    laborCost(state) +
    state.packaging +
    state.overhead
  );
}

/** Pre-tax selling price implied by the chosen pricing strategy. */
export function priceBeforeTax(cost: number, strategy: PricingStrategy): number {
  switch (strategy.type) {
    case "markup":
      return cost * (1 + strategy.percent / 100);
    case "margin": {
      const divisor = 1 - strategy.percent / 100;
      return divisor > 0 ? cost / divisor : Infinity;
    }
    case "fixedProfit":
      return cost + strategy.amount;
  }
}

/** The statutory discount rate under RA 9994 (Expanded Senior Citizens Act) and RA 10754 (PWD Act) — 20% off a VAT-exempt base, for a qualified purchase. */
export const SENIOR_PWD_DISCOUNT_PERCENT = 20;

/**
 * The Senior Citizen/PWD price for a qualified purchase: 20% off the
 * pre-tax price, with no tax added on top — senior/PWD sales are
 * VAT-exempt by law, so this uses the app's own pre-tax price as the
 * VAT-exempt base rather than re-deriving one per tax preset. This is
 * the standard treatment for a VAT-registered seller; if you file
 * Percentage Tax or otherwise, confirm the correct treatment with an
 * accountant — this is a general implementation, not tax advice.
 */
export function seniorPwdPrice(priceBeforeTax: number): number {
  return priceBeforeTax * (1 - SENIOR_PWD_DISCOUNT_PERCENT / 100);
}

export interface PriceBreakdown {
  cost: number;
  priceBeforeTax: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  priceCustomerPays: number;
  profitPerUnit: number;
  marginPercent: number;
  markupPercent: number;
  seniorPwdPrice: number;
}

export function computePriceBreakdown(state: CalculatorState): PriceBreakdown {
  const cost = trueCost(state);
  const pre = priceBeforeTax(cost, state.strategy);
  const { label: taxLabel, rate: taxRate } = effectiveTax(state.tax);
  const taxAmount = pre * (taxRate / 100);
  const profitPerUnit = pre - cost;

  return {
    cost,
    priceBeforeTax: pre,
    taxLabel,
    taxRate,
    taxAmount,
    priceCustomerPays: pre + taxAmount,
    profitPerUnit,
    marginPercent: pre > 0 ? (profitPerUnit / pre) * 100 : 0,
    markupPercent: cost > 0 ? (profitPerUnit / cost) * 100 : 0,
    seniorPwdPrice: seniorPwdPrice(pre),
  };
}

/**
 * The price a channel must charge to net the same per-unit profit as
 * the base price, after that channel takes its cut. E.g. a 10%
 * marketplace fee means charging more there than in person for the
 * same take-home profit.
 */
export function channelAdjustedPrice(
  breakdown: Pick<PriceBreakdown, "priceBeforeTax" | "taxRate">,
  feePercent: number
): { preFee: number; taxAmount: number; final: number } {
  const divisor = 1 - feePercent / 100;
  const preFee = divisor > 0 ? breakdown.priceBeforeTax / divisor : Infinity;
  const taxAmount = preFee * (breakdown.taxRate / 100);
  return { preFee, taxAmount, final: preFee + taxAmount };
}

export interface BreakEvenResult {
  unitsPerMonth: number;
  achievable: boolean;
}

export function computeBreakEven(monthlyOpex: number, profitPerUnit: number): BreakEvenResult {
  if (profitPerUnit <= 0) {
    return { unitsPerMonth: 0, achievable: false };
  }
  return { unitsPerMonth: Math.ceil(monthlyOpex / profitPerUnit), achievable: true };
}

export function newCostItem(label = ""): CostItem {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    quantity: 1,
    unit: "pcs",
    amount: 0,
  };
}

export const VERTICAL_LABELS: Record<
  Vertical,
  { name: string; itemNoun: string; itemPlaceholder: string; laborLabel: string }
> = {
  food: {
    name: "Food & beverage",
    itemNoun: "Ingredient",
    itemPlaceholder: "e.g. Eggs",
    laborLabel: "Prep labor",
  },
};

/** A common rule-of-thumb starting range — not a rule, just somewhere reasonable to start before adjusting for the actual market. */
export const SUGGESTED_MARGIN_RANGE: Record<Vertical, { min: number; max: number }> = {
  food: { min: 30, max: 40 },
};

/** The markup % that yields the same peso profit as a given margin % — margin divides profit by price, markup divides the same profit by cost, so the two numbers are never equal except at 0%. */
export function marginPercentToMarkupPercent(marginPercent: number): number {
  if (marginPercent >= 100) return Infinity;
  return (marginPercent / (100 - marginPercent)) * 100;
}

export function defaultState(vertical: Vertical = "food"): CalculatorState {
  return {
    vertical,
    itemName: "",
    costItems: [newCostItem()],
    laborHours: 0,
    laborRate: 0,
    packaging: 0,
    overhead: 0,
    strategy: { type: "margin", percent: 40 },
    tax: { preset: "none", customLabel: "", customRate: 0 },
    batchSize: 1,
  };
}

export interface BatchTotals {
  batchSize: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
}

export function computeBatchTotals(breakdown: PriceBreakdown, batchSize: number): BatchTotals {
  const size = Math.max(1, batchSize || 1);
  return {
    batchSize: size,
    totalCost: breakdown.cost * size,
    totalRevenue: breakdown.priceCustomerPays * size,
    totalProfit: breakdown.profitPerUnit * size,
  };
}
