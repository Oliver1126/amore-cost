"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { defaultState, STORAGE_KEY, type CalculatorState } from "@/lib/calculator";
import {
  CATALOG_STORAGE_KEY,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  commitHistorySnapshot,
  newCatalogItem,
  updateItemState,
  updateItemStateLive,
  upsert,
  type CatalogItem,
  type JobStatus,
} from "@/lib/catalog";
import { ACTIVE_PROFILE_STORAGE_KEY } from "@/lib/team";
import { INGREDIENTS_STORAGE_KEY, type Ingredient } from "@/lib/ingredients";
import { TEMPLATES_STORAGE_KEY, type QuoteTemplate } from "@/lib/templates";
import { ItemEditor } from "@/components/ItemEditor";
import { TemplatesCard } from "@/components/TemplatesCard";
import { useLanguage, getJobStatusLabel, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useDebouncedCommit } from "@/lib/useDebouncedCommit";
import { MODULES } from "@/lib/modules";

/** One Cost History snapshot per settled edit, not one per keystroke — see decision 0035/backlog item 10. */
const HISTORY_COMMIT_DELAY_MS = 1200;

export default function CostingPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CostingPageInner />
    </Suspense>
  );
}

function CostingPageInner() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [draft, setDraft, draftHydrated] = useLocalStorage<CalculatorState>(STORAGE_KEY, () =>
    defaultState()
  );
  const [catalog, setCatalog, catalogHydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [activeProfileId] = useLocalStorage<string>(ACTIVE_PROFILE_STORAGE_KEY, () => "");
  const [ingredients, , ingredientsHydrated] = useLocalStorage<Ingredient[]>(
    INGREDIENTS_STORAGE_KEY,
    () => []
  );
  const [templates, setTemplates, templatesHydrated] = useLocalStorage<QuoteTemplate[]>(
    TEMPLATES_STORAGE_KEY,
    () => []
  );

  const hydrated = draftHydrated && catalogHydrated && ingredientsHydrated && templatesHydrated;
  const editingItem = editingId ? catalog.find((c) => c.id === editingId) : undefined;
  const state = editingItem ? editingItem.state : draft;
  const notFound = editingId && !editingItem;

  // Every keystroke updates the catalog item's live state instantly (so the
  // displayed numbers never lag), but only *commits* a Cost History
  // snapshot after the user pauses — otherwise typing "1200" into a cost
  // field appends one snapshot per digit instead of one per real edit.
  useDebouncedCommit(editingId ? state : null, HISTORY_COMMIT_DELAY_MS, () => {
    if (!editingId) return;
    setCatalog((current) => {
      const item = current.find((i) => i.id === editingId);
      return item ? upsert(current, commitHistorySnapshot(item)) : current;
    });
  });

  if (!hydrated) {
    return <PageSkeleton />;
  }

  function setState(next: CalculatorState) {
    if (editingItem) {
      setCatalog(upsert(catalog, updateItemStateLive(editingItem, next, activeProfileId || undefined)));
    } else {
      setDraft(next);
    }
  }

  function saveToCatalog() {
    const item = newCatalogItem(draft);
    setCatalog([...catalog, item]);
    setDraft(defaultState(draft.vertical));
    router.push(`/costing?id=${item.id}`);
  }

  function setStatus(status: JobStatus) {
    if (!editingItem) return;
    setCatalog(upsert(catalog, { ...editingItem, status }));
  }

  function reset() {
    if (!window.confirm(t("costing.confirmClear"))) return;
    if (editingItem) {
      setCatalog(upsert(catalog, updateItemState(editingItem, defaultState(editingItem.state.vertical))));
    } else {
      setDraft(defaultState(draft.vertical));
    }
  }

  if (notFound) {
    return (
      <div className="card p-5 max-w-md">
        <p className="text-sm text-text-muted">
          {t("costing.notFound")}{" "}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {t("costing.backToCatalog")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          {editingItem && (
            <Link href="/catalog" className="text-xs text-accent hover:text-accent-strong font-medium">
              {t("costing.catalogBackLink")}
            </Link>
          )}
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-2xl">
              {getModuleText(lang, MODULES.find((m) => m.slug === "calculator")!).name}
            </h1>
            {editingItem && (
              <select
                value={editingItem.status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                aria-label="Job status"
                className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none cursor-pointer ${
                  editingItem.status === "invoiced"
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
            )}
          </div>
          <p className="mt-1 text-text-muted">
            {state.itemName || t("costing.defaultTitle")}
            {t("costing.savedToDevice")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-none">
          {!editingItem && (
            <button
              type="button"
              onClick={saveToCatalog}
              className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
            >
              {t("costing.saveToCatalog")}
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-sm text-text-muted hover:text-bad transition-colors"
          >
            {t("costing.startOver")}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <ItemEditor
          state={state}
          onChange={setState}
          ingredients={ingredients}
          sideExtra={
            <TemplatesCard
              state={state}
              onChange={setState}
              templates={templates}
              onTemplatesChange={setTemplates}
            />
          }
        />
      </div>

      <p className="mt-8 text-xs text-text-muted">
        <span className="text-accent">●</span>{" "}
        {editingItem ? t("costing.savedAutoCatalog") : t("costing.savedAutoBrowser")}
        · {t("costing.conceptNote")}
      </p>
    </div>
  );
}
