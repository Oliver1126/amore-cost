"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { peso } from "@/lib/format";
import {
  OPEX_STORAGE_KEY,
  OPEX_CATEGORIES,
  defaultOpexSettings,
  newOpexItem,
  totalOpex,
  opexWithContingency,
  totalsByCategory,
  overheadPerDish,
  type OpexCategory,
  type OpexItem,
  type OpexSettings,
} from "@/lib/opex";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { InfoButton } from "@/components/InfoButton";
import { MODULES } from "@/lib/modules";

const inputClass =
  "rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm focus:outline-none focus:border-accent";

export default function OpexPage() {
  const { lang, t } = useLanguage();
  const [opex, setOpex, hydrated] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);

  if (!hydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "opex")!).name;
  const base = totalOpex(opex.items);
  const withBuffer = opexWithContingency(opex.items, opex.contingencyPercent);
  const byCategory = totalsByCategory(opex.items);
  const dishSales = opex.monthlyDishSales ?? 0;
  const perDish = overheadPerDish(withBuffer, dishSales);
  const categoryLabel = (c: OpexCategory) => t(`opex.cat.${c}` as Parameters<typeof t>[0]);

  function update(id: string, patch: Partial<OpexItem>) {
    setOpex({ ...opex, items: opex.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("opex.description")}</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-warn">
          <p className="text-sm text-text-muted">{t("opex.totalMonthly")}</p>
          <p className="font-num text-2xl font-semibold mt-2 text-warn">₱{peso(base)}</p>
          <p className="text-xs text-text-muted mt-1">
            {opex.items.length} {t("opex.itemsSuffix")}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-text-muted">{t("opex.withContingency")}</p>
          <p className="font-num text-2xl font-semibold mt-2">₱{peso(withBuffer)}</p>
          <p className="text-xs text-text-muted mt-1">
            +{opex.contingencyPercent || 0}% {t("opex.bufferSuffix")}
          </p>
        </div>
        <div className="rounded-2xl bg-accent text-accent-ink p-5 shadow-sm">
          <p className="text-sm text-accent-ink/80">{t("opex.perDish")}</p>
          <p className="font-num text-3xl font-bold mt-2">₱{peso(perDish)}</p>
          <p className="text-xs text-accent-ink/70 mt-1">
            {dishSales > 0 ? `÷ ${dishSales.toLocaleString("en-PH")} ${t("opex.dishesPerMonth")}` : t("opex.enterSales")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="card p-5 min-w-0">
          <p className="text-sm font-medium">{t("opex.recurringTitle")}</p>
          <div className="mt-4 space-y-2">
            {opex.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_7rem_2.75rem] sm:grid-cols-[8.5rem_1fr_8rem_2.75rem] gap-2 items-center">
                <select
                  value={item.category ?? "other"}
                  onChange={(e) => update(item.id, { category: e.target.value as OpexCategory })}
                  aria-label={t("opex.category")}
                  className={`${inputClass} col-span-3 sm:col-span-1`}
                >
                  {OPEX_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => update(item.id, { label: e.target.value })}
                  placeholder={t("opex.namePlaceholder")}
                  aria-label={t("opex.expenseName")}
                  className={`${inputClass} min-w-0`}
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₱</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={item.amountPerMonth || ""}
                    onChange={(e) => update(item.id, { amountPerMonth: Math.max(0, Number(e.target.value) || 0) })}
                    placeholder="0"
                    aria-label={t("opex.monthlyAmount")}
                    className={`${inputClass} font-num w-full pl-7 text-right`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOpex({ ...opex, items: opex.items.filter((i) => i.id !== item.id) })}
                  aria-label={`${t("common.remove")} ${item.label || t("opex.expenseName")}`}
                  className="flex w-11 h-11 items-center justify-center rounded-lg text-text-muted hover:text-bad transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpex({ ...opex, items: [...opex.items, newOpexItem()] })}
            className="mt-4 text-sm font-medium text-accent hover:text-accent-strong"
          >
            + {t("opex.addExpense")}
          </button>

          <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="contingency" className="text-sm text-text-muted">
                {t("opex.contingency")}
              </label>
              <InfoButton label={t("opex.contingencyWhat")}>{t("opex.contingencyHelp")}</InfoButton>
            </div>
            <div className="relative w-24">
              <input
                id="contingency"
                type="number"
                inputMode="decimal"
                min={0}
                value={opex.contingencyPercent || ""}
                onChange={(e) => setOpex({ ...opex, contingencyPercent: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="0"
                className={`${inputClass} font-num w-full pr-7 text-right`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div className="card p-5">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">{t("opex.allocationTitle")}</p>
              <InfoButton label={t("opex.allocationWhat")}>{t("opex.allocationHelp")}</InfoButton>
            </div>
            <label htmlFor="dish-sales" className="block mt-4 text-xs text-text-muted">
              {t("opex.estimatedSales")}
            </label>
            <input
              id="dish-sales"
              type="number"
              inputMode="numeric"
              min={0}
              value={dishSales || ""}
              onChange={(e) => setOpex({ ...opex, monthlyDishSales: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="1000"
              className={`${inputClass} font-num mt-1 w-full text-right`}
            />
            <p className="mt-3 text-sm">
              {t("opex.perDishLine")} <span className="font-num font-semibold text-accent-strong">₱{peso(perDish)}</span>
            </p>
          </div>

          <div className="card p-5">
            <p className="text-sm font-medium">{t("opex.breakdownTitle")}</p>
            <ul className="mt-4 space-y-3">
              {OPEX_CATEGORIES.filter((c) => byCategory[c] > 0).map((c) => {
                const pct = base > 0 ? (byCategory[c] / base) * 100 : 0;
                return (
                  <li key={c}>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">{categoryLabel(c)}</span>
                      <span className="font-num">
                        ₱{peso(byCategory[c])} <span className="text-text-muted">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div className="h-full bg-warn" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
              {base === 0 && <li className="text-sm text-text-muted">{t("opex.breakdownEmpty")}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
