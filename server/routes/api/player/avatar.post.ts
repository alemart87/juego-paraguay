import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createError, defineEventHandler, readMultipartFormData, setResponseStatus } from "h3";
import { getSql } from "../../../../src/lib/db";

function normalizeContact(kind: string, value: string) {
  if (kind === "email") {
    const normalized = value.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized) && normalized.length <= 160
      ? normalized
      : null;
  }
  if (kind !== "phone") return null;
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `595${digits.slice(1)}` : digits;
  return /^\d{8,15}$/.test(normalized) ? normalized : null;
}

function secret() {
  return (
    process.env.LEADERBOARD_SECRET?.trim() ||
    process.env.WHOP_WEBHOOK_SECRET?.trim() ||
    (process.env.DATABASE_URL?.trim() ? "" : "influencers-battle-local-preview")
  );
}

function imageExtension(data: Buffer) {
  if (
    data.length >= 12 &&
    data.subarray(0, 4).toString() === "RIFF" &&
    data.subarray(8, 12).toString() === "WEBP"
  )
    return "webp";
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "png";
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpg";
  return null;
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  if (!parts) throw createError({ statusCode: 400, statusMessage: "Formulario inválido" });
  const field = (name: string) =>
    Buffer.from(parts.find((part) => part.name === name && !part.filename)?.data ?? []).toString(
      "utf8",
    );
  const avatar = parts.find((part) => part.name === "avatar" && part.filename);
  const kind = field("contactKind");
  const normalized = normalizeContact(kind, field("contact"));
  const token = field("benefitToken");
  if (!normalized || !avatar) {
    setResponseStatus(event, 400);
    return { ok: false, message: "Completá el perfil y elegí una foto válida." };
  }
  const avatarData = Buffer.from(avatar.data);
  if (avatarData.length < 64 || avatarData.length > 3 * 1024 * 1024) {
    setResponseStatus(event, 413);
    return { ok: false, message: "La foto debe pesar menos de 3 MB." };
  }
  const extension = imageExtension(avatarData);
  if (!extension) {
    setResponseStatus(event, 415);
    return { ok: false, message: "Usá una imagen JPG, PNG o WebP." };
  }
  const signingSecret = secret();
  if (!signingSecret)
    throw createError({ statusCode: 503, statusMessage: "Perfil no configurado" });
  const contactHash = createHmac("sha256", signingSecret)
    .update(`${kind}:${normalized}`)
    .digest("hex");
  const expected = createHmac("sha256", signingSecret)
    .update(`benefits:${contactHash}`)
    .digest("hex");
  const suppliedBuffer = Buffer.from(token, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    setResponseStatus(event, 401);
    return { ok: false, message: "Actualizá tu perfil antes de subir la foto." };
  }

  const sql = await getSql();
  const players = await sql.query<{ id: number; avatar_file: string | null }>(
    "SELECT id, avatar_file FROM leaderboard_players WHERE contact_hash = $1 LIMIT 1",
    [contactHash],
  );
  const player = players[0];
  if (!player) {
    setResponseStatus(event, 404);
    return { ok: false, message: "Primero creá tu perfil del ranking." };
  }

  const directory = resolve(process.env.PERSISTENT_DIR?.trim() || "persistent", "players");
  await mkdir(directory, { recursive: true });
  const contentHash = createHash("sha256").update(avatarData).digest("hex").slice(0, 12);
  const filename = `${contactHash.slice(0, 28)}-${contentHash}.${extension}`;
  const temporary = join(directory, `${filename}.tmp`);
  await writeFile(temporary, avatarData, { flag: "wx" }).catch(
    async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
    },
  );
  await rename(temporary, join(directory, filename)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await sql.query(
    "UPDATE leaderboard_players SET avatar_file = $1, updated_at = now() WHERE id = $2",
    [filename, player.id],
  );
  if (player.avatar_file && player.avatar_file !== filename)
    await unlink(join(directory, player.avatar_file)).catch(() => undefined);
  return { ok: true, avatarUrl: `/media/players/${filename}` };
});
