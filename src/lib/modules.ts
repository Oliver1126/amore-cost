import {
  LayoutDashboard,
  Calculator,
  Scale,
  LayoutGrid,
  Package,
  History,
  FileText,
  Users,
  Share2,
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export interface ModuleInfo {
  slug: string;
  href: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** A caveat worth surfacing in the UI — e.g. simplified vs. the original spec. */
  note?: string;
}

/**
 * Mirrors docs/product/modules.md — keep the two in sync when a module
 * ships or its description changes. All modules are real and
 * interactive as of decision 0006 — everything runs on localStorage,
 * no accounts or backend exist, so a few (flagged via `note`) are
 * simplified versions of the original spec. The Ingredient Library
 * (decision 0007) closed the cost-sharing half of that gap for
 * Inventory/Margin Alerts, but not the stock-quantity half — see each
 * module's `note`. Ingredient Library and Catalog merged into one
 * Catalog Management module (decision 0022) — the "ingredients" slug
 * no longer exists; the "catalog" slug now covers both.
 */
export const MODULES: ModuleInfo[] = [
  {
    slug: "overview",
    href: "/dashboard",
    name: "Overview",
    description:
      "A summary of what you're currently pricing, plus a hub linking out to every module.",
    icon: LayoutDashboard,
  },
  {
    slug: "calculator",
    href: "/costing",
    name: "Costing & Pricing",
    description:
      "Cost a recipe and get a price back using markup, margin, or a fixed profit target.",
    icon: Calculator,
  },
  {
    slug: "break-even",
    href: "/break-even",
    name: "Break-Even",
    description:
      "See how many units you need to sell in a month to cover your real fixed costs at the price you set.",
    icon: Scale,
  },
  {
    slug: "catalog",
    href: "/catalog",
    name: "Catalog Management",
    description:
      "A saved list of costed recipes — job status, printable QR price tags, a margin filter — plus the shared Ingredient Library: cost a raw ingredient once, reuse it everywhere, and see exactly which recipes link to it.",
    icon: LayoutGrid,
  },
  {
    slug: "inventory",
    href: "/inventory",
    name: "Inventory",
    description:
      "Stock-on-hand tracking, low-stock alerts, and deduct-on-sale for each catalog item.",
    icon: Package,
    note: "Shares cost via the Ingredient Library, but stock quantity is still tracked per finished item, not a pooled raw-ingredient stock.",
  },
  {
    slug: "pos",
    href: "/pos",
    name: "Point of Sale",
    description:
      "Ring up a sale by scanning or searching a Catalog item, add it to a cart, and check out with a payment method — deducts stock and logs the sale automatically.",
    icon: ShoppingCart,
    note: "Prints a receipt via your browser's print dialog, same as Documents — no cash-drawer or thermal-printer-specific integration, and no multi-register sync (needs real accounts and a backend).",
  },
  {
    slug: "history",
    href: "/history",
    name: "Cost History",
    description:
      "Track cost changes over time so margin erosion is visible before it quietly eats a bestseller's profit.",
    icon: History,
  },
  {
    slug: "documents",
    href: "/documents",
    name: "Documents",
    description:
      "A full data backup/restore, CSV import from spreadsheets you already have, CSV export, and printable client quotations.",
    icon: FileText,
  },
  {
    slug: "multi-user",
    href: "/multi-user",
    name: "Multi-User",
    description: "Owner plus staff or bookkeeper profiles on one account.",
    icon: Users,
    note: "A local preview only — anyone using this browser can switch profiles freely. Real access control needs accounts and a backend.",
  },
  {
    slug: "multi-channel",
    href: "/multi-channel",
    name: "Multi-Channel Pricing",
    description:
      "Different prices for the same product across Shopee, Lazada, and in-person, since platform fees differ.",
    icon: Share2,
  },
  {
    slug: "alerts",
    href: "/alerts",
    name: "Margin Alerts",
    description:
      "Set a target margin per item and see which ones have fallen below it.",
    icon: AlertTriangle,
    note: "Reflects Ingredient Library cascades automatically, but there's no push notification — you have to open this page to see it.",
  },
  {
    slug: "reporting",
    href: "/reporting",
    name: "Sales & Profit Reporting",
    description:
      "Sales you log turn the cost data already in the system into real, not theoretical, profit reporting.",
    icon: BarChart3,
  },
];
