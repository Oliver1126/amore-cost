import type { CalculatorState } from "@/lib/calculator";
import { computePriceBreakdown } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage, getTaxPresetLabel } from "@/lib/i18n";

export function StatCards({ state }: { state: CalculatorState }) {
  const { lang, t } = useLanguage();
  const b = computePriceBreakdown(state);
  const isLoss = b.profitPerUnit < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card p-5 border-l-4 border-l-warn">
        <p className="text-sm text-text-muted">{t("stats.trueCost")}</p>
        <p className="font-num text-2xl font-semibold mt-2 text-warn">₱{peso(b.cost)}</p>
        <p className="text-xs text-text-muted mt-1">{t("stats.trueCostBreakdown")}</p>
      </div>

      <div className="rounded-2xl bg-accent text-accent-ink p-5 shadow-sm">
        <p className="text-sm text-accent-ink/80">{t("stats.suggestedPrice")}</p>
        <p className="font-num text-3xl font-bold mt-2">₱{peso(b.priceCustomerPays)}</p>
        <p className="text-xs text-accent-ink/70 mt-1">
          {b.taxRate > 0
            ? `${t("stats.includesTax")} ${getTaxPresetLabel(lang, state.tax.preset, b.taxLabel)} (${b.taxRate}%)`
            : t("stats.noTaxAdded")}
        </p>
        <p className="text-xs text-accent-ink/70 mt-2 pt-2 border-t border-accent-ink/20">
          {t("stats.seniorPwdPrefix")} ₱{peso(b.seniorPwdPrice)}
        </p>
      </div>

      <div className={`card p-5 border-l-4 ${isLoss ? "border-l-bad" : "border-l-info"}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">{t("stats.profitPerUnit")}</p>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isLoss ? "bg-bad-soft text-bad" : "bg-info-soft text-info"
            }`}
          >
            {b.marginPercent.toFixed(1)}% {t("stats.marginSuffix")}
          </span>
        </div>
        <p className={`font-num text-2xl font-semibold mt-2 ${isLoss ? "text-bad" : "text-info"}`}>
          ₱{peso(b.profitPerUnit)}
        </p>
        <p className="text-xs text-text-muted mt-1">{b.markupPercent.toFixed(1)}% {t("stats.markupSuffix")}</p>
      </div>
    </div>
  );
}
