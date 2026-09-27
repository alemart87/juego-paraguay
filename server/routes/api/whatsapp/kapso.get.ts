import { defineEventHandler, setHeader } from "h3";
import { kapsoApiKey, kapsoPhoneNumberId } from "../../../utils/kapso";
import { kapsoStatus } from "../../../utils/kapso-status";

/** Estado del puente WhatsApp → agente, sin secretos: qué variables ve el servidor y qué llegó. */
export default defineEventHandler((event) => {
  setHeader(event, "cache-control", "no-store");
  const secretSource = process.env.KAPSO_WEBHOOK_SECRET?.trim()
    ? "env"
    : kapsoApiKey()
      ? "derived-from-api-key"
      : "none";
  return {
    ok: true,
    env: {
      kapsoApiKey: Boolean(kapsoApiKey()),
      openaiApiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna",
      phoneNumberId: kapsoPhoneNumberId(),
      webhookSecret: secretSource,
      siteUrl: process.env.PUBLIC_SITE_URL || null,
    },
    webhook: kapsoStatus(),
  };
});
