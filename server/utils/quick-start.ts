import { FIGHTERS, type EpisodeId, type FighterId } from "../../src/battle/content";

export type QuickStart = { level: EpisodeId; fighter: FighterId | "" };

export const QUICK_START_KEY = "quick_start";

/** Personajes que pueden ser el predeterminado del inicio directo (sin premium). */
export const quickStartFighters = () => FIGHTERS.filter((f) => !f.premium);

export const isEpisodeId = (value: unknown): value is EpisodeId =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;

export const isQuickStartFighter = (value: unknown): value is FighterId =>
  typeof value === "string" && quickStartFighters().some((f) => f.id === value);

/** Lee el valor guardado en game_settings ({"level":3,"fighter":"rafa"} o vacío). */
export function parseQuickStart(raw: string): QuickStart | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { level?: unknown; fighter?: unknown };
    if (!isEpisodeId(data.level)) return null;
    const fighter = isQuickStartFighter(data.fighter) ? data.fighter : "";
    return { level: data.level, fighter };
  } catch {
    return null;
  }
}
