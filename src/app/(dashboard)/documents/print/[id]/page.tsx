"use client";

import { use } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { computePriceBreakdown } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { BrandMark } from "@/components/BrandMark";
import { useLanguage, getTaxPresetLabel } from "@/lib/i18n";

export default function PrintQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang, t } = useLanguage();
  const [catalog, , hydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);

  if (!hydrated) return null;

  const item = catalog.find((c) => c.id === id);
  if (!item) {
    return <p className="text-text-muted text-sm">{t("print.itemGone")}</p>;
  }

  const b = computePriceBreakdown(item.state);
  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 print:p-0">
      <div className="flex justify-end mb-6 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
        >
          {t("print.button")}
        </button>
      </div>

      <div className="border border-border rounded-2xl p-8 print:border-0 print:p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <BrandMark size={32} />
            </div>
            <span className="font-display text-lg">Amore Cost</span>
          </div>
          <div className="text-right text-sm text-text-muted">
            <p>{t("print.quotation")}</p>
            <p>{today}</p>
          </div>
        </div>

        <h1 className="font-display text-xl mt-8">{item.state.itemName || t("print.untitled")}</h1>

        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="text-left text-text-muted border-b border-border">
              <th className="font-medium py-2">{t("print.description")}</th>
              <th className="font-medium py-2 text-right">{t("print.amount")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3">{item.state.itemName || t("print.item")}</td>
              <td className="py-3 text-right font-num">₱{peso(b.priceBeforeTax)}</td>
            </tr>
            {b.taxRate > 0 && (
              <tr className="border-b border-border">
                <td className="py-3 text-text-muted">
                  {getTaxPresetLabel(lang, item.state.tax.preset, b.taxLabel)} ({b.taxRate}%)
                </td>
                <td className="py-3 text-right font-num">₱{peso(b.taxAmount)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 font-medium">{t("print.total")}</td>
              <td className="py-3 text-right font-num font-bold text-lg">
                ₱{peso(b.priceCustomerPays)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-text-muted mt-10">{t("print.footer")}</p>
      </div>
    </div>
  );
}
