import type { CalculatorState } from "@/lib/calculator";
import {
  computeBatchTotals,
  computePriceBreakdown,
  foodCostPercent,
  laborCost,
  materialsCost,
  FOOD_COST_TARGET,
  PRICE_ROUNDINGS,
  type PriceRounding,
} from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage, getTaxPresetLabel } from "@/lib/i18n";
import { InfoButton } from "./InfoButton";

const SEGMENTS = [
  { key: "materials", labelKey: "costComp.materials", color: "bg-warn" },
  { key: "labor", labelKey: "costComp.labor", color: "bg-info" },
  { key: "packaging", labelKey: "costComp.packaging", color: "bg-accent" },
  { key: "overhead", labelKey: "costComp.overhead", color: "bg-text-muted" },
] as const;

/**
 * The live price panel beside the ingredient list in Edit & Breakdown
 * (decision 0042) — replaces the three large StatCards, the Cost
 * composition card and the Batch card with one slim, sticky column, so
 * the price stays in view while ingredients are edited.
 */
export function PriceSummary({ state, onChange }: { state: CalculatorState; onChange: (next: CalculatorState) => void }) {
  const { lang, t } = useLanguage();
  const b = computePriceBreakdown(state);
  const fc = foodCostPercent(state);
  const fcStatus = fc <= 0 ? "none" : fc > FOOD_COST_TARGET.max ? "high" : fc < FOOD_COST_TARGET.min ? "low" : "ok";
  const isLoss = b.profitPerUnit < 0;
  const totals = computeBatchTotals(b, state.batchSize);

  const values = {
    materials: materialsCost(state.costItems),
    labor: laborCost(state),
    packaging: state.packaging,
    overhead: state.overhead,
  };
  const total = values.materials + values.labor + values.packaging + values.overhead;

  const fcColor = fcStatus === "high" ? "text-bad" : fcStatus === "ok" ? "text-accent-strong" : "text-text";
  // Meter spans 0–60% food cost; the shaded band marks the healthy target.
  const meterMax = 60;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-accent text-accent-ink p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-accent-ink/80">{t("stats.suggestedPrice")}</p>
          <select
            value={state.priceRounding ?? "none"}
            onChange={(e) => onChange({ ...state, priceRounding: e.target.value as PriceRounding })}
            aria-label={t("stats.roundingLabel")}
            className="rounded-lg bg-accent-ink/15 text-accent-ink text-[11px] font-medium px-1.5 py-1 border-0 focus:outline-none cursor-pointer [&>option]:text-text [&>option]:bg-surface"
          >
            {PRICE_ROUNDINGS.map((r) => (
              <option key={r} value={r}>
                {t(`stats.round.${r}` as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>
        </div>
        <p className="font-num text-[2rem] leading-tight font-bold mt-1">₱{peso(b.priceCustomerPays)}</p>
        <p className="text-[11px] text-accent-ink/75">
          {b.taxRate > 0
            ? `${t("stats.includesTax")} ${getTaxPresetLabel(lang, state.tax.preset, b.taxLabel)} (${b.taxRate}%)`
            : t("stats.noTaxAdded")}
          {b.priceCustomerPays !== b.unroundedPriceCustomerPays && (
            <span className="font-num"> · {t("stats.roundedFrom")} ₱{peso(b.unroundedPriceCustomerPays)}</span>
          )}
        </p>
        <div className="mt-3 pt-2 border-t border-accent-ink/20 flex items-baseline justify-between gap-2 text-xs">
          <span className="text-accent-ink/80">Senior / PWD</span>
          <span className="font-num font-semibold">₱{peso(b.seniorPwdPrice)}</span>
        </div>
      </div>

      <dl className="card p-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-text-muted">{t("input.costPerServing")}</dt>
          <dd className="font-num font-semibold text-warn">₱{peso(b.cost)}</dd>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-text-muted">{t("input.foodCost")}</dt>
            <dd className={`font-num font-semibold ${fcColor}`}>
              {fc.toFixed(1)}%{fcStatus === "ok" ? " ✓" : ""}
            </dd>
          </div>
          <div className="relative mt-1.5 h-1.5 rounded-full bg-surface-muted" aria-hidden>
            <span
              className="absolute inset-y-0 bg-accent-soft"
              style={{ left: `${(FOOD_COST_TARGET.min / meterMax) * 100}%`, width: `${((FOOD_COST_TARGET.max - FOOD_COST_TARGET.min) / meterMax) * 100}%` }}
            />
            {fc > 0 && (
              <span
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${fcStatus === "high" ? "bg-bad" : fcStatus === "ok" ? "bg-accent" : "bg-text-muted"}`}
                style={{ left: `${Math.min(100, (fc / meterMax) * 100)}%` }}
              />
            )}
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            {t("editor.target")} {FOOD_COST_TARGET.min}–{FOOD_COST_TARGET.max}%
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-text-muted">{t("stats.profitPerUnit")}</dt>
          <dd className={`font-num font-semibold ${isLoss ? "text-bad" : "text-info"}`}>₱{peso(b.profitPerUnit)}</dd>
        </div>
        <p className="font-num -mt-2 text-[11px] text-text-muted text-right">
          {b.marginPercent.toFixed(1)}% {t("stats.marginSuffix")} · {b.markupPercent.toFixed(1)}% {t("stats.markupSuffix")}
        </p>

        {total > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-[11px] uppercase tracking-wider text-text-muted">{t("costComp.title")}</p>
            <div className="mt-2 h-2 rounded-full overflow-hidden flex bg-surface-muted">
              {SEGMENTS.map((s) => {
                const pct = (values[s.key] / total) * 100;
                return pct > 0 ? <span key={s.key} className={s.color} style={{ width: `${pct}%` }} /> : null;
              })}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              {SEGMENTS.filter((s) => values[s.key] > 0).map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                    {t(s.labelKey as Parameters<typeof t>[0])}
                  </span>
                  <span className="font-num">{((values[s.key] / total) * 100).toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {totals.batchSize > 1 && (
          <div className="pt-3 border-t border-border space-y-1 text-xs font-num">
            <p className="text-[11px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              {t("batch.totalCostPrefix")}
              {totals.batchSize}
              {t("batch.totalCostSuffix")}
              <InfoButton label={t("batch.whatsThis")}>{t("batch.note")}</InfoButton>
            </p>
            <div className="flex justify-between">
              <span className="text-text-muted">{t("stats.trueCost")}</span>
              <span className="text-warn font-medium">₱{peso(totals.totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t("batch.totalRevenue")}</span>
              <span className="text-accent-strong font-medium">₱{peso(totals.totalRevenue)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t("batch.totalProfit")}</span>
              <span className="text-info">₱{peso(totals.totalProfit)}</span>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}
