"use client";

import { useState } from "react";
import { defaultState } from "@/lib/calculator";
import { newCatalogItem, type CatalogItem } from "@/lib/catalog";
import { useLanguage } from "@/lib/i18n";

/**
 * The lightweight "+ New item" flow — name, batch size, target margin
 * only. Deliberately smaller than "Edit & Breakdown" (`CatalogEditModal`,
 * the full cost-stack editor): the live reference this was modeled on
 * (food-cost-tau.vercel.app) uses this same two-step shape — create a
 * bare item here, then add cost lines separately via its own "Edit &
 * Breakdown." Confirmed by actually visiting the site, not guessed.
 */
export function CreateCatalogModal({
  onCreate,
  onClose,
}: {
  onCreate: (item: CatalogItem) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [itemName, setItemName] = useState("");
  const [batchSize, setBatchSize] = useState(1);
  const [targetMarginPercent, setTargetMarginPercent] = useState(30);

  function handleCreate() {
    if (!itemName.trim()) return;
    const state = { ...defaultState(), itemName: itemName.trim(), batchSize };
    const item = { ...newCatalogItem(state), targetMarginPercent };
    onCreate(item);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl">{t("catalog.createTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <label className="block mt-4">
          <span className="text-sm text-text-muted">
            {t("costForm.whatPricing")} <span className="text-bad">*</span>
          </span>
          <input
            type="text"
            autoFocus
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={t("costForm.itemNamePlaceholder")}
            className="mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-text-muted">{t("batch.size")}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={batchSize || ""}
              onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value) || 1))}
              className="font-num mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-right focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-text-muted">{t("catalog.targetMarginLabel")}</span>
            <div className="relative mt-2">
              <input
                type="number"
                inputMode="decimal"
                value={targetMarginPercent || ""}
                onChange={(e) => setTargetMarginPercent(Math.max(0, Number(e.target.value) || 0))}
                className="font-num w-full rounded-xl border border-border bg-surface-muted pr-7 pl-3 py-2.5 text-right focus:outline-none focus:border-accent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!itemName.trim()}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors disabled:opacity-40 disabled:hover:bg-accent"
          >
            {t("catalog.createButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
