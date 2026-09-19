import { createError, defineEventHandler, getHeader, readBody } from "h3";
import { createAdminSession, validAdminCredentials } from "../../../utils/admin-auth";

export default defineEventHandler(async (event) => {
  const address = getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const globalRate = globalThis as typeof globalThis & { __adminLoginRate?: Map<string, number[]> };
  globalRate.__adminLoginRate ??= new Map();
  const now = Date.now();
  const attempts = (globalRate.__adminLoginRate.get(address) || []).filter(
    (time) => now - time < 15 * 60_000,
  );
  if (attempts.length >= 6)
    throw createError({ statusCode: 429, statusMessage: "Esperá antes de reintentar" });
  const body = (await readBody<{ email?: string; password?: string }>(event)) ?? {};
  if (!validAdminCredentials(body?.email || "", body?.password || "")) {
    attempts.push(now);
    globalRate.__adminLoginRate.set(address, attempts);
    throw createError({ statusCode: 401, statusMessage: "Credenciales incorrectas" });
  }
  globalRate.__adminLoginRate.delete(address);
  createAdminSession(event, body.email || "");
  return { ok: true };
});
