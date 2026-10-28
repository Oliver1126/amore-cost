import { SENIOR_PWD_DISCOUNT_PERCENT } from "./calculator";

export type PricingModel = "inclusive" | "exclusive";

export interface ReceiptLine {
  id: string;
  name: string;
  quantity: number;
  /** VAT-exclusive selling price per portion — the model decides whether the menu shows it with VAT folded in or added on top. */
  unitNetPrice: number;
  /** Direct (variable) cost per portion — see `directCost` in calculator.ts. */
  unitCost: number;
}

export interface ReceiptSettings {
  pricingModel: PricingModel;
  vatRate: number;
  serviceChargePercent: number;
  seniorPwd: boolean;
}

export interface ReceiptResult {
  /** What the menu prices add up to, as the customer sees them (VAT-inclusive under the inclusive model). */
  subtotal: number;
  /** VAT-exclusive gross sales — the base every PH discount and VAT figure is computed from. */
  netSales: number;
  discount: number;
  vatableSales: number;
  vatExemptSales: number;
  vat: number;
  serviceCharge: number;
  totalDue: number;
  directCost: number;
  /** Revenue the business actually keeps: net of VAT (remitted) and service charge (goes to staff under RA 11360). */
  netRevenue: number;
  foodCostPercent: number;
  netProfit: number;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/**
 * A simulated PH official receipt. Senior Citizen/PWD (RA 9994/10754)
 * gets 20% off the VAT-exclusive price and is VAT-exempt — the same rule
 * `seniorPwdPrice()` already applies on Costing — so under the inclusive
 * model VAT is stripped out first, never discounted on top of.
 */
export function simulateReceipt(lines: ReceiptLine[], settings: ReceiptSettings): ReceiptResult {
  const rate = Math.max(0, finite(settings.vatRate)) / 100;
  const scRate = Math.max(0, finite(settings.serviceChargePercent)) / 100;

  const netSales = lines.reduce((sum, l) => sum + finite(l.unitNetPrice) * Math.max(0, finite(l.quantity)), 0);
  const directCost = lines.reduce((sum, l) => sum + finite(l.unitCost) * Math.max(0, finite(l.quantity)), 0);
  const subtotal = settings.pricingModel === "inclusive" ? netSales * (1 + rate) : netSales;

  const discount = settings.seniorPwd ? netSales * (SENIOR_PWD_DISCOUNT_PERCENT / 100) : 0;
  const discountedNet = netSales - discount;
  const vatableSales = settings.seniorPwd ? 0 : netSales;
  const vatExemptSales = settings.seniorPwd ? discountedNet : 0;
  const vat = vatableSales * rate;
  const serviceCharge = discountedNet * scRate;

  return {
    subtotal,
    netSales,
    discount,
    vatableSales,
    vatExemptSales,
    vat,
    serviceCharge,
    totalDue: discountedNet + vat + serviceCharge,
    directCost,
    netRevenue: discountedNet,
    foodCostPercent: discountedNet > 0 ? (directCost / discountedNet) * 100 : 0,
    netProfit: discountedNet - directCost,
  };
}
