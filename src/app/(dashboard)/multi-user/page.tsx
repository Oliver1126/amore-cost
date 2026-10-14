"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  TEAM_STORAGE_KEY,
  ACTIVE_PROFILE_STORAGE_KEY,
  newProfile,
  defaultTeam,
  type TeamProfile,
} from "@/lib/team";
import { CATALOG_STORAGE_KEY, type CatalogItem } from "@/lib/catalog";
import { useLanguage, getModuleText } from "@/lib/i18n";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MODULES } from "@/lib/modules";

export default function MultiUserPage() {
  const { lang, t } = useLanguage();
  const [team, setTeam, teamHydrated] = useLocalStorage<TeamProfile[]>(
    TEAM_STORAGE_KEY,
    defaultTeam
  );
  const [activeId, setActiveId, activeHydrated] = useLocalStorage<string>(
    ACTIVE_PROFILE_STORAGE_KEY,
    () => ""
  );
  const [catalog, , catalogHydrated] = useLocalStorage<CatalogItem[]>(
    CATALOG_STORAGE_KEY,
    () => []
  );
  const [name, setName] = useState("");

  const hydrated = teamHydrated && activeHydrated && catalogHydrated;
  if (!hydrated) {
    return <PageSkeleton />;
  }
  const title = getModuleText(lang, MODULES.find((m) => m.slug === "multi-user")!).name;

  const active = activeId || team[0]?.id;

  function addProfile() {
    if (!name.trim()) return;
    const profile = newProfile(name.trim());
    setTeam([...team, profile]);
    setName("");
  }

  function removeProfile(id: string) {
    if (team.length <= 1) return;
    const profile = team.find((p) => p.id === id);
    const profileName = profile?.name || (lang === "tl" ? "itong profile" : "this profile");
    const msg =
      lang === "tl"
        ? `Alisin ang profile na "${profileName}"? Mananatili ang mga item na na-edit nila, pero mapapalitan ang aktibong profile kung ito ang kasalukuyang aktibo.`
        : `Remove "${profileName}"? Items they've edited stay as-is, but the active profile will switch if this one is currently active.`;
    if (!window.confirm(msg)) return;
    setTeam(team.filter((p) => p.id !== id));
    if (active === id) setActiveId(team.find((p) => p.id !== id)?.id ?? "");
  }

  return (
    <div>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-1 text-text-muted max-w-[64ch]">{t("multiUser.description")}</p>

      <div className="mt-4 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-muted max-w-2xl">
        <strong className="text-text">{t("multiUser.warning")}</strong>
        {t("multiUser.warningRest")}
      </div>

      <div className="mt-6 card p-5 max-w-2xl">
        <p className="text-sm text-text-muted mb-3">{t("multiUser.profiles")}</p>
        <ul className="space-y-2">
          {team.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="active-profile"
                  checked={active === p.id}
                  onChange={() => setActiveId(p.id)}
                  className="accent-accent"
                />
                {p.name}
                {active === p.id && (
                  <span className="text-xs font-medium text-accent-strong bg-accent-soft px-2 py-0.5 rounded-full">
                    {t("multiUser.active")}
                  </span>
                )}
              </label>
              {team.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProfile(p.id)}
                  className="text-xs text-text-muted hover:text-bad transition-colors"
                >
                  {t("common.remove")}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("multiUser.namePlaceholder")}
            className="flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-text-muted/70 focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={addProfile}
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors flex-none"
          >
            {t("common.add")}
          </button>
        </div>
      </div>

      {catalog.some((c) => c.updatedByProfileId) && (
        <div className="mt-6 card p-5 max-w-2xl">
          <p className="text-sm text-text-muted mb-3">{t("multiUser.lastEditedBy")}</p>
          <ul className="space-y-1.5 text-sm">
            {catalog
              .filter((c) => c.updatedByProfileId)
              .map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span>{c.state.itemName || t("common.untitled")}</span>
                  <span className="text-text-muted">
                    {team.find((p) => p.id === c.updatedByProfileId)?.name ?? t("multiUser.unknown")}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
