"use client";

import { packCostPerUnit, withPack, type Ingredient } from "@/lib/ingredients";
import { peso } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { PackFields } from "./CostForm";

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface-muted px-2.5 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent";
const label = "text-xs text-text-muted";

/**
 * The fields of one Ingredient Library entry — shared by "+ Add ingredient"
 * (AddIngredientModal) and the library's Edit row so the two can't drift.
 * Controlled: `value` is a whole Ingredient, `onChange` gets the next one.
 * When a pack is filled in, Cost / unit is worked out from it (withPack)
 * and the typed field is replaced by the derived figure.
 */
export function IngredientForm({ value, onChange, autoFocus }: { value: Ingredient; onChange: (next: Ingredient) => void; autoFocus?: boolean }) {
  const { t } = useLanguage();
  const derived = packCostPerUnit(value);

  return (
    <div className="space-y-4">
      <datalist id="calcost-units-ingredient-library">
        {["pcs", "kg", "g", "L", "mL", "pack", "box", "dozen", "tray", "sack"].map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="block col-span-2">
          <span className={label}>
            {t("ingredients.name")} <span className="text-bad">*</span>
          </span>
          <input
            type="text"
            autoFocus={autoFocus}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder={t("ingredients.namePlaceholder")}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>{t("common.unit")}</span>
          <input
            type="text"
            list="calcost-units-ingredient-library"
            value={value.unit}
            onChange={(e) => onChange(withPack(value, { unit: e.target.value }))}
            placeholder="pcs"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>{t("ingredients.costPerUnit")}</span>
          {derived === undefined ? (
            <div className="relative">
              <span className="font-num absolute left-2.5 top-1/2 translate-y-[-30%] text-text-muted text-sm">₱</span>
              <input
                type="number"
                inputMode="decimal"
                value={value.costPerUnit || ""}
                onChange={(e) => onChange({ ...value, costPerUnit: Number(e.target.value) || 0 })}
                placeholder="0.00"
                className={`font-num ${field} pl-6 text-right`}
              />
            </div>
          ) : (
            <p className="font-num mt-1 rounded-lg bg-accent-soft text-accent-strong px-2.5 py-2 text-sm text-right font-semibold" title={t("ingredients.fromPack")}>
              ₱{peso(derived)}/{value.unit || "unit"}
            </p>
          )}
        </label>
        <label className="block col-span-2">
          <span className={label}>{t("costForm.supplier")}</span>
          <input
            type="text"
            value={value.supplier ?? ""}
            onChange={(e) => onChange({ ...value, supplier: e.target.value })}
            placeholder={t("costForm.supplierPlaceholder")}
            className={field}
          />
        </label>
        <label className="block col-span-2">
          <span className={label}>{t("ingredients.category")}</span>
          <input
            type="text"
            value={value.category ?? ""}
            onChange={(e) => onChange({ ...value, category: e.target.value })}
            placeholder={t("ingredients.categoryExample")}
            className={field}
          />
        </label>
      </div>

      <div className="rounded-xl border border-border p-3">
        <p className="text-xs font-medium">{t("editor.package")} <span className="font-normal text-text-muted">· {t("ingredients.optional")}</span></p>
        <p className="mt-0.5 text-[11px] text-text-muted">{t("ingredients.packHint")}</p>
        <PackFields
          values={value}
          unitPlaceholder={value.unit || "kg"}
          surface="bg-surface-muted"
          hideSupplier
          onChange={(patch) => onChange(withPack(value, patch))}
        />
      </div>
    </div>
  );
}
