"use client";

import { useState } from "react";
import type { CalculatorState, CostItem } from "@/lib/calculator";
import { VERTICAL_LABELS, COMMON_UNITS, newCostItem, trueCost, packageLineAmount } from "@/lib/calculator";
import { linkedCostAmount, type Ingredient } from "@/lib/ingredients";
import { convertQuantity } from "@/lib/units";
import { peso } from "@/lib/format";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { OPEX_STORAGE_KEY, defaultOpexSettings, opexWithContingency, type OpexSettings } from "@/lib/opex";
import { useLanguage, getVerticalLabels, getModuleText } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";
import { InfoButton } from "./InfoButton";

export function CostForm({
  state,
  onChange,
  ingredients = [],
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  ingredients?: Ingredient[];
}) {
  const { lang, t } = useLanguage();
  const labels = getVerticalLabels(lang, state.vertical, VERTICAL_LABELS[state.vertical]);
  const ingredientsName = t("costForm.ingredientLibraryName");
  const breakEvenName = getModuleText(lang, MODULES.find((m) => m.slug === "break-even")!).name;
  const totalCost = trueCost(state);
  const [showOverheadCalc, setShowOverheadCalc] = useState(false);
  const [expectedVolume, setExpectedVolume] = useState("");
  const [opex] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);
  const opexTotal = opexWithContingency(opex.items, opex.contingencyPercent);
  const suggestedOverheadPerUnit = Number(expectedVolume) > 0 ? opexTotal / Number(expectedVolume) : 0;

  function updateItem(
    id: string,
    patch: Partial<
      Pick<
        CostItem,
        | "label"
        | "amount"
        | "quantity"
        | "unit"
        | "ingredientId"
        | "supplier"
        | "packagePrice"
        | "qtyPerPack"
        | "shippingFee"
        | "packUnit"
      >
    >
  ) {
    onChange({
      ...state,
      costItems: state.costItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  }

  function findIngredient(item: CostItem) {
    return item.ingredientId ? ingredients.find((i) => i.id === item.ingredientId) : undefined;
  }

  /** The single source of truth for what a line's amount should be, given its current fields — reused by every handler below so linking, quantity, unit, and package-field edits can never disagree on the math. Uses the raw `quantity` (no `|| 1` fallback) so this always agrees with `syncCostItem` (src/lib/ingredients.ts), the cascade path that recomputes the same line when the ingredient's price changes elsewhere — a mismatched fallback there once let a cleared (0) quantity show a nonzero cost here but silently drop to ₱0 on the next cascade. */
  function recompute(item: CostItem): number {
    const ing = findIngredient(item);
    if (ing) return linkedCostAmount(ing, item.quantity, item.unit);
    if (item.qtyPerPack) {
      return packageLineAmount(
        item.packagePrice || 0,
        item.qtyPerPack,
        item.shippingFee || 0,
        item.quantity || 0,
        item.unit,
        item.packUnit
      );
    }
    return item.amount;
  }

  function linkIngredient(item: CostItem, ingredientId: string) {
    if (!ingredientId) {
      // Unlinking still needs to go through recompute() — otherwise the
      // line keeps showing the stale linked amount, and if package fields
      // (packagePrice/qtyPerPack) are left over from before it was linked,
      // the line-cost cell stays stuck read-only against that stale value.
      const merged = { ...item, ingredientId: undefined };
      updateItem(item.id, { ingredientId: undefined, amount: recompute(merged) });
      return;
    }
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;
    // Always adopt the ingredient's own unit on link — every fresh cost
    // line defaults to "pcs" (src/lib/calculator.ts newCostItem), so
    // preserving `item.unit` here was effectively always preserving that
    // default, silently skipping unit conversion for any kg/L-priced
    // ingredient. The Portion Unit dropdown can still be changed to a
    // different (but convertible) unit right after linking.
    const unit = ing.unit;
    updateItem(item.id, {
      ingredientId,
      label: ing.name,
      unit,
      amount: linkedCostAmount(ing, item.quantity, unit),
    });
  }

  function setQuantity(item: CostItem, quantity: number) {
    const merged = { ...item, quantity };
    updateItem(item.id, { quantity, amount: recompute(merged) });
  }

  function updatePackageFields(
    item: CostItem,
    patch: Partial<Pick<CostItem, "supplier" | "packagePrice" | "qtyPerPack" | "shippingFee" | "packUnit">>
  ) {
    const merged = { ...item, ...patch };
    updateItem(item.id, { ...patch, amount: recompute(merged) });
  }

  function setUnit(item: CostItem, unit: string) {
    const merged = { ...item, unit };
    updateItem(item.id, { unit, amount: recompute(merged) });
  }

  function removeItem(id: string) {
    onChange({ ...state, costItems: state.costItems.filter((item) => item.id !== id) });
  }

  function addItem() {
    onChange({ ...state, costItems: [...state.costItems, newCostItem()] });
  }

  return (
    <div className="card p-6 space-y-7 min-w-0">
      <datalist id="calcost-units-cost-form">
        {COMMON_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <label className="block">
        <span className="text-sm text-text-muted">{t("costForm.whatPricing")}</span>
        <input
          type="text"
          value={state.itemName}
          onChange={(e) => onChange({ ...state, itemName: e.target.value })}
          placeholder={t("costForm.itemNamePlaceholder")}
          className="mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
        />
      </label>

      <fieldset className="min-w-0">
        <legend className="text-sm text-text-muted mb-3 flex items-center gap-1.5">
          {labels.itemNoun}s
          <InfoButton label={t("costForm.whatsThis")}>{t("costForm.packagePricingExplainer")}</InfoButton>
        </legend>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="font-medium py-2 pr-3 whitespace-nowrap min-w-[9rem]">{labels.itemNoun} {t("ingredients.name")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.supplier")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.packagePrice")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.qtyPerPack")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.shippingFee")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.packUnit")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.portionQty")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">{t("costForm.portionUnit")}</th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap">
                  {t("costForm.unitCostLabel")}{" "}
                  <span className="text-[9px] font-semibold bg-accent-soft text-accent-strong rounded-full px-1.5 py-0.5 align-middle">
                    {t("common.auto")}
                  </span>
                </th>
                <th className="font-medium py-2 pr-3 whitespace-nowrap text-right">
                  {t("catalog.lineCost")}{" "}
                  <span className="text-[9px] font-semibold bg-accent-soft text-accent-strong rounded-full px-1.5 py-0.5 align-middle">
                    {t("common.auto")}
                  </span>
                </th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {state.costItems.map((item, i) => {
                const linked = !!item.ingredientId;
                const linkedIngredient = linked
                  ? ingredients.find((ing) => ing.id === item.ingredientId)
                  : undefined;
                const converting =
                  linkedIngredient && item.unit && item.unit !== linkedIngredient.unit
                    ? convertQuantity(1, item.unit, linkedIngredient.unit) !== null
                    : false;
                const unitCost = item.amount / (item.quantity || 1);
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 align-top">
                    <td className="py-2 pr-3 min-w-[9rem]">
                      {ingredients.length > 0 && (
                        <select
                          value={item.ingredientId ?? ""}
                          onChange={(e) => linkIngredient(item, e.target.value)}
                          aria-label={`Link ${item.label || labels.itemNoun.toLowerCase()} to a library ingredient`}
                          className="w-full text-[11px] text-accent bg-transparent border-0 p-0 mb-1 focus:outline-none cursor-pointer"
                        >
                          <option value="">{t("costForm.customOption")}</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={item.label}
                        disabled={linked}
                        onChange={(e) => updateItem(item.id, { label: e.target.value })}
                        placeholder={i === 0 ? labels.itemPlaceholder : `Another ${labels.itemNoun.toLowerCase()}`}
                        className="w-full rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent disabled:opacity-60"
                      />
                      {converting && linkedIngredient && (
                        <p className="text-[10px] text-accent mt-1">
                          {lang === "tl" ? "Na-convert sa" : "Converted to"} {linkedIngredient.unit} {lang === "tl" ? "sa" : "at"} ₱
                          {linkedIngredient.costPerUnit}/{linkedIngredient.unit}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {linked ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <input
                          type="text"
                          value={item.supplier ?? ""}
                          onChange={(e) => updatePackageFields(item, { supplier: e.target.value })}
                          placeholder={t("costForm.supplierPlaceholder")}
                          className="w-28 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {linked ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.packagePrice || ""}
                          onChange={(e) => updatePackageFields(item, { packagePrice: Number(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {linked ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.qtyPerPack || ""}
                          onChange={(e) => updatePackageFields(item, { qtyPerPack: Number(e.target.value) || 0 })}
                          placeholder="1"
                          className="font-num w-16 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {linked ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.shippingFee || ""}
                          onChange={(e) => updatePackageFields(item, { shippingFee: Number(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="font-num w-20 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {linked ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <input
                          type="text"
                          list="calcost-units-cost-form"
                          value={item.packUnit ?? ""}
                          onChange={(e) => updatePackageFields(item, { packUnit: e.target.value })}
                          placeholder={item.unit || "kg"}
                          className="w-16 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={item.quantity || ""}
                        onChange={(e) => setQuantity(item, Number(e.target.value) || 0)}
                        placeholder="1"
                        aria-label={`Quantity of ${item.label || labels.itemNoun.toLowerCase()}`}
                        className="font-num w-16 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        list="calcost-units-cost-form"
                        value={item.unit}
                        onChange={(e) => setUnit(item, e.target.value)}
                        placeholder="pcs"
                        aria-label={`Unit of measure for ${item.label || labels.itemNoun.toLowerCase()}`}
                        className="w-16 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
                      />
                    </td>
                    <td className="py-2 pr-3 font-num text-text-muted whitespace-nowrap">
                      ₱{peso(unitCost)}/{item.unit || "unit"}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {linked || item.qtyPerPack ? (
                        <span className="font-num font-medium">₱{peso(item.amount)}</span>
                      ) : (
                        <div className="relative">
                          <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                            ₱
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={item.amount || ""}
                            onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) || 0 })}
                            placeholder="0.00"
                            aria-label={`Cost of ${item.label || labels.itemNoun.toLowerCase()}`}
                            className="font-num w-24 rounded-lg border border-border bg-surface-muted pl-6 pr-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}
                      {totalCost > 0 && item.amount > 0 && (
                        <p className="font-num text-[10px] text-text-muted mt-0.5">
                          {((item.amount / totalCost) * 100).toFixed(1)}% {t("costForm.percentOfCost")}
                        </p>
                      )}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.label || labels.itemNoun.toLowerCase()}`}
                        className="inline-flex items-center justify-center -m-2 p-2"
                      >
                        {/* Visible box stays a compact 28px to match this table's density; the
                            surrounding button padding + canceling negative margin brings the
                            actual clickable/tappable area up to 44px, same technique as
                            InfoButton.tsx, without changing the row's visual size. */}
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-bad hover:bg-bad-soft transition-colors">
                          ×
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {ingredients.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            {t("costForm.linkHintPrefix")}
            {labels.itemNoun.toLowerCase()}
            {t("costForm.linkHintSuffix")}
            <span className="text-accent">{ingredientsName}</span>
            {t("costForm.linkHintEnd")}
          </p>
        )}
        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm font-medium text-accent hover:text-accent-strong"
        >
          {t("costForm.addPrefix")}
          {labels.itemNoun.toLowerCase()}
        </button>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-text-muted">{labels.laborLabel} — hours</span>
          <input
            type="number"
            inputMode="decimal"
            value={state.laborHours || ""}
            onChange={(e) => onChange({ ...state, laborHours: Number(e.target.value) || 0 })}
            placeholder="0"
            className="font-num mt-2 w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-right focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">{t("costForm.ratePerHour")}</span>
          <div className="relative mt-2">
            <span className="font-num absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              ₱
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={state.laborRate || ""}
              onChange={(e) => onChange({ ...state, laborRate: Number(e.target.value) || 0 })}
              placeholder="0.00"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-7 pr-3 py-2.5 text-right focus:outline-none focus:border-accent"
            />
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-text-muted">{t("costForm.packaging")}</span>
          <div className="relative mt-2">
            <span className="font-num absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              ₱
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={state.packaging || ""}
              onChange={(e) => onChange({ ...state, packaging: Number(e.target.value) || 0 })}
              placeholder="0.00"
              aria-label="Packaging cost"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-7 pr-3 py-2.5 text-right focus:outline-none focus:border-accent"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">{t("costForm.overheadAllocation")}</span>
          <div className="relative mt-2">
            <span className="font-num absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              ₱
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={state.overhead || ""}
              onChange={(e) => onChange({ ...state, overhead: Number(e.target.value) || 0 })}
              placeholder="0.00"
              aria-label="Overhead allocation cost"
              className="font-num w-full rounded-xl border border-border bg-surface-muted pl-7 pr-3 py-2.5 text-right focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowOverheadCalc((v) => !v)}
            className="mt-1.5 text-[11px] text-accent hover:text-accent-strong"
          >
            {showOverheadCalc ? t("costForm.overheadCalcHide") : t("costForm.overheadCalcShow")}
          </button>
          {showOverheadCalc && (
            <div className="mt-2 bg-surface-muted rounded-lg p-3">
              {opexTotal <= 0 ? (
                <p className="text-xs text-text-muted">
                  {t("costForm.noOpexPrefix")}{" "}
                  <a href="/break-even" className="text-accent hover:text-accent-strong font-medium">
                    {breakEvenName}
                  </a>{" "}
                  {t("costForm.noOpexSuffix")}
                </p>
              ) : (
                <>
                  <p className="text-xs text-text-muted">
                    {t("costForm.opexIsPrefix")} ₱{peso(opexTotal)}{t("costForm.opexIsSuffix")}
                  </p>
                  <label className="block mt-2">
                    <span className="text-[11px] text-text-muted">{t("costForm.expectedVolume")}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={expectedVolume}
                      onChange={(e) => setExpectedVolume(e.target.value)}
                      placeholder="e.g. 200"
                      className="font-num mt-1 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent"
                    />
                  </label>
                  {suggestedOverheadPerUnit > 0 && (
                    <>
                      <p className="text-xs text-text-muted mt-2">
                        {t("costForm.suggestedOverheadPrefix")} ₱{peso(suggestedOverheadPerUnit)}{" "}
                        {t("costForm.suggestedOverheadSuffix")}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ ...state, overhead: suggestedOverheadPerUnit });
                          setShowOverheadCalc(false);
                        }}
                        className="mt-2 text-xs font-medium text-accent hover:text-accent-strong"
                      >
                        {t("costForm.useThisOverhead")}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
