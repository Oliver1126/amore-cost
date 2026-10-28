import { defaultState, type CostItem, type PriceRounding } from "./calculator";
import { newCatalogItem, type CatalogItem } from "./catalog";
import { linkedCostAmount, type Ingredient } from "./ingredients";
import type { OpexItem, OpexSettings } from "./opex";

/**
 * "Try with sample recipes" — a small Filipino carinderia menu so a
 * first-time visitor sees a filled-in app instead of empty cards. Every
 * id starts with `DEMO_PREFIX`, which is the only thing `clearDemoData`
 * looks at, so the owner's own recipes are never touched. Prices are
 * rough Metro Manila 2026 market prices — illustrative, not a quote.
 */
export const DEMO_PREFIX = "demo-";

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_PREFIX);
}

const STAMP = "2026-10-28T00:00:00.000Z";

const INGREDIENTS: [slug: string, name: string, unit: string, costPerUnit: number, category: string][] = [
  ["chicken", "Chicken (cut-up)", "kg", 220, "meat"],
  ["beef", "Beef sirloin (tapa cut)", "kg", 480, "meat"],
  ["rice", "Rice (dinorado)", "kg", 58, "grains"],
  ["egg", "Egg (large)", "pcs", 9, "eggs"],
  ["garlic", "Garlic", "kg", 160, "produce"],
  ["soy", "Soy sauce", "L", 90, "condiments"],
  ["vinegar", "Cane vinegar", "L", 60, "condiments"],
  ["oil", "Cooking oil", "L", 120, "condiments"],
  ["sugar", "Sugar (washed)", "kg", 80, "baking"],
  ["ice", "Shaved ice", "kg", 10, "other"],
  ["milk", "Evaporated milk", "L", 130, "dairy"],
  ["ube", "Ube halaya", "kg", 320, "sweets"],
  ["mix", "Halo-halo mix (beans, nata, sago)", "kg", 190, "sweets"],
];

export function demoIngredients(): Ingredient[] {
  return INGREDIENTS.map(([slug, name, unit, costPerUnit, category]) => ({
    id: `${DEMO_PREFIX}ing-${slug}`,
    name,
    unit,
    costPerUnit,
    category,
    updatedAt: STAMP,
    suppliers: [],
  }));
}

type Line = [slug: string, quantity: number, unit: string, yieldPercent?: number];

const RECIPES: { slug: string; name: string; lines: Line[]; packaging: number; margin: number; rounding: PriceRounding }[] = [
  {
    slug: "adobo",
    name: "Chicken Adobo with rice",
    // Bone-in chicken loses ~30% to bones and shrinkage — the yield column at work.
    lines: [["chicken", 200, "g", 70], ["soy", 30, "mL"], ["vinegar", 30, "mL"], ["garlic", 15, "g", 85], ["oil", 10, "mL"], ["rice", 150, "g"]],
    packaging: 0,
    margin: 70,
    rounding: "9",
  },
  {
    slug: "tapsilog",
    name: "Tapsilog",
    lines: [["beef", 120, "g", 90], ["rice", 180, "g"], ["egg", 1, "pcs"], ["garlic", 10, "g", 85], ["oil", 15, "mL"]],
    packaging: 0,
    margin: 68,
    rounding: "5",
  },
  {
    slug: "halohalo",
    name: "Halo-Halo (to go)",
    lines: [["ice", 300, "g"], ["milk", 60, "mL"], ["sugar", 20, "g"], ["ube", 40, "g"], ["mix", 80, "g"]],
    packaging: 8,
    margin: 70,
    rounding: "10",
  },
];

export function demoRecipes(ingredients: Ingredient[] = demoIngredients()): CatalogItem[] {
  const bySlug = new Map(ingredients.map((i) => [i.id.slice(`${DEMO_PREFIX}ing-`.length), i]));
  return RECIPES.map((r) => {
    const costItems: CostItem[] = r.lines.map(([slug, quantity, unit, yieldPercent], idx) => {
      const ing = bySlug.get(slug)!;
      return {
        id: `${DEMO_PREFIX}${r.slug}-${idx}`,
        label: ing.name,
        quantity,
        unit,
        amount: linkedCostAmount(ing, quantity, unit),
        ingredientId: ing.id,
        yieldPercent,
      };
    });
    const item = newCatalogItem({
      ...defaultState("food"),
      itemName: r.name,
      costItems,
      packaging: r.packaging,
      strategy: { type: "margin", percent: r.margin },
      tax: { preset: "vat", customLabel: "", customRate: 0 },
      priceRounding: r.rounding,
    });
    return { ...item, id: `${DEMO_PREFIX}${r.slug}`, createdAt: STAMP, updatedAt: STAMP };
  });
}

export function demoOpexItems(): OpexItem[] {
  return [
    { id: `${DEMO_PREFIX}opex-rent`, label: "Stall rent", amountPerMonth: 15000, category: "rent" },
    { id: `${DEMO_PREFIX}opex-power`, label: "Electricity & water", amountPerMonth: 6500, category: "utilities" },
    { id: `${DEMO_PREFIX}opex-lpg`, label: "LPG", amountPerMonth: 3200, category: "utilities" },
    { id: `${DEMO_PREFIX}opex-staff`, label: "2 kitchen staff", amountPerMonth: 26000, category: "labor" },
    { id: `${DEMO_PREFIX}opex-ads`, label: "Facebook ads", amountPerMonth: 2000, category: "marketing" },
  ];
}

const DEMO_MONTHLY_DISHES = 1500;

export function hasDemoData(catalog: CatalogItem[]): boolean {
  return catalog.some((c) => isDemoId(c.id));
}

/** Blank = only the untouched starter row (`defaultOpexSettings`), so loading samples never overwrites real expenses. */
function opexIsBlank(opex: OpexSettings): boolean {
  return opex.items.every((i) => !i.label.trim() && !(i.amountPerMonth > 0));
}

/**
 * Adds the sample menu alongside whatever is already there. Safe to
 * call twice — existing demo ids are replaced, not duplicated. OPEX and
 * the monthly-dishes estimate are only filled in when still blank.
 */
export function loadDemoData(
  catalog: CatalogItem[],
  ingredients: Ingredient[],
  opex: OpexSettings
): { catalog: CatalogItem[]; ingredients: Ingredient[]; opex: OpexSettings } {
  const ings = demoIngredients();
  const recipes = demoRecipes(ings);
  const opexBlank = opexIsBlank(opex);
  return {
    catalog: [...recipes, ...catalog.filter((c) => !isDemoId(c.id))],
    ingredients: [...ingredients.filter((i) => !isDemoId(i.id)), ...ings],
    opex: {
      ...opex,
      items: opexBlank ? demoOpexItems() : opex.items,
      monthlyDishSales: opex.monthlyDishSales || (opexBlank ? DEMO_MONTHLY_DISHES : opex.monthlyDishSales),
    },
  };
}

/** Removes only `demo-` records. A demo ingredient the owner linked into their own recipe is kept, so that recipe doesn't lose its cascade. */
export function clearDemoData(
  catalog: CatalogItem[],
  ingredients: Ingredient[],
  opex: OpexSettings
): { catalog: CatalogItem[]; ingredients: Ingredient[]; opex: OpexSettings } {
  const nextCatalog = catalog.filter((c) => !isDemoId(c.id));
  const stillUsed = new Set(nextCatalog.flatMap((c) => c.state.costItems.map((i) => i.ingredientId).filter(Boolean)));
  const nextOpexItems = opex.items.filter((i) => !isDemoId(i.id));
  const hadDemoOpex = nextOpexItems.length !== opex.items.length;
  return {
    catalog: nextCatalog,
    ingredients: ingredients.filter((i) => !isDemoId(i.id) || stillUsed.has(i.id)),
    opex: {
      ...opex,
      items: nextOpexItems,
      monthlyDishSales:
        hadDemoOpex && nextOpexItems.length === 0 && opex.monthlyDishSales === DEMO_MONTHLY_DISHES
          ? undefined
          : opex.monthlyDishSales,
    },
  };
}
