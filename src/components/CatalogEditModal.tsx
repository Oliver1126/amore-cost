"use client";

import { useEffect } from "react";
import { computePriceBreakdown, foodCostPercent, type CalculatorState } from "@/lib/calculator";
import { peso } from "@/lib/format";
import type { CatalogItem } from "@/lib/catalog";
import type { Ingredient } from "@/lib/ingredients";
import { ItemEditor } from "@/components/ItemEditor";
import { InfoButton } from "@/components/InfoButton";
import { useLanguage } from "@/lib/i18n";

/**
 * "Edit & Breakdown" on the Input page (decision 0042 layout). A fixed
 * header holds what identifies the recipe (name, servings, target margin);
 * the body scrolls with the ingredient list beside a sticky price panel;
 * a fixed footer closes it. Every change live-saves via `onSave` — there is
 * no Save button by design, the footer just says so. Creating a recipe is
 * the separate, lightweight `CreateCatalogModal`.
 */
export function CatalogEditModal({
  item,
  ingredients,
  onSave,
  onTargetMarginChange,
  onClose,
}: {
  item: CatalogItem;
  ingredients: Ingredient[];
  onSave: (next: CalculatorState) => void;
  onTargetMarginChange: (value: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const state = item.state;
  const price = computePriceBreakdown(state);
  const foodCost = foodCostPercent(state);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const chip = "flex items-center gap-2 rounded-xl bg-surface-muted pl-3 pr-1 py-1 text-xs text-text-muted";
  const chipInput =
    "font-num w-14 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-right text-text focus:outline-none focus:border-accent";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-stretch sm:items-center justify-center sm:p-4 z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("catalog.editBreakdownTitle")}
        className="bg-surface border border-border w-full max-w-6xl sm:rounded-2xl flex flex-col max-h-[100dvh] sm:max-h-[92vh] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-none border-b border-border px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-text-muted">{t("catalog.editBreakdownTitle")}</p>
              <input
                type="text"
                value={state.itemName}
                onChange={(e) => onSave({ ...state, itemName: e.target.value })}
                placeholder={t("editor.namePlaceholder")}
                aria-label={t("editor.namePlaceholder")}
                className="font-display w-full bg-transparent text-xl sm:text-2xl border-0 border-b-2 border-transparent hover:border-border focus:border-accent focus:outline-none px-0 py-0.5 placeholder:text-text-muted/50"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="flex-none -mr-2 w-10 h-10 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className={chip}>
              <span className="flex items-center gap-1">
                {t("batch.size")}
                <InfoButton label={t("batch.whatsThis")}>{t("batch.note")}</InfoButton>
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={state.batchSize || ""}
                onChange={(e) => onSave({ ...state, batchSize: Math.max(1, Number(e.target.value) || 1) })}
                placeholder="1"
                aria-label="Servings — number of servings this recipe makes"
                className={chipInput}
              />
            </label>
            <label className={chip}>
              <span>{t("catalog.targetMarginLabel")}</span>
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.targetMarginPercent || ""}
                  onChange={(e) => onTargetMarginChange(Math.max(0, Number(e.target.value) || 0))}
                  aria-label={t("catalog.targetMarginLabel")}
                  className={chipInput}
                />
                <span className="pr-1.5">%</span>
              </span>
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <ItemEditor state={state} onChange={onSave} ingredients={ingredients} />
        </div>

        <footer className="flex-none border-t border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Phones: the price panel sits below the ingredients, so keep the live price in view here. */}
          <div className="lg:hidden min-w-0" aria-live="polite">
            <p className="font-num text-lg font-bold text-accent-strong leading-tight">₱{peso(price.priceCustomerPays)}</p>
            <p className="font-num text-[11px] text-text-muted truncate">
              {foodCost.toFixed(1)}% {t("input.foodCostShort")} · {t("editor.autoSaved").toLowerCase()}
            </p>
          </div>
          <p className="hidden lg:flex text-xs text-text-muted items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
            {t("editor.autoSaved")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex-none whitespace-nowrap rounded-xl bg-accent text-accent-ink px-5 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("common.done")}
          </button>
        </footer>
      </div>
    </div>
  );
}
