import Link from "next/link";
import type { Insight } from "@/lib/insights";
import { useLanguage } from "@/lib/i18n";

const SEVERITY_STYLES: Record<Insight["severity"], string> = {
  critical: "border-bad/40 bg-bad-soft",
  warning: "border-bad/20 bg-bad-soft/60",
  info: "border-accent/25 bg-accent-soft",
};

const SEVERITY_DOT: Record<Insight["severity"], string> = {
  critical: "bg-bad",
  warning: "bg-bad/70",
  info: "bg-accent-strong",
};

/** Renders `generateInsights()`'s output — see src/lib/insights.ts and docs/business/product-depth-analysis.md for what this is actually for: specific, personalized recommendations instead of just a number to interpret. */
export function InsightsPanel({ insights }: { insights: Insight[] }) {
  const { t } = useLanguage();

  return (
    <div className="card p-5">
      <p className="text-sm font-medium">{t("overview.insightsTitle")}</p>
      <p className="text-xs text-text-muted mt-1">{t("overview.insightsSubtitle")}</p>

      {insights.length === 0 ? (
        <p className="text-sm text-text-muted mt-4">{t("overview.insightsEmpty")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {insights.map((insight) => {
            const content = (
              <div
                className={`rounded-lg border px-3 py-2.5 text-sm flex gap-2.5 ${SEVERITY_STYLES[insight.severity]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-none ${SEVERITY_DOT[insight.severity]}`}
                  aria-hidden="true"
                />
                <span>{insight.message}</span>
              </div>
            );
            return (
              <li key={insight.id}>
                {insight.itemId ? (
                  <Link href={`/input?edit=${insight.itemId}`} className="block hover:opacity-90 transition-opacity">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
