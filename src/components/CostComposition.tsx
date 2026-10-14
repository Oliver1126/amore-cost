import type { CalculatorState } from "@/lib/calculator";
import { materialsCost, laborCost } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

const SEGMENTS = [
  { key: "materials", labelKey: "costComp.materials", color: "bg-accent" },
  { key: "labor", labelKey: "costComp.labor", color: "bg-accent-strong" },
  { key: "packaging", labelKey: "costComp.packaging", color: "bg-text-muted" },
  { key: "overhead", labelKey: "costComp.overhead", color: "bg-border" },
] as const;

export function CostComposition({ state }: { state: CalculatorState }) {
  const { t } = useLanguage();
  const materials = materialsCost(state.costItems);
  const labor = laborCost(state);
  const values: Record<(typeof SEGMENTS)[number]["key"], number> = {
    materials,
    labor,
    packaging: state.packaging,
    overhead: state.overhead,
  };
  const total = materials + labor + state.packaging + state.overhead;

  return (
    <div className="card p-5">
      <p className="text-sm text-text-muted">{t("costComp.title")}</p>

      {total <= 0 ? (
        <p className="text-sm text-text-muted mt-4">{t("costComp.empty")}</p>
      ) : (
        <>
          <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-surface-muted">
            {SEGMENTS.map((s) => {
              const pct = (values[s.key] / total) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={s.key}
                  className={s.color}
                  style={{ width: `${pct}%` }}
                  title={`${t(s.labelKey as Parameters<typeof t>[0])}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <ul className="mt-4 space-y-2">
            {SEGMENTS.map((s) => (
              <li key={s.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-muted">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  {t(s.labelKey as Parameters<typeof t>[0])}
                </span>
                <span className="font-num">
                  ₱{peso(values[s.key])}{" "}
                  <span className="text-text-muted">
                    ({total > 0 ? ((values[s.key] / total) * 100).toFixed(1) : "0.0"}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
