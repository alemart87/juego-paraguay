import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeContact } from "./leaderboard";

test("ranking normalizes email and Paraguayan phone without exposing formatting", () => {
  assert.equal(normalizeContact("email", "  PLAYER@Example.COM "), "player@example.com");
  assert.equal(normalizeContact("phone", "0981 123 456"), "595981123456");
  assert.equal(normalizeContact("phone", "+595 981 123 456"), "595981123456");
});

test("ranking rejects malformed contact data", () => {
  assert.equal(normalizeContact("email", "no-es-correo"), null);
  assert.equal(normalizeContact("phone", "123"), null);
});
