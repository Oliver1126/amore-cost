"use client";

import type { CalculatorState, PricingStrategy } from "@/lib/calculator";
import { SUGGESTED_MARGIN_RANGE, marginPercentToMarkupPercent, VERTICAL_LABELS } from "@/lib/calculator";
import { useLanguage, getVerticalLabels } from "@/lib/i18n";
import { InfoButton } from "./InfoButton";

const STRATEGIES: { type: PricingStrategy["type"]; labelKey: "strategy.marginPercent" | "strategy.markupPercent" | "strategy.fixedProfit" }[] = [
  { type: "margin", labelKey: "strategy.marginPercent" },
  { type: "markup", labelKey: "strategy.markupPercent" },
  { type: "fixedProfit", labelKey: "strategy.fixedProfit" },
];

export function StrategyCard({
  state,
  onChange,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
}) {
  const { lang, t } = useLanguage();
  function setStrategyType(type: PricingStrategy["type"]) {
    if (type === state.strategy.type) return;
    const strategy: PricingStrategy =
      type === "fixedProfit" ? { type, amount: 0 } : { type, percent: 40 };
    onChange({ ...state, strategy });
  }

  function setStrategyValue(value: number) {
    if (state.strategy.type === "fixedProfit") {
      onChange({ ...state, strategy: { type: "fixedProfit", amount: value } });
    } else if (state.strategy.type === "margin") {
      // Margin price = cost / (1 - percent/100) — 100 or more sends price to
      // Infinity, which a "no tax" preset then turns into NaN downstream
      // (Infinity * 0), permanently corrupting the item's stored history.
      onChange({ ...state, strategy: { type: "margin", percent: Math.min(value, 99) } });
    } else {
      onChange({ ...state, strategy: { type: "markup", percent: value } });
    }
  }

  const description =
    state.strategy.type === "margin"
      ? t("strategy.marginDescription")
      : state.strategy.type === "markup"
        ? t("strategy.markupDescription")
        : t("strategy.fixedProfitDescription");

  const marginRange = SUGGESTED_MARGIN_RANGE[state.vertical];
  const suggestedRange =
    state.strategy.type === "markup"
      ? {
          min: Math.round(marginPercentToMarkupPercent(marginRange.min)),
          max: Math.round(marginPercentToMarkupPercent(marginRange.max)),
        }
      : marginRange;
  const suggestedMidpoint = Math.round((suggestedRange.min + suggestedRange.max) / 2);
  const verticalName = getVerticalLabels(lang, state.vertical, VERTICAL_LABELS[state.vertical]).name;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-text-muted">{t("strategy.priceUsing")}</p>
        <InfoButton label={t("strategy.whatsThis")}>{description}</InfoButton>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STRATEGIES.map((s) => (
          <button
            key={s.type}
            type="button"
            onClick={() => setStrategyType(s.type)}
            className={`rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
              state.strategy.type === s.type
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>
      <div className="relative mt-3">
        {state.strategy.type === "fixedProfit" ? (
          <>
            <span className="font-num absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              ₱
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={state.strategy.amount || ""}
              onChange={(e) => setStrategyValue(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-7 pr-3 py-2.5 text-right focus:outline-none focus:border-accent"
            />
          </>
        ) : (
          <>
            <input
              type="number"
              inputMode="decimal"
              value={state.strategy.percent || ""}
              onChange={(e) => setStrategyValue(Number(e.target.value) || 0)}
              max={state.strategy.type === "margin" ? 99 : undefined}
              placeholder="0"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-3 pr-8 py-2.5 text-right focus:outline-none focus:border-accent"
            />
            <span className="font-num absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              %
            </span>
          </>
        )}
      </div>

      {state.strategy.type !== "fixedProfit" && (
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-text-muted">
            {t("strategy.suggestedForPrefix")} {verticalName}:{" "}
            <span className="font-num text-text font-medium">
              {suggestedRange.min}–{suggestedRange.max}%
            </span>{" "}
            {state.strategy.type === "margin" ? t("strategy.marginSuffix") : t("strategy.markupSuffix")}
          </p>
          <button
            type="button"
            onClick={() => setStrategyValue(suggestedMidpoint)}
            className="text-xs font-medium text-accent hover:text-accent-strong flex-none"
          >
            {t("strategy.useSuggested")}
          </button>
        </div>
      )}
    </div>
  );
}
