import type { EpisodeId } from "./content";
import type { ShopSku } from "./shop-catalog";

export const SCORE_REWARDS = [
  { score: 600, sku: "terere", label: "Tereré medicinal" },
  { score: 1_800, sku: "energia", label: "Energía desatada" },
  { score: 3_500, sku: "arsenal", label: "Arsenal guaraní" },
] as const satisfies ReadonlyArray<{ score: number; sku: ShopSku; label: string }>;

export type RewardWallet = {
  version: 1;
  stock: Partial<Record<ShopSku, number>>;
  claimed: string[];
};

const STORAGE_KEY = "influencers-battle-rewards-v1";

export const emptyRewardWallet = (): RewardWallet => ({ version: 1, stock: {}, claimed: [] });

export function loadRewardWallet(): RewardWallet {
  const empty = emptyRewardWallet();
  if (typeof window === "undefined") return empty;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as RewardWallet | null;
    if (!stored || stored.version !== 1 || !stored.stock || !Array.isArray(stored.claimed))
      return empty;
    return {
      version: 1,
      stock: Object.fromEntries(
        Object.entries(stored.stock).filter(
          ([, quantity]) => Number.isInteger(quantity) && Number(quantity) >= 0,
        ),
      ) as RewardWallet["stock"],
      claimed: stored.claimed.filter((claim) => typeof claim === "string"),
    };
  } catch {
    return empty;
  }
}

export function writeRewardWallet(wallet: RewardWallet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    return true;
  } catch {
    return false;
  }
}

export function claimScoreRewards(wallet: RewardWallet, level: EpisodeId, score: number) {
  const awarded = SCORE_REWARDS.filter(
    (reward) => score >= reward.score && !wallet.claimed.includes(`${level}:${reward.score}`),
  );
  if (!awarded.length) return { wallet, awarded };
  const stock = { ...wallet.stock };
  for (const reward of awarded) stock[reward.sku] = (stock[reward.sku] ?? 0) + 1;
  return {
    wallet: {
      ...wallet,
      stock,
      claimed: [...wallet.claimed, ...awarded.map((reward) => `${level}:${reward.score}`)],
    },
    awarded,
  };
}

export function consumeReward(wallet: RewardWallet, sku: ShopSku): RewardWallet | null {
  const quantity = wallet.stock[sku] ?? 0;
  if (quantity < 1) return null;
  return { ...wallet, stock: { ...wallet.stock, [sku]: quantity - 1 } };
}

export function rewardStock(wallet: RewardWallet) {
  return Object.values(wallet.stock).reduce((total, quantity) => total + (quantity ?? 0), 0);
}
