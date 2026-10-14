"use client";

import { useState } from "react";
import { newIngredient, type Ingredient } from "@/lib/ingredients";
import { useLanguage } from "@/lib/i18n";

/**
 * The lightweight "+ Add ingredient" flow for the shared Ingredient
 * Library — mirrors `CreateCatalogModal`'s shape (a small popup instead
 * of an always-open inline form taking up permanent page space).
 * Unlike the per-recipe cost-line "Add ingredient" inside "Edit &
 * Breakdown" (CostForm), which stays a plain inline row on purpose —
 * confirmed against the live reference site, see decision 0025 — this
 * one really is its own standalone record, so a popup fits it.
 */
export function AddIngredientModal({
  onAdd,
  onClose,
}: {
  onAdd: (ingredient: Ingredient) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [category, setCategory] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    const cost = Number(costPerUnit) || 0;
    onAdd(newIngredient(name.trim(), unit.trim() || "pcs", cost, category));
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl">{t("ingredients.addTitle")}</h2>
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
            {t("ingredients.name")} <span className="text-bad">*</span>
          </span>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ingredients.namePlaceholder")}
            className="mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-text-muted">{t("common.unit")}</span>
            <input
              type="text"
              list="calcost-units-ingredient-library"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs"
              className="mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-text-muted">{t("ingredients.costPerUnit")}</span>
            <div className="relative mt-2">
              <span className="font-num absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="0.00"
                className="font-num w-full rounded-xl border border-border bg-surface-muted pl-7 pr-3 py-2.5 text-right focus:outline-none focus:border-accent"
              />
            </div>
          </label>
        </div>

        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t("ingredients.categoryPlaceholder")}
          className="mt-4 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
        />

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
            onClick={handleAdd}
            disabled={!name.trim()}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors disabled:opacity-40 disabled:hover:bg-accent"
          >
            {t("ingredients.addButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
