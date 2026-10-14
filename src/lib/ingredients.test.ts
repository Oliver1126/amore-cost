import { describe, expect, it } from "vitest";
import { defaultState, newCostItem, type CalculatorState } from "./calculator";
import { newCatalogItem, type CatalogItem } from "./catalog";
import {
  cheapestSupplier,
  detachIngredient,
  linkedCostAmount,
  newIngredient,
  newSupplierQuote,
  propagateIngredientChange,
  removeIngredient,
  similarIngredients,
  upsertIngredient,
  usageCount,
  usedInItems,
} from "./ingredients";

function linkedItem(
  ingredientId: string,
  quantity: number,
  label = "Eggs",
  itemName = "Leche Flan"
): CalculatorState {
  return {
    ...defaultState(),
    itemName,
    costItems: [{ ...newCostItem(label), ingredientId, quantity, amount: 0 }],
  };
}

describe("newIngredient / upsertIngredient / removeIngredient", () => {
  it("creates an ingredient with the given fields", () => {
    const ing = newIngredient("Eggs", "pcs", 8);
    expect(ing.name).toBe("Eggs");
    expect(ing.unit).toBe("pcs");
    expect(ing.costPerUnit).toBe(8);
  });

  it("upsert adds new, replaces existing by id", () => {
    const a = newIngredient("Eggs", "pcs", 8);
    let list = upsertIngredient([], a);
    expect(list).toHaveLength(1);
    const updated = { ...a, costPerUnit: 9 };
    list = upsertIngredient(list, updated);
    expect(list).toHaveLength(1);
    expect(list[0].costPerUnit).toBe(9);
  });

  it("removeIngredient drops only the matching id", () => {
    const a = newIngredient("Eggs", "pcs", 8);
    const b = newIngredient("Flour", "kg", 45);
    expect(removeIngredient([a, b], a.id)).toEqual([b]);
  });
});

describe("propagateIngredientChange — the cascade", () => {
  it("updates every linked catalog item's cost item (label, unit, amount = costPerUnit * quantity)", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const catalogState = linkedItem(eggs.id, 12);
    const item = newCatalogItem(catalogState);

    const raisedEggs = { ...eggs, costPerUnit: 10 };
    const { catalog } = propagateIngredientChange([item], defaultState(), raisedEggs);

    const linked = catalog[0].state.costItems[0];
    expect(linked.label).toBe("Eggs");
    expect(linked.unit).toBe("pcs");
    expect(linked.amount).toBe(120); // 10 * 12
  });

  it("records a real history snapshot when the price cascade actually changes cost", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const item = newCatalogItem(linkedItem(eggs.id, 12)); // seeds history at cost 0 (amount starts 0)
    const startingHistoryLength = item.history.length;

    const raisedEggs = { ...eggs, costPerUnit: 10 };
    const { catalog } = propagateIngredientChange([item], defaultState(), raisedEggs);

    expect(catalog[0].history.length).toBeGreaterThan(startingHistoryLength);
    expect(catalog[0].history.at(-1)?.cost).toBe(120);
  });

  it("does not touch catalog items that don't reference this ingredient", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const flour = newIngredient("Flour", "kg", 45);
    const unrelated = newCatalogItem({
      ...defaultState(),
      itemName: "Unrelated",
      costItems: [{ ...newCostItem("Sugar"), amount: 30 }],
    });

    const { catalog } = propagateIngredientChange([unrelated], defaultState(), {
      ...flour,
      costPerUnit: 50,
    });

    expect(catalog[0]).toEqual(unrelated); // completely unchanged, no wasted history entry
    void eggs;
  });

  it("also syncs the current unsaved draft, not just the catalog", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const draft = linkedItem(eggs.id, 5);
    const { draft: nextDraft } = propagateIngredientChange([], draft, { ...eggs, costPerUnit: 20 });
    expect(nextDraft.costItems[0].amount).toBe(100); // 20 * 5
  });

  it("a renamed ingredient updates the linked item's label too", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const item = newCatalogItem(linkedItem(eggs.id, 1));
    const renamed = { ...eggs, name: "Duck Eggs" };
    const { catalog } = propagateIngredientChange([item], defaultState(), renamed);
    expect(catalog[0].state.costItems[0].label).toBe("Duck Eggs");
  });
});

describe("detachIngredient", () => {
  it("clears ingredientId but keeps the last-known label/unit/amount", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const state = linkedItem(eggs.id, 12);
    state.costItems[0].label = "Eggs";
    state.costItems[0].unit = "pcs";
    state.costItems[0].amount = 96;
    const item = newCatalogItem(state);

    const { catalog } = detachIngredient([item], defaultState(), eggs.id);
    const detached = catalog[0].state.costItems[0];
    expect(detached.ingredientId).toBeUndefined();
    expect(detached.label).toBe("Eggs");
    expect(detached.amount).toBe(96);
  });

  it("leaves items that don't reference the ingredient untouched", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const unrelated = newCatalogItem({
      ...defaultState(),
      costItems: [{ ...newCostItem("Sugar"), amount: 30 }],
    });
    const { catalog } = detachIngredient([unrelated], defaultState(), eggs.id);
    expect(catalog[0]).toEqual(unrelated);
  });
});

describe("usageCount", () => {
  it("counts across both catalog items and the draft", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const catalog: CatalogItem[] = [
      newCatalogItem(linkedItem(eggs.id, 1)),
      newCatalogItem(linkedItem(eggs.id, 2)),
      newCatalogItem({ ...defaultState(), costItems: [{ ...newCostItem("Sugar"), amount: 1 }] }),
    ];
    const draft = linkedItem(eggs.id, 3);
    expect(usageCount(catalog, draft, eggs.id)).toBe(3); // 2 catalog + 1 draft
  });

  it("is zero for an ingredient nothing references", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    expect(usageCount([], defaultState(), eggs.id)).toBe(0);
  });
});

describe("usedInItems", () => {
  it("returns the id/name of each saved catalog item linking to the ingredient", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const flan = newCatalogItem(linkedItem(eggs.id, 1));
    const unrelated = newCatalogItem({
      ...defaultState(),
      costItems: [{ ...newCostItem("Sugar"), amount: 1 }],
    });
    const result = usedInItems([flan, unrelated], eggs.id);
    expect(result).toEqual([{ id: flan.id, name: "Leche Flan" }]);
  });

  it("returns every catalog item linking to the ingredient, not just the first", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const flan = newCatalogItem(linkedItem(eggs.id, 1, "Eggs", "Leche Flan"));
    const cake = newCatalogItem(linkedItem(eggs.id, 2, "Eggs", "Ube Cake"));
    const result = usedInItems([flan, cake], eggs.id);
    expect(result).toEqual([
      { id: flan.id, name: "Leche Flan" },
      { id: cake.id, name: "Ube Cake" },
    ]);
  });

  it("is empty for an ingredient nothing references", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    const unrelated = newCatalogItem(defaultState());
    expect(usedInItems([unrelated], eggs.id)).toEqual([]);
  });
});

describe("linkedCostAmount — unit conversion for a linked cost item", () => {
  it("converts a recipe line in grams against a per-kg ingredient", () => {
    const flour = newIngredient("Flour", "kg", 45); // ₱45/kg
    expect(linkedCostAmount(flour, 500, "g")).toBeCloseTo(22.5, 5); // 500g = 0.5kg
  });

  it("matches plain multiplication when units already match", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    expect(linkedCostAmount(eggs, 12, "pcs")).toBe(96);
  });

  it("falls back to raw quantity for an unconvertible unit rather than throwing", () => {
    const flour = newIngredient("Flour", "kg", 45);
    expect(linkedCostAmount(flour, 2, "pack")).toBe(90); // treats 2 "pack" as 2kg — a known, documented fallback
  });
});

describe("propagateIngredientChange respects unit conversion (regression: previously ignored it)", () => {
  it("recomputes correctly when the linked item's unit differs from the ingredient's", () => {
    const flour = newIngredient("Flour", "kg", 45);
    const state: CalculatorState = {
      ...defaultState(),
      itemName: "Bread",
      costItems: [{ ...newCostItem("Flour"), ingredientId: flour.id, quantity: 500, unit: "g", amount: 22.5 }],
    };
    const item = newCatalogItem(state);

    const raisedFlour = { ...flour, costPerUnit: 60 };
    const { catalog } = propagateIngredientChange([item], defaultState(), raisedFlour);

    const linked = catalog[0].state.costItems[0];
    expect(linked.unit).toBe("g"); // the item's own unit choice is preserved, not reset to "kg"
    expect(linked.amount).toBeCloseTo(30, 5); // 500g = 0.5kg * ₱60/kg
  });
});

describe("cheapestSupplier", () => {
  it("picks the lowest-priced supplier quote", () => {
    const eggs = newIngredient("Eggs", "pcs", 8);
    eggs.suppliers.push(newSupplierQuote("Supplier A", 9), newSupplierQuote("Supplier B", 7));
    expect(cheapestSupplier(eggs)?.supplierName).toBe("Supplier B");
  });

  it("is undefined when there are no suppliers", () => {
    expect(cheapestSupplier(newIngredient("Eggs", "pcs", 8))).toBeUndefined();
  });
});

describe("similarIngredients", () => {
  it("suggests other ingredients sharing a category, cheapest first, excluding itself", () => {
    const a = newIngredient("Whole milk", "L", 90, "dairy");
    const b = newIngredient("Evaporated milk", "L", 70, "dairy");
    const c = newIngredient("Flour", "kg", 45, "baking");
    const suggestions = similarIngredients([a, b, c], a);
    expect(suggestions.map((s) => s.name)).toEqual(["Evaporated milk"]);
  });

  it("is empty when the ingredient has no category", () => {
    const a = newIngredient("Whole milk", "L", 90);
    const b = newIngredient("Evaporated milk", "L", 70, "dairy");
    expect(similarIngredients([a, b], a)).toEqual([]);
  });
});
