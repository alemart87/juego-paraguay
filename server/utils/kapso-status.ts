/**
 * Estado en memoria del webhook de WhatsApp, para diagnosticar producción sin
 * exponer secretos ni datos de personas (no guarda teléfonos ni textos).
 */
export type WebhookStatus = {
  startedAt: string;
  received: number;
  accepted: number;
  rejectedSignature: number;
  replied: number;
  sendFailures: number;
  lastEvent: string | null;
  lastAt: string | null;
  lastResult: string | null;
  lastError: string | null;
  lastPayloadKeys: string[] | null;
  /** Qué generó el agente en la última ráfaga (sin textos de la persona). */
  lastGenerated: string | null;
};

const globalRef = globalThis as typeof globalThis & { __kapsoStatus?: WebhookStatus };

export function kapsoStatus(): WebhookStatus {
  globalRef.__kapsoStatus ??= {
    startedAt: new Date().toISOString(),
    received: 0,
    accepted: 0,
    rejectedSignature: 0,
    replied: 0,
    sendFailures: 0,
    lastEvent: null,
    lastAt: null,
    lastResult: null,
    lastError: null,
    lastPayloadKeys: null,
    lastGenerated: null,
  };
  return globalRef.__kapsoStatus;
}

export function note(partial: Partial<WebhookStatus>) {
  Object.assign(kapsoStatus(), partial, { lastAt: new Date().toISOString() });
}

/** Solo las claves de primer nivel (y de `data`), nunca valores. */
export function payloadShape(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [typeof payload];
  const root = payload as Record<string, unknown>;
  const keys = Object.keys(root);
  const data = root.data;
  if (data && typeof data === "object")
    keys.push(...Object.keys(data as Record<string, unknown>).map((k) => `data.${k}`));
  return keys.slice(0, 20);
}
