"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { defaultState, type CalculatorState } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, newCatalogItem, type CatalogItem } from "@/lib/catalog";
import { catalogToCSV, downloadCSV, parseCostItemsCSV } from "@/lib/csv";
import { buildBackup, downloadBackup, parseBackup, restoreBackup } from "@/lib/backup";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

export default function DocumentsPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [catalog, setCatalog, hydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return <PageSkeleton />;
  }
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "documents")!).name;
  const catalogName = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;

  function downloadFullBackup() {
    downloadBackup(buildBackup());
  }

  async function handleRestore(file: File) {
    let backup;
    try {
      backup = parseBackup(await file.text());
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : lang === "tl" ? "Hindi mabasa ang file na iyon." : "Couldn't read that file."
      );
      return;
    }
    const confirmMsg =
      lang === "tl"
        ? `Papalitan nito ang lahat sa Amore Cost — ang Katalogo, Aklatan ng Sangkap, at kasaysayan mo — ng backup mula ${backup.exportedAt.slice(0, 10)}. Hindi na ito puwedeng bawiin. Magpatuloy?`
        : `This replaces everything in Amore Cost — your Catalog, Ingredient Library, and history — with the backup from ${backup.exportedAt.slice(0, 10)}. This can't be undone. Continue?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    restoreBackup(backup);
    window.location.reload();
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const items = parseCostItemsCSV(text);
    if (items.length === 0) {
      window.alert(
        lang === "tl"
          ? "Walang nahanap na rows sa file na iyon. Kailangang column: label,quantity,unit,amount"
          : "Couldn't find any rows in that file. Expected columns: label,quantity,unit,amount"
      );
      return;
    }
    const state: CalculatorState = {
      ...defaultState(),
      itemName: file.name.replace(/\.csv$/i, ""),
      costItems: items,
    };
    const item = newCatalogItem(state);
    setCatalog([...catalog, item]);
    router.push(`/costing?id=${item.id}`);
  }

  function exportCatalog() {
    downloadCSV("amore-cost-catalog.csv", catalogToCSV(catalog));
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("documents.description")}</p>

      <div className="mt-6 rounded-2xl border-[1.5px] border-accent bg-accent-soft p-5">
        <p className="text-sm font-medium text-accent-strong">{t("documents.fullBackupTitle")}</p>
        <p className="text-sm text-text-muted mt-1 max-w-[64ch]">{t("documents.fullBackupDesc")}</p>
        <input
          ref={backupInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleRestore(file);
            e.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadFullBackup}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("documents.downloadBackup")}
          </button>
          <button
            type="button"
            onClick={() => backupInput.current?.click()}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-accent transition-colors"
          >
            {t("documents.restoreBackup")}
          </button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-medium">{t("documents.importTitle")}</p>
          <p className="text-sm text-text-muted mt-1">{t("documents.importDesc")}</p>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-4 rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            {t("documents.chooseCsv")}
          </button>
        </div>

        <div className="card p-5">
          <p className="text-sm font-medium">{t("documents.exportTitle")}</p>
          <p className="text-sm text-text-muted mt-1">{t("documents.exportDesc")}</p>
          <button
            type="button"
            onClick={exportCatalog}
            disabled={catalog.length === 0}
            className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-accent transition-colors disabled:opacity-40 disabled:hover:border-border"
          >
            {t("documents.downloadCatalogCsv")}
          </button>
        </div>
      </div>

      <p className="mt-8 mb-3 text-sm text-text-muted">{t("documents.quotationsTitle")}</p>
      {catalog.length === 0 ? (
        <div className="card p-5 text-sm text-text-muted max-w-md">
          {t("documents.quotationsEmptyPrefix")}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {catalogName}
          </Link>
          {t("documents.quotationsEmptySuffix")}
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {catalog.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm font-medium">{item.state.itemName || t("common.untitled")}</span>
              <Link
                href={`/documents/print/${item.id}`}
                target="_blank"
                className="text-sm font-medium text-accent hover:text-accent-strong"
              >
                {t("documents.printLink")}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
