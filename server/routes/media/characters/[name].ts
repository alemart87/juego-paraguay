import { readFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { createError, defineEventHandler, getRouterParam, setResponseHeader } from "h3";

const contentTypes: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
};

export default defineEventHandler(async (event) => {
  const requested = getRouterParam(event, "name") ?? "";
  const name = basename(requested);
  const contentType = contentTypes[extname(name).toLowerCase()];
  if (!name || name !== requested || !contentType) {
    throw createError({ statusCode: 400, statusMessage: "Invalid media name" });
  }

  const persistent = resolve(process.env.PERSISTENT_DIR?.trim() || "persistent", "characters");
  const bundled = resolve("public", "battle");
  let data: Buffer;
  try {
    data = await readFile(join(persistent, name));
  } catch {
    try {
      data = await readFile(join(bundled, name));
    } catch {
      throw createError({ statusCode: 404, statusMessage: "Media not found" });
    }
  }
  setResponseHeader(event, "content-type", contentType);
  setResponseHeader(event, "cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  return data;
});
