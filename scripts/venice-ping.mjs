#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

for (const raw of readFileSync(join(process.cwd(), ".env"), "utf8").split("\n")) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 1) continue;
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  if (!process.env[key]) process.env[key] = val;
}

const key = process.env.venice_api || process.env.VENICE_API_KEY;
const base = (process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/$/, "");
const model = process.env.VENICE_MODEL || "zai-org-glm-5-2";
if (!key) {
  console.error("missing venice_api");
  process.exit(1);
}

const res = await fetch(`${base}/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "Una oración en español." },
      { role: "user", content: "Decí Team UPAP listo." },
    ],
    max_tokens: 40,
  }),
});
const json = await res.json();
if (!res.ok) {
  console.error("venice fail", res.status, JSON.stringify(json).slice(0, 300));
  process.exit(1);
}
const text = json.choices?.[0]?.message?.content?.trim() || json.choices?.[0]?.message?.reasoning_content?.trim();
console.log("ok", text || "(empty)");
