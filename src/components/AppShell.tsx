"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { BrandMark } from "./BrandMark";
import { LanguageProvider } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LanguageProvider>
      <div className="flex h-full bg-bg print:block print:bg-white">
        <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 flex flex-col overflow-y-auto print:overflow-visible">
          <div className="flex items-center gap-3 px-4 sm:px-8 pt-4 sm:pt-6 print:hidden">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="w-11 h-11 flex-none flex items-center justify-center rounded-lg hover:bg-surface-muted transition-colors"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <BrandMark size={24} />
            </div>
            <div className="flex gap-2 ml-auto">
              <div className="w-20">
                <LanguageToggle />
              </div>
              <div className="w-44">
                <ThemeToggle />
              </div>
            </div>
          </div>
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pb-8 pt-2 print:p-0 print:max-w-none">
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
