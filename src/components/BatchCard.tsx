"use client";

import type { CalculatorState } from "@/lib/calculator";
import { computeBatchTotals, computePriceBreakdown } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { InfoButton } from "./InfoButton";

export function BatchCard({
  state,
  onChange,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
}) {
  const { t } = useLanguage();
  const totals = computeBatchTotals(computePriceBreakdown(state), state.batchSize);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-text-muted">{t("batch.size")}</p>
          <InfoButton label={t("batch.whatsThis")}>{t("batch.note")}</InfoButton>
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={state.batchSize || ""}
          onChange={(e) => onChange({ ...state, batchSize: Math.max(1, Number(e.target.value) || 1) })}
          placeholder="1"
          aria-label="Servings — number of servings this recipe makes"
          className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
        />
      </div>
      {totals.batchSize > 1 && (
        <dl className="mt-3 space-y-1.5 text-sm font-num">
          <div className="flex justify-between">
            <dt className="text-text-muted">
              {t("batch.totalCostPrefix")}
              {totals.batchSize}
              {t("batch.totalCostSuffix")}
            </dt>
            <dd className="text-warn font-medium">₱{peso(totals.totalCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">{t("batch.totalRevenue")}</dt>
            <dd className="text-accent-strong font-medium">₱{peso(totals.totalRevenue)}</dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>{t("batch.totalProfit")}</dt>
            <dd className="text-info">₱{peso(totals.totalProfit)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
