"use client";

import type { CalculatorState, TaxPreset } from "@/lib/calculator";
import { computePriceBreakdown, TAX_PRESET_LABELS, TAX_PRESET_RATES } from "@/lib/calculator";
import { useLanguage, getTaxPresetLabel } from "@/lib/i18n";
import { InfoButton } from "./InfoButton";

const TAX_PRESETS: TaxPreset[] = ["none", "vat", "percentage", "custom"];

export function TaxCard({
  state,
  onChange,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
}) {
  const { lang, t } = useLanguage();
  const breakdown = computePriceBreakdown(state);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-text-muted">{t("taxCard.title")}</p>
        <InfoButton label={t("taxCard.whatsThis")}>
          <p>{t("taxCard.explainer")}</p>
          <p className="mt-2">
            {breakdown.taxRate > 0
              ? `${getTaxPresetLabel(lang, state.tax.preset, breakdown.taxLabel)} (${breakdown.taxRate}%) ${t("taxCard.infoWithTaxSuffix")}`
              : t("taxCard.infoNoTax")}
          </p>
        </InfoButton>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TAX_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange({ ...state, tax: { ...state.tax, preset: p } })}
            className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
              state.tax.preset === p
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {p === "custom"
              ? t("taxCard.custom")
              : `${getTaxPresetLabel(lang, p, TAX_PRESET_LABELS[p])}${TAX_PRESET_RATES[p] ? ` (${TAX_PRESET_RATES[p]}%)` : ""}`}
          </button>
        ))}
      </div>

      {state.tax.preset === "custom" && (
        <div className="mt-2 grid grid-cols-[1fr_5.5rem] gap-2">
          <input
            type="text"
            value={state.tax.customLabel}
            onChange={(e) => onChange({ ...state, tax: { ...state.tax, customLabel: e.target.value } })}
            placeholder={t("taxCard.namePlaceholder")}
            className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
          />
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={state.tax.customRate || ""}
              onChange={(e) =>
                onChange({ ...state, tax: { ...state.tax, customRate: Number(e.target.value) || 0 } })
              }
              placeholder="0"
              aria-label="Custom tax rate"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-3 pr-6 py-2 text-sm text-right focus:outline-none focus:border-accent"
            />
            <span className="font-num absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
