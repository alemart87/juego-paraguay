#!/usr/bin/env node
/**
 * Registra (una vez) el webhook de "Jesús te ama" en Kapso para el número del
 * proyecto. Idempotente: si ya existe uno con la misma URL, no crea otro.
 *
 *   node --env-file=.env scripts/kapso-register-webhook.mjs [https://www.influencerspy.pro]
 */
import { createHmac } from "node:crypto";

const apiKey = process.env.KAPSO_API_KEY?.trim();
if (!apiKey) throw new Error("KAPSO_API_KEY is missing");
const base = (process.env.KAPSO_API_BASE_URL?.trim() || "https://api.kapso.ai").replace(/\/$/, "");
const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID?.trim() || "1121668997686035";
const site = (process.argv[2] || process.env.PUBLIC_SITE_URL || "https://www.influencerspy.pro").replace(/\/$/, "");
const url = `${site}/api/whatsapp/kapso`;
const secret =
  process.env.KAPSO_WEBHOOK_SECRET?.trim() ||
  createHmac("sha256", apiKey).update("kapso-webhook-secret-v1").digest("hex");
const headers = { "content-type": "application/json", "X-API-Key": apiKey };
const path = `${base}/platform/v1/whatsapp/phone_numbers/${phoneNumberId}/webhooks`;

const listed = await fetch(path, { headers });
if (listed.ok) {
  const body = await listed.json();
  const items = Array.isArray(body?.data) ? body.data : [];
  const existing = items.find((item) => item.url === url);
  if (existing) {
    console.log(`ya existe: ${existing.id} → ${existing.url} (${existing.events?.join(", ")})`);
    process.exit(0);
  }
  console.log(`webhooks actuales: ${items.length}`);
} else console.log(`no pude listar (${listed.status}); intento crear igual`);

const created = await fetch(path, {
  method: "POST",
  headers,
  body: JSON.stringify({
    whatsapp_webhook: {
      url,
      secret_key: secret,
      kind: "kapso",
      events: ["whatsapp.message.received"],
      active: true,
      buffer_enabled: false,
      payload_version: "v2",
    },
  }),
});
const text = await created.text();
if (!created.ok) throw new Error(`Kapso ${created.status}: ${text.slice(0, 400)}`);
const data = JSON.parse(text)?.data ?? {};
console.log(`creado: ${data.id} → ${data.url} (${(data.events ?? []).join(", ")})`);
