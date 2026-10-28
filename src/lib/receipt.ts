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
const centavos = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** The per-portion price as printed on the menu and receipt, rounded to the centavo — VAT folded in under the inclusive model. */
export function menuUnitPrice(unitNetPrice: number, settings: Pick<ReceiptSettings, "pricingModel" | "vatRate">): number {
  const rate = Math.max(0, finite(settings.vatRate)) / 100;
  const net = finite(unitNetPrice);
  return centavos(settings.pricingModel === "inclusive" ? net * (1 + rate) : net);
}

/**
 * A simulated PH official receipt. Senior Citizen/PWD (RA 9994/10754)
 * gets 20% off the VAT-exclusive price and is VAT-exempt — the same rule
 * `seniorPwdPrice()` already applies on Costing — so under the inclusive
 * model VAT is stripped out first, never discounted on top of.
 *
 * Every money figure is whole centavos, worked the way a POS does: from
 * the rounded menu price, VATable sales rounded and VAT taken as the
 * remainder, so printed lines always foot to the total exactly.
 */
export function simulateReceipt(lines: ReceiptLine[], settings: ReceiptSettings): ReceiptResult {
  const rate = Math.max(0, finite(settings.vatRate)) / 100;
  const scRate = Math.max(0, finite(settings.serviceChargePercent)) / 100;
  const inclusive = settings.pricingModel === "inclusive";

  const subtotal = centavos(
    lines.reduce((sum, l) => sum + menuUnitPrice(l.unitNetPrice, settings) * Math.max(0, finite(l.quantity)), 0)
  );
  const directCost = centavos(
    lines.reduce((sum, l) => sum + finite(l.unitCost) * Math.max(0, finite(l.quantity)), 0)
  );
  const netSales = inclusive ? centavos(subtotal / (1 + rate)) : subtotal;

  const discount = settings.seniorPwd ? centavos(netSales * (SENIOR_PWD_DISCOUNT_PERCENT / 100)) : 0;
  const discountedNet = centavos(netSales - discount);
  const vatableSales = settings.seniorPwd ? 0 : netSales;
  const vatExemptSales = settings.seniorPwd ? discountedNet : 0;
  const vat = settings.seniorPwd ? 0 : inclusive ? centavos(subtotal - netSales) : centavos(netSales * rate);
  const serviceCharge = centavos(discountedNet * scRate);

  return {
    subtotal,
    netSales,
    discount,
    vatableSales,
    vatExemptSales,
    vat,
    serviceCharge,
    totalDue: centavos(discountedNet + vat + serviceCharge),
    directCost,
    netRevenue: discountedNet,
    foodCostPercent: discountedNet > 0 ? (directCost / discountedNet) * 100 : 0,
    netProfit: centavos(discountedNet - directCost),
  };
}

/** The header printed at the top of the simulated receipt — the owner's own details, never invented ones. Every field is optional; blank ones are simply left off. */
export interface ReceiptProfile {
  businessName: string;
  address: string;
  tin: string;
}

export const RECEIPT_PROFILE_STORAGE_KEY = "calcost:v0:receipt-profile";

export function defaultReceiptProfile(): ReceiptProfile {
  return { businessName: "", address: "", tin: "" };
}
