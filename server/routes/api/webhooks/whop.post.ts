import { unwrapWebhook, WebhookVerificationError } from "@whop/sdk/helpers";
import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import {
  recordWhopWebhook,
  type WhopWebhookEvent,
} from "../../../../src/battle/whop-webhook.server";

function header(event: Parameters<typeof getHeader>[0], name: string) {
  return getHeader(event, name) ?? "";
}

export default defineEventHandler(async (event) => {
  const secret = process.env.WHOP_WEBHOOK_SECRET?.trim();
  if (!secret) {
    setResponseStatus(event, 503);
    return { ok: false, error: "Webhook no configurado" };
  }

  const payload = await readRawBody(event, "utf8");
  if (!payload) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Cuerpo vacío" };
  }

  const headers = {
    "webhook-id": header(event, "webhook-id"),
    "webhook-timestamp": header(event, "webhook-timestamp"),
    "webhook-signature": header(event, "webhook-signature"),
  };

  let verified: WhopWebhookEvent;
  try {
    verified = unwrapWebhook<WhopWebhookEvent>(payload, { headers, key: secret });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      setResponseStatus(event, 401);
      return { ok: false, error: "Firma inválida" };
    }
    throw error;
  }

  if (!verified.id || !verified.type || !verified.data) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Evento inválido" };
  }

  const result = await recordWhopWebhook(verified, headers["webhook-id"] || verified.id);
  return { ok: true, duplicate: result.duplicate };
});

