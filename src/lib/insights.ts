/**
 * Turns data every module already has (Catalog, Cost History, sales
 * logs, channel fees) into specific, plain-language recommendations —
 * "priced below target because X, raise by ₱Y" instead of just a
 * number the owner has to interpret themselves. See
 * docs/business/product-depth-analysis.md for the reasoning: every
 * function here is a pure read over `CatalogItem[]`, no new data
 * collection, no backend needed.
 */
import type { Lang } from "./i18n";
import { computePriceBreakdown, channelAdjustedPrice } from "./calculator";
import { marginStatus, itemSalesTotals, type CatalogItem } from "./catalog";
import { peso } from "./format";

export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  itemId?: string;
  message: string;
}

const SEVERITY_RANK: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2 };

/** The price that turns a given cost into exactly `targetMarginPercent` margin (profit ÷ price, not ÷ cost — same definition `computePriceBreakdown` uses). Undefined once the target is 100% or more — no finite price gets there. */
function priceForTargetMargin(cost: number, targetMarginPercent: number): number | undefined {
  const divisor = 1 - targetMarginPercent / 100;
  return divisor > 0 ? cost / divisor : undefined;
}

function itemName(item: CatalogItem, lang: Lang): string {
  return item.state.itemName.trim() || (lang === "tl" ? "Walang pangalan" : "Untitled item");
}

/** Items priced below their own target margin — paired with how much to raise the price by, and (when Cost History shows real movement) what actually drove the gap. */
export function belowTargetMarginInsights(catalog: CatalogItem[], lang: Lang): Insight[] {
  const insights: Insight[] = [];

  for (const item of catalog) {
    if (item.targetMarginPercent <= 0) continue;
    const breakdown = computePriceBreakdown(item.state);
    if (marginStatus(breakdown.marginPercent, item.targetMarginPercent) !== "belowTarget") continue;

    const gap = item.targetMarginPercent - breakdown.marginPercent;
    const targetPrice = priceForTargetMargin(breakdown.cost, item.targetMarginPercent);
    // Every price this app actually shows the customer is tax-inclusive
    // (`priceCustomerPays`), so the "raise by" delta has to be computed
    // against that, not the pre-tax price — otherwise the advice
    // understates the real increase needed by the tax rate.
    const targetPriceInclusive = targetPrice !== undefined ? targetPrice * (1 + breakdown.taxRate / 100) : undefined;
    const raiseBy =
      targetPriceInclusive !== undefined ? Math.max(0, targetPriceInclusive - breakdown.priceCustomerPays) : undefined;
    const name = itemName(item, lang);

    const earliest = item.history[0];
    const costRosePercent =
      earliest && earliest.cost > 0 && breakdown.cost > earliest.cost
        ? ((breakdown.cost - earliest.cost) / earliest.cost) * 100
        : undefined;

    let message: string;
    if (lang === "tl") {
      const raiseClause = raiseBy ? ` Itaas ng ~₱${peso(raiseBy)} para maabot ang target.` : "";
      message =
        costRosePercent && costRosePercent >= 3
          ? `${name}: bumaba sa ${gap.toFixed(1)} puntos mula sa ${item.targetMarginPercent}% target — tumaas ang gastos ng ${costRosePercent.toFixed(1)}% mula nang unang na-save.${raiseClause}`
          : `${name}: nasa ${breakdown.marginPercent.toFixed(1)}% margin, ${gap.toFixed(1)} puntos sa ibaba ng ${item.targetMarginPercent}% target.${raiseClause}`;
    } else {
      const raiseClause = raiseBy ? ` Raise price by ~₱${peso(raiseBy)} to close the gap.` : "";
      message =
        costRosePercent && costRosePercent >= 3
          ? `${name} is ${gap.toFixed(1)} points below your ${item.targetMarginPercent}% target — cost rose ${costRosePercent.toFixed(1)}% since it was first saved.${raiseClause}`
          : `${name} is priced at ${breakdown.marginPercent.toFixed(1)}% margin, ${gap.toFixed(1)} points below your ${item.targetMarginPercent}% target.${raiseClause}`;
    }

    insights.push({
      id: `below-target-${item.id}`,
      severity: gap >= 10 ? "critical" : "warning",
      itemId: item.id,
      message,
    });
  }

  return insights;
}

/** Portfolio-level view across logged sales: which item is carrying most of the profit, and which below-target item is also a slow seller (a repricing/retirement candidate, not just a red flag). Needs at least 2 items with real sales — otherwise there isn't a portfolio to compare yet. */
export function portfolioInsights(catalog: CatalogItem[], lang: Lang): Insight[] {
  const withSales = catalog
    .map((item) => ({ item, totals: itemSalesTotals(item) }))
    .filter((r) => r.totals.units > 0);

  if (withSales.length < 2) return [];

  const insights: Insight[] = [];
  const totalProfit = withSales.reduce((sum, r) => sum + r.totals.profit, 0);
  const topSorted = [...withSales].sort((a, b) => b.totals.profit - a.totals.profit);
  const top = topSorted[0];

  // "% of total profit" only means what it says when every item actually
  // contributed non-negative profit — a loss-making sibling (a below-cost
  // sale, a refund) shrinks totalProfit and can push the leader's share
  // mathematically past 100%, which would misreport a subsidized item as
  // an outsized star instead of surfacing the real loss-making one.
  const allNonNegative = withSales.every((r) => r.totals.profit >= 0);

  if (allNonNegative && totalProfit > 0 && top.totals.profit / totalProfit >= 0.5) {
    const pct = (top.totals.profit / totalProfit) * 100;
    const name = itemName(top.item, lang);
    insights.push({
      id: `portfolio-star-${top.item.id}`,
      severity: "info",
      itemId: top.item.id,
      message:
        lang === "tl"
          ? `${name} ang bumubuo ng ${pct.toFixed(1)}% ng kabuuang kita mo (₱${peso(top.totals.profit)}) — alagaan ang stock at presyo nito.`
          : `${name} alone generates ${pct.toFixed(1)}% of your total logged profit (₱${peso(top.totals.profit)}) — keep a close eye on its stock and price.`,
    });
  }

  const avgUnits = withSales.reduce((sum, r) => sum + r.totals.units, 0) / withSales.length;
  const reconsiderCandidates = withSales
    .filter((r) => {
      const breakdown = computePriceBreakdown(r.item.state);
      return (
        r.item.targetMarginPercent > 0 &&
        marginStatus(breakdown.marginPercent, r.item.targetMarginPercent) === "belowTarget" &&
        r.totals.units < avgUnits * 0.5
      );
    })
    .sort((a, b) => a.totals.units - b.totals.units);

  if (reconsiderCandidates.length > 0) {
    const worst = reconsiderCandidates[0];
    const name = itemName(worst.item, lang);
    insights.push({
      id: `portfolio-reconsider-${worst.item.id}`,
      severity: "warning",
      itemId: worst.item.id,
      message:
        lang === "tl"
          ? `${name}: mababa sa target margin AT isa sa pinakamabagal magbenta (${worst.totals.units} vs ${avgUnits.toFixed(0)} average) — pag-isipang baguhin ang presyo o itigil na.`
          : `${name} is both below your margin target and one of your slower sellers (${worst.totals.units} sold vs ${avgUnits.toFixed(0)} average) — consider repricing or retiring it.`,
    });
  }

  return insights;
}

/** Charging the same price everywhere ignores that a marketplace fee eats straight into margin. Flags the item's highest-fee channel when charging the usual price there would fall below target — with the price that would actually match it. */
export function channelGapInsights(catalog: CatalogItem[], lang: Lang): Insight[] {
  const insights: Insight[] = [];

  for (const item of catalog) {
    if (item.channels.length === 0 || item.targetMarginPercent <= 0) continue;
    const breakdown = computePriceBreakdown(item.state);
    const worstChannel = [...item.channels].sort((a, b) => b.feePercent - a.feePercent)[0];
    // The only channel-creation UI (Multi-Channel Pricing) offers 6%/8%/0%
    // presets with no custom-fee input — a 10% floor here made this
    // generator mathematically unreachable for every real catalog. 5%
    // catches both real non-zero presets while still excluding "In-person."
    if (worstChannel.feePercent < 5) continue;

    const netAfterFee = breakdown.priceBeforeTax * (1 - worstChannel.feePercent / 100);
    const actualProfit = netAfterFee - breakdown.cost;
    const actualMarginPercent = netAfterFee > 0 ? (actualProfit / netAfterFee) * 100 : 0;
    if (actualMarginPercent >= item.targetMarginPercent) continue;

    const adjusted = channelAdjustedPrice(
      { priceBeforeTax: breakdown.priceBeforeTax, taxRate: breakdown.taxRate },
      worstChannel.feePercent
    );
    const name = itemName(item, lang);

    insights.push({
      id: `channel-gap-${item.id}`,
      severity: actualMarginPercent < 0 ? "critical" : "warning",
      itemId: item.id,
      message:
        lang === "tl"
          ? `${name} sa ${worstChannel.name} (${worstChannel.feePercent}% fee): ang karaniwang presyo mo ay ${actualMarginPercent.toFixed(1)}% lang ang margin doon, hindi ang ${item.targetMarginPercent}% target. Isingil ng ₱${peso(adjusted.final)} doon para tumugma.`
          : `${name} on ${worstChannel.name} (${worstChannel.feePercent}% fee): your usual price only nets ${actualMarginPercent.toFixed(1)}% margin there, not your ${item.targetMarginPercent}% target. Charge ₱${peso(adjusted.final)} on ${worstChannel.name} to match.`,
    });
  }

  return insights;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Sell-through-rate reorder signal instead of a fixed threshold someone guessed once — "2 weeks of stock left at your current pace" instead of a static low-stock number. Only fires for items with real recent sales and stock actually on hand. */
export function stockRunwayInsights(catalog: CatalogItem[], lang: Lang, now: number = Date.now()): Insight[] {
  const insights: Insight[] = [];
  const cutoff = now - THIRTY_DAYS_MS;

  for (const item of catalog) {
    if (item.stockOnHand <= 0) continue;
    const recentUnits = item.sales
      .filter((s) => new Date(s.date).getTime() >= cutoff)
      .reduce((sum, s) => sum + s.quantity, 0);
    if (recentUnits <= 0) continue;

    // Divide by how long the item has actually existed, capped at the
    // 30-day window — dividing by a flat 30 regardless of age understates
    // the pace of anything newer than that (all its sales fall inside the
    // window, but the denominator assumes a full 30 days of them).
    const daysTracked = Math.max(
      1,
      Math.min(30, (now - new Date(item.createdAt).getTime()) / (24 * 60 * 60 * 1000))
    );
    const perDay = recentUnits / daysTracked;
    const runwayDays = Math.floor(item.stockOnHand / perDay);
    if (runwayDays >= 14) continue;

    const name = itemName(item, lang);
    const perWeek = Math.round(perDay * 7 * 10) / 10;
    insights.push({
      id: `stock-runway-${item.id}`,
      severity: runwayDays <= 5 ? "critical" : "warning",
      itemId: item.id,
      message:
        lang === "tl"
          ? `${name}: sa kasalukuyang bilis (~${perWeek}/linggo), may natitirang ${runwayDays} araw na stock na lang (${item.stockOnHand} on hand).`
          : `${name}: at your current pace (~${perWeek}/week), you have about ${runwayDays} days of stock left (${item.stockOnHand} on hand).`,
    });
  }

  return insights;
}

/** Every generator above, ranked critical → warning → info and capped so Overview shows the handful that matter, not a wall of text. */
export function generateInsights(catalog: CatalogItem[], lang: Lang, maxCount = 6): Insight[] {
  const generatorResults = [
    belowTargetMarginInsights(catalog, lang),
    portfolioInsights(catalog, lang),
    channelGapInsights(catalog, lang),
    stockRunwayInsights(catalog, lang),
  ];

  // Interleave one insight at a time from each generator, round-robin,
  // before sorting — sorting alone is stable, so concatenating first would
  // let one generator's run of same-severity insights (e.g. six
  // below-target items) fill the entire cap and silently drop an equally
  // critical insight from a generator that happened to run later.
  const interleaved: Insight[] = [];
  const maxLen = Math.max(0, ...generatorResults.map((r) => r.length));
  for (let i = 0; i < maxLen; i++) {
    for (const result of generatorResults) {
      if (result[i]) interleaved.push(result[i]);
    }
  }

  return interleaved
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, maxCount);
}
