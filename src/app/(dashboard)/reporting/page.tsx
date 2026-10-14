"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, itemSalesTotals, type CatalogItem, type SaleEntry } from "@/lib/catalog";
import { pesoSigned } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

export default function ReportingPage() {
  const { lang, t } = useLanguage();
  const [catalog, , hydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);

  if (!hydrated) {
    return <PageSkeleton />;
  }

  const allSales = catalog.flatMap((item) =>
    item.sales.map((s) => ({ ...s, item }))
  );

  const totals = allSales.reduce(
    (acc, s) => {
      acc.units += s.quantity;
      acc.revenue += s.unitPrice * s.quantity;
      acc.cost += s.unitCost * s.quantity;
      return acc;
    },
    { units: 0, revenue: 0, cost: 0 }
  );
  const profit = totals.revenue - totals.cost;

  const perItem = catalog
    .map((item) => ({ item, ...itemSalesTotals(item) }))
    .filter((r) => r.units > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const recent: (SaleEntry & { item: CatalogItem })[] = allSales
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "reporting")!).name;
  const inventoryName = getModuleText(lang, MODULES.find((m) => m.slug === "inventory")!).name;

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">
        {t("reporting.description1")}
        <Link href="/inventory" className="text-accent hover:text-accent-strong font-medium">
          {inventoryName}
        </Link>
        {t("reporting.description2")}
      </p>

      {allSales.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("reporting.noSales1")}
          <Link href="/inventory" className="text-accent hover:text-accent-strong font-medium">
            {inventoryName}
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="text-sm text-text-muted">{t("reporting.unitsSold")}</p>
              <p className="font-num text-2xl font-semibold mt-2">{totals.units.toLocaleString("en-PH")}</p>
            </div>
            <div className="rounded-2xl bg-accent text-accent-ink p-5 shadow-sm">
              <p className="text-sm text-accent-ink/80">{t("reporting.totalProfit")}</p>
              <p className="font-num text-3xl font-bold mt-2">{pesoSigned(profit)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-text-muted">{t("reporting.totalRevenue")}</p>
              <p className="font-num text-2xl font-semibold mt-2">{pesoSigned(totals.revenue)}</p>
            </div>
          </div>

          <p className="mt-8 mb-3 text-sm text-text-muted">{t("reporting.byItem")}</p>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="font-medium px-5 py-3">{t("common.item")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("reporting.unitsSold")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("common.revenue")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("common.profit")}</th>
                </tr>
              </thead>
              <tbody>
                {perItem.map(({ item, units, revenue, profit }) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/costing?id=${item.id}`} className="font-medium hover:text-accent transition-colors">
                        {item.state.itemName || t("common.untitled")}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right font-num">{units}</td>
                    <td className="px-5 py-3 text-right font-num">{pesoSigned(revenue)}</td>
                    <td className="px-5 py-3 text-right font-num font-medium">{pesoSigned(profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 mb-3 text-sm text-text-muted">{t("reporting.recentSales")}</p>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="font-medium px-5 py-3">{t("common.date")}</th>
                  <th className="font-medium px-5 py-3">{t("common.item")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("common.qty")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("common.revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-text-muted">{dateFmt(s.date)}</td>
                    <td className="px-5 py-3">{s.item.state.itemName || t("common.untitled")}</td>
                    <td className="px-5 py-3 text-right font-num">{s.quantity}</td>
                    <td className="px-5 py-3 text-right font-num">{pesoSigned(s.unitPrice * s.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
