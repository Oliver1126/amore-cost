"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { computePriceBreakdown, directCost } from "@/lib/calculator";
import { CATALOG_STORAGE_KEY, newId, type CatalogItem } from "@/lib/catalog";
import {
  simulateReceipt,
  menuUnitPrice,
  RECEIPT_PROFILE_STORAGE_KEY,
  defaultReceiptProfile,
  type PricingModel,
  type ReceiptLine,
  type ReceiptProfile,
} from "@/lib/receipt";
import { UtensilsCrossed } from "lucide-react";
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
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);
  const [profile, setProfile, profileHydrated] = useLocalStorage<ReceiptProfile>(
    RECEIPT_PROFILE_STORAGE_KEY,
    defaultReceiptProfile
  );
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [pricingModel, setPricingModel] = useState<PricingModel>("inclusive");
  const [vatRate, setVatRate] = useState(12);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [seniorPwd, setSeniorPwd] = useState(false);

  if (!catalogHydrated || !profileHydrated) return <PageSkeleton />;

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "receipt")!).name;
  const inputName = getModuleText(lang, MODULES.find((m) => m.slug === "input")!).name;
  const r = simulateReceipt(lines, { pricingModel, vatRate, serviceChargePercent: serviceCharge, seniorPwd });
  const shownPrice = (net: number) => menuUnitPrice(net, { pricingModel, vatRate });
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

  const now = new Date();
  const date = now.toLocaleDateString("en-CA");
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const marginPct = r.netRevenue > 0 ? (r.netProfit / r.netRevenue) * 100 : 0;

  // One receipt line: label left, amount right, never wrapping the amount.
  const row = (label: string, value: number, opts: { negative?: boolean } = {}) => (
    <div className="flex justify-between gap-3">
      <span className="min-w-0">{label}</span>
      <span className="flex-none tabular-nums">
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
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem] gap-6 items-start">
          <div className="space-y-6 min-w-0 print:hidden">
            <div className="card p-5">
              <p className="text-sm font-medium">{t("receipt.addTitle")}</p>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_6rem_auto] gap-2">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  aria-label={t("receipt.selectRecipe")}
                  className={`${inputClass} col-span-2 sm:col-span-1 w-full min-w-0`}
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
                  className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-accent-strong transition-colors disabled:opacity-50"
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

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-muted">{t("receipt.businessDetails")}</p>
                <p className="text-xs text-text-muted mt-0.5">{t("receipt.businessDetailsHint")}</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    placeholder={t("receipt.businessNamePlaceholder")}
                    aria-label={t("receipt.businessName")}
                    className={`${inputClass} sm:col-span-2`}
                  />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder={t("receipt.addressPlaceholder")}
                    aria-label={t("receipt.address")}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={profile.tin}
                    onChange={(e) => setProfile({ ...profile, tin: e.target.value })}
                    placeholder={t("receipt.tinPlaceholder")}
                    aria-label={t("receipt.tin")}
                    className={`${inputClass} font-num`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:max-w-none lg:mx-0 lg:sticky lg:top-6">
            {/* Receipt paper stays light in every theme — it's paper. Tokens
                are re-pinned to their light values so orange/blue/green
                accents keep their contrast on it in dark mode too. */}
            <div className="receipt-paper rounded-t-xl shadow-sm print:shadow-none">
              <div className="px-5 pt-7 pb-5 sm:px-7 font-receipt text-[13px] sm:text-sm leading-relaxed">
                <div className="text-center">
                  <UtensilsCrossed className="w-7 h-7 mx-auto" strokeWidth={2.25} aria-hidden="true" />
                  <p className="mt-2 text-lg sm:text-xl font-bold uppercase tracking-wide leading-snug break-words">
                    {profile.businessName.trim() || t("receipt.businessNameFallback")}
                  </p>
                  {profile.address.trim() && <p className="mt-1 break-words">{profile.address}</p>}
                  {profile.tin.trim() && (
                    <p className="break-words">
                      {t("receipt.vatRegTin")} {profile.tin}
                    </p>
                  )}
                </div>

                <div className="my-4 border-t-[3px] border-double border-current opacity-40" />
                <div className="text-center uppercase">
                  <p>{t("receipt.officialReceiptSimulation")}</p>
                  <p>
                    {t("receipt.dateLabel")} {date} {t("receipt.timeLabel")} {time}
                  </p>
                </div>
                <div className="my-4 border-t border-dashed border-current opacity-40" />

                <div className="grid grid-cols-[2.25rem_1fr_auto] gap-x-2 font-bold uppercase">
                  <span>{t("receipt.qty")}</span>
                  <span>{t("receipt.descriptionCol")}</span>
                  <span className="text-right">{t("receipt.amountCol")}</span>
                </div>
                <div className="my-2 border-t border-dashed border-current opacity-40" />
                {lines.length === 0 ? (
                  <p className="py-2 text-center opacity-60">{t("receipt.noItems")}</p>
                ) : (
                  <ul className="space-y-1">
                    {lines.map((l) => (
                      <li key={l.id} className="grid grid-cols-[2.25rem_1fr_auto] gap-x-2">
                        <span className="tabular-nums">{l.quantity}</span>
                        <span className="min-w-0 break-words">{l.name}</span>
                        <span className="text-right tabular-nums">₱{peso(shownPrice(l.unitNetPrice) * l.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="my-3 border-t border-dashed border-current opacity-40" />

                <div className="space-y-0.5 uppercase">
                  {row(t("receipt.subtotal"), r.subtotal)}
                  {seniorPwd && pricingModel === "inclusive" && row(t("receipt.lessVat"), r.subtotal - r.netSales, { negative: true })}
                  {seniorPwd && row(t("receipt.seniorPwdDiscount"), r.discount, { negative: true })}
                  {seniorPwd ? row(t("receipt.vatExemptSales"), r.vatExemptSales) : row(t("receipt.netVatableSales"), r.vatableSales)}
                  {row(`${t("receipt.vat")} (${vatRate}%)`, r.vat)}
                  {row(`${t("receipt.svcCharge")}${serviceCharge > 0 ? ` (${serviceCharge}%)` : ""}`, r.serviceCharge)}
                </div>

                <div className="mt-3 border-t-[3px] border-double border-current opacity-40" />
                <div className="my-2 flex justify-between gap-3 text-lg sm:text-xl font-bold uppercase">
                  <span>{t("receipt.totalDue")}</span>
                  <span className="tabular-nums">₱{peso(r.totalDue)}</span>
                </div>
                <div className="border-t-[3px] border-double border-current opacity-40" />

                <div className="mt-5 rounded-lg border border-dashed border-accent/60 bg-accent-soft/60 p-4 print:hidden">
                  <p className="text-center font-bold uppercase text-accent-strong">{t("receipt.dishMarginTitle")}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <span>{t("receipt.directIngredientCost")}</span>
                      <span className="flex-none tabular-nums text-warn">₱{peso(r.directCost)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>{t("receipt.trueFoodCost")}</span>
                      <span className="flex-none tabular-nums font-bold">{r.foodCostPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-3 items-start">
                      <span>{t("receipt.netDishProfit")}</span>
                      <span className={`text-right tabular-nums font-bold ${r.netProfit < 0 ? "text-bad" : "text-accent-strong"}`}>
                        ₱{peso(r.netProfit)}
                        <span className="block font-normal">
                          ({marginPct.toFixed(1)}% {t("receipt.marginWord")})
                        </span>
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-snug opacity-70">{t("receipt.marginNote")}</p>
                </div>

                <div className="mt-5 text-center uppercase opacity-70 text-xs">
                  <p>{t("receipt.thankYou")}</p>
                  <p className="mt-0.5">{t("receipt.simulationFooter")}</p>
                </div>
              </div>
            </div>
            <div className="receipt-edge h-2.5" aria-hidden="true" />

            <button
              type="button"
              onClick={() => window.print()}
              disabled={lines.length === 0}
              className="mt-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-accent transition-colors disabled:opacity-50 print:hidden"
            >
              {t("receipt.print")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
