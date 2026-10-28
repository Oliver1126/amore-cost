import { describe, expect, it } from "vitest";
import { computePriceBreakdown, foodCostPercent, lineCost } from "./calculator";
import { newCatalogItem } from "./catalog";
import { defaultState } from "./calculator";
import { newIngredient, propagateIngredientChange } from "./ingredients";
import { defaultOpexSettings } from "./opex";
import {
  clearDemoData,
  demoIngredients,
  demoRecipes,
  hasDemoData,
  isDemoId,
  loadDemoData,
} from "./demo";

describe("demo kitchen data", () => {
  it("prefixes every id so it can be cleared without touching real data", () => {
    const recipes = demoRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(3);
    expect(recipes.every((r) => isDemoId(r.id))).toBe(true);
    expect(demoIngredients().every((i) => isDemoId(i.id))).toBe(true);
  });

  it("links every line to a demo ingredient and prices it with the g→kg conversion", () => {
    const ings = demoIngredients();
    const adobo = demoRecipes(ings).find((r) => r.id === "demo-adobo")!;
    const chicken = adobo.state.costItems[0];
    expect(chicken.ingredientId).toBe("demo-ing-chicken");
    expect(chicken.amount).toBeCloseTo(0.2 * 220, 6);
    expect(lineCost(chicken)).toBeCloseTo((0.2 * 220) / 0.7, 6);
  });

  it("produces believable carinderia prices, rounded, with food cost near the 28–32% target", () => {
    for (const r of demoRecipes()) {
      const b = computePriceBreakdown(r.state);
      expect(b.priceCustomerPays).toBeGreaterThan(50);
      expect(b.priceCustomerPays).toBeLessThan(400);
      expect(Number.isInteger(b.priceCustomerPays)).toBe(true);
      const fc = foodCostPercent(r.state);
      expect(fc).toBeGreaterThan(20);
      expect(fc).toBeLessThan(35);
    }
  });

  it("follows the ingredient cascade like any other recipe", () => {
    const ings = demoIngredients();
    const recipes = demoRecipes(ings);
    const pricier = { ...ings.find((i) => i.id === "demo-ing-chicken")!, costPerUnit: 300 };
    const { catalog } = propagateIngredientChange(recipes, defaultState(), pricier);
    const adobo = catalog.find((r) => r.id === "demo-adobo")!;
    expect(adobo.state.costItems[0].amount).toBeCloseTo(0.2 * 300, 6);
  });
});

describe("loadDemoData / clearDemoData", () => {
  const mine = newCatalogItem({ ...defaultState(), itemName: "My lumpia" });
  const myIng = newIngredient("Wrapper", "pcs", 2);

  it("adds samples next to existing recipes and fills blank OPEX", () => {
    const out = loadDemoData([mine], [myIng], defaultOpexSettings());
    expect(out.catalog.map((c) => c.id)).toContain(mine.id);
    expect(hasDemoData(out.catalog)).toBe(true);
    expect(out.ingredients).toContainEqual(myIng);
    expect(out.opex.items.every((i) => isDemoId(i.id))).toBe(true);
    expect(out.opex.monthlyDishSales).toBeGreaterThan(0);
  });

  it("never overwrites OPEX the owner already entered", () => {
    const real = { items: [{ id: "x", label: "Rent", amountPerMonth: 9000 }], contingencyPercent: 5, monthlyDishSales: 800 };
    const out = loadDemoData([], [], real);
    expect(out.opex).toEqual(real);
  });

  it("is idempotent — loading twice does not duplicate", () => {
    const once = loadDemoData([mine], [], defaultOpexSettings());
    const twice = loadDemoData(once.catalog, once.ingredients, once.opex);
    expect(twice.catalog).toHaveLength(once.catalog.length);
    expect(twice.ingredients).toHaveLength(once.ingredients.length);
    expect(twice.opex.items).toHaveLength(once.opex.items.length);
  });

  it("clears only demo records and restores the dish estimate", () => {
    const loaded = loadDemoData([mine], [myIng], defaultOpexSettings());
    const out = clearDemoData(loaded.catalog, loaded.ingredients, loaded.opex);
    expect(out.catalog).toEqual([mine]);
    expect(out.ingredients).toEqual([myIng]);
    expect(out.opex.items).toEqual([]);
    expect(out.opex.monthlyDishSales).toBeUndefined();
  });

  it("keeps a demo ingredient the owner linked into their own recipe", () => {
    const loaded = loadDemoData([], [], defaultOpexSettings());
    const rice = loaded.ingredients.find((i) => i.id === "demo-ing-rice")!;
    const own = newCatalogItem({
      ...defaultState(),
      itemName: "Sinangag",
      costItems: [{ id: "l1", label: rice.name, quantity: 1, unit: "kg", amount: 58, ingredientId: rice.id }],
    });
    const out = clearDemoData([own, ...loaded.catalog], loaded.ingredients, loaded.opex);
    expect(out.catalog).toEqual([own]);
    expect(out.ingredients.map((i) => i.id)).toEqual(["demo-ing-rice"]);
  });
});
