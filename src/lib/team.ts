export interface TeamProfile {
  id: string;
  name: string;
}

export const TEAM_STORAGE_KEY = "calcost:v0:team";
export const ACTIVE_PROFILE_STORAGE_KEY = "calcost:v0:activeProfile";

export function newProfile(name: string): TeamProfile {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `profile-${Date.now()}`,
    name,
  };
}

export function defaultTeam(): TeamProfile[] {
  return [newProfile("Owner")];
}
