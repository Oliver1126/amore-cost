"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        setValue(JSON.parse(raw) as T);
      } catch {
        // ignore corrupt storage, keep default
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  // The native `storage` event only fires in *other* tabs/windows when this
  // key changes — never in the tab that made the write — so this is exactly
  // "resync when someone else touched this data," not an echo of our own
  // writes. Without it, a real transaction (e.g. a refund) processed on a
  // receipt page opened in a new tab could be silently overwritten the next
  // time the original tab writes its own (stale, pre-refund) in-memory copy.
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        // ignore corrupt storage written by another tab
      }
    }
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key]);

  return [value, setValue, hydrated] as const;
}
