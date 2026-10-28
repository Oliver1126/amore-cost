"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { hasDemoData } from "@/lib/demo";
import { DemoBanner, TryDemoButton } from "@/components/DemoDataButton";
import {
  defaultState,
  STORAGE_KEY,
  computePriceBreakdown,
  foodCostPercent,
  lineCost,
  FOOD_COST_TARGET,
  type CalculatorState,
} from "@/lib/calculator";
import {
  CATALOG_STORAGE_KEY,
  commitHistorySnapshot,
  duplicateCatalogItem,
  marginStatus,
  removeItem,
  updateItemStateLive,
  upsert,
  type CatalogItem,
} from "@/lib/catalog";
import { INGREDIENTS_STORAGE_KEY, type Ingredient } from "@/lib/ingredients";
import { peso } from "@/lib/format";
import { CatalogEditModal } from "@/components/CatalogEditModal";
import { CreateCatalogModal } from "@/components/CreateCatalogModal";
import { IngredientLibraryModal } from "@/components/IngredientLibraryModal";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useDebouncedCommit } from "@/lib/useDebouncedCommit";
import { MODULES } from "@/lib/modules";

/** One Cost History snapshot per settled edit, not one per keystroke — decision 0036. */
const HISTORY_COMMIT_DELAY_MS = 1200;

type MarginFilter = "all" | "onTarget" | "belowTarget";

export default function InputPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InputPageInner />
    </Suspense>
  );
}

function InputPageInner() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catalog, setCatalog, catalogHydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [ingredients, setIngredients, ingredientsHydrated] = useLocalStorage<Ingredient[]>(
    INGREDIENTS_STORAGE_KEY,
    () => []
  );
  const [draft, setDraft, draftHydrated] = useLocalStorage<CalculatorState>(STORAGE_KEY, () => defaultState());

  const [search, setSearch] = useState("");
  const [marginFilter, setMarginFilter] = useState<MarginFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showIngredientLibrary, setShowIngredientLibrary] = useState(false);

  const hydrated = catalogHydrated && ingredientsHydrated && draftHydrated;
  const editing = editingId ? (catalog.find((i) => i.id === editingId) ?? null) : null;

  // `/input?edit=<id>` — how Dashboard and the old `/costing?id=` links
  // open a recipe's breakdown directly.
  const editParam = searchParams.get("edit");
  useEffect(() => {
    if (hydrated && editParam && catalog.some((i) => i.id === editParam)) setEditingId(editParam);
  }, [hydrated, editParam, catalog]);

  useDebouncedCommit(editing ? editing.state : null, HISTORY_COMMIT_DELAY_MS, () => {
    const id = editing?.id;
    if (!id) return;
    setCatalog((current) => {
      const item = current.find((i) => i.id === id);
      return item ? upsert(current, commitHistorySnapshot(item)) : current;
    });
  });

  if (!hydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "input")!).name;

  function closeEditor() {
    setEditingId(null);
    if (editParam) router.replace("/input");
  }

  function remove(item: CatalogItem) {
    const label = item.state.itemName || (lang === "tl" ? "itong recipe" : "this recipe");
    const msg = lang === "tl" ? `Burahin ang "${label}"?` : `Delete "${label}"?`;
    if (window.confirm(msg)) setCatalog(removeItem(catalog, item.id));
  }

  function saveEditorState(next: CalculatorState) {
    if (!editing) return;
    setCatalog(upsert(catalog, updateItemStateLive(editing, next)));
  }

  function setTargetMargin(value: number) {
    if (!editing) return;
    setCatalog(upsert(catalog, { ...editing, targetMarginPercent: value, updatedAt: new Date().toISOString() }));
  }

  function createAndOpen(item: CatalogItem) {
    setCatalog([...catalog, item]);
    setCreating(false);
    setEditingId(item.id);
  }

  const query = search.trim().toLowerCase();
  const visible = catalog
    .filter((item) => !query || (item.state.itemName || "").toLowerCase().includes(query))
    .filter((item) => {
      if (marginFilter === "all") return true;
      const b = computePriceBreakdown(item.state);
      return marginStatus(b.marginPercent, item.targetMarginPercent) === marginFilter;
    })
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">{title}</h1>
          <p className="mt-1 text-text-muted max-w-[64ch]">{t("input.description")}</p>
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
            onClick={() => setCreating(true)}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("catalog.newItem")}
          </button>
        </div>
      </div>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-6 max-w-md">
          <p className="font-medium">{t("input.emptyTitle")}</p>
          <p className="mt-1 text-sm text-text-muted">{t("input.emptyBody")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
            >
              {t("catalog.newItem")}
            </button>
            <TryDemoButton />
          </div>
          <p className="mt-3 text-xs text-text-muted">{t("demo.tryHint")}</p>
        </div>
      ) : (
        <>
          {hasDemoData(catalog) && (
            <div className="mt-6">
              <DemoBanner />
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("input.searchPlaceholder")}
              aria-label={t("input.searchPlaceholder")}
              className="w-full sm:max-w-xs rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
            />
            <div className="flex gap-1 bg-surface-muted rounded-xl p-1 flex-none" role="tablist" aria-label="Margin filter">
              {(["all", "onTarget", "belowTarget"] as MarginFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={marginFilter === f}
                  onClick={() => setMarginFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    marginFilter === f ? "bg-surface shadow-sm text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {f === "all" ? t("catalog.filterAll") : f === "onTarget" ? t("catalog.filterOnTarget") : t("catalog.filterBelowTarget")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((item) => {
              const b = computePriceBreakdown(item.state);
              const fc = foodCostPercent(item.state);
              const fcHigh = fc > FOOD_COST_TARGET.max;
              const belowTarget = marginStatus(b.marginPercent, item.targetMarginPercent) === "belowTarget";
              const expanded = expandedId === item.id;
              return (
                <div key={item.id} className="card p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="font-medium hover:text-accent transition-colors text-left"
                    >
                      {item.state.itemName || t("common.untitled")}
                    </button>
                    <span
                      className={`flex-none text-[11px] font-medium rounded-full px-2 py-0.5 ${
                        belowTarget ? "bg-bad-soft text-bad" : "bg-accent-soft text-accent-strong"
                      }`}
                    >
                      {item.targetMarginPercent.toFixed(1)}% {t("catalog.targetMarginLabel")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {item.state.batchSize} {t("input.servingsSuffix")}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-text-muted">{t("input.costPerServing")}</p>
                      <p className="font-num font-semibold mt-0.5 text-warn">₱{peso(b.cost)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-text-muted">{t("input.foodCost")}</p>
                      <p className={`font-num font-semibold mt-0.5 ${fcHigh ? "text-bad" : ""}`}>{fc.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-accent text-accent-ink px-4 py-3">
                    <p className="text-xs text-accent-ink/80">{t("stats.suggestedPrice")}</p>
                    <p className="font-num text-2xl font-bold mt-0.5">₱{peso(b.priceCustomerPays)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    aria-expanded={expanded}
                    className="mt-3 text-xs text-accent hover:text-accent-strong transition-colors text-left"
                  >
                    {expanded ? t("input.hideBreakdown") : `${t("input.showBreakdown")} (${item.state.costItems.length})`}
                  </button>
                  {expanded && (
                    <ul className="mt-2 space-y-1.5">
                      {item.state.costItems.length === 0 ? (
                        <li className="text-xs text-text-muted">{t("catalog.noCostLines")}</li>
                      ) : (
                        item.state.costItems.map((ci) => (
                          <li key={ci.id} className="flex items-center justify-between text-xs gap-2">
                            <span className="truncate">{ci.label || t("common.untitled")}</span>
                            <span className="font-num font-medium flex-none">₱{peso(lineCost(ci))}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="w-full rounded-lg bg-accent text-accent-ink px-3 py-2 text-xs font-medium hover:bg-accent-strong transition-colors"
                    >
                      {t("input.editBreakdown")}
                    </button>
                    <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                      <button
                        type="button"
                        onClick={() => setCatalog(upsert(catalog, duplicateCatalogItem(item)))}
                        className="hover:text-text transition-colors"
                      >
                        {t("catalog.duplicate")}
                      </button>
                      <button type="button" onClick={() => remove(item)} className="hover:text-bad transition-colors">
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visible.length === 0 && <p className="mt-6 text-sm text-text-muted">{t("input.noMatches")}</p>}
        </>
      )}

      {editing && (
        <CatalogEditModal
          item={editing}
          ingredients={ingredients}
          onSave={saveEditorState}
          onTargetMarginChange={setTargetMargin}
          onClose={closeEditor}
        />
      )}
      {creating && <CreateCatalogModal onCreate={createAndOpen} onClose={() => setCreating(false)} />}
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
