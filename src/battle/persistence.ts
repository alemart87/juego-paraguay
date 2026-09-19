import { FIGHTERS, type FighterId, type Difficulty, type EpisodeId } from "./content";
export interface RecordScore {
  score: number;
  time: number;
  medals: number;
  hero: FighterId;
}
export interface Save {
  version: 1;
  hero: FighterId;
  records: Partial<Record<EpisodeId, RecordScore>>;
  sound: boolean;
  shake: boolean;
  leftHanded: boolean;
  quality: "auto" | "low";
  difficulty: Difficulty;
}
export const defaultSave = (): Save => ({
  version: 1,
  hero: "masivo",
  records: {},
  sound: true,
  shake: true,
  leftHanded: false,
  quality: "auto",
  difficulty: "tranqui",
});
const KEY = "influencers-battle.v1";
export function loadSave(): Save {
  const d = defaultSave();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!s || s.version !== 1) return d;
    if (FIGHTERS.some((f) => f.id === s.hero)) d.hero = s.hero;
    for (const k of ["sound", "shake", "leftHanded"] as const)
      if (typeof s[k] === "boolean") d[k] = s[k];
    if (s.quality === "low") d.quality = "low";
    if (s.difficulty === "picante") d.difficulty = "picante";
    for (const id of [1, 2, 3] as EpisodeId[]) {
      const r = s.records?.[id];
      if (
        r &&
        Number.isFinite(r.score) &&
        r.score >= 0 &&
        Number.isFinite(r.time) &&
        r.time > 0 &&
        Number.isInteger(r.medals) &&
        r.medals >= 1 &&
        r.medals <= 3 &&
        FIGHTERS.some((f) => f.id === r.hero)
      )
        d.records[id] = r;
    }
    return d;
  } catch {
    return d;
  }
}
export function writeSave(save: Save): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
export function saveResult(save: Save, id: EpisodeId, result: RecordScore): Save {
  const prev = save.records[id];
  return {
    ...save,
    records: {
      ...save.records,
      [id]: prev
        ? {
            ...result,
            score: Math.max(prev.score, result.score),
            time: Math.min(prev.time, result.time),
            medals: Math.max(prev.medals, result.medals),
          }
        : result,
    },
  };
}
