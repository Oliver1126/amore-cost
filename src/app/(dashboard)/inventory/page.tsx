"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, logSale, upsert, type CatalogItem } from "@/lib/catalog";
import { ACTIVE_PROFILE_STORAGE_KEY } from "@/lib/team";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

export default function InventoryPage() {
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, hydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [activeProfileId] = useLocalStorage<string>(ACTIVE_PROFILE_STORAGE_KEY, () => "");
  const [drafts, setDrafts] = useState<Record<string, { stock: string; sale: string }>>({});

  if (!hydrated) {
    return <PageSkeleton />;
  }
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "inventory")!).name;
  const catalogName = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;

  function draftFor(id: string) {
    return drafts[id] ?? { stock: "", sale: "" };
  }

  function setDraft(id: string, patch: Partial<{ stock: string; sale: string }>) {
    setDrafts((d) => ({ ...d, [id]: { ...draftFor(id), ...patch } }));
  }

  function addStock(item: CatalogItem) {
    const n = Number(draftFor(item.id).stock);
    if (!n || n <= 0) return;
    setCatalog(
      upsert(catalog, {
        ...item,
        stockOnHand: Math.max(0, item.stockOnHand + n),
        updatedAt: new Date().toISOString(),
      })
    );
    setDraft(item.id, { stock: "" });
  }

  function setThreshold(item: CatalogItem, value: number) {
    setCatalog(
      upsert(catalog, { ...item, lowStockThreshold: Math.max(0, value), updatedAt: new Date().toISOString() })
    );
  }

  function sell(item: CatalogItem) {
    const n = Number(draftFor(item.id).sale);
    if (!n || n <= 0) return;
    setCatalog(upsert(catalog, logSale(item, n, activeProfileId || undefined)));
    setDraft(item.id, { sale: "" });
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("inventory.description")}</p>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("inventory.emptyPrefix")}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {catalogName}
          </Link>
          {t("inventory.emptySuffix")}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {catalog.map((item) => {
            const low = item.stockOnHand <= item.lowStockThreshold;
            const d = draftFor(item.id);
            return (
              <div key={item.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <Link
                      href={`/costing?id=${item.id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {item.state.itemName || t("common.untitled")}
                    </Link>
                    <p className="text-sm text-text-muted mt-0.5">
                      {low ? (
                        <span className="text-bad font-medium">{t("inventory.lowStock")}</span>
                      ) : (
                        t("inventory.inStock")
                      )}{" "}
                      · {item.stockOnHand} {t("inventory.onHandPrefix")}{" "}
                      <input
                        type="number"
                        value={item.lowStockThreshold}
                        onChange={(e) => setThreshold(item, Number(e.target.value) || 0)}
                        className="font-num w-14 rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-center"
                        aria-label={`Low-stock threshold for ${item.state.itemName}`}
                      />
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        placeholder={t("common.qty")}
                        value={d.stock}
                        onChange={(e) => setDraft(item.id, { stock: e.target.value })}
                        aria-label={`Stock to add for ${item.state.itemName}`}
                        className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right"
                      />
                      <button
                        type="button"
                        onClick={() => addStock(item)}
                        className="text-sm font-medium text-accent hover:text-accent-strong px-2"
                      >
                        {t("inventory.addStock")}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        placeholder={t("common.qty")}
                        value={d.sale}
                        onChange={(e) => setDraft(item.id, { sale: e.target.value })}
                        aria-label={`Quantity sold for ${item.state.itemName}`}
                        className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right"
                      />
                      <button
                        type="button"
                        onClick={() => sell(item)}
                        className="rounded-lg bg-accent text-accent-ink px-3 py-1.5 text-sm font-medium hover:bg-accent-strong transition-colors"
                      >
                        {t("inventory.logSale")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
