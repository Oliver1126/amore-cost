"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  CATALOG_STORAGE_KEY,
  isTransactionRefunded,
  refundTransaction,
  type CatalogItem,
  type SaleEntry,
} from "@/lib/catalog";
import { BrandMark } from "@/components/BrandMark";
import { peso, pesoSigned } from "@/lib/format";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

const PAYMENT_LABEL_KEY = {
  cash: "pos.paymentCash",
  gcash: "pos.paymentGcash",
  card: "pos.paymentCard",
  other: "pos.paymentOther",
} as const;

export default function PosReceiptPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = use(params);
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [catalog, setCatalog, hydrated] = useLocalStorage<CatalogItem[]>(CATALOG_STORAGE_KEY, () => []);

  if (!hydrated) return null;

  const lines: { item: CatalogItem; entry: SaleEntry }[] = [];
  for (const item of catalog) {
    for (const entry of item.sales) {
      if (entry.transactionId === transactionId) lines.push({ item, entry });
    }
  }

  if (lines.length === 0) {
    return <p className="text-text-muted text-sm">{t("pos.receiptNotFound")}</p>;
  }

  const isRefundReceipt = lines.every(({ entry }) => !!entry.refundOf);
  const refunded = !isRefundReceipt && isTransactionRefunded(catalog, transactionId);
  const refundedEntry = refunded
    ? catalog.flatMap((i) => i.sales).find((e) => e.refundOf === lines[0].entry.id)
    : undefined;
  const originalTransactionId = isRefundReceipt
    ? catalog.flatMap((i) => i.sales).find((e) => e.id === lines[0].entry.refundOf)?.transactionId
    : undefined;

  const total = lines.reduce((sum, { entry }) => sum + entry.unitPrice * entry.quantity, 0);
  const paymentMethod = lines[0].entry.paymentMethod;
  const dateLabel = new Date(lines[0].entry.date).toLocaleDateString(
    lang === "tl" ? "fil-PH" : "en-PH",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const posName = getModuleText(lang, MODULES.find((m) => m.slug === "pos")!).name;

  function handleRefund() {
    if (!window.confirm(t("pos.refundConfirm"))) return;
    const { catalog: nextCatalog, refundTransactionId } = refundTransaction(catalog, transactionId);
    setCatalog(nextCatalog);
    router.push(`/pos/receipt/${refundTransactionId}`);
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 print:p-0">
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        {!isRefundReceipt &&
          (refunded ? (
            <span className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-muted">
              {t("pos.refunded")}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRefund}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-bad hover:text-bad transition-colors"
            >
              {t("pos.refundThisSale")}
            </button>
          ))}
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
        >
          {t("documents.printLink")}
        </button>
      </div>

      <div className="border border-border rounded-2xl p-8 print:border-0 print:p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <BrandMark size={32} />
            </div>
            <span className="font-display text-lg">Amore Cost</span>
          </div>
          <div className="text-right text-sm text-text-muted">
            <p>{isRefundReceipt ? t("pos.refundReceipt") : t("pos.receipt")}</p>
            <p>{dateLabel}</p>
          </div>
        </div>

        <h1 className="font-display text-xl mt-8">{posName}</h1>
        {isRefundReceipt && originalTransactionId && (
          <p className="text-xs text-text-muted mt-1 print:hidden">
            {t("pos.refundOfLabel")}{" "}
            <Link
              href={`/pos/receipt/${originalTransactionId}`}
              className="text-accent hover:text-accent-strong font-medium"
            >
              {originalTransactionId}
            </Link>
          </p>
        )}
        {refunded && refundedEntry && (
          <p className="text-xs text-bad mt-1">
            {t("pos.refundedOn")}{" "}
            {new Date(refundedEntry.date).toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="text-left text-text-muted border-b border-border">
              <th className="font-medium py-2">{t("common.item")}</th>
              <th className="font-medium py-2 text-right">{t("common.qty")}</th>
              <th className="font-medium py-2 text-right">{t("common.price")}</th>
              <th className="font-medium py-2 text-right">{t("pos.total")}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(({ item, entry }) => (
              <tr key={entry.id} className="border-b border-border">
                <td className="py-3">
                  {item.state.itemName || t("common.untitled")}
                  {entry.seniorPwdDiscount && (
                    <span className="ml-1.5 text-[11px] text-accent-strong bg-accent-soft rounded-full px-1.5 py-0.5">
                      {t("pos.seniorPwdLabel")}
                    </span>
                  )}
                  {entry.refundOf && (
                    <span className="ml-1.5 text-[11px] text-bad bg-bad/10 rounded-full px-1.5 py-0.5">
                      {t("pos.refundTag")}
                    </span>
                  )}
                </td>
                <td className="py-3 text-right font-num">{entry.quantity}</td>
                <td className="py-3 text-right font-num">₱{peso(entry.unitPrice)}</td>
                <td className="py-3 text-right font-num">{pesoSigned(entry.unitPrice * entry.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 font-medium">
                {t("pos.total")}
              </td>
              <td className="py-3 text-right font-num font-bold text-lg">{pesoSigned(total)}</td>
            </tr>
          </tfoot>
        </table>

        {paymentMethod && (
          <p className="text-sm text-text-muted mt-4">
            {t("pos.paymentMethod")}: {t(PAYMENT_LABEL_KEY[paymentMethod])}
          </p>
        )}

        <p className="text-xs text-text-muted mt-10">{t("pos.notBirReceipt")}</p>
      </div>
    </div>
  );
}
