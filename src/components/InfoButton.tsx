"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

/**
 * A small "?" trigger that reveals a short explanation on click instead
 * of it sitting permanently on the page — added after feedback that
 * Costing & Pricing showed too much always-visible terminology
 * (Margin vs. Markup, VAT vs. Percentage Tax, package-price math) for
 * a first-time owner. Reusable anywhere a term needs an on-demand
 * explanation instead of a paragraph nobody asked to read yet.
 */
export function InfoButton({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center justify-center -m-[15px] p-[15px] rounded-full text-text-muted hover:text-accent transition-colors flex-none"
      >
        <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute z-20 top-full left-0 mt-1.5 w-64 max-w-[80vw] rounded-lg border border-border bg-surface shadow-lg p-3 text-xs text-text-muted leading-relaxed"
        >
          {children}
        </div>
      )}
    </span>
  );
}
