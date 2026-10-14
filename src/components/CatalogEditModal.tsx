"use client";

import type { CalculatorState } from "@/lib/calculator";
import type { CatalogItem } from "@/lib/catalog";
import type { Ingredient } from "@/lib/ingredients";
import { ItemEditor } from "@/components/ItemEditor";
import { useLanguage } from "@/lib/i18n";

/**
 * "Edit & Breakdown" for Catalog Management — the same `ItemEditor`
 * Costing & Pricing uses, in a modal, so editing an existing item never
 * requires leaving the Catalog Management page. Every change live-saves
 * via `onSave`, mirroring how Costing & Pricing already auto-saves an
 * `?id=` edit. Creating a brand-new item is a separate, deliberately
 * lightweight flow — see `CreateCatalogModal`.
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

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-5xl my-6 sm:my-0 max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl">{t("catalog.editBreakdownTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-text-muted max-w-xs">
          <span>{t("catalog.targetMarginLabel")}</span>
          <input
            type="number"
            inputMode="decimal"
            value={item.targetMarginPercent || ""}
            onChange={(e) => onTargetMarginChange(Math.max(0, Number(e.target.value) || 0))}
            className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
          />
          <span>%</span>
        </label>

        <div className="mt-6">
          <ItemEditor state={item.state} onChange={onSave} ingredients={ingredients} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("common.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
