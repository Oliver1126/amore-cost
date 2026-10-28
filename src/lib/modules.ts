import { LayoutDashboard, ClipboardList, Building2, Receipt, TrendingUp, type LucideIcon } from "lucide-react";

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
 * The whole app, five pages (decision 0040) — modeled on the food-cost-tau
 * reference's Dashboard / Recipes / OpEx / Receipt Simulator / Margin
 * Simulator. Mirrors docs/product/modules.md; keep the two in sync. The
 * previous 11-module version is tagged `v1-full-11-modules` in git.
 */
export const MODULES: ModuleInfo[] = [
  {
    slug: "overview",
    href: "/dashboard",
    name: "Dashboard",
    description: "Your recipes, monthly OPEX, and average food cost at a glance.",
    icon: LayoutDashboard,
  },
  {
    slug: "input",
    href: "/input",
    name: "Input",
    description: "Every recipe with its full ingredient breakdown — add one, then edit the breakdown anytime.",
    icon: ClipboardList,
  },
  {
    slug: "opex",
    href: "/opex",
    name: "OPEX & Overhead",
    description: "Monthly fixed costs — rent, utilities, labor — and how much each dish has to carry.",
    icon: Building2,
  },
  {
    slug: "receipt",
    href: "/receipt",
    name: "Receipt Simulator",
    description: "Ring up a practice order and see the official-receipt math — VAT, Senior/PWD, service charge.",
    icon: Receipt,
  },
  {
    slug: "simulator",
    href: "/simulator",
    name: "Margin & POS Simulator",
    description: "Try a menu price and monthly sales volume, see the profit waterfall and break-even.",
    icon: TrendingUp,
  },
];
