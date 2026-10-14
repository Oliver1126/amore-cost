"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { defaultState, STORAGE_KEY, computePriceBreakdown, computeBreakEven, type CalculatorState } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, featuredState, type CatalogItem } from "@/lib/catalog";
import { peso } from "@/lib/format";
import {
  OPEX_STORAGE_KEY,
  defaultOpexSettings,
  totalOpex,
  opexWithContingency,
  newOpexItem,
  type OpexItem,
  type OpexSettings,
} from "@/lib/opex";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

export default function BreakEvenPage() {
  const { lang, t } = useLanguage();
  const [draft, , draftHydrated] = useLocalStorage<CalculatorState>(STORAGE_KEY, () =>
    defaultState()
  );
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [opex, setOpex, opexHydrated] = useLocalStorage<OpexSettings>(
    OPEX_STORAGE_KEY,
    defaultOpexSettings
  );

  const hydrated = draftHydrated && catalogHydrated && opexHydrated;
  if (!hydrated) {
    return <PageSkeleton />;
  }

  // Same fallback rule Overview uses (src/lib/catalog.ts's
  // `featuredState`) — otherwise this page could say "you haven't
  // priced anything yet" right after Overview showed a real number
  // for the same item, just because "Save to Catalog" already reset
  // the draft.
  const featured = featuredState(draft, catalog);
  const state = featured?.state ?? draft;
  const effectiveOpex = opexWithContingency(opex.items, opex.contingencyPercent);
  const breakdown = computePriceBreakdown(state);
  const breakEven = computeBreakEven(effectiveOpex, breakdown.profitPerUnit);
  const hasItem = !!featured;
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "break-even")!).name;
  const costingName = getModuleText(lang, MODULES.find((m) => m.slug === "calculator")!).name;

  function updateOpexItem(id: string, patch: Partial<Pick<OpexItem, "label" | "amountPerMonth">>) {
    setOpex({
      ...opex,
      items: opex.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addOpexItem() {
    setOpex({ ...opex, items: [...opex.items, newOpexItem()] });
  }

  function removeOpexItem(id: string) {
    setOpex({ ...opex, items: opex.items.filter((item) => item.id !== id) });
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[56ch]">
        {lang === "tl" ? "Gumagamit ng presyong itinakda mo sa " : "Uses the price you set on "}
        <Link href="/costing" className="text-accent hover:text-accent-strong font-medium">
          {costingName}
        </Link>{" "}
        {lang === "tl"
          ? "para malaman kung ilang unit ang sasakop sa buwanang fixed cost mo."
          : "to work out how many units cover your monthly fixed costs."}
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {hasItem ? (
          <>
            <div className="card p-5">
              <p className="text-sm text-text-muted">{state.itemName}</p>
              <p className="font-num text-2xl font-semibold mt-2">₱{peso(breakdown.priceCustomerPays)}</p>
              <p className="text-xs text-text-muted mt-1">{t("breakEven.pricePerUnit")}</p>
            </div>
            <div className="rounded-2xl bg-accent text-accent-ink p-5 shadow-sm">
              <p className="text-sm text-accent-ink/80">{t("breakEven.unitsNeeded")}</p>
              <p className="font-num text-3xl font-bold mt-2">
                {breakEven.achievable ? breakEven.unitsPerMonth.toLocaleString("en-PH") : "—"}
              </p>
              <p className="text-xs text-accent-ink/70 mt-1">{t("breakEven.toCover")}</p>
            </div>
          </>
        ) : (
          <div className="card px-5 py-4 text-sm text-text-muted sm:col-span-2">
            {lang === "tl" ? "Wala ka pang na-presyuhan — pumunta sa " : "You haven't priced anything yet — go to "}
            <Link href="/costing" className="text-accent hover:text-accent-strong font-medium">
              {costingName}
            </Link>{" "}
            {lang === "tl"
              ? "para makita ang mga unit na kailangan mo. Puwede mo nang i-set up ang OPEX mo sa ibaba habang naghihintay."
              : "to see units needed. You can set up your OPEX below in the meantime."}
          </div>
        )}

        <div className="card p-5 sm:col-span-2">
          <p className="text-sm text-text-muted">{t("breakEven.opexTitle")}</p>
          <p className="text-xs text-text-muted mt-1">{t("breakEven.opexSharedNote")}</p>
          <div className="mt-3 space-y-2">
            {opex.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_8rem_1.75rem] gap-2 items-center">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateOpexItem(item.id, { label: e.target.value })}
                  placeholder={t("breakEven.opexLabelPlaceholder")}
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
                />
                <div className="relative">
                  <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={item.amountPerMonth || ""}
                    onChange={(e) => updateOpexItem(item.id, { amountPerMonth: Number(e.target.value) || 0 })}
                    placeholder="0.00"
                    aria-label={`${t("breakEven.opexAmountLabel")}: ${item.label || t("breakEven.opexLabelPlaceholder")}`}
                    className="font-num w-full rounded-lg border border-border bg-surface-muted pl-6 pr-2 py-2 text-sm text-right focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOpexItem(item.id)}
                  aria-label={`${t("common.remove")}: ${item.label || t("breakEven.opexLabelPlaceholder")}`}
                  className="w-7 h-7 rounded-lg text-text-muted hover:text-bad hover:bg-bad-soft transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOpexItem}
            className="mt-3 text-sm font-medium text-accent hover:text-accent-strong"
          >
            {t("breakEven.addOpexItem")}
          </button>

          <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">{t("breakEven.totalOpex")}</p>
              <p className="font-num text-lg font-semibold mt-1">₱{peso(totalOpex(opex.items))}</p>
            </div>
            <label className="block">
              <span className="text-sm text-text-muted">{t("breakEven.contingency")}</span>
              <div className="relative mt-1 max-w-[8rem]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={opex.contingencyPercent || ""}
                  onChange={(e) =>
                    setOpex({ ...opex, contingencyPercent: Number(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="font-num w-full rounded-lg border border-border bg-surface-muted pl-3 pr-7 py-2 text-sm text-right focus:outline-none focus:border-accent"
                />
                <span className="font-num absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                  %
                </span>
              </div>
            </label>
          </div>
          {opex.contingencyPercent > 0 && (
            <p className="mt-3 text-xs text-text-muted">
              {t("breakEven.effectiveOpexPrefix")}{" "}
              <strong className="text-text font-num">₱{peso(effectiveOpex)}</strong>{" "}
              {t("breakEven.effectiveOpexSuffix")}
            </p>
          )}

          {hasItem && (
            <div className="mt-4 pt-4 border-t border-border">
              {breakEven.achievable ? (
                <p className="text-sm text-text-muted">
                  {lang === "tl" ? "Kailangan mong magbenta ng " : "You need to sell "}
                  <span className="font-num font-semibold text-text">
                    {breakEven.unitsPerMonth.toLocaleString("en-PH")}
                  </span>{" "}
                  {lang === "tl"
                    ? "unit bawat buwan para masakop ang fixed cost mo sa presyong ito."
                    : "units a month to cover your fixed costs at this price."}
                </p>
              ) : (
                <p className="text-sm text-bad">
                  {breakdown.profitPerUnit < 0
                    ? t("breakEven.lossMessage")
                    : t("breakEven.noMarginMessage")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
