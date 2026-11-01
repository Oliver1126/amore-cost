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

          <div className="mt-4 card overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_7rem_9rem_8rem_auto] gap-4 px-5 py-2.5 bg-surface-muted text-[11px] uppercase tracking-wider text-text-muted">
              <span>{t("input.colRecipe")}</span>
              <span className="text-right">{t("input.costPerServing")}</span>
              <span>{t("input.foodCost")}</span>
              <span className="text-right">{t("stats.suggestedPrice")}</span>
              <span className="w-[8.5rem]" />
            </div>
            <ul className="divide-y divide-border">
              {visible.map((item) => {
                const b = computePriceBreakdown(item.state);
                const fc = foodCostPercent(item.state);
                const fcHigh = fc > FOOD_COST_TARGET.max;
                const fcOk = fc >= FOOD_COST_TARGET.min && !fcHigh;
                const belowTarget = marginStatus(b.marginPercent, item.targetMarginPercent) === "belowTarget";
                const expanded = expandedId === item.id;
                const name = item.state.itemName || t("common.untitled");
                return (
                  <li key={item.id} className="group">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_7rem_9rem_8rem_auto] gap-x-4 gap-y-1.5 items-center px-4 md:px-5 py-3 hover:bg-surface-muted/60 transition-colors">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setEditingId(item.id)}
                          className="font-medium hover:text-accent transition-colors text-left truncate max-w-full block"
                        >
                          {name}
                        </button>
                        <p className="text-xs text-text-muted flex flex-wrap items-center gap-x-2">
                          <span>
                            {item.state.batchSize} {t("input.servingsSuffix")} · {item.state.costItems.length} {t("editor.ingredients").toLowerCase()}
                          </span>
                          <span
                            className={`text-[10px] font-medium rounded-full px-1.5 py-px ${
                              belowTarget ? "bg-bad-soft text-bad" : "bg-accent-soft text-accent-strong"
                            }`}
                          >
                            {item.targetMarginPercent.toFixed(0)}% {t("catalog.targetMarginLabel").toLowerCase()}
                          </span>
                        </p>
                      </div>

                      <p className="md:hidden font-num text-lg font-bold text-accent-strong text-right">₱{peso(b.priceCustomerPays)}</p>

                      <p className="hidden md:block font-num text-sm font-semibold text-warn text-right">₱{peso(b.cost)}</p>

                      <div className="hidden md:block">
                        <p className={`font-num text-sm font-semibold ${fcHigh ? "text-bad" : fcOk ? "text-accent-strong" : ""}`}>{fc.toFixed(1)}%</p>
                        <div className="mt-1 h-1 w-24 rounded-full bg-surface-muted overflow-hidden">
                          <span
                            className={`block h-full ${fcHigh ? "bg-bad" : fcOk ? "bg-accent" : "bg-text-muted"}`}
                            style={{ width: `${Math.min(100, (fc / 60) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <p className="hidden md:block font-num text-lg font-bold text-accent-strong text-right">₱{peso(b.priceCustomerPays)}</p>

                      {/* Phone-only second line: cost and food cost */}
                      <p className="md:hidden font-num text-xs text-text-muted col-span-1">
                        <span className="text-warn font-semibold">₱{peso(b.cost)}</span> {t("input.costPerServing").toLowerCase()} ·{" "}
                        <span className={`font-semibold ${fcHigh ? "text-bad" : fcOk ? "text-accent-strong" : "text-text"}`}>{fc.toFixed(1)}%</span> {t("input.foodCostShort")}
                      </p>

                      <div className="flex items-center justify-end gap-1 md:w-[8.5rem]">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          aria-expanded={expanded}
                          aria-label={expanded ? t("input.hideBreakdown") : t("input.showBreakdown")}
                          title={expanded ? t("input.hideBreakdown") : t("input.showBreakdown")}
                          className="w-8 h-8 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
                        >
                          <span aria-hidden className={`inline-block transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(item.id)}
                          className="rounded-lg bg-accent text-accent-ink px-3 py-1.5 text-xs font-medium hover:bg-accent-strong transition-colors whitespace-nowrap"
                        >
                          {t("input.editBreakdown")}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="px-4 md:px-5 pb-4 -mt-1">
                        <div className="rounded-xl bg-surface-muted p-3">
                          {item.state.costItems.length === 0 ? (
                            <p className="text-xs text-text-muted">{t("catalog.noCostLines")}</p>
                          ) : (
                            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                              {item.state.costItems.map((ci) => (
                                <li key={ci.id} className="flex items-center justify-between text-xs gap-2">
                                  <span className="truncate">{ci.label || t("common.untitled")}</span>
                                  <span className="font-num font-medium flex-none">₱{peso(lineCost(ci))}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-3 pt-2 border-t border-border flex items-center justify-end gap-4 text-xs text-text-muted">
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
                    )}
                  </li>
                );
              })}
            </ul>
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
