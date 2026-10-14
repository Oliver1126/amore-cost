import { useLanguage } from "@/lib/i18n";

/**
 * The loading state shown while a page's `useLocalStorage` hook is
 * still hydrating — replaces a bare "Loading…" text string (DESIGN.md
 * §6/§11 named this as a real, standing gap). `localStorage` reads are
 * near-instant, so this is rarely on screen for long; it exists mainly
 * so slower devices/first paints don't show an empty flash of plain
 * text, and so this app's own anti-pattern list is actually true.
 */
export function PageSkeleton() {
  const { t } = useLanguage();

  return (
    <div role="status" aria-label={t("common.loading")}>
      <div className="animate-pulse" aria-hidden="true">
        <div className="h-7 w-48 rounded-lg bg-surface-muted" />
        <div className="mt-3 h-4 w-72 max-w-full rounded-lg bg-surface-muted" />
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="h-24 rounded-2xl bg-surface-muted" />
          <div className="h-24 rounded-2xl bg-surface-muted" />
          <div className="h-24 rounded-2xl bg-surface-muted" />
        </div>
        <div className="mt-6 h-40 rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}
