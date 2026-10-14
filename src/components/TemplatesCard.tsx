"use client";

import { useState } from "react";
import type { CalculatorState } from "@/lib/calculator";
import {
  instantiateTemplate,
  newTemplate,
  removeTemplate,
  type QuoteTemplate,
} from "@/lib/templates";
import { useLanguage } from "@/lib/i18n";

export function TemplatesCard({
  state,
  onChange,
  templates,
  onTemplatesChange,
}: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  templates: QuoteTemplate[];
  onTemplatesChange: (next: QuoteTemplate[]) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");

  function saveAsTemplate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onTemplatesChange([...templates, newTemplate(trimmed, state.vertical, state.costItems)]);
    setName("");
  }

  function loadTemplate(template: QuoteTemplate) {
    onChange({ ...state, costItems: instantiateTemplate(template) });
  }

  return (
    <div className="card p-5">
      <p className="text-sm text-text-muted">{t("templates.title")}</p>

      {templates.length === 0 ? (
        <p className="text-sm text-text-muted mt-2">{t("templates.emptyHint")}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {templates.map((tpl) => (
            <li key={tpl.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{tpl.name}</span>
              <span className="flex items-center gap-2 flex-none">
                <button
                  type="button"
                  onClick={() => loadTemplate(tpl)}
                  className="text-xs font-medium text-accent hover:text-accent-strong"
                >
                  {t("templates.load")}
                </button>
                <button
                  type="button"
                  onClick={() => onTemplatesChange(removeTemplate(templates, tpl.id))}
                  className="text-text-muted hover:text-bad transition-colors"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("templates.namePlaceholder")}
          className="flex-1 min-w-0 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={saveAsTemplate}
          disabled={state.costItems.every((i) => !i.label.trim())}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent transition-colors disabled:opacity-40 disabled:hover:border-border"
        >
          {t("templates.saveCurrent")}
        </button>
      </div>
    </div>
  );
}
