/** The one peso formatter for the whole app — was duplicated verbatim across 13 files, including the customer-facing printed quotation and POS receipt, risking the two silently disagreeing after a future formatting change. */
export const peso = (n: number) =>
  n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Same as `peso`, but puts the minus sign before the ₱ instead of after it — needed anywhere a negative amount can appear (refunds), since `peso(-5)` alone would misleadingly print "₱-5.00". */
export const pesoSigned = (n: number) => (n < 0 ? `-₱${peso(Math.abs(n))}` : `₱${peso(n === 0 ? 0 : n)}`);
