import type { CostItem, Vertical } from "./calculator";
import { newId } from "./catalog";

export interface QuoteTemplate {
  id: string;
  name: string;
  vertical: Vertical;
  costItems: CostItem[];
  createdAt: string;
}

export const TEMPLATES_STORAGE_KEY = "calcost:v0:templates";

export function newTemplate(name: string, vertical: Vertical, costItems: CostItem[]): QuoteTemplate {
  return {
    id: newId(),
    name,
    vertical,
    // strip ingredient links on save — a template is a starting point,
    // not a live link into today's Ingredient Library state
    costItems: costItems.map((item) => ({ ...item, ingredientId: undefined })),
    createdAt: new Date().toISOString(),
  };
}

export function removeTemplate(list: QuoteTemplate[], id: string): QuoteTemplate[] {
  return list.filter((t) => t.id !== id);
}

/** Fresh copies with new ids, so loading the same template twice into one item never collides. */
export function instantiateTemplate(template: QuoteTemplate): CostItem[] {
  return template.costItems.map((item) => ({ ...item, id: newId() }));
}
