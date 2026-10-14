"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A click-to-expand section, collapsed by default — for grouping
 * settings someone only occasionally needs (pricing strategy, tax,
 * quote templates) behind one clean header instead of always taking
 * up screen space. The trigger is its own small card; expanded
 * content renders below it using whatever card styling its children
 * already have, so nothing gets double-bordered inside a bigger box.
 */
export function CollapsiblePanel({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="card w-full flex items-center justify-between gap-2 px-5 py-4 text-left hover:border-accent transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted flex-none transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
