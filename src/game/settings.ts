import type { HeroId } from "./content";

export type Difficulty = "facil" | "normal" | "dificil";
export type Quality = "auto" | "baja" | "alta";

export type Settings = {
  difficulty: Difficulty;
  sound: boolean;
  volume: number;
  vibrate: boolean;
  gore: boolean;
  shake: boolean;
  quality: Quality;
  leftHanded: boolean;
  showFps: boolean;
  touchControls: "auto" | "on" | "off";
};

export type MissionRecord = {
  done: boolean;
  bestTime: number | null;
  bestScore: number;
  plays: number;
};

export type Save = {
  version: 1;
  hero: HeroId | null;
  missions: Record<1 | 2 | 3, MissionRecord>;
  totalCoins: number;
  totalKills: number;
};

export const DEFAULT_SETTINGS: Settings = {
  difficulty: "normal",
  sound: true,
  volume: 0.8,
  vibrate: true,
  gore: true,
  shake: true,
  quality: "auto",
  leftHanded: false,
  showFps: false,
  touchControls: "auto",
};

const emptyRecord = (): MissionRecord => ({ done: false, bestTime: null, bestScore: 0, plays: 0 });

export const DEFAULT_SAVE: Save = {
  version: 1,
  hero: null,
  missions: { 1: emptyRecord(), 2: emptyRecord(), 3: emptyRecord() },
  totalCoins: 0,
  totalKills: 0,
};

const SETTINGS_KEY = "upap.settings.v1";
const SAVE_KEY = "upap.save.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota: the game still runs, it just does not remember */
  }
}

export function loadSettings(): Settings {
  const s = read(SETTINGS_KEY, DEFAULT_SETTINGS);
  s.volume = Math.max(0, Math.min(1, Number(s.volume) || 0));
  return s;
}
export function saveSettings(s: Settings) {
  write(SETTINGS_KEY, s);
}

export function loadSave(): Save {
  const s = read(SAVE_KEY, DEFAULT_SAVE);
  s.missions = {
    1: { ...emptyRecord(), ...(s.missions?.[1] ?? {}) },
    2: { ...emptyRecord(), ...(s.missions?.[2] ?? {}) },
    3: { ...emptyRecord(), ...(s.missions?.[3] ?? {}) },
  };
  return s;
}
export function saveSave(s: Save) {
  write(SAVE_KEY, s);
}

/** Gameplay tuning derived from difficulty. */
export type Tuning = {
  enemySpeed: number;
  damage: number;
  projectileRate: number;
  startAmmo: number;
  ammoPickup: number;
  respawnSeconds: number;
  enemyHp: number;
  label: string;
};

export const TUNING: Record<Difficulty, Tuning> = {
  facil: {
    enemySpeed: 0.82,
    damage: 0.6,
    projectileRate: 0.7,
    startAmmo: 20,
    ammoPickup: 10,
    respawnSeconds: 14,
    enemyHp: 0.7,
    label: "Fácil",
  },
  normal: {
    enemySpeed: 1,
    damage: 1,
    projectileRate: 1,
    startAmmo: 12,
    ammoPickup: 8,
    respawnSeconds: 10,
    enemyHp: 1,
    label: "Normal",
  },
  dificil: {
    enemySpeed: 1.18,
    damage: 1.5,
    projectileRate: 1.35,
    startAmmo: 8,
    ammoPickup: 6,
    respawnSeconds: 7,
    enemyHp: 1.5,
    label: "Difícil",
  },
};

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
