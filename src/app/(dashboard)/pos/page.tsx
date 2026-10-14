"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  CATALOG_STORAGE_KEY,
  POS_CART_STORAGE_KEY,
  checkoutCart,
  PAYMENT_METHODS,
  type CatalogItem,
  type CartLine,
  type PaymentMethod,
} from "@/lib/catalog";
import { ACTIVE_PROFILE_STORAGE_KEY } from "@/lib/team";
import { computePriceBreakdown, seniorPwdPrice } from "@/lib/calculator";
import { peso } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

const PAYMENT_LABEL_KEY: Record<PaymentMethod, "pos.paymentCash" | "pos.paymentGcash" | "pos.paymentCard" | "pos.paymentOther"> = {
  cash: "pos.paymentCash",
  gcash: "pos.paymentGcash",
  card: "pos.paymentCard",
  other: "pos.paymentOther",
};

export default function PosPage() {
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, catalogHydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [cart, setCart, cartHydrated] = useLocalStorage<CartLine[]>(POS_CART_STORAGE_KEY, () => []);
  const [activeProfileId] = useLocalStorage<string>(ACTIVE_PROFILE_STORAGE_KEY, () => "");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hydrated = catalogHydrated && cartHydrated;
  if (!hydrated) {
    return <PageSkeleton />;
  }

  const title = getModuleText(lang, MODULES.find((m) => m.slug === "pos")!).name;
  const costingName = getModuleText(lang, MODULES.find((m) => m.slug === "calculator")!).name;

  const query = search.trim().toLowerCase();
  const visibleItems = query
    ? catalog.filter(
        (c) =>
          (c.sku ?? "").toLowerCase().includes(query) ||
          (c.state.itemName || "").toLowerCase().includes(query)
      )
    : catalog;

  function addToCart(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === itemId);
      if (existing) {
        return prev.map((l) => (l.itemId === itemId ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  }

  function setLineQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((l) => l.itemId !== itemId));
      return;
    }
    setCart((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, quantity } : l)));
  }

  function removeLine(itemId: string) {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  function toggleSeniorPwd(itemId: string) {
    setCart((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, seniorPwd: !l.seniorPwd } : l)));
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !query) return;
    const bySku = catalog.find((c) => (c.sku ?? "").toLowerCase() === query);
    if (bySku) {
      addToCart(bySku.id);
      setSearch("");
      return;
    }
    if (visibleItems.length === 1) {
      addToCart(visibleItems[0].id);
      setSearch("");
    }
  }

  const cartDetails = cart
    .map((line) => {
      const item = catalog.find((c) => c.id === line.itemId);
      if (!item) return null;
      const breakdown = computePriceBreakdown(item.state);
      // Senior/PWD lines are already tax-exempt and 20% off the pre-tax price — no separate tax portion to add on top.
      const lineSubtotal = line.seniorPwd ? seniorPwdPrice(breakdown.priceBeforeTax) : breakdown.priceBeforeTax;
      const lineTax = line.seniorPwd ? 0 : breakdown.taxAmount;
      const unitPrice = lineSubtotal + lineTax;
      return { line, item, breakdown, unitPrice, lineSubtotal, lineTax };
    })
    .filter(
      (
        d
      ): d is {
        line: CartLine;
        item: CatalogItem;
        breakdown: ReturnType<typeof computePriceBreakdown>;
        unitPrice: number;
        lineSubtotal: number;
        lineTax: number;
      } => d !== null
    );

  const subtotal = cartDetails.reduce((sum, d) => sum + d.lineSubtotal * d.line.quantity, 0);
  const tax = cartDetails.reduce((sum, d) => sum + d.lineTax * d.line.quantity, 0);
  const total = subtotal + tax;

  function completeSale() {
    if (cartDetails.length === 0) return;
    const { catalog: nextCatalog, transactionId } = checkoutCart(
      catalog,
      cart,
      paymentMethod,
      activeProfileId || undefined
    );
    setCatalog(nextCatalog);
    setCart([]);
    setLastTransactionId(transactionId);
  }

  function startNewSale() {
    setLastTransactionId(null);
    searchInputRef.current?.focus();
  }

  if (catalog.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        <p className="mt-1 text-text-muted max-w-[64ch]">{t("pos.description")}</p>
        <div className="mt-8 card px-5 py-4 text-sm text-text-muted max-w-md">
          {t("common.saveItemFirstPrefix")}
          <Link href="/costing" className="text-accent hover:text-accent-strong font-medium">
            {costingName}
          </Link>
          {t("common.saveItemFirstSuffix")}
        </div>
      </div>
    );
  }

  if (lastTransactionId) {
    return (
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        <div className="mt-8 card p-6 max-w-md text-center">
          <p className="font-display text-xl text-accent-strong">{t("pos.saleComplete")}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={`/pos/receipt/${lastTransactionId}`}
              target="_blank"
              className="rounded-xl bg-accent text-accent-ink px-4 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors"
            >
              {t("pos.printReceipt")}
            </Link>
            <button
              type="button"
              onClick={startNewSale}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-accent transition-colors"
            >
              {t("pos.newSale")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("pos.description")}</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        <div className="card p-6">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("pos.searchPlaceholder")}
            autoFocus
            className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
          />

          {visibleItems.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">
              {t("pos.noResultsPrefix")} "{search}"
            </p>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {visibleItems.map((item) => {
                const b = computePriceBreakdown(item.state);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addToCart(item.id)}
                    className="text-left card p-4 hover:border-accent transition-colors"
                  >
                    <p className="text-sm font-medium">{item.state.itemName || t("common.untitled")}</p>
                    {item.sku && <p className="text-[11px] text-text-muted mt-0.5">{item.sku}</p>}
                    <p className="font-num text-sm mt-1.5">₱{peso(b.priceCustomerPays)}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {item.stockOnHand} {lang === "tl" ? "nasa stock" : "in stock"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5 lg:sticky lg:top-6">
          <p className="text-sm text-text-muted">{t("pos.cartTitle")}</p>

          {cartDetails.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">{t("pos.cartEmpty")}</p>
          ) : (
            <div className="mt-3 space-y-3">
              {cartDetails.map(({ line, item, unitPrice }) => (
                <div key={line.itemId} className="flex items-start justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.state.itemName || t("common.untitled")}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setLineQuantity(item.id, line.quantity - 1)}
                        className="w-6 h-6 rounded-md border border-border text-text-muted hover:text-text transition-colors"
                      >
                        −
                      </button>
                      <span className="font-num w-6 text-center">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setLineQuantity(item.id, line.quantity + 1)}
                        className="w-6 h-6 rounded-md border border-border text-text-muted hover:text-text transition-colors"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(item.id)}
                        className="ml-1 text-text-muted hover:text-bad transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    {line.quantity > item.stockOnHand && (
                      <p className="text-[11px] text-bad mt-1">
                        {lang === "tl"
                          ? `${item.stockOnHand} na lang ang stock`
                          : `only ${item.stockOnHand} in stock`}
                      </p>
                    )}
                    <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!line.seniorPwd}
                        onChange={() => toggleSeniorPwd(item.id)}
                        className="accent-accent"
                      />
                      {t("pos.seniorPwdLabel")}
                    </label>
                  </div>
                  <p className="font-num flex-none">₱{peso(unitPrice * line.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>{t("pos.subtotal")}</span>
              <span className="font-num">₱{peso(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>{t("pos.tax")}</span>
                <span className="font-num">₱{peso(tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base pt-1.5 border-t border-border">
              <span>{t("pos.total")}</span>
              <span className="font-num">₱{peso(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-text-muted mb-2">{t("pos.paymentMethod")}</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    paymentMethod === pm
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-border text-text-muted hover:text-text"
                  }`}
                >
                  {t(PAYMENT_LABEL_KEY[pm])}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={completeSale}
            disabled={cartDetails.length === 0}
            className="mt-4 w-full rounded-xl bg-accent text-accent-ink px-4 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors disabled:opacity-40 disabled:hover:bg-accent"
          >
            {t("pos.completeSale")}
          </button>
        </div>
      </div>
    </div>
  );
}
