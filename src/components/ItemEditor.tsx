import type { CalculatorState } from "@/lib/calculator";
import type { Ingredient } from "@/lib/ingredients";
import { IngredientLines, OtherCosts } from "@/components/CostForm";
import { PriceSummary } from "@/components/PriceSummary";
import { StrategyCard } from "@/components/StrategyCard";
import { TaxCard } from "@/components/TaxCard";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/lib/i18n";

/**
 * The body of Edit & Breakdown (decision 0042): the ingredient list is the
 * main work area, with other costs and the collapsed pricing settings under
 * it, and a slim live price panel beside it (sticky on desktop; on phones it
 * follows the ingredients and the modal footer carries a mini price bar). Recipe name, servings and
 * target margin live in the modal header — see CatalogEditModal.
 */
export function ItemEditor({
  state,
  onChange,
  ingredients,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  ingredients: Ingredient[];
}) {
  const { t } = useLanguage();

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_17.5rem] gap-6 items-start">
      <aside className="order-2 lg:sticky lg:top-0" aria-label={t("editor.priceTitle")}>
        <PriceSummary state={state} onChange={onChange} />
      </aside>
      <div className="order-1 min-w-0 space-y-6">
        <IngredientLines state={state} onChange={onChange} ingredients={ingredients} />
        <OtherCosts state={state} onChange={onChange} />
        <CollapsiblePanel title={t("itemEditor.advancedPricingSettings")}>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <StrategyCard state={state} onChange={onChange} />
            <TaxCard state={state} onChange={onChange} />
          </div>
        </CollapsiblePanel>
      </div>
    </div>
  );
}
