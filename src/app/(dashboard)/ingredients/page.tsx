import { redirect } from "next/navigation";

/** Ingredient Library merged into Catalog Management (decision 0022), then moved from a page section into its own modal (decision 0027) — old bookmarks land on the Catalog Management page, opened via its own "Ingredient Library" button rather than a now-nonexistent anchor. */
export default function IngredientsRedirectPage() {
  redirect("/catalog");
}
