import type { CostItem } from "./calculator";
import { newCostItem } from "./calculator";
import type { CatalogItem } from "./catalog";
import { computePriceBreakdown } from "./calculator";

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export function costItemsToCSV(items: CostItem[]): string {
  const header = "label,quantity,unit,amount";
  const rows = items.map((i) =>
    [i.label, i.quantity, i.unit, i.amount].map(csvEscape).join(",")
  );
  return [header, ...rows].join("\n");
}

/** Accepts columns label,quantity,unit,amount — matches the shape used by the Raket.ph-style templates this audience already owns. */
export function parseCostItemsCSV(text: string): CostItem[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const startIdx = /^\s*label\s*,/i.test(lines[0]) ? 1 : 0;
  const items: CostItem[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const [label = "", quantity = "1", unit = "pcs", amount = "0"] = parseCsvLine(lines[i]);
    if (!label.trim()) continue;
    const item = newCostItem(label.trim());
    item.quantity = Number(quantity) || 1;
    item.unit = unit.trim() || "pcs";
    item.amount = Number(amount) || 0;
    items.push(item);
  }
  return items;
}

export function catalogToCSV(items: CatalogItem[]): string {
  const header = "item,vertical,true_cost,price,margin_percent,stock_on_hand";
  const rows = items.map((c) => {
    const b = computePriceBreakdown(c.state);
    return [
      c.state.itemName || "(untitled)",
      c.state.vertical,
      b.cost.toFixed(2),
      b.priceCustomerPays.toFixed(2),
      b.marginPercent.toFixed(1),
      c.stockOnHand,
    ]
      .map(csvEscape)
      .join(",");
  });
  return [header, ...rows].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
