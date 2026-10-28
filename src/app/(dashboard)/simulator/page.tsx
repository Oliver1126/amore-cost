"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { computePriceBreakdown, directCost, FOOD_COST_TARGET } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { OPEX_STORAGE_KEY, defaultOpexSettings, opexWithContingency, type OpexSettings } from "@/lib/opex";
import { simulateMargin } from "@/lib/simulator";
import { peso, pesoSigned } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { InfoButton } from "@/components/InfoButton";
import { MODULES } from "@/lib/modules";

const inputClass =
  "rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm focus:outline-none focus:border-accent";

export default function MarginSimulatorPage() {
  const { lang, t } = useLanguage();
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [opex, , opexHydrated] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);
  const [selectedId, setSelectedId] = useState("");
  // null = "follow the recipe's own suggested price / the OPEX page's sales estimate" until the user types something.
  const [priceOverride, setPriceOverride] = useState<number | null>(null);
  const [portionsOverride, setPortionsOverride] = useState<number | null>(null);
  const [opexShare, setOpexShare] = useState(100);

  if (!catalogHydrated || !opexHydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "simulator")!).name;
  const inputName = getModuleText(lang, MODULES.find((m) => m.slug === "input")!).name;
  const opexName = getModuleText(lang, MODULES.find((m) => m.slug === "opex")!).name;

  const item = catalog.find((c) => c.id === selectedId) ?? catalog[0];
  const suggested = item ? computePriceBreakdown(item.state).priceBeforeTax : 0;
  const price = priceOverride ?? suggested;
  const portions = portionsOverride ?? opex.monthlyDishSales ?? 0;
  const monthlyOpex = opexWithContingency(opex.items, opex.contingencyPercent) * (opexShare / 100);
  const r = simulateMargin({ unitCost: item ? directCost(item.state) : 0, sellingPrice: price, monthlyPortions: portions, monthlyOpex });

  // Horizontal waterfall: every bar is placed on one shared scale running
  // from the lowest point (a loss, if any) up to revenue.
  const lo = Math.min(0, r.netProfit);
  const hi = Math.max(r.revenue, 1);
  const span = hi - lo;
  const bar = (from: number, to: number) => {
    const a = Math.min(from, to);
    const b = Math.max(from, to);
    return { left: `${((a - lo) / span) * 100}%`, width: `${Math.max(((b - a) / span) * 100, 0.5)}%` };
  };
  const steps = [
    { label: t("sim.revenue"), value: r.revenue, style: bar(0, r.revenue), color: "bg-accent" },
    { label: t("sim.directCost"), value: -r.ingredientCost, style: bar(r.grossProfit, r.revenue), color: "bg-warn" },
    { label: t("sim.grossProfit"), value: r.grossProfit, style: bar(0, r.grossProfit), color: r.grossProfit < 0 ? "bg-bad" : "bg-info" },
    { label: t("sim.opex"), value: -r.opex, style: bar(r.netProfit, r.grossProfit), color: "bg-warn/60" },
    { label: t("sim.netProfit"), value: r.netProfit, style: bar(0, r.netProfit), color: r.netProfit < 0 ? "bg-bad" : "bg-info" },
  ];

  const onTrack = r.breakEvenPortions !== null && portions >= r.breakEvenPortions;
  const fcHigh = r.foodCostPercent > FOOD_COST_TARGET.max;

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("sim.description")}</p>

      {!item ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("receipt.emptyPrefix")}
          <Link href="/input" className="text-accent hover:text-accent-strong font-medium">
            {inputName}
          </Link>
          {t("receipt.emptySuffix")}
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[22rem_1fr] gap-6 items-start">
          <div className="card p-5 space-y-4">
            <label className="block">
              <span className="text-sm text-text-muted">{t("sim.recipe")}</span>
              <select
                value={item.id}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setPriceOverride(null);
                }}
                className={`${inputClass} mt-1 w-full`}
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.state.itemName || t("common.untitled")}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="sim-price" className="text-sm text-text-muted">
                  {t("sim.price")}
                </label>
                {priceOverride !== null && (
                  <button type="button" onClick={() => setPriceOverride(null)} className="text-xs text-accent hover:text-accent-strong">
                    {t("sim.resetSuggested")}
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₱</span>
                <input
                  id="sim-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={price ? Number(price.toFixed(2)) : ""}
                  onChange={(e) => setPriceOverride(Math.max(0, Number(e.target.value) || 0))}
                  className={`${inputClass} font-num w-full pl-7 text-right`}
                />
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(Math.ceil(suggested * 2), 10)}
                step={1}
                value={price}
                onChange={(e) => setPriceOverride(Number(e.target.value))}
                aria-label={t("sim.price")}
                className="mt-2 w-full accent-[var(--accent)]"
              />
              <p className="text-xs text-text-muted">
                {t("sim.suggestedIs")} ₱{peso(suggested)} · {t("sim.beforeVat")}
              </p>
            </div>

            <label className="block">
              <span className="text-sm text-text-muted">{t("sim.portions")}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={portions || ""}
                placeholder="0"
                onChange={(e) => setPortionsOverride(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className={`${inputClass} font-num mt-1 w-full text-right`}
              />
            </label>

            <div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="sim-share" className="text-sm text-text-muted">
                  {t("sim.opexShare")}
                </label>
                <InfoButton label={t("sim.opexShareWhat")}>{t("sim.opexShareHelp")}</InfoButton>
              </div>
              <div className="relative mt-1">
                <input
                  id="sim-share"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  value={opexShare}
                  onChange={(e) => setOpexShare(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className={`${inputClass} font-num w-full pr-7 text-right`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                ₱{peso(monthlyOpex)} / {t("sim.month")} ·{" "}
                <Link href="/opex" className="text-accent hover:text-accent-strong">
                  {opexName}
                </Link>
              </p>
            </div>
          </div>

          <div className="space-y-6 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-4">
                <p className="text-xs text-text-muted">{t("input.foodCost")}</p>
                <p className={`font-num text-xl font-semibold mt-1 ${fcHigh ? "text-bad" : ""}`}>{r.foodCostPercent.toFixed(1)}%</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("sim.target")} {FOOD_COST_TARGET.min}–{FOOD_COST_TARGET.max}%
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-text-muted">{t("sim.grossMargin")}</p>
                <p className="font-num text-xl font-semibold mt-1 text-info">{r.grossMarginPercent.toFixed(1)}%</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-text-muted">{t("sim.netMargin")}</p>
                <p className={`font-num text-xl font-semibold mt-1 ${r.netProfit < 0 ? "text-bad" : "text-info"}`}>
                  {r.netMarginPercent.toFixed(1)}%
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-text-muted">{t("sim.breakEven")}</p>
                <p className="font-num text-xl font-semibold mt-1">
                  {r.breakEvenPortions === null ? "—" : r.breakEvenPortions.toLocaleString("en-PH")}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">{t("sim.portionsPerMonth")}</p>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-sm font-medium">{t("sim.waterfallTitle")}</p>
              <ul className="mt-4 space-y-3">
                {steps.map((s) => (
                  <li key={s.label} className="grid grid-cols-[7.5rem_1fr_7rem] sm:grid-cols-[9rem_1fr_8rem] items-center gap-3 text-sm">
                    <span className="text-text-muted">{s.label}</span>
                    <div className="relative h-6 rounded-md bg-surface-muted overflow-hidden">
                      <div className={`absolute top-0 h-full rounded-md ${s.color}`} style={s.style} />
                    </div>
                    <span className={`font-num text-right ${s.value < 0 ? "text-text-muted" : ""}`}>{pesoSigned(s.value)}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-5 text-sm ${r.breakEvenPortions === null ? "text-bad" : onTrack ? "text-info" : "text-bad"}`}>
                {r.breakEvenPortions === null
                  ? t("sim.verdictLoss")
                  : onTrack
                    ? `${t("sim.verdictOnTrackPrefix")} ${(portions - r.breakEvenPortions).toLocaleString("en-PH")} ${t("sim.verdictOnTrackSuffix")}`
                    : `${t("sim.verdictBehindPrefix")} ${(r.breakEvenPortions - portions).toLocaleString("en-PH")} ${t("sim.verdictBehindSuffix")}`}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {t("sim.opexPerPortion")} ₱{peso(r.opexPerPortion)} · {t("sim.contribution")} ₱{peso(r.unitContribution)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
