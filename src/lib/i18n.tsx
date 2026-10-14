"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "tl";
const LANG_STORAGE_KEY = "calcost:lang";

interface ModuleTranslation {
  name: string;
  description: string;
  note?: string;
}

/** Tagalog copy for MODULES (src/lib/modules.ts) — keyed by slug, same set covered by STRINGS below (Sidebar + Overview only, per backlog.md item 9's phased scope). */
export const MODULE_TRANSLATIONS_TL: Record<string, ModuleTranslation> = {
  overview: {
    name: "Pangkalahatang-ideya",
    description: "Buod ng kasalukuyan mong sinisingil, kasama ang link papunta sa bawat module.",
  },
  calculator: {
    name: "Pagsingil at Presyo",
    description:
      "Kalkulahin ang gastos ng isang recipe at makakuha ng presyo gamit ang markup, margin, o fixed na tubo.",
  },
  "break-even": {
    name: "Break-Even",
    description:
      "Tingnan kung ilang unit ang kailangan mong ibenta bawat buwan para masakop ang totoong fixed cost sa presyong itinakda mo.",
  },
  catalog: {
    name: "Pamamahala ng Katalogo",
    description:
      "Naka-save na listahan ng mga na-costed na recipe — job status, printable na QR price tag, filter ng margin — kasama ang Aklatan ng Sangkap: isingil ang hilaw na sangkap nang isang beses, gamitin kahit saan, at makita kung aling mga recipe ang naka-link dito.",
  },
  inventory: {
    name: "Imbentaryo",
    description: "Pagsubaybay sa stock, low-stock alert, at awtomatikong pagbawas ng stock kapag nabenta.",
    note: "Nagbabahagi ng gastos sa pamamagitan ng Aklatan ng Sangkap, pero ang dami ng stock ay per-item pa rin, hindi iisang stock ng hilaw na sangkap.",
  },
  pos: {
    name: "Point of Sale",
    description:
      "Mag-scan o maghanap ng Catalog item, idagdag sa cart, at mag-checkout gamit ang paraan ng bayad — awtomatikong babawasan ang stock at ilalagay sa log ang benta.",
    note: "Nagpi-print ng resibo sa pamamagitan ng print dialog ng browser mo, tulad ng Mga Dokumento — walang cash-drawer o thermal-printer-specific na integration, at walang multi-register sync (kailangan ng tunay na account at backend).",
  },
  history: {
    name: "Kasaysayan ng Gastos",
    description:
      "Subaybayan ang pagbabago ng gastos sa paglipas ng panahon para makita agad kung kumukupas na ang tubo ng isang bestseller.",
  },
  documents: {
    name: "Mga Dokumento",
    description:
      "Kumpletong backup/restore ng datos, CSV import mula sa spreadsheet na meron ka na, CSV export, at printable na quotation para sa kliyente.",
  },
  "multi-user": {
    name: "Maramihang Gumagamit",
    description: "Profile ng may-ari at staff o bookkeeper sa iisang account.",
    note: "Local preview lamang — kahit sino sa browser na ito ay pwedeng lumipat ng profile nang libre. Kailangan ng account at backend para sa tunay na access control.",
  },
  "multi-channel": {
    name: "Presyo sa Iba't Ibang Channel",
    description:
      "Iba't ibang presyo para sa parehong produkto sa Shopee, Lazada, at personal na benta, dahil magkaiba ang bayad sa bawat platform.",
  },
  alerts: {
    name: "Alerto sa Margin",
    description: "Magtakda ng target na margin bawat item at tingnan kung alin ang bumagsak dito.",
    note: "Awtomatikong sumasalamin sa pagbabago mula sa Aklatan ng Sangkap, pero walang push notification — kailangan mong buksan ang page na ito para makita ito.",
  },
  reporting: {
    name: "Ulat ng Benta at Tubo",
    description:
      "Ang mga benta na inilog mo ay ginagawang tunay, hindi teoretikal, na ulat ng tubo gamit ang datos ng gastos na nasa sistema na.",
  },
};

export function getModuleText(
  lang: Lang,
  m: { slug: string; name: string; description: string; note?: string }
): ModuleTranslation {
  if (lang === "en") return { name: m.name, description: m.description, note: m.note };
  const tl = MODULE_TRANSLATIONS_TL[m.slug];
  return tl ? { ...tl, note: tl.note ?? m.note } : { name: m.name, description: m.description, note: m.note };
}

interface VerticalLabel {
  name: string;
  itemNoun: string;
  itemPlaceholder: string;
  laborLabel: string;
}

/** Tagalog copy for VERTICAL_LABELS (src/lib/calculator.ts). */
const VERTICAL_LABELS_TL: Record<string, VerticalLabel> = {
  food: {
    name: "Pagkain at Inumin",
    itemNoun: "Sangkap",
    itemPlaceholder: "hal. Itlog",
    laborLabel: "Paghahanda",
  },
};

export function getVerticalLabels(lang: Lang, vertical: string, fallback: VerticalLabel): VerticalLabel {
  if (lang === "en") return fallback;
  return VERTICAL_LABELS_TL[vertical] ?? fallback;
}

const JOB_STATUS_LABELS_TL: Record<string, string> = {
  quoted: "Naka-quote",
  accepted: "Tinanggap",
  in_progress: "Ginagawa",
  invoiced: "Na-invoice",
};

export function getJobStatusLabel(lang: Lang, status: string, fallback: string): string {
  if (lang === "en") return fallback;
  return JOB_STATUS_LABELS_TL[status] ?? fallback;
}

const TAX_PRESET_LABELS_TL: Record<string, string> = {
  none: "Walang buwis",
  vat: "VAT",
  percentage: "Percentage Tax",
};

export function getTaxPresetLabel(lang: Lang, preset: string, fallback: string): string {
  if (lang === "en") return fallback;
  return TAX_PRESET_LABELS_TL[preset] ?? fallback;
}

const STRINGS = {
  en: {
    "overview.noDraft": "You haven't priced anything yet — start on Costing & Pricing.",
    "overview.startCta": "Start costing a recipe →",
    "overview.breakEven": "Break-even",
    "overview.breakEvenNotReachable": "Not reachable at this price",
    "overview.unitsPerMonth": "units / month",
    "overview.editing": "Editing",
    "overview.adjust": "Adjust costs, strategy, or tax",
    "overview.seeAll": "See everything you've saved",
    "overview.open": "Open →",
    "overview.allModules": "All modules",
    "overview.loading": "Loading your saved numbers…",
    "overview.insightsTitle": "Needs your attention",
    "overview.insightsSubtitle": "Based on your saved catalog and logged sales — not just theoretical pricing.",
    "overview.insightsEmpty": "Nothing needs your attention right now — priced items and logged sales will surface real recommendations here.",

    "common.loading": "Loading your saved numbers…",
    "common.untitled": "(untitled)",
    "common.item": "Recipe",
    "common.date": "Date",
    "common.price": "Price",
    "common.revenue": "Revenue",
    "common.profit": "Profit",
    "common.qty": "Qty",
    "common.status": "Status",
    "common.remove": "Remove",
    "common.add": "Add",
    "common.saveItemFirstPrefix": "Save a recipe to your ",
    "common.saveItemFirstSuffix": " first.",

    "breakEven.pricePerUnit": "price per unit",
    "breakEven.unitsNeeded": "Units needed / month",
    "breakEven.toCover": "to cover fixed costs at this price",
    "breakEven.opexTitle": "Operating expenses (OPEX) per month",
    "breakEven.opexSharedNote": "Shared across your whole business — the same list is used no matter which recipe you're costing.",
    "breakEven.opexLabelPlaceholder": "e.g. Rent, salaries, utilities",
    "breakEven.opexAmountLabel": "Amount/month",
    "breakEven.addOpexItem": "+ Add expense",
    "breakEven.totalOpex": "Total OPEX",
    "breakEven.contingency": "Contingency",
    "breakEven.effectiveOpexPrefix": "With contingency, break-even is calculated against",
    "breakEven.effectiveOpexSuffix": "a month, not the raw OPEX total above.",
    "breakEven.lossMessage":
      "At this price, every unit loses money — there's no break-even until the price covers the true cost.",
    "breakEven.noMarginMessage":
      "This price exactly covers your true cost with nothing left over — there's no profit margin to pay down fixed costs, so break-even is never reached.",

    "history.description":
      "A snapshot is recorded every time a saved item's true cost or price actually changes — so margin erosion is visible before it quietly eats a bestseller's profit.",
    "history.noSnapshots":
      "No cost changes recorded yet — edit a saved item's ingredients or costs on Costing & Pricing and a snapshot will show up here.",
    "history.marginWord": "margin",
    "history.trueCost": "True cost",
    "history.marginHeader": "Margin",

    "alerts.description":
      "Set a target margin per item and see which ones have quietly fallen below it — before it eats a bestseller's profit.",
    "alerts.currentMargin": "Current margin",
    "alerts.targetMargin": "Target margin",
    "alerts.belowTarget": "Below target",
    "alerts.onTarget": "On target",

    "multiUser.description": "Owner plus staff or bookkeeper profiles on one browser.",
    "multiUser.warning": "This is a local preview, not real access control.",
    "multiUser.warningRest":
      " Anyone using this browser can switch profiles or add new ones — there's no password and no server checking who's who. Real multi-user security needs accounts and a backend, which don't exist in this build.",
    "multiUser.profiles": "Profiles",
    "multiUser.active": "active",
    "multiUser.namePlaceholder": "e.g. Ate Rosa",
    "multiUser.lastEditedBy": "Last edited by",
    "multiUser.unknown": "Unknown",

    "multiChannel.description":
      "The same item can need a different price on different channels, since platform fees eat into your margin differently.",
    "multiChannel.channel": "Channel",
    "multiChannel.fee": "Fee",
    "multiChannel.priceToCharge": "Price to charge",
    "multiChannel.noChannels": "No channels yet — add one below.",
    "multiChannel.inPerson": "In-person",

    "reporting.description1": "Built from the sales you log on ",
    "reporting.description2": " — real profit from real sales, not just theoretical pricing.",
    "reporting.noSales1": "No sales logged yet — log one on ",
    "reporting.unitsSold": "Units sold",
    "reporting.totalProfit": "Total profit",
    "reporting.totalRevenue": "Total revenue",
    "reporting.byItem": "By recipe",
    "reporting.recentSales": "Recent sales",

    "common.unit": "Unit",
    "common.cost": "Cost",
    "common.margin": "Margin",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.auto": "AUTO",
    "common.done": "Done",

    "costing.savedToDevice": " — saved to this device only.",
    "costing.defaultTitle": "Cost a recipe and price it",
    "costing.saveToCatalog": "Save to Catalog",
    "costing.startOver": "Start over",
    "costing.confirmClear": "Clear everything and start over?",
    "costing.notFound": "That recipe doesn't exist anymore.",
    "costing.backToCatalog": "Back to Catalog",
    "costing.catalogBackLink": "← Catalog",
    "costing.savedAutoCatalog": "Saved automatically to your Catalog",
    "costing.savedAutoBrowser":
      'Saved automatically to this browser — use "Save to Catalog" to keep it as a reusable item',
    "costing.conceptNote": "Concept build — pricing is an estimate, not tax advice.",

    "costForm.whatPricing": "What recipe are you costing?",
    "costForm.itemNamePlaceholder": "e.g. Leche flan, 12-pc box",
    "costForm.customOption": "Custom…",
    "costForm.ingredientLibraryName": "Ingredient Library",
    "costForm.linkHintPrefix": "Pick a name above a ",
    "costForm.linkHintSuffix": " row to link it to your ",
    "costForm.linkHintEnd": " — edit the cost there once, and it updates everywhere it's used.",
    "costForm.addPrefix": "+ Add ",
    "costForm.ratePerHour": "Rate per hour",
    "costForm.packaging": "Packaging",
    "costForm.overheadAllocation": "Overhead allocation",
    "costForm.percentOfCost": "of total cost",
    "costForm.supplier": "Supplier",
    "costForm.supplierPlaceholder": "e.g. SM Market",
    "costForm.packagePrice": "Package price",
    "costForm.qtyPerPack": "Qty per pack",
    "costForm.shippingFee": "Shipping fee",
    "costForm.packUnit": "Pack unit",
    "costForm.portionQty": "Portion qty",
    "costForm.portionUnit": "Portion unit",
    "costForm.unitCostLabel": "Unit cost",
    "costForm.whatsThis": "What do these columns mean?",
    "costForm.packagePricingExplainer":
      "Only fill in Supplier/Package price/Qty per pack/Shipping fee if you buy this in bulk (e.g. a 25kg sack) and use it in smaller portions (e.g. grams per recipe). Pack unit is what the package is measured in; Portion qty/unit is how much you actually use. Unit cost and Line cost marked AUTO are calculated for you — you never type those directly. If you don't buy in bulk, skip straight to Portion qty/unit and type the cost yourself.",
    "costForm.overheadCalcShow": "Estimate from OPEX",
    "costForm.overheadCalcHide": "Hide OPEX estimate",
    "costForm.noOpexPrefix": "You haven't set up any OPEX yet — add some on",
    "costForm.noOpexSuffix": "first.",
    "costForm.opexIsPrefix": "Your OPEX is",
    "costForm.opexIsSuffix": "/month.",
    "costForm.expectedVolume": "Expected monthly volume",
    "costForm.suggestedOverheadPrefix": "=",
    "costForm.suggestedOverheadSuffix": "per unit at that volume.",
    "costForm.useThisOverhead": "Use this",

    "stats.trueCost": "Recipe cost",
    "stats.trueCostBreakdown": "materials + labor + packaging + overhead",
    "stats.suggestedPrice": "Suggested price",
    "stats.noTaxAdded": "no tax added",
    "stats.includesTax": "includes",
    "stats.profitPerUnit": "Profit per serving",
    "stats.marginSuffix": "margin",
    "stats.markupSuffix": "markup on cost",
    "stats.seniorPwdPrefix": "Senior/PWD price (20% off, VAT-exempt):",

    "costComp.title": "Cost composition",
    "costComp.empty": "Add a cost to see the breakdown.",
    "costComp.materials": "Materials",
    "costComp.labor": "Labor",
    "costComp.packaging": "Packaging",
    "costComp.overhead": "Overhead",

    "strategy.priceUsing": "Price using",
    "strategy.marginPercent": "Margin %",
    "strategy.markupPercent": "Markup %",
    "strategy.fixedProfit": "Fixed profit",
    "strategy.marginDescription":
      "Margin = profit as a % of your selling price. A 30% margin means 30 centavos of every peso a customer pays is profit.",
    "strategy.markupDescription":
      "Markup = profit as a % of your cost. A 50% markup means you add half your cost again on top as profit — not the same number as margin, even for the same peso profit.",
    "strategy.fixedProfitDescription":
      "Adds a flat peso amount on top of your cost, no matter what that cost is — useful when you've agreed to a fixed take-home amount regardless of ingredient or material price swings.",
    "strategy.suggestedForPrefix": "Suggested for",
    "strategy.marginSuffix": "margin",
    "strategy.markupSuffix": "markup",
    "strategy.useSuggested": "Use suggested",
    "strategy.whatsThis": "What's the difference?",

    "taxCard.title": "Tax",
    "taxCard.custom": "Custom",
    "taxCard.namePlaceholder": "Tax name",
    "taxCard.infoWithTaxSuffix": "is added on top and should be remitted or set aside — it isn't your profit.",
    "taxCard.infoNoTax":
      "No tax added here. If you're a percentage or 8%-flat filer, set aside a share of your net income separately — this tool doesn't calculate that per sale.",
    "taxCard.whatsThis": "What's the difference?",
    "taxCard.explainer":
      "VAT (12%) applies if you're VAT-registered — most bigger or newer registered businesses. Percentage Tax (3%) applies if you're non-VAT registered, common for smaller businesses under the VAT threshold. Custom lets you name your own rate for anything else (e.g. a flat local fee). Not sure which? Ask your accountant or check your BIR registration (2303) — this tool doesn't decide that for you.",

    "batch.size": "Servings",
    "batch.totalCostPrefix": "Total cost, ",
    "batch.totalCostSuffix": " servings",
    "batch.totalRevenue": "Total revenue",
    "batch.totalProfit": "Total profit",
    "batch.note":
      "Every cost above is per serving — this just scales the total for a batch, it doesn't assume packaging or overhead spread out differently at volume.",
    "batch.whatsThis": "What does this do?",

    "itemEditor.advancedPricingSettings": "Advanced Pricing Settings",

    "templates.title": "Quote templates",
    "templates.emptyHint": "Save your current line items as a reusable template below.",
    "templates.load": "Load",
    "templates.namePlaceholder": "Template name",
    "templates.saveCurrent": "Save current",

    "ingredients.description":
      "Cost a raw ingredient or material once, then link it to any item on Costing & Pricing. Change the cost here and every linked item recalculates — including a real Cost History snapshot for anything that actually changed price.",
    "ingredients.addTitle": "Add an ingredient",
    "ingredients.namePlaceholder": "e.g. Eggs",
    "ingredients.categoryPlaceholder": "Category (optional) — e.g. dairy, flour, packaging",
    "ingredients.addButton": "Add ingredient",
    "ingredients.empty":
      "Nothing here yet — add your most-used ingredients or materials above, then link them from any item on Costing & Pricing.",
    "ingredients.name": "Name",
    "ingredients.costPerUnit": "Cost / unit",
    "ingredients.usedIn": "Used in",
    "ingredients.suppliersPrefix": "Suppliers (",
    "ingredients.suppliers": "Suppliers",
    "ingredients.noSuppliers": "No suppliers logged yet.",
    "ingredients.cheapest": "cheapest",
    "ingredients.usePrice": "Use this price",
    "ingredients.supplierNamePlaceholder": "Supplier name",
    "ingredients.similarPrefix": "Similar ingredients",
    "ingredients.noCategoryHint": "Give this ingredient a category above to see substitutes.",
    "ingredients.usedInItemsTitle": "Used in these products:",
    "ingredients.notUsedYet": "Not used in any product yet.",

    "catalog.description": "Every recipe you've saved, instead of one throwaway calculation at a time.",
    "catalog.newItem": "+ New recipe",
    "catalog.emptyPrefix": "Nothing saved yet. Cost something on ",
    "catalog.emptySuffix": ' and use "Save to Catalog".',
    "catalog.vertical": "Vertical",
    "catalog.stock": "Stock",
    "catalog.qr": "QR",
    "catalog.duplicate": "Duplicate",
    "catalog.qrHint": "Print this for a price tag or menu board.",
    "catalog.skuPlaceholder": "+ SKU/barcode",
    "catalog.searchPlaceholder": "Search by name or SKU…",
    "catalog.filterAll": "All recipes",
    "catalog.filterOnTarget": "On target",
    "catalog.filterBelowTarget": "Below target",
    "catalog.linkedSuffix": " ingredient(s) linked",
    "catalog.notLinkedYet": "Not linked to the Ingredient Library yet",
    "catalog.breakdownTitle": "Cost breakdown",
    "catalog.lineCost": "Line cost",
    "catalog.noCostLines": "No cost lines on this recipe.",
    "catalog.editBreakdownTitle": "Edit & Breakdown",
    "catalog.createTitle": "New recipe",
    "catalog.createButton": "Add recipe",
    "catalog.targetMarginLabel": "Target margin",
    "catalog.linkedLine": "Linked ingredient",

    "pos.description": "Scan or search for a recipe to add it to the cart, then check out.",
    "pos.searchPlaceholder": "Scan or search by name/SKU",
    "pos.noResultsPrefix": "No recipes match",
    "pos.cartTitle": "Cart",
    "pos.cartEmpty": "Cart is empty — scan or click a recipe to add it.",
    "pos.subtotal": "Subtotal",
    "pos.tax": "Tax",
    "pos.total": "Total",
    "pos.paymentMethod": "Payment method",
    "pos.paymentCash": "Cash",
    "pos.paymentGcash": "GCash",
    "pos.paymentCard": "Card",
    "pos.paymentOther": "Other",
    "pos.seniorPwdLabel": "Senior/PWD",
    "pos.completeSale": "Complete sale",
    "pos.saleComplete": "Sale complete!",
    "pos.printReceipt": "Print receipt →",
    "pos.newSale": "Start new sale",
    "pos.receipt": "Receipt",
    "pos.receiptNotFound": "That receipt doesn't exist anymore.",
    "pos.notBirReceipt": "Generated by Amore Cost — not a BIR-registered official receipt.",
    "pos.refundReceipt": "Refund receipt",
    "pos.refundOfLabel": "Refund of receipt",
    "pos.refundThisSale": "Refund this sale",
    "pos.refundConfirm": "This restocks every recipe on this receipt and records a refund. It can't be undone. Continue?",
    "pos.refunded": "Refunded",
    "pos.refundedOn": "Refunded on",
    "pos.refundTag": "Refund",

    "inventory.description":
      "Stock-on-hand tracking, low-stock alerts, and deduct-on-sale for each catalog item — tracked per finished item on this device. The Ingredient Library already shares cost across products, but stock quantity itself is still per finished item, not a pooled raw-ingredient stock.",
    "inventory.emptyPrefix": "Nothing in your ",
    "inventory.emptySuffix": " yet — save a recipe on Costing & Pricing first.",
    "inventory.lowStock": "Low stock",
    "inventory.inStock": "In stock",
    "inventory.onHandPrefix": "on hand · alert below",
    "inventory.addStock": "Add stock",
    "inventory.logSale": "Log sale",

    "documents.description":
      "Bring in a spreadsheet you already have, take your catalog out as a CSV, or print a clean quotation for a client.",
    "documents.fullBackupTitle": "Full backup",
    "documents.fullBackupDesc":
      "Everything lives only in this browser — there's no account, so clearing your browser data or switching devices loses it all unless you back it up. This saves your whole Catalog, Ingredient Library, team profiles, and templates as one file.",
    "documents.downloadBackup": "Download full backup",
    "documents.restoreBackup": "Restore from backup",
    "documents.importTitle": "Import from CSV",
    "documents.importDesc":
      "Columns: label, quantity, unit, amount — the same shape as the Raket.ph-style spreadsheets this audience may already own.",
    "documents.chooseCsv": "Choose CSV file",
    "documents.exportTitle": "Export catalog",
    "documents.exportDesc": "Every saved recipe, its cost, price, margin, and stock, as one CSV file.",
    "documents.downloadCatalogCsv": "Download catalog.csv",
    "documents.quotationsTitle": "Quotations",
    "documents.quotationsEmptyPrefix": "Save a recipe to your ",
    "documents.quotationsEmptySuffix": " to print a quotation for it.",
    "documents.printLink": "Print / Save as PDF →",

    "print.button": "Print / Save as PDF",
    "print.quotation": "Quotation",
    "print.untitled": "(untitled recipe)",
    "print.itemGone": "That recipe doesn't exist anymore.",
    "print.description": "Description",
    "print.amount": "Amount",
    "print.item": "Item",
    "print.total": "Total",
    "print.footer": "Generated by Amore Cost — an estimate, not an official receipt.",
  },
  tl: {
    "overview.noDraft": "Wala ka pang na-presyuhan — magsimula sa Pagsingil at Presyo.",
    "overview.startCta": "Magsimulang mag-costing ng recipe →",
    "overview.breakEven": "Break-even",
    "overview.breakEvenNotReachable": "Hindi maaabot sa presyong ito",
    "overview.unitsPerMonth": "unit / buwan",
    "overview.editing": "Ineedit",
    "overview.adjust": "Ayusin ang gastos, estratehiya, o buwis",
    "overview.seeAll": "Tingnan lahat ng na-save mo",
    "overview.open": "Buksan →",
    "overview.allModules": "Lahat ng Module",
    "overview.loading": "Nilo-load ang mga na-save mong numero…",
    "overview.insightsTitle": "Dapat Pansinin",
    "overview.insightsSubtitle": "Batay sa na-save mong katalogo at naitalang benta — hindi lang teoretikal na presyo.",
    "overview.insightsEmpty": "Walang kailangang pansinin ngayon — magpapakita rito ng tunay na rekomendasyon kapag may mga presyong na-save at benta na naitala.",

    "common.loading": "Nilo-load ang mga na-save mong numero…",
    "common.untitled": "(walang pangalan)",
    "common.item": "Recipe",
    "common.date": "Petsa",
    "common.price": "Presyo",
    "common.revenue": "Benta",
    "common.profit": "Tubo",
    "common.qty": "Dami",
    "common.status": "Katayuan",
    "common.remove": "Alisin",
    "common.add": "Idagdag",
    "common.saveItemFirstPrefix": "Mag-save ng recipe sa iyong ",
    "common.saveItemFirstSuffix": " muna.",

    "breakEven.pricePerUnit": "presyo bawat unit",
    "breakEven.unitsNeeded": "Unit na kailangan / buwan",
    "breakEven.toCover": "para masakop ang fixed cost sa presyong ito",
    "breakEven.opexTitle": "Operating expenses (OPEX) bawat buwan",
    "breakEven.opexSharedNote": "Ibinabahagi sa buong negosyo mo — pareho ang listahang ito kahit anong recipe ang kino-cost mo.",
    "breakEven.opexLabelPlaceholder": "hal. Renta, sahod, kuryente",
    "breakEven.opexAmountLabel": "Halaga/buwan",
    "breakEven.addOpexItem": "+ Magdagdag ng gastos",
    "breakEven.totalOpex": "Kabuuang OPEX",
    "breakEven.contingency": "Contingency",
    "breakEven.effectiveOpexPrefix": "Kasama ang contingency, kinakalkula ang break-even laban sa",
    "breakEven.effectiveOpexSuffix": "bawat buwan, hindi sa kabuuang OPEX sa itaas.",
    "breakEven.lossMessage":
      "Sa presyong ito, nawawalan ka ng pera sa bawat unit — walang break-even hangga't hindi nasasakop ng presyo ang totoong gastos.",
    "breakEven.noMarginMessage":
      "Eksaktong nasasakop ng presyong ito ang totoong gastos mo nang walang natitira — walang tubo para bayaran ang fixed cost, kaya hindi kailanman maaabot ang break-even.",

    "history.description":
      "Awtomatikong nare-record ang snapshot tuwing magbabago ang totoong gastos o presyo ng naka-save na item — para makita agad kung kumukupas na ang tubo bago ito lumala.",
    "history.noSnapshots":
      "Wala pang naitalang pagbabago ng gastos — i-edit ang sangkap o gastos ng naka-save na item sa Pagsingil at Presyo at lalabas dito ang snapshot.",
    "history.marginWord": "margin",
    "history.trueCost": "Totoong Gastos",
    "history.marginHeader": "Margin",

    "alerts.description":
      "Magtakda ng target na margin bawat item at tingnan kung alin ang tahimik na bumagsak dito — bago pa man ito lumamon sa tubo ng isang bestseller.",
    "alerts.currentMargin": "Kasalukuyang Margin",
    "alerts.targetMargin": "Target na Margin",
    "alerts.belowTarget": "Bumagsak sa Target",
    "alerts.onTarget": "Nasa Target",

    "multiUser.description": "Profile ng may-ari, staff, o bookkeeper sa iisang browser.",
    "multiUser.warning": "Local preview lang ito, hindi tunay na access control.",
    "multiUser.warningRest":
      " Kahit sino sa browser na ito ay pwedeng lumipat ng profile o magdagdag ng bago — walang password at walang server na nagsusuri kung sino talaga. Kailangan ng account at backend para sa tunay na multi-user security, na wala pa sa build na ito.",
    "multiUser.profiles": "Mga Profile",
    "multiUser.active": "aktibo",
    "multiUser.namePlaceholder": "hal. Ate Rosa",
    "multiUser.lastEditedBy": "Huling Nag-edit",
    "multiUser.unknown": "Hindi Alam",

    "multiChannel.description":
      "Maaaring magkaiba ang presyo ng parehong item sa iba't ibang channel, dahil iba-iba ang epekto ng bayad ng platform sa margin mo.",
    "multiChannel.channel": "Channel",
    "multiChannel.fee": "Bayad",
    "multiChannel.priceToCharge": "Presyong Sisingilin",
    "multiChannel.noChannels": "Wala pang channel — magdagdag sa ibaba.",
    "multiChannel.inPerson": "Personal",

    "reporting.description1": "Base sa mga benta na inilog mo sa ",
    "reporting.description2": " — tunay na tubo mula sa tunay na benta, hindi lang teoretikal na presyo.",
    "reporting.noSales1": "Wala pang naitalang benta — mag-log ng isa sa ",
    "reporting.unitsSold": "Naibentang Unit",
    "reporting.totalProfit": "Kabuuang Tubo",
    "reporting.totalRevenue": "Kabuuang Benta",
    "reporting.byItem": "Ayon sa Recipe",
    "reporting.recentSales": "Kamakailang Benta",

    "common.unit": "Unit",
    "common.cost": "Gastos",
    "common.margin": "Margin",
    "common.save": "I-save",
    "common.cancel": "Kanselahin",
    "common.edit": "I-edit",
    "common.delete": "Burahin",
    "common.close": "Isara",
    "common.auto": "AUTO",
    "common.done": "Tapos na",

    "costing.savedToDevice": " — naka-save lang sa device na ito.",
    "costing.defaultTitle": "Mag-cost ng recipe at presyuhan ito",
    "costing.saveToCatalog": "I-save sa Katalogo",
    "costing.startOver": "Simulan Ulit",
    "costing.confirmClear": "Burahin lahat at magsimula ulit?",
    "costing.notFound": "Wala nang ganoong recipe sa katalogo.",
    "costing.backToCatalog": "Bumalik sa Katalogo",
    "costing.catalogBackLink": "← Katalogo",
    "costing.savedAutoCatalog": "Awtomatikong na-save sa iyong Katalogo",
    "costing.savedAutoBrowser":
      'Awtomatikong na-save sa browser na ito — gamitin ang "I-save sa Katalogo" para maging reusable item ito',
    "costing.conceptNote": "Concept build — ang presyo ay pagtantya lang, hindi payo sa buwis.",

    "costForm.whatPricing": "Anong recipe ang kino-cost mo?",
    "costForm.itemNamePlaceholder": "hal. Leche flan, 12-pc box",
    "costForm.customOption": "Custom…",
    "costForm.ingredientLibraryName": "Aklatan ng Sangkap",
    "costForm.linkHintPrefix": "Pumili ng pangalan sa itaas ng ",
    "costForm.linkHintSuffix": " row para i-link ito sa iyong ",
    "costForm.linkHintEnd": " — i-edit ang gastos doon nang isang beses, at mag-a-update ito kahit saan ginagamit.",
    "costForm.addPrefix": "+ Magdagdag ng ",
    "costForm.ratePerHour": "Rate bawat oras",
    "costForm.packaging": "Packaging",
    "costForm.overheadAllocation": "Overhead Allocation",
    "costForm.percentOfCost": "ng kabuuang gastos",
    "costForm.supplier": "Supplier",
    "costForm.supplierPlaceholder": "hal. SM Market",
    "costForm.packagePrice": "Presyo ng Package",
    "costForm.qtyPerPack": "Dami bawat Pack",
    "costForm.shippingFee": "Bayad sa Padala",
    "costForm.packUnit": "Unit ng Pack",
    "costForm.portionQty": "Dami ng Portion",
    "costForm.portionUnit": "Unit ng Portion",
    "costForm.unitCostLabel": "Unit Cost",
    "costForm.whatsThis": "Ano ang ibig sabihin ng mga column na ito?",
    "costForm.packagePricingExplainer":
      "Punan lang ang Supplier/Package price/Qty per pack/Shipping fee kung bumibili ka nang bulk (hal. 25kg na sako) at ginagamit sa maliliit na bahagi (hal. gramo bawat recipe). Ang Pack unit ay kung ano ang sukat ng package; ang Portion qty/unit ay kung gaano karami ang aktwal mong ginagamit. Ang Unit cost at Line cost na may markang AUTO ay awtomatikong kinakalkula — hindi mo na ito kailangang i-type. Kung hindi ka bumibili nang bulk, diretso na lang sa Portion qty/unit at i-type ang gastos mo mismo.",
    "costForm.overheadCalcShow": "Tantyahin Mula sa OPEX",
    "costForm.overheadCalcHide": "Itago ang Pagtantya ng OPEX",
    "costForm.noOpexPrefix": "Wala ka pang na-set up na OPEX — magdagdag muna sa",
    "costForm.noOpexSuffix": ".",
    "costForm.opexIsPrefix": "Ang OPEX mo ay",
    "costForm.opexIsSuffix": "/buwan.",
    "costForm.expectedVolume": "Inaasahang Buwanang Dami",
    "costForm.suggestedOverheadPrefix": "=",
    "costForm.suggestedOverheadSuffix": "bawat unit sa dami na iyon.",
    "costForm.useThisOverhead": "Gamitin Ito",

    "stats.trueCost": "Gastos sa Recipe",
    "stats.trueCostBreakdown": "sangkap + paggawa + packaging + overhead",
    "stats.suggestedPrice": "Iminumungkahing Presyo",
    "stats.noTaxAdded": "walang idinagdag na buwis",
    "stats.includesTax": "kasama ang",
    "stats.profitPerUnit": "Tubo bawat Serving",
    "stats.marginSuffix": "margin",
    "stats.markupSuffix": "markup sa gastos",
    "stats.seniorPwdPrefix": "Presyo para sa Senior/PWD (20% diskwento, exempted sa VAT):",

    "costComp.title": "Bumubuo sa Gastos",
    "costComp.empty": "Magdagdag ng gastos para makita ang breakdown.",
    "costComp.materials": "Sangkap",
    "costComp.labor": "Paggawa",
    "costComp.packaging": "Packaging",
    "costComp.overhead": "Overhead",

    "strategy.priceUsing": "Presyuhan Gamit ang",
    "strategy.marginPercent": "Margin %",
    "strategy.markupPercent": "Markup %",
    "strategy.fixedProfit": "Fixed na Tubo",
    "strategy.marginDescription":
      "Margin = tubo bilang porsyento ng iyong presyo. Ang 30% margin ay nangangahulugang 30 sentimo ng bawat pisong binabayad ng customer ay tubo.",
    "strategy.markupDescription":
      "Markup = tubo bilang porsyento ng iyong gastos. Ang 50% markup ay nagdaragdag ng kalahati ng gastos mo sa ibabaw bilang tubo — hindi ito parehong numero ng margin, kahit magkapareho ang tubo sa piso.",
    "strategy.fixedProfitDescription":
      "Nagdaragdag ng eksaktong halaga sa piso sa ibabaw ng gastos mo, kahit ano pa ang gastos na iyon — kapaki-pakinabang kapag napagkasunduan na ang fixed na kikitain kahit magbago ang presyo ng sangkap o materyales.",
    "strategy.suggestedForPrefix": "Iminumungkahi para sa",
    "strategy.marginSuffix": "margin",
    "strategy.markupSuffix": "markup",
    "strategy.useSuggested": "Gamitin ang Iminumungkahi",
    "strategy.whatsThis": "Ano ang pagkakaiba?",

    "taxCard.title": "Buwis",
    "taxCard.custom": "Custom",
    "taxCard.namePlaceholder": "Pangalan ng buwis",
    "taxCard.infoWithTaxSuffix": "ay idinagdag sa ibabaw at dapat iremit o ilaan — hindi ito tubo mo.",
    "taxCard.infoNoTax":
      "Walang idinagdag na buwis dito. Kung ikaw ay percentage o 8%-flat filer, maglaan ng bahagi ng net income mo nang hiwalay — hindi ito kinukwenta ng tool na ito bawat benta.",
    "taxCard.whatsThis": "Ano ang pagkakaiba?",
    "taxCard.explainer":
      "Ang VAT (12%) ay para sa mga VAT-registered na negosyo — karaniwan sa mas malalaki o bagong rehistradong negosyo. Ang Percentage Tax (3%) ay para sa non-VAT registered, karaniwan sa mas maliliit na negosyo na wala pa sa VAT threshold. Ang Custom ay para sa sarili mong rate para sa iba pang bagay (hal. flat na lokal na bayarin). Hindi sigurado? Tanungin ang accountant mo o tingnan ang BIR registration (2303) mo — hindi ito dinedesisyunan ng tool na ito.",

    "batch.size": "Servings",
    "batch.totalCostPrefix": "Kabuuang gastos, ",
    "batch.totalCostSuffix": " serving",
    "batch.totalRevenue": "Kabuuang Benta",
    "batch.totalProfit": "Kabuuang Tubo",
    "batch.note":
      "Ang bawat gastos sa itaas ay per serving — sini-scale lang nito ang kabuuan para sa isang batch, hindi ipinapalagay na magkaiba ang pagkalat ng packaging o overhead sa dami.",
    "batch.whatsThis": "Ano ang ginagawa nito?",

    "itemEditor.advancedPricingSettings": "Mga Advanced na Setting ng Presyo",

    "templates.title": "Mga Template ng Quote",
    "templates.emptyHint": "I-save ang kasalukuyang line items mo bilang reusable template sa ibaba.",
    "templates.load": "I-load",
    "templates.namePlaceholder": "Pangalan ng Template",
    "templates.saveCurrent": "I-save ang Kasalukuyan",

    "ingredients.description":
      "Isingil ang hilaw na sangkap o materyales nang isang beses, pagkatapos i-link ito sa kahit anong item sa Pagsingil at Presyo. Palitan ang gastos dito at awtomatikong nagbabago ang lahat ng naka-link na item — kasama ang tunay na Cost History snapshot para sa anumang talagang nagbago ang presyo.",
    "ingredients.addTitle": "Magdagdag ng Sangkap",
    "ingredients.namePlaceholder": "hal. Itlog",
    "ingredients.categoryPlaceholder": "Kategorya (opsyonal) — hal. dairy, harina, packaging",
    "ingredients.addButton": "Idagdag ang Sangkap",
    "ingredients.empty":
      "Wala pang laman dito — idagdag ang pinaka-gamit mong sangkap o materyales sa itaas, pagkatapos i-link ito mula sa kahit anong item sa Pagsingil at Presyo.",
    "ingredients.name": "Pangalan",
    "ingredients.costPerUnit": "Gastos / Unit",
    "ingredients.usedIn": "Ginagamit Sa",
    "ingredients.suppliersPrefix": "Mga Supplier (",
    "ingredients.suppliers": "Mga Supplier",
    "ingredients.noSuppliers": "Wala pang naitalang supplier.",
    "ingredients.cheapest": "pinakamura",
    "ingredients.usePrice": "Gamitin ang Presyong Ito",
    "ingredients.supplierNamePlaceholder": "Pangalan ng Supplier",
    "ingredients.similarPrefix": "Katulad na Sangkap",
    "ingredients.noCategoryHint": "Bigyan ang sangkap na ito ng kategorya sa itaas para makita ang mga substitute.",
    "ingredients.usedInItemsTitle": "Ginagamit sa mga sumusunod na produkto:",
    "ingredients.notUsedYet": "Wala pang gumagamit nito.",

    "catalog.description": "Bawat recipe na na-save mo, sa halip na isang beses lang na kalkulasyon.",
    "catalog.newItem": "+ Bagong Recipe",
    "catalog.emptyPrefix": "Wala pang na-save. Mag-presyo ng bagay sa ",
    "catalog.emptySuffix": ' at gamitin ang "I-save sa Katalogo".',
    "catalog.vertical": "Uri ng Negosyo",
    "catalog.stock": "Stock",
    "catalog.qr": "QR",
    "catalog.duplicate": "I-duplicate",
    "catalog.qrHint": "I-print ito para sa price tag o menu board.",
    "catalog.skuPlaceholder": "+ SKU/barcode",
    "catalog.searchPlaceholder": "Maghanap gamit ang pangalan o SKU…",
    "catalog.filterAll": "Lahat ng recipe",
    "catalog.filterOnTarget": "Naabot ang target",
    "catalog.filterBelowTarget": "Hindi pa naabot",
    "catalog.linkedSuffix": " sangkap ang naka-link",
    "catalog.notLinkedYet": "Wala pang naka-link na sangkap",
    "catalog.breakdownTitle": "Breakdown ng Gastos",
    "catalog.lineCost": "Gastos ng Linya",
    "catalog.noCostLines": "Walang cost lines ang recipe na ito.",
    "catalog.editBreakdownTitle": "I-edit at Breakdown",
    "catalog.createTitle": "Bagong recipe",
    "catalog.createButton": "Magdagdag ng recipe",
    "catalog.targetMarginLabel": "Target na margin",
    "catalog.linkedLine": "Naka-link na sangkap",

    "pos.description": "Mag-scan o maghanap ng recipe para idagdag sa cart, pagkatapos mag-checkout.",
    "pos.searchPlaceholder": "I-scan o hanapin ayon sa pangalan/SKU",
    "pos.noResultsPrefix": "Walang recipe na tumutugma sa",
    "pos.cartTitle": "Cart",
    "pos.cartEmpty": "Walang laman ang cart — mag-scan o mag-click ng recipe para idagdag.",
    "pos.subtotal": "Subtotal",
    "pos.tax": "Buwis",
    "pos.total": "Kabuuan",
    "pos.paymentMethod": "Paraan ng Bayad",
    "pos.paymentCash": "Cash",
    "pos.paymentGcash": "GCash",
    "pos.paymentCard": "Card",
    "pos.paymentOther": "Iba pa",
    "pos.seniorPwdLabel": "Senior/PWD",
    "pos.completeSale": "Kumpletuhin ang Benta",
    "pos.saleComplete": "Kumpleto na ang benta!",
    "pos.printReceipt": "I-print ang Resibo →",
    "pos.newSale": "Magsimula ng Bagong Benta",
    "pos.receipt": "Resibo",
    "pos.receiptNotFound": "Wala nang ganoong resibo.",
    "pos.notBirReceipt": "Ginawa ng Amore Cost — hindi ito BIR-registered na opisyal na resibo.",
    "pos.refundReceipt": "Resibo ng Refund",
    "pos.refundOfLabel": "Refund ng resibo",
    "pos.refundThisSale": "I-refund ang bentang ito",
    "pos.refundConfirm": "Ibabalik nito sa stock ang bawat recipe sa resibong ito at itatala ang refund. Hindi na ito puwedeng bawiin. Magpatuloy?",
    "pos.refunded": "Na-refund na",
    "pos.refundedOn": "Na-refund noong",
    "pos.refundTag": "Refund",

    "inventory.description":
      "Pagsubaybay sa stock-on-hand, low-stock alert, at awtomatikong pagbawas sa stock kapag nabenta ang bawat item sa katalogo — sinusubaybayan per finished item sa device na ito. Nagbabahagi na ang Aklatan ng Sangkap ng gastos sa mga produkto, pero ang dami ng stock ay per finished item pa rin, hindi iisang stock ng hilaw na sangkap.",
    "inventory.emptyPrefix": "Wala pa sa iyong ",
    "inventory.emptySuffix": " — mag-save muna ng recipe sa Pagsingil at Presyo.",
    "inventory.lowStock": "Mababang Stock",
    "inventory.inStock": "May Stock",
    "inventory.onHandPrefix": "nasa stock · alerto sa ibaba ng",
    "inventory.addStock": "Magdagdag ng Stock",
    "inventory.logSale": "I-log ang Benta",

    "documents.description":
      "Mag-import ng spreadsheet na meron ka na, kunin ang katalogo mo bilang CSV, o mag-print ng malinis na quotation para sa kliyente.",
    "documents.fullBackupTitle": "Kumpletong Backup",
    "documents.fullBackupDesc":
      "Ang lahat ay nasa browser na ito lang — walang account, kaya kung i-clear mo ang data ng browser o lumipat ng device, mawawala ang lahat maliban kung mag-backup ka. Ise-save nito ang buong Katalogo, Aklatan ng Sangkap, profile ng team, at mga template bilang isang file.",
    "documents.downloadBackup": "I-download ang Kumpletong Backup",
    "documents.restoreBackup": "I-restore mula sa Backup",
    "documents.importTitle": "Mag-import mula sa CSV",
    "documents.importDesc":
      "Mga column: label, quantity, unit, amount — parehong hugis ng mga Raket.ph-style na spreadsheet na maaaring meron na ang audience na ito.",
    "documents.chooseCsv": "Pumili ng CSV File",
    "documents.exportTitle": "I-export ang Katalogo",
    "documents.exportDesc": "Bawat na-save na recipe, ang gastos, presyo, margin, at stock nito, bilang isang CSV file.",
    "documents.downloadCatalogCsv": "I-download ang catalog.csv",
    "documents.quotationsTitle": "Mga Quotation",
    "documents.quotationsEmptyPrefix": "Mag-save ng recipe sa iyong ",
    "documents.quotationsEmptySuffix": " para mag-print ng quotation para dito.",
    "documents.printLink": "I-print / I-save bilang PDF →",

    "print.button": "I-print / I-save bilang PDF",
    "print.quotation": "Quotation",
    "print.untitled": "(walang pangalan na recipe)",
    "print.itemGone": "Wala nang itong recipe.",
    "print.description": "Deskripsyon",
    "print.amount": "Halaga",
    "print.item": "Item",
    "print.total": "Kabuuan",
    "print.footer": "Ginawa ng Amore Cost — isang estimate, hindi opisyal na resibo.",
  },
} satisfies Record<Lang, Record<string, string>>;

type StringKey = keyof typeof STRINGS.en;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "tl") setLangState(stored);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  }

  function t(key: StringKey) {
    return STRINGS[lang][key] ?? STRINGS.en[key];
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
