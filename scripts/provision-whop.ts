import { SHOP_ITEMS } from "../src/battle/shop-catalog";
import { getOrCreateWhopCheckout } from "../src/battle/whop.server";

if (!process.env.WHOP_API_KEY?.trim()) {
  throw new Error("WHOP_API_KEY no está configurada en .env");
}

console.log(`[whop] preparando ${SHOP_ITEMS.length} checkouts de pago único…`);
for (const item of SHOP_ITEMS) {
  const checkout = await getOrCreateWhopCheckout(item);
  console.log(`[whop] ${item.sku.padEnd(10)} $${item.price.toFixed(2)}  ${checkout.url}`);
}
console.log("[whop] listo; el caché quedó en persistent/whop-checkouts.json");

