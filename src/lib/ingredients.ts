import type { CalculatorState, CostItem } from "./calculator";
import { newId, updateItemState, type CatalogItem } from "./catalog";
import { convertQuantity } from "./units";

export interface SupplierQuote {
  id: string;
  supplierName: string;
  price: number;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  updatedAt: string;
  /** Free-text tag (e.g. "dairy", "flour") used only to suggest substitutes — not a fixed taxonomy. */
  category?: string;
  suppliers: SupplierQuote[];
}

export const INGREDIENTS_STORAGE_KEY = "calcost:v0:ingredients";

export function newIngredient(
  name: string,
  unit: string,
  costPerUnit: number,
  category?: string
): Ingredient {
  return {
    id: newId(),
    name,
    unit,
    costPerUnit,
    updatedAt: new Date().toISOString(),
    category: category?.trim() || undefined,
    suppliers: [],
  };
}

export function newSupplierQuote(supplierName: string, price: number): SupplierQuote {
  return { id: newId(), supplierName, price, updatedAt: new Date().toISOString() };
}

export function cheapestSupplier(ingredient: Ingredient): SupplierQuote | undefined {
  if (ingredient.suppliers.length === 0) return undefined;
  return [...ingredient.suppliers].sort((a, b) => a.price - b.price)[0];
}

export function similarIngredients(all: Ingredient[], ingredient: Ingredient): Ingredient[] {
  if (!ingredient.category) return [];
  return all
    .filter((i) => i.id !== ingredient.id && i.category === ingredient.category)
    .sort((a, b) => a.costPerUnit - b.costPerUnit);
}

export function upsertIngredient(list: Ingredient[], ingredient: Ingredient): Ingredient[] {
  const idx = list.findIndex((i) => i.id === ingredient.id);
  if (idx === -1) return [...list, ingredient];
  const next = [...list];
  next[idx] = ingredient;
  return next;
}

export function removeIngredient(list: Ingredient[], id: string): Ingredient[] {
  return list.filter((i) => i.id !== id);
}

/**
 * Cost for `quantity` of `unit` against `ingredient` — converts when
 * `unit` differs from the ingredient's own unit but is in the same
 * category (kg vs g), and otherwise falls back to treating the
 * quantity as already being in the ingredient's unit. Shared by the
 * cascade below and by `CostForm` so the two can never disagree.
 */
export function linkedCostAmount(ingredient: Ingredient, quantity: number, unit: string): number {
  const converted = convertQuantity(quantity, unit, ingredient.unit);
  return ingredient.costPerUnit * (converted ?? quantity);
}

function syncCostItem(item: CostItem, ingredient: Ingredient): CostItem {
  if (item.ingredientId !== ingredient.id) return item;
  // Preserve the item's own unit (it may deliberately differ from the
  // ingredient's, e.g. a recipe line in grams against a per-kg
  // ingredient) — convert when possible, fall back to the raw quantity
  // rather than silently reverting the unit the user chose.
  const unit = item.unit || ingredient.unit;
  return {
    ...item,
    label: ingredient.name,
    unit,
    amount: linkedCostAmount(ingredient, item.quantity, unit),
  };
}

function syncState(state: CalculatorState, ingredient: Ingredient): CalculatorState {
  return { ...state, costItems: state.costItems.map((item) => syncCostItem(item, ingredient)) };
}

function usesIngredient(state: CalculatorState, ingredientId: string): boolean {
  return state.costItems.some((item) => item.ingredientId === ingredientId);
}

/**
 * The cascade: every catalog item and the current draft that links to
 * this ingredient gets its cost item re-synced (label/unit/amount), and
 * catalog items get a real history snapshot if the resulting cost or
 * price actually changed — the single feature the original spec called
 * "change one price, every linked product recalculates."
 */
export function propagateIngredientChange(
  catalog: CatalogItem[],
  draft: CalculatorState,
  ingredient: Ingredient
): { catalog: CatalogItem[]; draft: CalculatorState } {
  const nextCatalog = catalog.map((item) =>
    usesIngredient(item.state, ingredient.id)
      ? updateItemState(item, syncState(item.state, ingredient))
      : item
  );
  const nextDraft = usesIngredient(draft, ingredient.id) ? syncState(draft, ingredient) : draft;
  return { catalog: nextCatalog, draft: nextDraft };
}

/** On delete, detach rather than destroy — linked items keep their last-known values as plain manual entries. */
export function detachIngredient(
  catalog: CatalogItem[],
  draft: CalculatorState,
  ingredientId: string
): { catalog: CatalogItem[]; draft: CalculatorState } {
  const unlink = (state: CalculatorState): CalculatorState => ({
    ...state,
    costItems: state.costItems.map((item) =>
      item.ingredientId === ingredientId ? { ...item, ingredientId: undefined } : item
    ),
  });
  return {
    catalog: catalog.map((item) =>
      usesIngredient(item.state, ingredientId) ? { ...item, state: unlink(item.state) } : item
    ),
    draft: unlink(draft),
  };
}

export function usageCount(catalog: CatalogItem[], draft: CalculatorState, ingredientId: string): number {
  const inCatalog = catalog.filter((c) => usesIngredient(c.state, ingredientId)).length;
  return inCatalog + (usesIngredient(draft, ingredientId) ? 1 : 0);
}

/** The actual saved products linking to this ingredient, for Catalog Management's "used in" drill-down — the unsaved draft is deliberately excluded, since it has no catalog id to link to. */
export function usedInItems(
  catalog: CatalogItem[],
  ingredientId: string
): { id: string; name: string }[] {
  return catalog
    .filter((c) => usesIngredient(c.state, ingredientId))
    .map((c) => ({ id: c.id, name: c.state.itemName || "Untitled" }));
}
