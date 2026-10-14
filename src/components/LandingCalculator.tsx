"use client";

import { useState } from "react";
import Link from "next/link";
import { computePriceBreakdown, type CalculatorState } from "@/lib/calculator";
import { peso } from "@/lib/format";

/** Free tries on the landing-page demo before it nudges toward the (still free, no-account) full dashboard — separate from and much lower than any real usage limit, since none exists anywhere else in the app. */
const FREE_TRIES = 3;

export function LandingCalculator() {
  const [itemName, setItemName] = useState("");
  const [materials, setMaterials] = useState("");
  const [labor, setLabor] = useState("");
  const [packaging, setPackaging] = useState("");
  const [marginPercent, setMarginPercent] = useState("30");
  const [result, setResult] = useState<ReturnType<typeof computePriceBreakdown> | null>(null);
  const [triesUsed, setTriesUsed] = useState(0);
  const limitHit = triesUsed >= FREE_TRIES;

  function calculate() {
    if (limitHit) return;
    const demoState: CalculatorState = {
      vertical: "food",
      itemName: itemName.trim() || "Your item",
      costItems: [
        { id: "materials", label: "Materials", quantity: 1, unit: "pcs", amount: Number(materials) || 0 },
      ],
      laborHours: 1,
      laborRate: Number(labor) || 0,
      packaging: Number(packaging) || 0,
      overhead: 0,
      strategy: { type: "margin", percent: Number(marginPercent) || 0 },
      tax: { preset: "none", customLabel: "", customRate: 0 },
      batchSize: 1,
    };
    setResult(computePriceBreakdown(demoState));
    setTriesUsed((n) => n + 1);
  }

  if (limitHit) {
    return (
      <div className="card p-6">
        <p className="text-sm font-medium text-accent-strong">You've tried the free preview</p>
        <h3 className="font-display text-xl mt-2">Good news — the full calculator is free too.</h3>
        <p className="text-sm text-text-muted mt-2">
          No account, no card, no limits. Everything you just tried here (plus
          ingredients, tax, batch scaling, and 8 more modules) is already
          live in the dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-xl bg-accent text-accent-ink px-5 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors"
        >
          Open the free dashboard →
        </Link>
        <p className="mt-4 text-xs text-text-muted">
          Curious what a paid tier might unlock later? See{" "}
          <a href="#pricing" className="text-accent hover:text-accent-strong font-medium">
            the proposed pricing
          </a>{" "}
          below — nothing there is live yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Try it — no signup needed</p>
        <span className="text-xs text-text-muted">
          {FREE_TRIES - triesUsed} free {FREE_TRIES - triesUsed === 1 ? "try" : "tries"} left
        </span>
      </div>

      <input
        type="text"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        placeholder="e.g. Leche flan, 12-pc box"
        className="mt-3 w-full rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
      />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-text-muted">Materials</span>
          <div className="relative mt-1">
            <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="0"
              className="font-num w-full rounded-lg border border-border bg-surface-muted pl-5 pr-2 py-2 text-sm text-right focus:outline-none focus:border-accent"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-text-muted">Labor</span>
          <div className="relative mt-1">
            <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={labor}
              onChange={(e) => setLabor(e.target.value)}
              placeholder="0"
              className="font-num w-full rounded-lg border border-border bg-surface-muted pl-5 pr-2 py-2 text-sm text-right focus:outline-none focus:border-accent"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-text-muted">Packaging</span>
          <div className="relative mt-1">
            <span className="font-num absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              placeholder="0"
              className="font-num w-full rounded-lg border border-border bg-surface-muted pl-5 pr-2 py-2 text-sm text-right focus:outline-none focus:border-accent"
            />
          </div>
        </label>
      </div>

      <label className="block mt-3">
        <span className="text-[11px] uppercase tracking-wider text-text-muted">Target margin</span>
        <div className="relative mt-1">
          <input
            type="number"
            inputMode="decimal"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            placeholder="30"
            className="font-num w-full rounded-lg border border-border bg-surface-muted pl-3 pr-7 py-2 text-sm text-right focus:outline-none focus:border-accent"
          />
          <span className="font-num absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
        </div>
      </label>

      <button
        type="button"
        onClick={calculate}
        className="mt-4 w-full rounded-xl bg-accent text-accent-ink px-4 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors"
      >
        Calculate my price
      </button>

      {result && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted">True cost</p>
            <p className="font-num text-lg font-semibold mt-1">₱{peso(result.cost)}</p>
          </div>
          <div className="rounded-xl bg-accent text-accent-ink p-3 -m-3">
            <p className="text-xs text-accent-ink/80">Suggested price</p>
            <p className="font-num text-lg font-bold mt-1">₱{peso(result.priceCustomerPays)}</p>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-text-muted">Example only — nothing here is saved.</p>
    </div>
  );
}
