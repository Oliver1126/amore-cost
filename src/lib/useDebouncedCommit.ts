"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Calls `commit` once, `delayMs` after `dep` last changed — re-arming
 * on every change instead of firing per change. Also flushes once on
 * unmount, so a final edit isn't lost if the page changes (e.g. the
 * user navigates away) before the delay elapses. `commit` is read via
 * a ref so the scheduled call always runs the latest closure, not the
 * one captured when the timer was set.
 *
 * Built for Cost History: appending a snapshot on every keystroke
 * (one per digit typed) instead of once per settled edit — this lets
 * a caller update the *displayed* state instantly on every change
 * while debouncing only the "record this as a real edit" step.
 */
export function useDebouncedCommit(dep: unknown, delayMs: number, commit: () => void) {
  const commitRef = useRef(commit);
  // Updated after render (not during it), before any timer can fire.
  useLayoutEffect(() => {
    commitRef.current = commit;
  });

  useEffect(() => {
    if (dep === null || dep === undefined) return;
    const timer = setTimeout(() => commitRef.current(), delayMs);
    return () => clearTimeout(timer);
  }, [dep, delayMs]);

  useEffect(() => {
    return () => commitRef.current();
  }, []);
}
