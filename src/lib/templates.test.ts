import { describe, expect, it } from "vitest";
import { newCostItem } from "./calculator";
import { instantiateTemplate, newTemplate, removeTemplate } from "./templates";

describe("newTemplate", () => {
  it("strips ingredient links — a template is a starting point, not a live link", () => {
    const items = [{ ...newCostItem("Eggs"), ingredientId: "some-ingredient-id", amount: 96 }];
    const template = newTemplate("Standard box", "food", items);
    expect(template.costItems[0].ingredientId).toBeUndefined();
    expect(template.costItems[0].amount).toBe(96); // value itself is kept, just unlinked
  });

  it("carries the name and vertical through", () => {
    const template = newTemplate("Basic quote", "food", []);
    expect(template.name).toBe("Basic quote");
    expect(template.vertical).toBe("food");
  });
});

describe("instantiateTemplate", () => {
  it("returns cost items with fresh ids so loading twice never collides", () => {
    const template = newTemplate("T", "food", [newCostItem("Eggs"), newCostItem("Flour")]);
    const first = instantiateTemplate(template);
    const second = instantiateTemplate(template);
    expect(first[0].id).not.toBe(template.costItems[0].id);
    expect(first[0].id).not.toBe(second[0].id);
    expect(first.map((i) => i.label)).toEqual(["Eggs", "Flour"]);
  });
});

describe("removeTemplate", () => {
  it("drops only the matching id", () => {
    const a = newTemplate("A", "food", []);
    const b = newTemplate("B", "food", []);
    expect(removeTemplate([a, b], a.id)).toEqual([b]);
  });
});
