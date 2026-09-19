export type StoredProfile = {
  name: string;
  kind: "email" | "phone";
  contact: string;
  purchaseEmail?: string;
  benefitToken?: string;
  avatarUrl?: string;
};

const PROFILE_KEY = "influencers-battle-profile-v1";

export function loadLeaderboardProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") as StoredProfile | null;
  } catch {
    return null;
  }
}

export function storeLeaderboardProfile(profile: StoredProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
