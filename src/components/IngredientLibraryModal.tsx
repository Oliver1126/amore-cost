"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { CalculatorState } from "@/lib/calculator";
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
  packCostPerUnit,
  type Ingredient,
} from "@/lib/ingredients";
import { AddIngredientModal } from "@/components/AddIngredientModal";
import { IngredientForm } from "@/components/IngredientForm";
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
  const [editDraft, setEditDraft] = useState<Ingredient | null>(null);
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
    setEditDraft(ing);
  }

  function saveEdit(ing: Ingredient) {
    if (!editDraft) return;
    applyIngredientUpdate({
      ...editDraft,
      name: editDraft.name.trim() || ing.name,
      unit: editDraft.unit.trim() || ing.unit,
      supplier: editDraft.supplier?.trim() || undefined,
      category: editDraft.category?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
    setEditDraft(null);
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

  /** Switching to a compared supplier: their per-unit price replaces the current one, so the old pack no longer applies. */
  function applySupplierPrice(ing: Ingredient, supplierName: string, price: number) {
    applyIngredientUpdate({
      ...ing,
      costPerUnit: price,
      supplier: supplierName,
      packagePrice: undefined,
      qtyPerPack: undefined,
      packUnit: undefined,
      shippingFee: undefined,
      updatedAt: new Date().toISOString(),
    });
  }

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
                    <th className="font-medium whitespace-nowrap px-4 py-3">{t("ingredients.name")}</th>
                    <th className="font-medium whitespace-nowrap px-4 py-3">{t("ingredients.supplierCol")}</th>
                    <th className="font-medium whitespace-nowrap px-4 py-3">{t("common.unit")}</th>
                    <th className="font-medium whitespace-nowrap px-4 py-3 text-right">{t("ingredients.costPerUnit")}</th>
                    <th className="font-medium whitespace-nowrap px-4 py-3 text-right">{t("ingredients.usedIn")}</th>
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
                          {editing && editDraft ? (
                            <td colSpan={6} className="px-5 py-4 bg-surface-muted/40">
                              <IngredientForm value={editDraft} onChange={setEditDraft} />
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs text-text-muted">
                                  {uses > 0 ? `${t("ingredients.usedIn")}: ${uses}` : ""}
                                </span>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditDraft(null);
                                    }}
                                    className="text-sm text-text-muted hover:text-text"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(ing)}
                                    className="rounded-lg bg-accent text-accent-ink px-4 py-1.5 text-sm font-medium hover:bg-accent-strong transition-colors"
                                  >
                                    {t("common.save")}
                                  </button>
                                </div>
                              </div>
                            </td>
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
                              <td className="px-5 py-3 text-text-muted">{ing.supplier || "—"}</td>
                              <td className="px-5 py-3 text-text-muted">{ing.unit}</td>
                              <td className="px-5 py-3 text-right font-num">
                                ₱{peso(ing.costPerUnit)}
                                {packCostPerUnit(ing) !== undefined && (
                                  <span className="block text-[11px] text-text-muted whitespace-nowrap">
                                    ₱{peso(ing.packagePrice || 0)} / {ing.qtyPerPack} {ing.packUnit || ing.unit}
                                  </span>
                                )}
                              </td>
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
                                <div className="flex items-center justify-end gap-3 text-text-muted whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedIngredientId(expanded ? null : ing.id)}
                                    className="hover:text-text transition-colors"
                                  >
                                    {t("ingredients.comparePrefix")}
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
                            <td colSpan={6} className="px-5 py-4">
                              <div className="grid sm:grid-cols-3 gap-6">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                                    {t("ingredients.compareTitle")}
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
                                                  onClick={() => applySupplierPrice(ing, s.supplierName, s.price)}
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
                                            href={`/input?edit=${p.id}`}
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
