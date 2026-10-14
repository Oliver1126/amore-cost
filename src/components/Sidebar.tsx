"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { BrandMark } from "./BrandMark";
import { useLanguage, getModuleText } from "@/lib/i18n";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden print:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-none bg-surface border-r border-border h-full overflow-y-auto transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto print:hidden`}
      >
        <div className="px-6 py-6 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center flex-none">
              <BrandMark size={32} />
            </div>
            <span className="font-display text-lg">Amore Cost</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex-none flex items-center justify-center rounded-lg hover:bg-surface-muted transition-colors lg:hidden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 pb-6">
          <ul className="space-y-1">
            {MODULES.map((m) => {
              const active = pathname === m.href;
              const Icon = m.icon;
              const { name } = getModuleText(lang, m);
              return (
                <li key={m.slug}>
                  <Link
                    href={m.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-accent-soft text-accent-strong font-medium"
                        : "text-text hover:bg-surface-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-none" strokeWidth={2} aria-hidden="true" />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
