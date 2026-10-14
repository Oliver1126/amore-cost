"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, marginStatus, upsert, type CatalogItem } from "@/lib/catalog";
import { computePriceBreakdown } from "@/lib/calculator";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

export default function AlertsPage() {
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, hydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );

  if (!hydrated) {
    return <PageSkeleton />;
  }

  function setTarget(item: CatalogItem, value: number) {
    setCatalog(
      upsert(catalog, { ...item, targetMarginPercent: Math.max(0, value), updatedAt: new Date().toISOString() })
    );
  }

  const withMargin = catalog.map((item) => ({
    item,
    margin: computePriceBreakdown(item.state).marginPercent,
  }));
  const below = withMargin.filter(
    ({ item, margin }) => marginStatus(margin, item.targetMarginPercent) === "belowTarget"
  );
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "alerts")!).name;
  const catalogName = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("alerts.description")}</p>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("common.saveItemFirstPrefix")}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {catalogName}
          </Link>
          {t("common.saveItemFirstSuffix")}
        </div>
      ) : (
        <>
          {below.length > 0 && (
            <div className="mt-6 rounded-xl border border-bad bg-bad-soft px-4 py-3 text-sm text-bad max-w-2xl">
              {lang === "tl"
                ? `${below.length} item ang bumagsak sa target margin.`
                : `${below.length} item${below.length > 1 ? "s" : ""} below target margin.`}
            </div>
          )}
          <div className="mt-6 card overflow-hidden max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="font-medium px-5 py-3">{t("common.item")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("alerts.currentMargin")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("alerts.targetMargin")}</th>
                  <th className="font-medium px-5 py-3 text-right">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {withMargin.map(({ item, margin }) => {
                  const isBelow = marginStatus(margin, item.targetMarginPercent) === "belowTarget";
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/costing?id=${item.id}`}
                          className="font-medium hover:text-accent transition-colors"
                        >
                          {item.state.itemName || t("common.untitled")}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right font-num">{margin.toFixed(1)}%</td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          value={item.targetMarginPercent || ""}
                          onChange={(e) => setTarget(item, Number(e.target.value) || 0)}
                          aria-label={`Target margin for ${item.state.itemName}`}
                          className="font-num w-16 rounded-md border border-border bg-surface-muted px-1.5 py-1 text-right"
                        />
                        %
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isBelow ? "bg-bad-soft text-bad" : "bg-accent-soft text-accent-strong"
                          }`}
                        >
                          {isBelow ? t("alerts.belowTarget") : t("alerts.onTarget")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
