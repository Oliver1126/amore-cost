"use client";

import { useEffect, useState } from "react";
import { newIngredient, type Ingredient } from "@/lib/ingredients";
import { IngredientForm } from "@/components/IngredientForm";
import { useLanguage } from "@/lib/i18n";

/**
 * The "+ Add ingredient" popup for the shared Ingredient Library. Its
 * fields (name, unit, cost / unit, supplier, category, optional pack
 * price) are `IngredientForm`, the same form the library's Edit row uses.
 * Unlike the per-recipe "Add ingredient" inside Edit & Breakdown, which
 * stays an inline row (decision 0025), a library entry is its own
 * standalone record, so a popup fits it.
 */
export function AddIngredientModal({
  onAdd,
  onClose,
}: {
  onAdd: (ingredient: Ingredient) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<Ingredient>(() => newIngredient("", "pcs", 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleAdd() {
    if (!draft.name.trim()) return;
    onAdd({
      ...draft,
      name: draft.name.trim(),
      unit: draft.unit.trim() || "pcs",
      supplier: draft.supplier?.trim() || undefined,
      category: draft.category?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={t("ingredients.addTitle")}
        className="card w-full max-w-xl p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
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

        <IngredientForm value={draft} onChange={setDraft} autoFocus />

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm text-text-muted hover:text-text transition-colors">
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={!draft.name.trim()}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors disabled:opacity-40 disabled:hover:bg-accent"
          >
            {t("ingredients.addButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
