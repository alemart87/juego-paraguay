// Crea (una vez) el producto "Guías de oración" y un plan por guía en Whop, y
// deja los ids en persistent/whop-guias.json. Idempotente: si ya existen, los reusa.
// Uso: node --env-file=.env scripts/jesus-guias/whop-setup.mjs
import { WhopClient } from "@whop/sdk";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const catalog = JSON.parse(await readFile(join(root, "src/jesus/guias/catalog.json"), "utf8"));
const apiKey = process.env.WHOP_API_KEY?.trim();
if (!apiKey) throw new Error("WHOP_API_KEY is missing");
const siteUrl = (process.env.PUBLIC_SITE_URL || "https://www.influencerspy.pro").replace(/\/$/, "");
const cacheFile = join(process.env.PERSISTENT_DIR?.trim() || join(root, "persistent"), "whop-guias.json");
const cache = await readFile(cacheFile, "utf8").then(JSON.parse).catch(() => ({}));

let productId = cache.product;
if (!productId) {
  const client = new WhopClient({ token: apiKey, idempotencyKey: () => "jesus-te-ama-guias-product-v2" });
  const product = await client.products.create({
    title: "Guías de oración de 30 días · Jesús te ama",
    headline: "Un mes de oración, un día a la vez, en PDF",
    description:
      "Guías de oración en PDF de Jesús te ama (PY-STAR GAMES). Cada guía trae 30 días completos para orar por un tema concreto: tu economía, el amor, tus hijos o tu trabajo. Es un camino de oración y disciplina; no promete resultados materiales.",
    custom_cta: "purchase",
    redirect_purchase_url: `${siteUrl}/jesus-te-ama/guias?gracias=1`,
    visibility: "hidden",
    metadata: { game: "jesus", game_sku: "jesus-guia" },
  });
  productId = product.id;
  cache.product = productId;
  console.log("producto creado", productId);
} else console.log("producto existente", productId);

cache.plans ??= {};
for (const guide of catalog.guides) {
  if (cache.plans[guide.id]) {
    console.log(`plan existente ${guide.id}`, cache.plans[guide.id]);
    continue;
  }
  const client = new WhopClient({ token: apiKey, idempotencyKey: () => `jesus-te-ama-guia-plan-${guide.id}-v2` });
  const plan = await client.plans.create({
    product_id: productId,
    title: `30 días · ${guide.plan_title}`,
    description: guide.subtitle,
    plan_type: "one_time",
    initial_price: catalog.price_usd,
    currency: "usd",
    release_method: "buy_now",
    unlimited_stock: true,
    visibility: "quick_link",
    metadata: { game: "jesus", game_sku: guide.sku, guide: guide.id },
  });
  cache.plans[guide.id] = plan.id;
  console.log(`plan creado ${guide.id}`, plan.id, plan.purchase_url);
}
await mkdir(dirname(cacheFile), { recursive: true });
await writeFile(cacheFile, JSON.stringify(cache, null, 2) + "\n", "utf8");
console.log("\nPegá esto en src/jesus/guias/whop-ids.json:");
console.log(JSON.stringify({ product: productId, plans: cache.plans }, null, 2));
