"use client";

import { useState } from "react";
import type { CalculatorState, CostItem } from "@/lib/calculator";
import { COMMON_UNITS, newCostItem, trueCost, packageLineAmount, lineCost, effectiveYield, materialsCost } from "@/lib/calculator";
import { linkedCostAmount, withPack, type Ingredient, type IngredientPack } from "@/lib/ingredients";
import { convertQuantity } from "@/lib/units";
import { peso } from "@/lib/format";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { OPEX_STORAGE_KEY, defaultOpexSettings, opexWithContingency, type OpexSettings } from "@/lib/opex";
import { useLanguage, getVerticalLabels, getModuleText } from "@/lib/i18n";
import { VERTICAL_LABELS } from "@/lib/calculator";
import { MODULES } from "@/lib/modules";
import { InfoButton } from "./InfoButton";

type LinePatch = Partial<
  Pick<
    CostItem,
    "label" | "amount" | "quantity" | "unit" | "ingredientId" | "supplier" | "packagePrice" | "qtyPerPack" | "shippingFee" | "packUnit" | "yieldPercent"
  >
>;

const UNITS_LIST_ID = "amore-units";
const LIBRARY_LIST_ID = "amore-library";

/** Desktop column template, shared by the header and every row so they always line up. */
const COLS = "md:grid-cols-[minmax(11rem,1fr)_5rem_4.5rem_4.75rem_6.5rem_6.75rem_2rem]";

const inputCls =
  "w-full rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/60 focus:outline-none focus:border-accent";

/**
 * The ingredient lines of a recipe — a compact one-row-per-ingredient list
 * (decision 0042), replacing the old 12-column table. One combined name
 * field links to the Ingredient Library by typing/picking an exact name;
 * the five package fields (supplier, pack price, qty per pack, pack unit,
 * shipping) fold into a per-row "Pack price" drawer instead of five
 * mostly-empty columns. On an unlinked line the drawer edits the line's
 * own fields; on a linked line it edits the library ingredient itself
 * (via `onIngredientChange`), so the change cascades to every recipe.
 *
 * The cost math is unchanged: every edit goes through `recompute()`, which
 * must agree with `syncCostItem` (src/lib/ingredients.ts), the cascade that
 * recomputes the same line when an ingredient's price changes elsewhere.
 */
export function IngredientLines({
  state,
  onChange,
  ingredients = [],
  onIngredientChange,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  ingredients?: Ingredient[];
  /** Saves a library ingredient (and cascades it). Without it, linked lines get no Pack price drawer. */
  onIngredientChange?: (next: Ingredient) => void;
}) {
  const { lang, t } = useLanguage();
  const labels = getVerticalLabels(lang, state.vertical, VERTICAL_LABELS[state.vertical]);
  const totalCost = trueCost(state);
  const materials = materialsCost(state.costItems);
  const [openPack, setOpenPack] = useState<Record<string, boolean>>({});

  function updateItem(id: string, patch: LinePatch) {
    onChange({ ...state, costItems: state.costItems.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  function findIngredient(item: CostItem) {
    return item.ingredientId ? ingredients.find((i) => i.id === item.ingredientId) : undefined;
  }

  /** The single source of truth for a line's amount given its fields. Uses the raw `quantity` (no `|| 1` fallback) so it agrees with `syncCostItem`. */
  function recompute(item: CostItem): number {
    const ing = findIngredient(item);
    if (ing) return linkedCostAmount(ing, item.quantity, item.unit);
    if (item.qtyPerPack) {
      return packageLineAmount(item.packagePrice || 0, item.qtyPerPack, item.shippingFee || 0, item.quantity || 0, item.unit, item.packUnit);
    }
    return item.amount;
  }

  /** Typing a library ingredient's exact name links it (adopting its unit, so kg/L prices convert); editing the name away from it unlinks. */
  function setName(item: CostItem, value: string) {
    const match = ingredients.find((i) => i.name.trim().toLowerCase() === value.trim().toLowerCase());
    if (match && match.id !== item.ingredientId) {
      updateItem(item.id, {
        ingredientId: match.id,
        label: match.name,
        unit: match.unit,
        amount: linkedCostAmount(match, item.quantity, match.unit),
      });
      return;
    }
    if (!match && item.ingredientId) {
      // Unlinking still goes through recompute() so leftover package fields
      // can't leave the line stuck on a stale linked amount.
      const merged = { ...item, ingredientId: undefined };
      updateItem(item.id, { ingredientId: undefined, label: value, amount: recompute(merged) });
      return;
    }
    updateItem(item.id, { label: value });
  }

  function setRecomputed(item: CostItem, patch: LinePatch) {
    updateItem(item.id, { ...patch, amount: recompute({ ...item, ...patch }) });
  }

  function removeItem(id: string) {
    onChange({ ...state, costItems: state.costItems.filter((item) => item.id !== id) });
  }

  function addItem() {
    onChange({ ...state, costItems: [...state.costItems, newCostItem()] });
  }

  const mobileLabel = "md:hidden block text-[10px] uppercase tracking-wider text-text-muted mb-1";

  return (
    <section className="min-w-0">
      <datalist id={UNITS_LIST_ID}>
        {COMMON_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <datalist id={LIBRARY_LIST_ID}>
        {ingredients.map((ing) => (
          <option key={ing.id} value={ing.name}>{`₱${peso(ing.costPerUnit)}/${ing.unit}`}</option>
        ))}
      </datalist>

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base flex items-center gap-1.5">
          {t("editor.ingredients")}
          <span className="font-num text-xs font-medium text-text-muted bg-surface-muted rounded-full px-2 py-0.5">{state.costItems.length}</span>
          <InfoButton label={t("costForm.whatsThis")}>{t("costForm.packagePricingExplainer")}</InfoButton>
        </h3>
        <p className="font-num text-sm text-text-muted">
          <span className="font-semibold text-warn">₱{peso(materials)}</span> {t("editor.materials")}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-border overflow-hidden">
        <div className={`hidden md:grid ${COLS} gap-2 px-3 py-2 bg-surface-muted text-[11px] uppercase tracking-wider text-text-muted`}>
          <span>{labels.itemNoun}</span>
          <span className="text-right">{t("editor.qty")}</span>
          <span>{t("editor.unit")}</span>
          <span className="inline-flex items-center gap-1">
            {t("costForm.yield")}
            <InfoButton label={t("costForm.yieldWhat")}>{t("costForm.yieldHelp")}</InfoButton>
          </span>
          <span className="text-right">{t("costForm.unitCostLabel")}</span>
          <span className="text-right">{t("catalog.lineCost")}</span>
          <span />
        </div>

        {state.costItems.length === 0 && <p className="px-3 py-6 text-sm text-text-muted text-center">{t("editor.noIngredients")}</p>}

        <ul className="divide-y divide-border">
          {state.costItems.map((item, i) => {
            const linked = findIngredient(item);
            const converting = linked && item.unit && item.unit !== linked.unit && convertQuantity(1, item.unit, linked.unit) !== null;
            const cost = lineCost(item);
            const share = totalCost > 0 ? (cost / totalCost) * 100 : 0;
            const yieldPct = effectiveYield(item);
            // Unit cost is the as-bought price (matches the library's ₱/kg); yield's extra shows in the Yield cell.
            const amount = Number.isFinite(item.amount) ? item.amount : 0;
            const unitCost = amount / (item.quantity || 1);
            const yieldLoss = cost - amount;
            const hasPack = !!item.qtyPerPack;
            // Linked lines show (and edit) the library ingredient's pack; unlinked lines their own.
            const packSrc: IngredientPack & { unit: string } = linked ?? item;
            const canPack = !linked || !!onIngredientChange;
            const packOpen = canPack && (openPack[item.id] ?? false);
            const name = item.label || labels.itemNoun.toLowerCase();
            return (
              <li key={item.id} className="px-3 py-2.5 hover:bg-surface-muted/50 transition-colors">
                <div className={`grid grid-cols-4 gap-2 ${COLS} md:items-center`}>
                  {/* Name: col-span on mobile, first on desktop */}
                  <div className="col-span-3 md:col-span-1 order-1 min-w-0">
                    <div className="relative">
                      <input
                        type="text"
                        list={ingredients.length > 0 ? LIBRARY_LIST_ID : undefined}
                        value={item.label}
                        onChange={(e) => setName(item, e.target.value)}
                        placeholder={i === 0 ? labels.itemPlaceholder : t("editor.ingredientPlaceholder")}
                        aria-label={`${labels.itemNoun} ${i + 1}`}
                        className={`${inputCls} ${linked ? "pr-16 border-accent/40" : ""}`}
                      />
                      {linked && (
                        <span
                          title={t("editor.libraryTitle")}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-accent-soft text-accent-strong rounded-full px-1.5 py-0.5 pointer-events-auto cursor-help"
                        >
                          {t("editor.library")}
                        </span>
                      )}
                    </div>
                    {canPack && (
                      <button
                        type="button"
                        onClick={() => setOpenPack((o) => ({ ...o, [item.id]: !packOpen }))}
                        aria-expanded={packOpen}
                        className="mt-1 text-[11px] text-accent hover:text-accent-strong text-left"
                      >
                        {packSrc.qtyPerPack
                          ? `${t("editor.package")}: ₱${peso(packSrc.packagePrice || 0)} / ${packSrc.qtyPerPack} ${packSrc.packUnit || packSrc.unit}`
                          : `+ ${t("editor.package")}`}
                        {packSrc.supplier ? ` · ${packSrc.supplier}` : ""} <span aria-hidden>{packOpen ? "▴" : "▾"}</span>
                      </button>
                    )}
                  </div>

                  {/* Remove: top-right on mobile, last on desktop */}
                  <div className="order-2 md:order-7 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`${t("editor.remove")} ${name}`}
                      className="inline-flex items-center justify-center -m-2 p-2"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-bad hover:bg-bad-soft transition-colors">×</span>
                    </button>
                  </div>

                  <label className="order-3 md:order-2 block">
                    <span className={mobileLabel}>{t("editor.qty")}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={item.quantity || ""}
                      onChange={(e) => setRecomputed(item, { quantity: Number(e.target.value) || 0 })}
                      placeholder="1"
                      aria-label={`${t("editor.qty")} — ${name}`}
                      className={`font-num ${inputCls} text-right`}
                    />
                  </label>

                  <label className="order-4 md:order-3 block">
                    <span className={mobileLabel}>{t("editor.unit")}</span>
                    <input
                      type="text"
                      list={UNITS_LIST_ID}
                      value={item.unit}
                      onChange={(e) => setRecomputed(item, { unit: e.target.value })}
                      placeholder="pcs"
                      aria-label={`${t("editor.unit")} — ${name}`}
                      className={inputCls}
                    />
                  </label>

                  <label className="order-5 md:order-4 block">
                    <span className={mobileLabel}>{t("costForm.yield")}</span>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={1}
                        max={100}
                        value={item.yieldPercent ?? ""}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          updateItem(item.id, { yieldPercent: e.target.value === "" || !v ? undefined : Math.min(100, Math.max(1, v)) });
                        }}
                        placeholder="100"
                        aria-label={`${t("costForm.yield")} — ${name}`}
                        className={`font-num ${inputCls} pr-5 text-right placeholder:text-text! ${yieldPct < 100 ? "text-warn" : ""}`}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
                    </div>
                    {yieldLoss > 0.005 && (
                      <span className="font-num block mt-1 text-[10px] text-warn text-right" title={t("costForm.yieldHelp")}>
                        +₱{peso(yieldLoss)} {t("editor.yieldLoss")}
                      </span>
                    )}
                  </label>

                  <div className="hidden md:block order-5 text-right font-num text-xs leading-tight">
                    <span className="text-text-muted">₱{peso(unitCost)}/{item.unit || "unit"}</span>
                    {linked && (
                      <span className="block text-[10px] text-accent mt-0.5">
                        {converting ? "↻ " : ""}₱{peso(linked.costPerUnit)}/{linked.unit}
                      </span>
                    )}
                  </div>

                  <div className="order-6 text-right">
                    <span className={mobileLabel}>{t("catalog.lineCost")}</span>
                    {linked || hasPack ? (
                      <span className="font-num text-sm font-semibold block py-1.5">₱{peso(cost)}</span>
                    ) : (
                      <div className="relative">
                        <span className="font-num absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">₱</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.amount || ""}
                          onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) || 0 })}
                          placeholder="0.00"
                          aria-label={`${t("catalog.lineCost")} — ${name}`}
                          className={`font-num ${inputCls} pl-5 text-right`}
                        />
                      </div>
                    )}
                    {yieldLoss > 0.005 && !linked && !hasPack && (
                      <span className="font-num block mt-1 text-[10px] text-warn">
                        = ₱{peso(cost)} {t("costForm.afterYield")}
                      </span>
                    )}
                    {cost > 0 && (
                      <div className="mt-1 flex items-center justify-end gap-1.5" title={`${share.toFixed(1)}% ${t("costForm.percentOfCost")}`}>
                        <span className="h-1 w-6 rounded-full bg-surface-muted overflow-hidden" aria-hidden>
                          <span className="block h-full bg-warn" style={{ width: `${Math.min(100, share)}%` }} />
                        </span>
                        <span className="font-num text-[10px] text-text-muted whitespace-nowrap">
                          {share.toFixed(0)}% {t("editor.shareOfCost")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {packOpen && (
                  <div className="mt-2 rounded-lg bg-surface-muted p-3">
                    <p className={`text-[11px] ${linked ? "text-accent-strong" : "text-text-muted"}`}>
                      {linked ? t("editor.packLibraryNote").replace("{name}", linked.name) : t("editor.packageHint")}
                    </p>
                    <PackFields
                      values={packSrc}
                      unitPlaceholder={packSrc.unit || "kg"}
                      onChange={(patch) =>
                        linked && onIngredientChange ? onIngredientChange(withPack(linked, patch)) : setRecomputed(item, patch)
                      }
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={addItem}
          className="w-full border-t border-border px-3 py-2.5 text-sm font-medium text-accent hover:text-accent-strong hover:bg-accent-soft/50 transition-colors text-left"
        >
          + {t("editor.addIngredient")}
        </button>
      </div>

      {ingredients.length > 0 && <p className="mt-2 text-xs text-text-muted">{t("editor.libraryHint")}</p>}
    </section>
  );
}

/**
 * Supplier, pack price, qty per pack, pack unit and shipping — the "Pack
 * price" drawer's fields, shared by recipe lines (CostItem) and the
 * Ingredient Library (Ingredient), which store the same five fields.
 */
export function PackFields({
  values,
  unitPlaceholder,
  onChange,
  surface = "bg-surface",
  hideSupplier = false,
}: {
  values: IngredientPack;
  unitPlaceholder: string;
  onChange: (patch: IngredientPack) => void;
  surface?: string;
  /** For forms that already show supplier as its own field (IngredientForm). */
  hideSupplier?: boolean;
}) {
  const { t } = useLanguage();
  const label = "text-[10px] uppercase tracking-wider text-text-muted";
  const num = (v: string) => Number(v) || 0;
  return (
    <div className={`mt-2 grid grid-cols-2 gap-2 ${hideSupplier ? "sm:grid-cols-4" : "sm:grid-cols-5"}`}>
      {!hideSupplier && (
        <label className="block col-span-2 sm:col-span-1">
          <span className={label}>{t("costForm.supplier")}</span>
          <input
            type="text"
            value={values.supplier ?? ""}
            onChange={(e) => onChange({ supplier: e.target.value })}
            placeholder={t("costForm.supplierPlaceholder")}
            className={`mt-1 ${inputCls} ${surface}`}
          />
        </label>
      )}
      <label className="block">
        <span className={label}>{t("costForm.packagePrice")}</span>
        <input
          type="number"
          inputMode="decimal"
          value={values.packagePrice || ""}
          onChange={(e) => onChange({ packagePrice: num(e.target.value) })}
          placeholder="0.00"
          className={`mt-1 font-num ${inputCls} ${surface} text-right`}
        />
      </label>
      <label className="block">
        <span className={label}>{t("costForm.qtyPerPack")}</span>
        <input
          type="number"
          inputMode="decimal"
          value={values.qtyPerPack || ""}
          onChange={(e) => onChange({ qtyPerPack: num(e.target.value) })}
          placeholder="1"
          className={`mt-1 font-num ${inputCls} ${surface} text-right`}
        />
      </label>
      <label className="block">
        <span className={label}>{t("costForm.packUnit")}</span>
        <input
          type="text"
          list={UNITS_LIST_ID}
          value={values.packUnit ?? ""}
          onChange={(e) => onChange({ packUnit: e.target.value })}
          placeholder={unitPlaceholder}
          className={`mt-1 ${inputCls} ${surface}`}
        />
      </label>
      <label className="block">
        <span className={label}>{t("costForm.shippingFee")}</span>
        <input
          type="number"
          inputMode="decimal"
          value={values.shippingFee || ""}
          onChange={(e) => onChange({ shippingFee: num(e.target.value) })}
          placeholder="0.00"
          className={`mt-1 font-num ${inputCls} ${surface} text-right`}
        />
      </label>
    </div>
  );
}

/** Labor, packaging and overhead per serving — one compact row under the ingredients, with the OPEX-based overhead helper. */
export function OtherCosts({ state, onChange }: { state: CalculatorState; onChange: (next: CalculatorState) => void }) {
  const { lang, t } = useLanguage();
  const opexPageName = getModuleText(lang, MODULES.find((m) => m.slug === "opex")!).name;
  const [showOverheadCalc, setShowOverheadCalc] = useState(false);
  const [expectedVolume, setExpectedVolume] = useState("");
  const [opex] = useLocalStorage<OpexSettings>(OPEX_STORAGE_KEY, defaultOpexSettings);
  const opexTotal = opexWithContingency(opex.items, opex.contingencyPercent);
  const suggestedOverheadPerUnit = Number(expectedVolume) > 0 ? opexTotal / Number(expectedVolume) : 0;

  const field = (
    label: string,
    value: number,
    set: (v: number) => void,
    opts: { peso?: boolean; aria?: string } = {}
  ) => (
    <label className="block">
      <span className="text-xs text-text-muted">{label}</span>
      <div className="relative mt-1">
        {opts.peso && <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">₱</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value || ""}
          onChange={(e) => set(Number(e.target.value) || 0)}
          placeholder={opts.peso ? "0.00" : "0"}
          aria-label={opts.aria ?? label}
          className={`font-num ${inputCls} text-right ${opts.peso ? "pl-6" : ""}`}
        />
      </div>
    </label>
  );

  return (
    <section>
      <h3 className="font-display text-base">{t("editor.otherCosts")}</h3>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {field(t("editor.laborHours"), state.laborHours, (v) => onChange({ ...state, laborHours: v }))}
        {field(t("costForm.ratePerHour"), state.laborRate, (v) => onChange({ ...state, laborRate: v }), { peso: true })}
        {field(t("costForm.packaging"), state.packaging, (v) => onChange({ ...state, packaging: v }), { peso: true, aria: "Packaging cost" })}
        {field(t("costForm.overheadAllocation"), state.overhead, (v) => onChange({ ...state, overhead: v }), { peso: true, aria: "Overhead allocation cost" })}
      </div>
      <button
        type="button"
        onClick={() => setShowOverheadCalc((v) => !v)}
        className="mt-2 text-xs text-accent hover:text-accent-strong"
      >
        {showOverheadCalc ? t("costForm.overheadCalcHide") : t("costForm.overheadCalcShow")}
      </button>
      {showOverheadCalc && (
        <div className="mt-2 bg-surface-muted rounded-lg p-3 max-w-md">
          {opexTotal <= 0 ? (
            <p className="text-xs text-text-muted">
              {t("costForm.noOpexPrefix")}{" "}
              <a href="/opex" className="text-accent hover:text-accent-strong font-medium">
                {opexPageName}
              </a>{" "}
              {t("costForm.noOpexSuffix")}
            </p>
          ) : (
            <>
              <p className="text-xs text-text-muted">
                {t("costForm.opexIsPrefix")} ₱{peso(opexTotal)}
                {t("costForm.opexIsSuffix")}
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
                  className={`mt-1 font-num ${inputCls} bg-surface text-right`}
                />
              </label>
              {suggestedOverheadPerUnit > 0 && (
                <>
                  <p className="text-xs text-text-muted mt-2">
                    {t("costForm.suggestedOverheadPrefix")} ₱{peso(suggestedOverheadPerUnit)} {t("costForm.suggestedOverheadSuffix")}
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
    </section>
  );
}
