"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
const STORAGE_KEY = "calcost:theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <div className="flex gap-1 bg-surface-muted rounded-xl p-1" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={theme === o.value}
          onClick={() => choose(o.value)}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            theme === o.value ? "bg-surface shadow-sm text-text" : "text-text-muted hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
