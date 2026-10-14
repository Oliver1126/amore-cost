"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { peso } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

export default function HistoryPage() {
  const { lang, t } = useLanguage();
  const [catalog, , hydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);

  if (!hydrated) {
    return <PageSkeleton />;
  }

  const withHistory = catalog.filter((c) => c.history.length > 1);
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "history")!).name;
  const catalogName = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("history.description")}</p>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {lang === "tl" ? "Wala pa sa iyong " : "Nothing in your "}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {catalogName}
          </Link>{" "}
          {lang === "tl" ? "." : "yet."}
        </div>
      ) : withHistory.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">{t("history.noSnapshots")}</div>
      ) : (
        <div className="mt-6 space-y-4">
          {withHistory.map((item) => {
            const entries = [...item.history].reverse();
            const first = item.history[0];
            const last = item.history[item.history.length - 1];
            const trendUp = last.marginPercent >= first.marginPercent;
            return (
              <div key={item.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/costing?id=${item.id}`}
                    className="font-medium hover:text-accent transition-colors"
                  >
                    {item.state.itemName || t("common.untitled")}
                  </Link>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      trendUp ? "bg-accent-soft text-accent-strong" : "bg-bad-soft text-bad"
                    }`}
                  >
                    {t("history.marginWord")} {trendUp ? "↑" : "↓"} {first.marginPercent.toFixed(1)}% → {last.marginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-3">
                  <Sparkline values={item.history.map((h) => h.marginPercent)} />
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-text-muted border-b border-border">
                        <th className="font-medium py-2 pr-4">{t("common.date")}</th>
                        <th className="font-medium py-2 pr-4 text-right">{t("history.trueCost")}</th>
                        <th className="font-medium py-2 pr-4 text-right">{t("common.price")}</th>
                        <th className="font-medium py-2 text-right">{t("history.marginHeader")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.slice(0, 8).map((snap, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="py-2 pr-4 text-text-muted">{dateFmt(snap.savedAt)}</td>
                          <td className="py-2 pr-4 text-right font-num">₱{peso(snap.cost)}</td>
                          <td className="py-2 pr-4 text-right font-num">₱{peso(snap.price)}</td>
                          <td className="py-2 text-right font-num">{snap.marginPercent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
