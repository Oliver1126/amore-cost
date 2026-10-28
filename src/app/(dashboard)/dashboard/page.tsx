"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { computePriceBreakdown, foodCostPercent, FOOD_COST_TARGET } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { INGREDIENTS_STORAGE_KEY, type Ingredient } from "@/lib/ingredients";
import {
  OPEX_STORAGE_KEY,
  defaultOpexSettings,
  opexWithContingency,
  overheadPerDish,
  type OpexSettings,
} from "@/lib/opex";
import { generateInsights } from "@/lib/insights";
import { buildBackup, downloadBackup, parseBackup, restoreBackup } from "@/lib/backup";
import { peso } from "@/lib/format";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [ingredients, , ingredientsHydrated] = useLocalStorage<Ingredient[]>(INGREDIENTS_STORAGE_KEY, () => []);
  const [opex, setOpex, opexHydrated] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);
  const backupInput = useRef<HTMLInputElement>(null);

  if (!catalogHydrated || !ingredientsHydrated || !opexHydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES[0]).name;
  const monthlyOpex = opexWithContingency(opex.items, opex.contingencyPercent);
  const dishSales = opex.monthlyDishSales ?? 0;
  const perDish = overheadPerDish(monthlyOpex, dishSales);
  const pricedRecipes = catalog.filter((c) => computePriceBreakdown(c.state).priceBeforeTax > 0);
  const avgFoodCost = pricedRecipes.length
    ? pricedRecipes.reduce((s, c) => s + foodCostPercent(c.state), 0) / pricedRecipes.length
    : 0;
  const fcInTarget = avgFoodCost >= FOOD_COST_TARGET.min && avgFoodCost <= FOOD_COST_TARGET.max;
  const featured = [...catalog].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  async function handleRestore(file: File) {
    let backup;
    try {
      backup = parseBackup(await file.text());
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("dash.restoreUnreadable"));
      return;
    }
    const msg =
      lang === "tl"
        ? `Papalitan nito ang lahat ng data mo ng backup mula ${backup.exportedAt.slice(0, 10)}. Hindi na ito puwedeng bawiin. Magpatuloy?`
        : `This replaces all your data with the backup from ${backup.exportedAt.slice(0, 10)}. This can't be undone. Continue?`;
    if (!window.confirm(msg)) return;
    restoreBackup(backup);
    window.location.reload();
  }

  const kpis = [
    { label: t("dash.activeRecipes"), value: catalog.length.toLocaleString("en-PH"), href: "/input" },
    { label: t("dash.monthlyOpex"), value: `₱${peso(monthlyOpex)}`, href: "/opex", tone: "text-warn" },
    {
      label: t("dash.avgFoodCost"),
      value: `${avgFoodCost.toFixed(1)}%`,
      note: `${t("dash.industryTarget")} ${FOOD_COST_TARGET.min.toFixed(1)}% – ${FOOD_COST_TARGET.max.toFixed(1)}%`,
      tone: pricedRecipes.length === 0 ? "" : fcInTarget || avgFoodCost < FOOD_COST_TARGET.min ? "text-info" : "text-bad",
    },
    { label: t("dash.ingredients"), value: ingredients.length.toLocaleString("en-PH"), href: "/input" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted">{t("dash.subtitle")}</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const body = (
            <>
              <p className="text-sm text-text-muted">{k.label}</p>
              <p className={`font-num text-2xl font-semibold mt-2 ${k.tone ?? ""}`}>{k.value}</p>
              {k.note && <p className="text-[11px] text-text-muted mt-1">{k.note}</p>}
            </>
          );
          return k.href ? (
            <Link key={k.label} href={k.href} className="card p-5 hover:border-accent transition-colors">
              {body}
            </Link>
          ) : (
            <div key={k.label} className="card p-5">
              {body}
            </div>
          );
        })}
      </div>

      {catalog.length > 0 && (
        <div className="mt-6">
          <InsightsPanel insights={generateInsights(catalog, lang)} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start">
        <div className="card p-5 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{t("dash.featuredTitle")}</p>
            <Link href="/input" className="text-sm font-medium text-accent hover:text-accent-strong">
              {t("dash.viewAll")}
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-text-muted">{t("input.emptyBody")}</p>
              <Link
                href="/input"
                className="mt-4 inline-block rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
              >
                {t("catalog.newItem")}
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="font-medium py-2 pr-3">{t("common.item")}</th>
                    <th className="font-medium py-2 pr-3 text-right">{t("batch.size")}</th>
                    <th className="font-medium py-2 pr-3 text-right">{t("input.costPerServing")}</th>
                    <th className="font-medium py-2 pr-3 text-right">{t("stats.suggestedPrice")}</th>
                    <th className="font-medium py-2 pr-3 text-right">{t("input.foodCost")}</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {featured.map((c) => {
                    const b = computePriceBreakdown(c.state);
                    const fc = foodCostPercent(c.state);
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3 font-medium">{c.state.itemName || t("common.untitled")}</td>
                        <td className="py-2.5 pr-3 text-right font-num">{c.state.batchSize}</td>
                        <td className="py-2.5 pr-3 text-right font-num text-warn">₱{peso(b.cost)}</td>
                        <td className="py-2.5 pr-3 text-right font-num">₱{peso(b.priceCustomerPays)}</td>
                        <td className={`py-2.5 pr-3 text-right font-num ${fc > FOOD_COST_TARGET.max ? "text-bad" : ""}`}>
                          {fc.toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-right">
                          <Link href={`/input?edit=${c.id}`} className="text-accent hover:text-accent-strong font-medium">
                            {t("dash.edit")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <p className="text-sm font-medium">{t("opex.allocationTitle")}</p>
            <label htmlFor="dash-sales" className="block mt-3 text-xs text-text-muted">
              {t("opex.estimatedSales")}
            </label>
            <input
              id="dash-sales"
              type="number"
              inputMode="numeric"
              min={0}
              value={dishSales || ""}
              placeholder="1000"
              onChange={(e) => setOpex({ ...opex, monthlyDishSales: Math.max(0, Number(e.target.value) || 0) })}
              className="font-num mt-1 w-full rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-right focus:outline-none focus:border-accent"
            />
            <p className="mt-3 text-sm">
              {t("opex.perDishLine")} <span className="font-num font-semibold text-accent-strong">₱{peso(perDish)}</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              ₱{peso(monthlyOpex)} ÷ {dishSales.toLocaleString("en-PH")}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-sm font-medium">{t("dash.backupTitle")}</p>
            <p className="mt-1 text-xs text-text-muted">{t("dash.backupDesc")}</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => downloadBackup(buildBackup())}
                className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:border-accent transition-colors"
              >
                {t("documents.downloadBackup")}
              </button>
              <button
                type="button"
                onClick={() => backupInput.current?.click()}
                className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:border-accent transition-colors"
              >
                {t("documents.restoreBackup")}
              </button>
              <input
                ref={backupInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleRestore(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
