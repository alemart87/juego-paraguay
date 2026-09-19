import { WhopClient } from "@whop/sdk";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ShopItem } from "./shop-catalog";

type CheckoutRecord = {
  id: string;
  url: string;
  price: number;
  createdAt: string;
};
type CheckoutCache = Partial<Record<ShopItem["sku"], CheckoutRecord>>;

const pending = new Map<ShopItem["sku"], Promise<CheckoutRecord>>();

function cachePath() {
  const root = process.env.PERSISTENT_DIR?.trim() || join(process.cwd(), "persistent");
  return join(root, "whop-checkouts.json");
}

async function readCache(): Promise<CheckoutCache> {
  try {
    return JSON.parse(await readFile(cachePath(), "utf8")) as CheckoutCache;
  } catch {
    return {};
  }
}

async function saveCache(cache: CheckoutCache) {
  const target = cachePath();
  const temp = `${target}.${process.pid}.tmp`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(temp, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  await rename(temp, target);
}

function validCheckoutUrl(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    (url.hostname !== "whop.com" && !url.hostname.endsWith(".whop.com"))
  ) {
    throw new Error("Whop returned an invalid purchase URL");
  }
  return url.toString();
}

async function createCheckout(item: ShopItem): Promise<CheckoutRecord> {
  const apiKey = process.env.WHOP_API_KEY?.trim();
  if (!apiKey) throw new Error("WHOP_API_KEY is missing");

  const existing = await readCache();
  const cached = existing[item.sku];
  if (cached?.price === item.price) return cached;

  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://www.influencerspy.pro").replace(
    /\/$/,
    "",
  );
  const productClient = new WhopClient({
    token: apiKey,
    idempotencyKey: () => `influencers-battle-${item.sku}-product-v1`,
  });
  const product = await productClient.products.create({
    title: `${item.name} · Influencers Battle`,
    headline: "Ventaja especial para tu próxima batalla",
    description: item.description,
    custom_cta: "purchase",
    redirect_purchase_url: `${siteUrl}/?compra=${item.sku}`,
    visibility: "hidden",
    metadata: {
      game: "influencers-battle",
      game_sku: item.sku,
    },
  });
  const planClient = new WhopClient({
    token: apiKey,
    idempotencyKey: () =>
      `influencers-battle-${item.sku}-plan-${item.price.toFixed(2)}-v1`,
  });
  const plan = await planClient.plans.create({
    product_id: product.id,
    title: item.name,
    description: item.description,
    plan_type: "one_time",
    initial_price: item.price,
    currency: "usd",
    release_method: "buy_now",
    unlimited_stock: true,
    visibility: "quick_link",
    metadata: {
      game: "influencers-battle",
      game_sku: item.sku,
      source: "marketplace-web",
    },
  });
  if (!plan.purchase_url) throw new Error("Whop did not return purchase_url");

  const record: CheckoutRecord = {
    id: plan.id,
    url: validCheckoutUrl(plan.purchase_url),
    price: item.price,
    createdAt: plan.created_at,
  };
  await saveCache({ ...existing, [item.sku]: record });
  return record;
}

export function getOrCreateWhopCheckout(item: ShopItem) {
  const active = pending.get(item.sku);
  if (active) return active;
  const operation = createCheckout(item).finally(() => pending.delete(item.sku));
  pending.set(item.sku, operation);
  return operation;
}
