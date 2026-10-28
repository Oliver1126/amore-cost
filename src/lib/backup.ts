import { STORAGE_KEY } from "./calculator";
import { CATALOG_STORAGE_KEY, POS_CART_STORAGE_KEY } from "./catalog";
import { INGREDIENTS_STORAGE_KEY } from "./ingredients";
import { TEAM_STORAGE_KEY, ACTIVE_PROFILE_STORAGE_KEY } from "./team";
import { TEMPLATES_STORAGE_KEY } from "./templates";
import { OPEX_STORAGE_KEY } from "./opex";
import { RECEIPT_PROFILE_STORAGE_KEY } from "./receipt";

/** Every localStorage key that holds real Amore Cost data — deliberately excludes the theme preference, which is a device setting, not data. */
export const BACKUP_KEYS = [
  STORAGE_KEY,
  CATALOG_STORAGE_KEY,
  INGREDIENTS_STORAGE_KEY,
  TEAM_STORAGE_KEY,
  ACTIVE_PROFILE_STORAGE_KEY,
  TEMPLATES_STORAGE_KEY,
  POS_CART_STORAGE_KEY,
  OPEX_STORAGE_KEY,
  RECEIPT_PROFILE_STORAGE_KEY,
] as const;

export interface BackupFile {
  /** The backup-file-format identifier — deliberately left as "calcost" (the app's original name) rather than kept in sync with the brand: it's an internal format tag old backups must still validate against, not display text. */
  app: "calcost";
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function buildBackup(): BackupFile {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      // skip a corrupt entry rather than fail the whole backup
    }
  }
  return { app: "calcost", version: 1, exportedAt: new Date().toISOString(), data };
}

export function downloadBackup(backup: BackupFile) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amore-cost-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as Record<string, unknown>).app !== "calcost" ||
    typeof (parsed as Record<string, unknown>).data !== "object" ||
    typeof (parsed as Record<string, unknown>).exportedAt !== "string"
  ) {
    throw new Error("That doesn't look like an Amore Cost backup file.");
  }
  return parsed as BackupFile;
}

/** Overwrites every backed-up key. Callers should confirm with the user first — this is a full replace, not a merge. */
export function restoreBackup(backup: BackupFile) {
  for (const key of BACKUP_KEYS) {
    if (key in backup.data) {
      window.localStorage.setItem(key, JSON.stringify(backup.data[key]));
    }
  }
}
