import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const root = resolve(process.env.PERSISTENT_DIR?.trim() || "persistent");
const target = join(root, "characters");
const source = resolve("public", "battle");
const selected = new Set([
  "cover-v2.webp",
  "masivo-bro.webp",
  "onichan.webp",
  "anatomic-blogs.webp",
  "la-comadre.webp",
  "el-papu.webp",
  "la-secre.webp",
  "boss-luison.webp",
  "boss-lata.webp",
  "boss-lulax.webp",
  "bosses.webp",
  "minions.webp",
  "fighters.webp",
  "poses.webp",
]);

await mkdir(target, { recursive: true });
const available = await readdir(source);
const copied = [];
for (const name of available) {
  if (!selected.has(name)) continue;
  await copyFile(join(source, name), join(target, basename(name)));
  copied.push(name);
}
await writeFile(
  join(target, "manifest.json"),
  `${JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), files: copied }, null, 2)}\n`,
);
console.log(`[persistent] ${copied.length} assets copied to ${target}`);
