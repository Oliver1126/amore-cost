"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { COMMON_UNITS, type CalculatorState } from "@/lib/calculator";
import type { CatalogItem } from "@/lib/catalog";
import {
  newSupplierQuote,
  upsertIngredient,
  removeIngredient,
  propagateIngredientChange,
  detachIngredient,
  usageCount,
  usedInItems,
  cheapestSupplier,
  similarIngredients,
  type Ingredient,
} from "@/lib/ingredients";
import { AddIngredientModal } from "@/components/AddIngredientModal";
import { peso } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

/**
 * The shared Ingredient Library, in a modal opened from Catalog
 * Management instead of an always-visible page section — mirrors the
 * "+ New item" / "Edit & Breakdown" pattern (decisions 0025/0026):
 * self-contained, owns its own edit/expand/supplier-form state, and
 * only needs the shared catalog/draft/ingredients state plus their
 * setters from the parent.
 */
export function IngredientLibraryModal({
  ingredients,
  setIngredients,
  catalog,
  setCatalog,
  draft,
  setDraft,
  onClose,
}: {
  ingredients: Ingredient[];
  setIngredients: (next: Ingredient[]) => void;
  catalog: CatalogItem[];
  setCatalog: (next: CatalogItem[]) => void;
  draft: CalculatorState;
  setDraft: (next: CalculatorState) => void;
  onClose: () => void;
}) {
  const { lang, t } = useLanguage();
  const [addingIngredient, setAddingIngredient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", unit: "", costPerUnit: "", category: "" });
  const [expandedIngredientId, setExpandedIngredientId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState({ name: "", price: "" });

  function applyIngredientUpdate(updated: Ingredient) {
    setIngredients(upsertIngredient(ingredients, updated));
    const { catalog: nextCatalog, draft: nextDraft } = propagateIngredientChange(catalog, draft, updated);
    setCatalog(nextCatalog);
    setDraft(nextDraft);
  }

  function handleAddIngredient(ing: Ingredient) {
    setIngredients([...ingredients, ing]);
    setAddingIngredient(false);
  }

  function startEdit(ing: Ingredient) {
    setEditingId(ing.id);
    setEditDraft({
      name: ing.name,
      unit: ing.unit,
      costPerUnit: String(ing.costPerUnit),
      category: ing.category ?? "",
    });
  }

  function saveEdit(ing: Ingredient) {
    applyIngredientUpdate({
      ...ing,
      name: editDraft.name.trim() || ing.name,
      unit: editDraft.unit.trim() || ing.unit,
      costPerUnit: Number(editDraft.costPerUnit) || 0,
      category: editDraft.category.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
  }

  function deleteIngredient(ing: Ingredient) {
    const uses = usageCount(catalog, draft, ing.id);
    if (
      uses > 0 &&
      !window.confirm(
        lang === "tl"
          ? `Ginagamit ang "${ing.name}" sa ${uses} item. Kapag binura ito, mahihiwalay ang mga item na iyon — mananatili ang kasalukuyang gastos nila bilang plain manual entry. Magpatuloy?`
          : `"${ing.name}" is used in ${uses} item${uses > 1 ? "s" : ""}. Deleting it will detach those items — they'll keep their current cost as a plain manual entry. Continue?`
      )
    ) {
      return;
    }
    const { catalog: nextCatalog, draft: nextDraft } = detachIngredient(catalog, draft, ing.id);
    setCatalog(nextCatalog);
    setDraft(nextDraft);
    setIngredients(removeIngredient(ingredients, ing.id));
  }

  function addSupplier(ing: Ingredient) {
    const price = Number(supplierForm.price) || 0;
    if (!supplierForm.name.trim()) return;
    const quote = newSupplierQuote(supplierForm.name.trim(), price);
    setIngredients(upsertIngredient(ingredients, { ...ing, suppliers: [...ing.suppliers, quote] }));
    setSupplierForm({ name: "", price: "" });
  }

  function removeSupplier(ing: Ingredient, supplierId: string) {
    setIngredients(
      upsertIngredient(ingredients, { ...ing, suppliers: ing.suppliers.filter((s) => s.id !== supplierId) })
    );
  }

  function useSupplierPrice(ing: Ingredient, price: number) {
    applyIngredientUpdate({ ...ing, costPerUnit: price, updatedAt: new Date().toISOString() });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-4xl my-6 sm:my-0 max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <datalist id="calcost-units-ingredient-library">
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">{t("costForm.ingredientLibraryName")}</h2>
            <p className="mt-1 text-text-muted max-w-[64ch] text-sm">{t("ingredients.description")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none flex-none"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setAddingIngredient(true)}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors flex-none"
          >
            {t("ingredients.addButton")}
          </button>
        </div>

        {ingredients.length === 0 ? (
          <div className="mt-4 card p-5 text-sm text-text-muted">{t("ingredients.empty")}</div>
        ) : (
          <div className="mt-4 card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="font-medium px-5 py-3">{t("ingredients.name")}</th>
                    <th className="font-medium px-5 py-3">{t("common.unit")}</th>
                    <th className="font-medium px-5 py-3 text-right">{t("ingredients.costPerUnit")}</th>
                    <th className="font-medium px-5 py-3 text-right">{t("ingredients.usedIn")}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => {
                    const editing = editingId === ing.id;
                    const expanded = expandedIngredientId === ing.id;
                    const uses = usageCount(catalog, draft, ing.id);
                    const usedIn = usedInItems(catalog, ing.id);
                    const cheapest = cheapestSupplier(ing);
                    const similar = similarIngredients(ingredients, ing);
                    return (
                      <Fragment key={ing.id}>
                        <tr className="border-b border-border last:border-0">
                          {editing ? (
                            <>
                              <td className="px-5 py-2.5">
                                <input
                                  type="text"
                                  value={editDraft.name}
                                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                  className="w-full rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm focus:outline-none focus:border-accent"
                                />
                              </td>
                              <td className="px-5 py-2.5">
                                <input
                                  type="text"
                                  list="calcost-units-ingredient-library"
                                  value={editDraft.unit}
                                  onChange={(e) => setEditDraft({ ...editDraft, unit: e.target.value })}
                                  className="w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm focus:outline-none focus:border-accent"
                                />
                              </td>
                              <td className="px-5 py-2.5 text-right">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  value={editDraft.costPerUnit}
                                  onChange={(e) => setEditDraft({ ...editDraft, costPerUnit: e.target.value })}
                                  className="font-num w-24 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                                />
                              </td>
                              <td className="px-5 py-2.5 text-right font-num text-text-muted">{uses}</td>
                              <td className="px-5 py-2.5">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(ing)}
                                    className="text-sm font-medium text-accent hover:text-accent-strong"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="text-sm text-text-muted hover:text-text"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() => setExpandedIngredientId(expanded ? null : ing.id)}
                                  className="font-medium hover:text-accent transition-colors text-left"
                                >
                                  {ing.name}
                                </button>
                                {ing.category && (
                                  <span className="ml-2 text-[11px] text-text-muted bg-surface-muted rounded-full px-2 py-0.5">
                                    {ing.category}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-text-muted">{ing.unit}</td>
                              <td className="px-5 py-3 text-right font-num">₱{peso(ing.costPerUnit)}</td>
                              <td className="px-5 py-3 text-right font-num text-text-muted">
                                {uses > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedIngredientId(expanded ? null : ing.id)}
                                    className="hover:text-accent transition-colors underline decoration-dotted"
                                  >
                                    {uses}
                                  </button>
                                ) : (
                                  uses
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-3 text-text-muted">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedIngredientId(expanded ? null : ing.id)}
                                    className="hover:text-text transition-colors"
                                  >
                                    {t("ingredients.suppliersPrefix")}
                                    {ing.suppliers.length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(ing)}
                                    className="hover:text-text transition-colors"
                                  >
                                    {t("common.edit")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteIngredient(ing)}
                                    className="hover:text-bad transition-colors"
                                  >
                                    {t("common.delete")}
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                        {expanded && !editing && (
                          <tr className="border-b border-border last:border-0 bg-surface-muted">
                            <td colSpan={5} className="px-5 py-4">
                              <div className="grid sm:grid-cols-3 gap-6">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                                    {t("ingredients.suppliers")}
                                  </p>
                                  {ing.suppliers.length === 0 ? (
                                    <p className="text-sm text-text-muted">{t("ingredients.noSuppliers")}</p>
                                  ) : (
                                    <ul className="space-y-1.5">
                                      {ing.suppliers
                                        .slice()
                                        .sort((a, b) => a.price - b.price)
                                        .map((s) => (
                                          <li key={s.id} className="flex items-center justify-between text-sm gap-2">
                                            <span>
                                              {s.supplierName}
                                              {cheapest?.id === s.id && (
                                                <span className="ml-1.5 text-[10px] text-accent-strong bg-accent-soft rounded-full px-1.5 py-0.5">
                                                  {t("ingredients.cheapest")}
                                                </span>
                                              )}
                                            </span>
                                            <span className="flex items-center gap-2">
                                              <span className="font-num">₱{peso(s.price)}</span>
                                              {s.price !== ing.costPerUnit && (
                                                <button
                                                  type="button"
                                                  onClick={() => useSupplierPrice(ing, s.price)}
                                                  className="text-xs font-medium text-accent hover:text-accent-strong"
                                                >
                                                  {t("ingredients.usePrice")}
                                                </button>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => removeSupplier(ing, s.id)}
                                                className="text-text-muted hover:text-bad transition-colors"
                                              >
                                                ×
                                              </button>
                                            </span>
                                          </li>
                                        ))}
                                    </ul>
                                  )}
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      type="text"
                                      value={supplierForm.name}
                                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                      placeholder={t("ingredients.supplierNamePlaceholder")}
                                      className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
                                    />
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      value={supplierForm.price}
                                      onChange={(e) => setSupplierForm({ ...supplierForm, price: e.target.value })}
                                      placeholder={t("common.price")}
                                      className="font-num w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => addSupplier(ing)}
                                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-accent transition-colors"
                                    >
                                      {t("common.add")}
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                                    {t("ingredients.similarPrefix")} {ing.category ? `(${ing.category})` : ""}
                                  </p>
                                  {!ing.category ? (
                                    <p className="text-sm text-text-muted">{t("ingredients.noCategoryHint")}</p>
                                  ) : similar.length === 0 ? (
                                    <p className="text-sm text-text-muted">
                                      {lang === "tl"
                                        ? `Wala pang ibang sangkap na naka-tag na "${ing.category}".`
                                        : `No other ingredients tagged "${ing.category}" yet.`}
                                    </p>
                                  ) : (
                                    <ul className="space-y-1.5">
                                      {similar.map((s) => (
                                        <li key={s.id} className="flex items-center justify-between text-sm">
                                          <span>{s.name}</span>
                                          <span className="font-num text-text-muted">
                                            ₱{peso(s.costPerUnit)}/{s.unit}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>

                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                                    {t("ingredients.usedInItemsTitle")}
                                  </p>
                                  {usedIn.length === 0 ? (
                                    <p className="text-sm text-text-muted">{t("ingredients.notUsedYet")}</p>
                                  ) : (
                                    <ul className="space-y-1.5">
                                      {usedIn.map((p) => (
                                        <li key={p.id} className="text-sm">
                                          <Link
                                            href={`/costing?id=${p.id}`}
                                            className="text-accent hover:text-accent-strong font-medium"
                                          >
                                            {p.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {addingIngredient && (
        <AddIngredientModal onAdd={handleAddIngredient} onClose={() => setAddingIngredient(false)} />
      )}
    </div>
  );
}
