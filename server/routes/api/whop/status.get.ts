import { defineEventHandler } from "h3";

/** Safe production diagnostic: confirms presence without exposing either secret. */
export default defineEventHandler(() => ({
  ok: true,
  apiKeyConfigured: Boolean(process.env.WHOP_API_KEY?.trim()),
  webhookSecretConfigured: Boolean(process.env.WHOP_WEBHOOK_SECRET?.trim()),
}));
