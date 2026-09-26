import { getPlayerBenefits, registerLeaderboardPlayer } from "@/battle/leaderboard";
import {
  loadLeaderboardProfile,
  storeLeaderboardProfile,
  type StoredProfile,
} from "@/battle/leaderboard-profile";
import { getWhopCheckout } from "@/battle/shop";
import { readStoredRef } from "@/battle/credits-config";
import { ABOGADO_SHOP_ITEMS, type AbogadoSku } from "@/battle/shop-catalog";

/**
 * Purchases reuse the site-wide PY-STAR profile + Whop entitlements, so a
 * player who already linked their email in Influencers Battle is recognised
 * here too. Local storage only caches what the server confirmed.
 */

const OWNED_KEY = "abogado-owned-v1";
const BEST_KEY = "abogado-best-v1";
const ABOGADO_SKUS = new Set<string>(ABOGADO_SHOP_ITEMS.map((item) => item.sku));

export function isAbogadoSku(value: string | null): value is AbogadoSku {
  return Boolean(value && ABOGADO_SKUS.has(value));
}

export function loadOwned(): AbogadoSku[] {
  try {
    const raw = JSON.parse(localStorage.getItem(OWNED_KEY) || "[]") as string[];
    return raw.filter((sku): sku is AbogadoSku => ABOGADO_SKUS.has(sku));
  } catch {
    return [];
  }
}

function storeOwned(skus: AbogadoSku[]) {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify(skus));
  } catch {
    /* private mode */
  }
}

export type Best = { score: number; kos: number; combo: number };

export function loadBest(): Best {
  try {
    return { score: 0, kos: 0, combo: 0, ...JSON.parse(localStorage.getItem(BEST_KEY) || "{}") };
  } catch {
    return { score: 0, kos: 0, combo: 0 };
  }
}

export function saveBest(best: Best) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    /* private mode */
  }
}

export function profile(): StoredProfile | null {
  return loadLeaderboardProfile();
}

export async function syncOwned(): Promise<{ ok: boolean; skus: AbogadoSku[]; message?: string }> {
  const p = loadLeaderboardProfile();
  if (!p?.contact || !p.benefitToken) return { ok: false, skus: loadOwned() };
  try {
    const res = await getPlayerBenefits({
      data: { contactKind: p.kind, contact: p.contact, benefitToken: p.benefitToken },
    });
    if (!res.ok) return { ok: false, skus: loadOwned(), message: res.message };
    const skus = res.skus.filter((sku): sku is AbogadoSku => ABOGADO_SKUS.has(sku));
    storeOwned(skus);
    return { ok: true, skus };
  } catch {
    return { ok: false, skus: loadOwned(), message: "No pudimos verificar tus compras." };
  }
}

export async function createProfile(name: string, email: string) {
  const res = await registerLeaderboardPlayer({
    data: {
      name: name.trim(),
      contactKind: "email",
      contact: email.trim(),
      consent: true,
      ref: readStoredRef(),
    },
  });
  if (!res.ok) return res;
  storeLeaderboardProfile({
    name: res.name,
    kind: "email",
    contact: email.trim().toLowerCase(),
    benefitToken: res.benefitToken,
    avatarUrl: loadLeaderboardProfile()?.avatarUrl,
  });
  return res;
}

/** Starts a Whop checkout; pass a pre-opened tab to keep the current page (e.g. mid-match). */
export async function checkout(sku: AbogadoSku, tab?: Window | null) {
  const res = await getWhopCheckout({ data: { sku } });
  if (!res.ok) return res;
  const url = new URL(res.url);
  const p = loadLeaderboardProfile();
  const email = p?.kind === "email" ? p.contact : p?.purchaseEmail;
  if (email) url.searchParams.set("email", email.trim().toLowerCase());
  if (tab) tab.location.replace(url.toString());
  else window.location.assign(url.toString());
  return { ok: true as const };
}
