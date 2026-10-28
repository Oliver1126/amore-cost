import type { ReactNode } from "react";
import type { CalculatorState } from "@/lib/calculator";
import type { Ingredient } from "@/lib/ingredients";
import { CostForm } from "@/components/CostForm";
import { StatCards } from "@/components/StatCards";
import { CostComposition } from "@/components/CostComposition";
import { StrategyCard } from "@/components/StrategyCard";
import { TaxCard } from "@/components/TaxCard";
import { BatchCard } from "@/components/BatchCard";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/lib/i18n";

/** The full cost-to-price editor — vertical, cost lines, labor/packaging/overhead, tax, pricing strategy — shared between the standalone Costing & Pricing page and Catalog Management's edit modal so the two never diverge. Cost Composition and Batch size stay visible at a glance; Price using, Tax, and `sideExtra` (the full page's quote templates) sit behind a collapsed-by-default "Advanced Pricing Settings" panel — most edits are cost-line edits, not strategy changes, so the default view stays focused on the numbers that change every time. */
export function ItemEditor({
  state,
  onChange,
  ingredients,
  sideExtra,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  ingredients: Ingredient[];
  sideExtra?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <StatCards state={state} onChange={onChange} />
      <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
        <CostComposition state={state} />
        <BatchCard state={state} onChange={onChange} />
      </div>
      <div className="mt-6">
        <CollapsiblePanel title={t("itemEditor.advancedPricingSettings")}>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <StrategyCard state={state} onChange={onChange} />
            <TaxCard state={state} onChange={onChange} />
            {sideExtra}
          </div>
        </CollapsiblePanel>
      </div>
      <div className="mt-6">
        <CostForm state={state} onChange={onChange} ingredients={ingredients} />
      </div>
    </div>
  );
}
