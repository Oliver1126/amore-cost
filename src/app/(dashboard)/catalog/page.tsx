"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  defaultState,
  STORAGE_KEY,
  computePriceBreakdown,
  type CalculatorState,
} from "@/lib/calculator";
import {
  CATALOG_STORAGE_KEY,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  commitHistorySnapshot,
  duplicateCatalogItem,
  marginStatus,
  removeItem,
  updateItemStateLive,
  upsert,
  type CatalogItem,
  type JobStatus,
} from "@/lib/catalog";
import { INGREDIENTS_STORAGE_KEY, type Ingredient } from "@/lib/ingredients";
import { peso } from "@/lib/format";
import { ACTIVE_PROFILE_STORAGE_KEY } from "@/lib/team";
import { QRCodeImage } from "@/components/QRCode";
import { CatalogEditModal } from "@/components/CatalogEditModal";
import { CreateCatalogModal } from "@/components/CreateCatalogModal";
import { IngredientLibraryModal } from "@/components/IngredientLibraryModal";
import { useLanguage, getModuleText, getJobStatusLabel } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useDebouncedCommit } from "@/lib/useDebouncedCommit";
import { MODULES } from "@/lib/modules";

/** One Cost History snapshot per settled edit, not one per keystroke — see decision 0035/backlog item 10. */
const HISTORY_COMMIT_DELAY_MS = 1200;

type MarginFilter = "all" | "onTarget" | "belowTarget";

export default function CatalogPage() {
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, catalogHydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [ingredients, setIngredients, ingredientsHydrated] = useLocalStorage<Ingredient[]>(
    INGREDIENTS_STORAGE_KEY,
    () => []
  );
  const [draft, setDraft, draftHydrated] = useLocalStorage<CalculatorState>(STORAGE_KEY, () =>
    defaultState()
  );
  const [activeProfileId] = useLocalStorage<string>(ACTIVE_PROFILE_STORAGE_KEY, () => "");

  const [qrItem, setQrItem] = useState<CatalogItem | null>(null);
  const [search, setSearch] = useState("");
  const [marginFilter, setMarginFilter] = useState<MarginFilter>("all");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [editModalItem, setEditModalItem] = useState<CatalogItem | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [showIngredientLibrary, setShowIngredientLibrary] = useState(false);

  const hydrated = catalogHydrated && ingredientsHydrated && draftHydrated;

  // Every keystroke in the "Edit & Breakdown" modal updates the item's live
  // state instantly, but only *commits* a Cost History snapshot after the
  // user pauses — same fix, same reasoning as Costing & Pricing's own
  // setState (decision 0035/backlog item 10): one snapshot per settled
  // edit, not one per digit typed.
  useDebouncedCommit(editModalItem ? editModalItem.state : null, HISTORY_COMMIT_DELAY_MS, () => {
    const id = editModalItem?.id;
    if (!id) return;
    setCatalog((current) => {
      const item = current.find((i) => i.id === id);
      return item ? upsert(current, commitHistorySnapshot(item)) : current;
    });
  });

  if (!hydrated) {
    return <PageSkeleton />;
  }
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;
  const costingName = getModuleText(lang, MODULES.find((m) => m.slug === "calculator")!).name;

  // ---- Products ----

  function duplicate(item: CatalogItem) {
    setCatalog(upsert(catalog, duplicateCatalogItem(item)));
  }

  function remove(item: CatalogItem) {
    const itemLabel = item.state.itemName || (lang === "tl" ? "itong item" : "this item");
    const msg =
      lang === "tl" ? `Burahin ang "${itemLabel}" mula sa katalogo?` : `Delete "${itemLabel}" from your catalog?`;
    if (window.confirm(msg)) {
      setCatalog(removeItem(catalog, item.id));
    }
  }

  function setStatus(item: CatalogItem, status: JobStatus) {
    setCatalog(upsert(catalog, { ...item, status, updatedAt: new Date().toISOString() }));
  }

  function setSku(item: CatalogItem, sku: string) {
    setCatalog(upsert(catalog, { ...item, sku: sku || undefined, updatedAt: new Date().toISOString() }));
  }

  function saveEditModalState(next: CalculatorState) {
    if (!editModalItem) return;
    const updated = updateItemStateLive(editModalItem, next, activeProfileId || undefined);
    setCatalog(upsert(catalog, updated));
    setEditModalItem(updated);
  }

  function setEditModalTargetMargin(value: number) {
    if (!editModalItem) return;
    const updated = { ...editModalItem, targetMarginPercent: value, updatedAt: new Date().toISOString() };
    setCatalog(upsert(catalog, updated));
    setEditModalItem(updated);
  }

  function createFromModal(item: CatalogItem) {
    setCatalog([...catalog, item]);
    setCreatingItem(false);
  }

  const query = search.trim().toLowerCase();
  const visibleCatalog = catalog
    .filter(
      (item) =>
        !query ||
        (item.sku ?? "").toLowerCase().includes(query) ||
        (item.state.itemName || "").toLowerCase().includes(query)
    )
    .filter((item) => {
      if (marginFilter === "all") return true;
      const b = computePriceBreakdown(item.state);
      return marginStatus(b.marginPercent, item.targetMarginPercent) === marginFilter;
    })
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">{title}</h1>
          <p className="mt-1 text-text-muted max-w-[64ch]">{t("catalog.description")}</p>
        </div>
        <div className="flex items-center gap-3 flex-none">
          <button
            type="button"
            onClick={() => setShowIngredientLibrary(true)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
          >
            {t("costForm.ingredientLibraryName")}
          </button>
          <button
            type="button"
            onClick={() => setCreatingItem(true)}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("catalog.newItem")}
          </button>
        </div>
      </div>

      <section id="products" className="mt-8 scroll-mt-6">
        {catalog.length === 0 ? (
          <div className="card p-5 text-sm text-text-muted max-w-md">
            {t("catalog.emptyPrefix")}
            <button
              type="button"
              onClick={() => setCreatingItem(true)}
              className="text-accent hover:text-accent-strong font-medium"
            >
              {costingName}
            </button>
            {t("catalog.emptySuffix")}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("catalog.searchPlaceholder")}
                className="w-full sm:max-w-xs rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
              />
              <div
                className="flex gap-1 bg-surface-muted rounded-xl p-1 flex-none"
                role="tablist"
                aria-label="Margin filter"
              >
                {(["all", "onTarget", "belowTarget"] as MarginFilter[]).map((f) => {
                  const active = marginFilter === f;
                  const label =
                    f === "all"
                      ? t("catalog.filterAll")
                      : f === "onTarget"
                        ? t("catalog.filterOnTarget")
                        : t("catalog.filterBelowTarget");
                  return (
                    <button
                      key={f}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMarginFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-surface shadow-sm text-text" : "text-text-muted hover:text-text"
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleCatalog.map((item) => {
                const b = computePriceBreakdown(item.state);
                const linkedCount = item.state.costItems.filter((ci) => ci.ingredientId).length;
                const expanded = expandedProductId === item.id;
                const status = marginStatus(b.marginPercent, item.targetMarginPercent);
                const lowStock = item.stockOnHand <= item.lowStockThreshold;
                return (
                  <div key={item.id} className="card p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setEditModalItem(item)}
                        className="font-medium hover:text-accent transition-colors text-left"
                      >
                        {item.state.itemName || t("common.untitled")}
                      </button>
                      <span
                        className={`flex-none text-[11px] font-medium rounded-full px-2 py-0.5 ${status === "belowTarget"
                          ? "bg-bad/10 text-bad"
                          : "bg-accent-soft text-accent-strong"
                          }`}
                      >
                        {item.targetMarginPercent.toFixed(1)}% {t("catalog.targetMarginLabel")}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={item.sku ?? ""}
                      onChange={(e) => setSku(item, e.target.value)}
                      placeholder={t("catalog.skuPlaceholder")}
                      aria-label={`SKU for ${item.state.itemName || "this item"}`}
                      className="mt-0.5 w-full text-[11px] text-text-muted bg-transparent border-0 p-0 focus:outline-none focus:text-text placeholder:text-text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={() => setExpandedProductId(expanded ? null : item.id)}
                      className="mt-1 text-[11px] text-accent hover:text-accent-strong transition-colors text-left"
                    >
                      {linkedCount > 0
                        ? `${linkedCount}${t("catalog.linkedSuffix")}`
                        : t("catalog.notLinkedYet")}
                    </button>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted">
                          {t("stats.trueCost")}
                        </p>
                        <p className="font-num font-semibold mt-0.5">₱{peso(b.cost)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted">
                          {t("common.margin")}
                        </p>
                        <p
                          className={`font-num font-semibold mt-0.5 ${status === "belowTarget" ? "text-bad" : ""
                            }`}
                        >
                          {b.marginPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-accent text-accent-ink px-4 py-3">
                      <p className="text-xs text-accent-ink/80">{t("stats.suggestedPrice")}</p>
                      <p className="font-num text-2xl font-bold mt-0.5">₱{peso(b.priceCustomerPays)}</p>
                    </div>

                    <p className="mt-3 text-xs text-text-muted">
                      {t("catalog.stock")}:{" "}
                      <span className={`font-num ${lowStock ? "text-bad" : "text-text"}`}>
                        {item.stockOnHand}
                      </span>
                    </p>

                    <div className="mt-2">
                      <select
                        value={item.status}
                        onChange={(e) => setStatus(item, e.target.value as JobStatus)}
                        aria-label={`Status for ${item.state.itemName || "this item"}`}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none cursor-pointer ${item.status === "invoiced"
                          ? "bg-accent-soft text-accent-strong"
                          : "bg-surface-muted text-text-muted"
                          }`}
                      >
                        {JOB_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {getJobStatusLabel(lang, s, JOB_STATUS_LABELS[s])}
                          </option>
                        ))}
                      </select>
                    </div>

                    {expanded && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-2">
                          {t("catalog.breakdownTitle")}
                        </p>
                        {item.state.costItems.length === 0 ? (
                          <p className="text-xs text-text-muted">{t("catalog.noCostLines")}</p>
                        ) : (
                          <ul className="space-y-2">
                            {item.state.costItems.map((ci) => {
                              const unitCost = ci.amount / (ci.quantity || 1);
                              return (
                                <li key={ci.id} className="text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{ci.label || t("common.untitled")}</span>
                                    <span className="font-num font-medium">₱{peso(ci.amount)}</span>
                                  </div>
                                  <p className="text-text-muted mt-0.5">
                                    {ci.ingredientId
                                      ? t("catalog.linkedSuffix")
                                      : ci.supplier || t("costForm.supplier")}
                                    {" · "}
                                    {t("costForm.unitCostLabel")}: ₱{peso(unitCost)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
                        <button
                          type="button"
                          onClick={() => setQrItem(item)}
                          className="hover:text-text transition-colors"
                        >
                          {t("catalog.qr")}
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicate(item)}
                          className="hover:text-text transition-colors"
                        >
                          {t("catalog.duplicate")}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="hover:text-bad transition-colors"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditModalItem(item)}
                        className="mt-3 w-full rounded-lg bg-accent text-accent-ink px-3 py-2 text-xs font-medium hover:bg-accent-strong transition-colors"
                      >
                        {t("catalog.editBreakdownTitle")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {qrItem && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setQrItem(null)}
        >
          <div
            className="card p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium">{qrItem.state.itemName || t("common.untitled")}</p>
            <p className="font-num text-text-muted text-sm mt-1">
              ₱{peso(computePriceBreakdown(qrItem.state).priceCustomerPays)}
            </p>
            <div className="mt-4 flex justify-center">
              <QRCodeImage
                text={`${qrItem.state.itemName || "Recipe"} - ₱${peso(
                  computePriceBreakdown(qrItem.state).priceCustomerPays
                )}`}
              />
            </div>
            <p className="mt-3 text-xs text-text-muted">{t("catalog.qrHint")}</p>
            <button
              type="button"
              onClick={() => setQrItem(null)}
              className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {editModalItem && (
        <CatalogEditModal
          item={editModalItem}
          ingredients={ingredients}
          onSave={saveEditModalState}
          onTargetMarginChange={setEditModalTargetMargin}
          onClose={() => setEditModalItem(null)}
        />
      )}

      {creatingItem && (
        <CreateCatalogModal onCreate={createFromModal} onClose={() => setCreatingItem(false)} />
      )}

      {showIngredientLibrary && (
        <IngredientLibraryModal
          ingredients={ingredients}
          setIngredients={setIngredients}
          catalog={catalog}
          setCatalog={setCatalog}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setShowIngredientLibrary(false)}
        />
      )}
    </div>
  );
}
