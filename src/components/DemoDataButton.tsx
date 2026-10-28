"use client";

import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { INGREDIENTS_STORAGE_KEY, type Ingredient } from "@/lib/ingredients";
import { OPEX_STORAGE_KEY, defaultOpexSettings, type OpexSettings } from "@/lib/opex";
import { clearDemoData, loadDemoData } from "@/lib/demo";
import { useLanguage } from "@/lib/i18n";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Writes straight to localStorage and reloads, the same way Restore
 * backup does — each page holds its own `useLocalStorage` copy of these
 * keys, so writing through one page's hooks would leave the others stale.
 */
function apply(mode: "load" | "clear") {
  const fn = mode === "load" ? loadDemoData : clearDemoData;
  const next = fn(
    read<CatalogItem[]>(CATALOG_STORAGE_KEY, []),
    read<Ingredient[]>(INGREDIENTS_STORAGE_KEY, []),
    read<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings())
  );
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(next.catalog));
  window.localStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(next.ingredients));
  window.localStorage.setItem(OPEX_STORAGE_KEY, JSON.stringify(next.opex));
  window.location.reload();
}

export function TryDemoButton() {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => apply("load")}
      title={t("demo.tryHint")}
      className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
    >
      {t("demo.try")}
    </button>
  );
}

export function DemoBanner() {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-info/40 bg-info/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm">{t("demo.active")}</p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("demo.confirmClear"))) apply("clear");
        }}
        className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-bad hover:text-bad transition-colors"
      >
        {t("demo.clear")}
      </button>
    </div>
  );
}
