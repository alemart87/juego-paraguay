import { readFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { createError, defineEventHandler, getRouterParam, setResponseHeader } from "h3";

const contentTypes: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

export default defineEventHandler(async (event) => {
  const requested = getRouterParam(event, "name") ?? "";
  const name = basename(requested);
  const contentType = contentTypes[extname(name).toLowerCase()];
  if (!name || name !== requested || !contentType)
    throw createError({ statusCode: 400, statusMessage: "Invalid avatar name" });
  const directory = resolve(process.env.PERSISTENT_DIR?.trim() || "persistent", "players");
  try {
    const data = await readFile(join(directory, name));
    setResponseHeader(event, "content-type", contentType);
    setResponseHeader(event, "cache-control", "public, max-age=31536000, immutable");
    setResponseHeader(event, "x-content-type-options", "nosniff");
    return data;
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Avatar not found" });
  }
});
