import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, deleteCookie, type H3Event } from "h3";

const COOKIE = "ib_admin";
const secret = () =>
  process.env.ADMIN_SESSION_SECRET?.trim() || process.env.LEADERBOARD_SECRET?.trim() || "";
const equal = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function validAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "";
  const expectedPassword = process.env.SUPERADMIN_PASSWORD || "";
  return (
    Boolean(secret() && expectedEmail && expectedPassword) &&
    equal(email.trim().toLowerCase(), expectedEmail) &&
    equal(password, expectedPassword)
  );
}
export function createAdminSession(event: H3Event, email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + 8 * 60 * 60_000 }),
  ).toString("base64url");
  setCookie(event, COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}
export function isAdmin(event: H3Event) {
  const value = getCookie(event, COOKIE);
  if (!value || !secret()) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !equal(signature, sign(payload))) return false;
  try {
    return Number(JSON.parse(Buffer.from(payload, "base64url").toString()).exp) > Date.now();
  } catch {
    return false;
  }
}
export function clearAdminSession(event: H3Event) {
  deleteCookie(event, COOKIE, { path: "/" });
}
