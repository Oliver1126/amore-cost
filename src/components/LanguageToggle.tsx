"use client";

import { useLanguage, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "tl", label: "TL" },
];

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-1 bg-surface-muted rounded-xl p-1" role="radiogroup" aria-label="Language">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={lang === o.value}
          onClick={() => setLang(o.value)}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            lang === o.value ? "bg-surface shadow-sm text-text" : "text-text-muted hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
