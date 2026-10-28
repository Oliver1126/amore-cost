export interface MarginInput {
  /** Direct (variable) cost per portion — `directCost()` in calculator.ts. */
  unitCost: number;
  /** Proposed menu price per portion, before VAT. */
  sellingPrice: number;
  monthlyPortions: number;
  /** Monthly fixed costs, contingency included — `opexWithContingency()`. */
  monthlyOpex: number;
}

export interface MarginResult {
  revenue: number;
  ingredientCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  foodCostPercent: number;
  opex: number;
  netProfit: number;
  netMarginPercent: number;
  opexPerPortion: number;
  unitContribution: number;
  /** Portions per month that cover fixed costs; null when each sale loses money, so no volume ever breaks even. */
  breakEvenPortions: number | null;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/** One dish's monthly P&L: revenue → minus direct cost → gross profit → minus OPEX → net profit. */
export function simulateMargin(input: MarginInput): MarginResult {
  const unitCost = Math.max(0, finite(input.unitCost));
  const price = Math.max(0, finite(input.sellingPrice));
  const portions = Math.max(0, finite(input.monthlyPortions));
  const opex = Math.max(0, finite(input.monthlyOpex));

  const revenue = price * portions;
  const ingredientCost = unitCost * portions;
  const grossProfit = revenue - ingredientCost;
  const netProfit = grossProfit - opex;
  const unitContribution = price - unitCost;

  return {
    revenue,
    ingredientCost,
    grossProfit,
    grossMarginPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    foodCostPercent: price > 0 ? (unitCost / price) * 100 : 0,
    opex,
    netProfit,
    netMarginPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    opexPerPortion: portions > 0 ? opex / portions : 0,
    unitContribution,
    breakEvenPortions: unitContribution > 0 ? Math.ceil(opex / unitContribution) : null,
  };
}
