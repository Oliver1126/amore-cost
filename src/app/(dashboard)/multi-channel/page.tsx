"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CATALOG_STORAGE_KEY, newId, upsert, type CatalogItem, type ChannelPrice } from "@/lib/catalog";
import { computePriceBreakdown, channelAdjustedPrice } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

const PRESET_CHANNELS = [
  { name: "Shopee", feePercent: 6 },
  { name: "Lazada", feePercent: 8 },
  { name: "In-person", feePercent: 0 },
];

export default function MultiChannelPage() {
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, hydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!hydrated) {
    return <PageSkeleton />;
  }

  const item = catalog.find((c) => c.id === selectedId) ?? catalog[0];
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "multi-channel")!).name;
  const catalogName = getModuleText(lang, MODULES.find((m) => m.slug === "catalog")!).name;
  const channelDisplayName = (name: string) => (lang === "tl" && name === "In-person" ? t("multiChannel.inPerson") : name);

  function updateChannels(channels: ChannelPrice[]) {
    if (!item) return;
    setCatalog(upsert(catalog, { ...item, channels, updatedAt: new Date().toISOString() }));
  }

  function addChannel(name: string, feePercent: number) {
    if (!item) return;
    updateChannels([...item.channels, { id: newId(), name, feePercent }]);
  }

  function removeChannel(id: string) {
    if (!item) return;
    updateChannels(item.channels.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("multiChannel.description")}</p>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("common.saveItemFirstPrefix")}
          <Link href="/catalog" className="text-accent hover:text-accent-strong font-medium">
            {catalogName}
          </Link>
          {t("common.saveItemFirstSuffix")}
        </div>
      ) : (
        <>
          <div className="mt-6 max-w-xs">
            <select
              value={item?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.state.itemName || t("common.untitled")}
                </option>
              ))}
            </select>
          </div>

          {item && (
            <div className="mt-6 card overflow-hidden max-w-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="font-medium px-5 py-3">{t("multiChannel.channel")}</th>
                    <th className="font-medium px-5 py-3 text-right">{t("multiChannel.fee")}</th>
                    <th className="font-medium px-5 py-3 text-right">{t("multiChannel.priceToCharge")}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {item.channels.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-text-muted">
                        {t("multiChannel.noChannels")}
                      </td>
                    </tr>
                  ) : (
                    item.channels.map((ch) => {
                      const breakdown = computePriceBreakdown(item.state);
                      const adjusted = channelAdjustedPrice(breakdown, ch.feePercent);
                      return (
                        <tr key={ch.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-3 font-medium">{channelDisplayName(ch.name)}</td>
                          <td className="px-5 py-3 text-right font-num">{ch.feePercent}%</td>
                          <td className="px-5 py-3 text-right font-num font-medium">
                            ₱{peso(adjusted.final)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeChannel(ch.id)}
                              className="text-text-muted hover:text-bad transition-colors"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2">
                {PRESET_CHANNELS.filter(
                  (p) => !item.channels.some((c) => c.name === p.name)
                ).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => addChannel(p.name, p.feePercent)}
                    className="text-sm font-medium text-accent hover:text-accent-strong"
                  >
                    + {channelDisplayName(p.name)} ({p.feePercent}%)
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
