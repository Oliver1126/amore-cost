"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  defaultState,
  STORAGE_KEY,
  computePriceBreakdown,
  computeBreakEven,
  type CalculatorState,
} from "@/lib/calculator";
import { OPEX_STORAGE_KEY, defaultOpexSettings, opexWithContingency, type OpexSettings } from "@/lib/opex";
import { CATALOG_STORAGE_KEY, featuredState, type CatalogItem } from "@/lib/catalog";
import { generateInsights } from "@/lib/insights";
import { MODULES } from "@/lib/modules";
import { StatCards } from "@/components/StatCards";
import { CostComposition } from "@/components/CostComposition";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function OverviewPage() {
  const { lang, t } = useLanguage();
  const [draft, , draftHydrated] = useLocalStorage<CalculatorState>(STORAGE_KEY, () =>
    defaultState()
  );
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [opex, , opexHydrated] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);

  const hydrated = draftHydrated && catalogHydrated && opexHydrated;
  if (!hydrated) {
    return <PageSkeleton />;
  }

  // Prefer an in-progress unsaved draft; otherwise fall back to the
  // most recently touched catalog item — the shared rule in
  // src/lib/catalog.ts's `featuredState`, so Break-Even can't disagree
  // with what Overview is showing for the same item.
  const resolved = featuredState(draft, catalog);
  const featured = resolved
    ? {
        state: resolved.state,
        editHref: resolved.catalogItem ? `/costing?id=${resolved.catalogItem.id}` : "/costing",
        isDraft: resolved.isDraft,
      }
    : undefined;

  const breakdown = featured ? computePriceBreakdown(featured.state) : undefined;
  const breakEven = featured
    ? computeBreakEven(
        opexWithContingency(opex.items, opex.contingencyPercent),
        breakdown!.profitPerUnit
      )
    : undefined;

  const insights = generateInsights(catalog, lang);
  const overviewTitle = getModuleText(lang, MODULES[0]).name;
  const summary =
    lang === "tl"
      ? `Buod ng "${featured?.state.itemName}"${featured?.isDraft ? " (hindi pa naa-save)" : ""} — naka-save lang sa device na ito ang lahat sa ibaba.`
      : `Here's a summary of "${featured?.state.itemName}"${featured?.isDraft ? " (unsaved)" : ""} — everything below is saved on this device only.`;

  return (
    <div>
      <h1 className="font-display text-2xl">{overviewTitle}</h1>
      <p className="mt-1 text-text-muted">{featured ? summary : t("overview.noDraft")}</p>

      {catalog.length > 0 && (
        <div className="mt-6">
          <InsightsPanel insights={insights} />
        </div>
      )}

      {!featured ? (
        <Link
          href="/costing"
          className="mt-6 inline-block rounded-xl bg-accent text-accent-ink px-4 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors"
        >
          {t("overview.startCta")}
        </Link>
      ) : (
        <>
          <div className="mt-6">
            <StatCards state={featured.state} />
          </div>

          <div className="mt-6 grid lg:grid-cols-2 gap-6 items-start">
            <CostComposition state={featured.state} />

            <div className="space-y-4">
              <div className="card p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-text-muted">{t("overview.breakEven")}</p>
                  <p className="font-num text-xl font-semibold mt-1">
                    {breakEven!.achievable
                      ? `${breakEven!.unitsPerMonth.toLocaleString("en-PH")} ${t("overview.unitsPerMonth")}`
                      : t("overview.breakEvenNotReachable")}
                  </p>
                </div>
                <Link
                  href="/break-even"
                  className="text-sm font-medium text-accent hover:text-accent-strong flex-none"
                >
                  {t("overview.open")}
                </Link>
              </div>

              <div className="card p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-text-muted">
                    {catalog.length > 0
                      ? lang === "tl"
                        ? `${catalog.length} item sa katalogo mo`
                        : `${catalog.length} item${catalog.length > 1 ? "s" : ""} in your catalog`
                      : t("overview.editing")}
                  </p>
                  <p className="text-sm mt-1">
                    {catalog.length > 0 ? t("overview.seeAll") : t("overview.adjust")}
                  </p>
                </div>
                <Link
                  href={catalog.length > 0 ? "/catalog" : featured.editHref}
                  className="text-sm font-medium text-accent hover:text-accent-strong flex-none"
                >
                  {t("overview.open")}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="mt-8 mb-3 text-sm text-text-muted">{t("overview.allModules")}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.filter((m) => m.slug !== "overview").map((m) => {
          const Icon = m.icon;
          const { name, description, note } = getModuleText(lang, m);
          return (
            <Link
              key={m.slug}
              href={m.href}
              className="card p-4 hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-accent flex-none" strokeWidth={2} aria-hidden="true" />
                <p className="text-sm font-medium">{name}</p>
              </div>
              <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{description}</p>
              {note && (
                <p className="text-[11px] text-accent-strong mt-1.5 line-clamp-2">{note}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
