"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { computePriceBreakdown, directCost } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, newId, type CatalogItem } from "@/lib/catalog";
import { simulateReceipt, type PricingModel, type ReceiptLine } from "@/lib/receipt";
import { peso } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { InfoButton } from "@/components/InfoButton";
import { MODULES } from "@/lib/modules";

const inputClass =
  "rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm focus:outline-none focus:border-accent";

function segmentClass(active: boolean) {
  return `flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
    active ? "bg-surface shadow-sm text-text" : "text-text-muted hover:text-text"
  }`;
}

export default function ReceiptSimulatorPage() {
  const { lang, t } = useLanguage();
  const [catalog, , hydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [pricingModel, setPricingModel] = useState<PricingModel>("inclusive");
  const [vatRate, setVatRate] = useState(12);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [seniorPwd, setSeniorPwd] = useState(false);

  if (!hydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "receipt")!).name;
  const inputName = getModuleText(lang, MODULES.find((m) => m.slug === "input")!).name;
  const r = simulateReceipt(lines, { pricingModel, vatRate, serviceChargePercent: serviceCharge, seniorPwd });
  const rate = vatRate / 100;
  const shownPrice = (net: number) => (pricingModel === "inclusive" ? net * (1 + rate) : net);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  function addLine() {
    const item = catalog.find((c) => c.id === selectedId);
    if (!item || quantity <= 0) return;
    const b = computePriceBreakdown(item.state);
    setLines((current) => {
      const existing = current.find((l) => l.name === item.state.itemName && l.unitNetPrice === b.priceBeforeTax);
      if (existing) return current.map((l) => (l === existing ? { ...l, quantity: l.quantity + quantity } : l));
      return [
        ...current,
        {
          id: newId(),
          name: item.state.itemName || t("common.untitled"),
          quantity,
          unitNetPrice: b.priceBeforeTax,
          unitCost: directCost(item.state),
        },
      ];
    });
    setQuantity(1);
  }

  const row = (label: string, value: number, opts: { negative?: boolean; strong?: boolean } = {}) => (
    <div className={`flex justify-between ${opts.strong ? "font-semibold text-base" : ""}`}>
      <span>{label}</span>
      <span className="font-num">
        {opts.negative ? "−" : ""}₱{peso(value)}
      </span>
    </div>
  );

  return (
    <div>
      <div className="print:hidden">
        <h1 className="font-display text-2xl">{title}</h1>
        <p className="mt-1 text-text-muted max-w-[64ch]">{t("receipt.description")}</p>
      </div>

      {catalog.length === 0 ? (
        <div className="mt-8 card p-5 text-sm text-text-muted max-w-md">
          {t("receipt.emptyPrefix")}
          <Link href="/input" className="text-accent hover:text-accent-strong font-medium">
            {inputName}
          </Link>
          {t("receipt.emptySuffix")}
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_24rem] gap-6 items-start">
          <div className="space-y-6 print:hidden">
            <div className="card p-5">
              <p className="text-sm font-medium">{t("receipt.addTitle")}</p>
              <div className="mt-4 grid sm:grid-cols-[1fr_6rem_auto] gap-2">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  aria-label={t("receipt.selectRecipe")}
                  className={inputClass}
                >
                  <option value="">{t("receipt.chooseRecipe")}</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(c.state.itemName || t("common.untitled")) +
                        ` — ₱${peso(shownPrice(computePriceBreakdown(c.state).priceBeforeTax))}`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  aria-label={t("receipt.quantity")}
                  className={`${inputClass} font-num text-right`}
                />
                <button
                  type="button"
                  onClick={addLine}
                  disabled={!selectedId || quantity <= 0}
                  className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors disabled:opacity-50"
                >
                  {t("receipt.addToOrder")}
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-text-muted">
                    {t("receipt.orderItems")} ({itemCount})
                  </p>
                  {lines.length > 0 && (
                    <button type="button" onClick={() => setLines([])} className="text-xs text-text-muted hover:text-bad">
                      {t("receipt.clearAll")}
                    </button>
                  )}
                </div>
                {lines.length === 0 ? (
                  <p className="mt-2 text-sm text-text-muted">{t("receipt.noItems")}</p>
                ) : (
                  <ul className="mt-2 divide-y divide-border">
                    {lines.map((l) => (
                      <li key={l.id} className="flex items-center gap-2 py-2 text-sm">
                        <span className="flex-1 min-w-0 truncate">{l.name}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={l.quantity || ""}
                          onChange={(e) => {
                            const q = Math.max(0, Math.floor(Number(e.target.value) || 0));
                            setLines((cur) => cur.map((x) => (x.id === l.id ? { ...x, quantity: q } : x)));
                          }}
                          aria-label={`${t("receipt.quantity")} — ${l.name}`}
                          className={`${inputClass} font-num w-16 text-right py-1`}
                        />
                        <span className="font-num w-24 text-right">₱{peso(shownPrice(l.unitNetPrice) * l.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => setLines((cur) => cur.filter((x) => x.id !== l.id))}
                          aria-label={`${t("common.remove")} ${l.name}`}
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-bad"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-text-muted">{t("receipt.pricingModel")}</p>
                  <InfoButton label={t("receipt.pricingModelWhat")}>{t("receipt.pricingModelHelp")}</InfoButton>
                </div>
                <div className="mt-2 flex gap-1 bg-surface-muted rounded-xl p-1" role="radiogroup" aria-label={t("receipt.pricingModel")}>
                  {(["inclusive", "exclusive"] as PricingModel[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={pricingModel === m}
                      onClick={() => setPricingModel(m)}
                      className={segmentClass(pricingModel === m)}
                    >
                      {m === "inclusive" ? t("receipt.vatInclusive") : t("receipt.vatExclusive")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-text-muted">{t("receipt.vatRate")}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={vatRate}
                    onChange={(e) => setVatRate(Math.max(0, Number(e.target.value) || 0))}
                    className={`${inputClass} font-num mt-1 w-full text-right`}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted">{t("receipt.serviceCharge")}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={serviceCharge || ""}
                    placeholder="0"
                    onChange={(e) => setServiceCharge(Math.max(0, Number(e.target.value) || 0))}
                    className={`${inputClass} font-num mt-1 w-full text-right`}
                  />
                </label>
              </div>

              <div>
                <p className="text-sm text-text-muted">{t("receipt.discount")}</p>
                <div className="mt-2 flex gap-1 bg-surface-muted rounded-xl p-1" role="radiogroup" aria-label={t("receipt.discount")}>
                  <button type="button" role="radio" aria-checked={!seniorPwd} onClick={() => setSeniorPwd(false)} className={segmentClass(!seniorPwd)}>
                    {t("receipt.standardCustomer")}
                  </button>
                  <button type="button" role="radio" aria-checked={seniorPwd} onClick={() => setSeniorPwd(true)} className={segmentClass(seniorPwd)}>
                    {t("receipt.seniorPwd")}
                  </button>
                </div>
                {seniorPwd && <p className="mt-2 text-xs text-text-muted">{t("receipt.seniorPwdNote")}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6 font-num text-sm print:border-0 print:shadow-none">
              <div className="text-center">
                <p className="font-display text-base">{t("receipt.receiptHeader")}</p>
                <p className="text-xs text-text-muted mt-0.5">{t("receipt.simulationLabel")}</p>
                <p className="text-xs text-text-muted">{new Date().toLocaleString("en-PH")}</p>
              </div>
              <div className="my-4 border-t border-dashed border-border" />
              {lines.length === 0 ? (
                <p className="text-center text-text-muted">{t("receipt.noItems")}</p>
              ) : (
                <ul className="space-y-1">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {l.quantity} × {l.name}
                      </span>
                      <span>₱{peso(shownPrice(l.unitNetPrice) * l.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="my-4 border-t border-dashed border-border" />
              <div className="space-y-1">
                {row(t("receipt.subtotal"), r.subtotal)}
                {seniorPwd && pricingModel === "inclusive" && row(t("receipt.lessVat"), r.subtotal - r.netSales, { negative: true })}
                {seniorPwd && row(t("receipt.seniorPwdDiscount"), r.discount, { negative: true })}
                {row(t("receipt.vatableSales"), r.vatableSales)}
                {seniorPwd && row(t("receipt.vatExemptSales"), r.vatExemptSales)}
                {row(`${t("receipt.vat")} (${vatRate}%)`, r.vat)}
                {serviceCharge > 0 && row(`${t("receipt.serviceChargeLine")} (${serviceCharge}%)`, r.serviceCharge)}
              </div>
              <div className="my-3 border-t border-border" />
              {row(t("receipt.totalDue"), r.totalDue, { strong: true })}
            </div>

            <div className="card p-5 print:hidden">
              <p className="text-sm font-medium">{t("receipt.marginTitle")}</p>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("receipt.directCost")}</span>
                  <span className="font-num text-warn">₱{peso(r.directCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("input.foodCost")}</span>
                  <span className="font-num">{r.foodCostPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("receipt.netProfit")}</span>
                  <span className={`font-num ${r.netProfit < 0 ? "text-bad" : "text-info"}`}>₱{peso(r.netProfit)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-muted">{t("receipt.marginNote")}</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={lines.length === 0}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-accent transition-colors disabled:opacity-50 print:hidden"
            >
              {t("receipt.print")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
