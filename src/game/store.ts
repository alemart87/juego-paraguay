import { create } from "zustand";
import {
  HAZARDS,
  TALKS,
  WEAPONS,
  chapterOf,
  checksFor,
  objective,
  zoneAt,
  type GunId,
  type HeroId,
  type Line,
  type TalkKey,
  type WeaponId,
} from "./content";
import { configureAudio, sfx, unlockAudio, vibrate } from "./audio";
import { isChapterLoaded, preloadChapter } from "./assets";
import {
  DEFAULT_SAVE,
  DEFAULT_SETTINGS,
  loadSave,
  loadSettings,
  saveSave,
  saveSettings,
  type Difficulty,
  type Save,
  type Settings,
} from "./settings";
import { flushInput } from "./input";
import {
  applyChoice,
  closeTalk,
  createWorld,
  interactTarget,
  isAlive,
  markMet,
  respawn,
  scriptFor,
  type World,
  type WorldEvent,
} from "./world";

export type Phase = "title" | "select" | "missions" | "cinema" | "loading" | "play" | "win";
export type Overlay = null | "pause" | "options" | "help" | "ko" | "talk";

export type Clip = { src: string; title: string; line: string; next: Phase; sound?: boolean };

export type Hud = {
  hp: number;
  maxHp: number;
  coins: number;
  ammo: number;
  weapon: WeaponId;
  hasKnife: boolean;
  timer: number;
  score: number;
  kills: number;
  falls: number;
  combo: number;
  zone: string;
  objective: string;
  objectiveX: number | null;
  checks: { t: string; ok: boolean }[];
  recruited: string[];
  chasing: string[];
  prompt: string | null;
  x: number;
  width: number;
  enemies: { x: number; chasing: boolean }[];
  markers: number[];
  grenades: number;
  weapons: WeaponId[];
  dashReady: boolean;
  boss: { name: string; hp: number; maxHp: number } | null;
};

export type Result = {
  chapter: 1 | 2 | 3;
  time: number;
  score: number;
  base: number;
  bonus: number;
  coins: number;
  kills: number;
  falls: number;
  medal: "oro" | "plata" | "bronce";
  newBestTime: boolean;
  newBestScore: boolean;
};

type State = {
  booted: boolean;
  phase: Phase;
  overlay: Overlay;
  hero: HeroId | null;
  chapter: 1 | 2 | 3;
  clip: Clip | null;
  talkKey: TalkKey | null;
  script: Line[];
  line: number;
  toast: string;
  banner: { text: string; key: number; kind: "zone" | "boss" } | null;
  hud: Hud;
  settings: Settings;
  save: Save;
  loadProgress: number;
  result: Result | null;
  fps: number;
  boot: () => void;
  play: () => void;
  continueGame: () => void;
  choose: (id: HeroId) => void;
  pickMissions: () => void;
  goTitle: () => void;
  goSelect: () => void;
  startMission: (n: 1 | 2 | 3) => void;
  skipCinema: () => void;
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;
  togglePause: () => void;
  restartMission: () => void;
  quitToMenu: () => void;
  retry: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setDifficulty: (d: Difficulty) => void;
  resetProgress: () => void;
  startTalk: (key: TalkKey) => void;
  advance: (choice?: number) => void;
  dismissTalk: () => void;
  handleEvents: (ev: WorldEvent[]) => void;
  syncHud: () => void;
  setFps: (n: number) => void;
};

let world: World | null = null;
export function getWorld() {
  return world;
}

let toastTimer = 0;
let bannerTimer = 0;
let bannerSeq = 0;
let loadToken = 0;

function pushBanner(text: string, kind: "zone" | "boss") {
  useGame.setState({ banner: { text, key: ++bannerSeq, kind } });
  if (bannerTimer) window.clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(
    () => {
      useGame.setState({ banner: null });
      bannerTimer = 0;
    },
    kind === "boss" ? 2600 : 1800,
  );
}

const emptyHud: Hud = {
  hp: 100,
  maxHp: 100,
  coins: 0,
  ammo: 0,
  weapon: "pistol",
  hasKnife: false,
  timer: 0,
  score: 0,
  kills: 0,
  falls: 0,
  combo: 0,
  zone: "",
  objective: "",
  objectiveX: null,
  checks: [],
  recruited: [],
  chasing: [],
  prompt: null,
  x: 0,
  width: 600,
  enemies: [],
  markers: [],
  grenades: 0,
  weapons: ["fist", "pistol"],
  dashReady: true,
  boss: null,
};

function buildHud(w: World): Hud {
  const prog = {
    recruited: w.recruited,
    items: w.items,
    hero: w.hero,
    chapter: w.chapter,
    fire: w.fire,
    examScore: w.examScore,
  };
  const obj = objective(prog);
  const target = interactTarget(w);
  const ch = chapterOf(w.chapter);
  const markers: number[] = [];
  for (const p of ch.pickups) if (p.kind === "item" && !w.items.includes(p.id)) markers.push(p.x);
  const bossEnemy = w.boss.active ? w.enemies[ch.boss.id] : null;
  const weapon = w.player.weapon;
  return {
    hp: Math.round(w.player.hp),
    maxHp: w.player.maxHp,
    coins: w.coins,
    ammo: WEAPONS[weapon].kind === "melee" ? 0 : w.player.ammo[weapon as GunId],
    weapon,
    hasKnife: w.player.weapons.includes("knife"),
    timer: Math.floor(w.timer),
    score: w.score,
    kills: w.kills,
    falls: w.falls,
    combo: w.combo,
    zone: zoneAt(w.chapter, w.player.x).name,
    objective: obj.text,
    objectiveX: obj.x,
    checks: checksFor(prog),
    recruited: [...w.recruited],
    chasing: HAZARDS.filter((h) => w.enemies[h.id].chasing && isAlive(w.enemies[h.id])).map(
      (h) => h.name,
    ),
    prompt: target ? `${target.verb} · ${target.label}` : null,
    x: Math.round(w.player.x),
    width: w.width,
    enemies: HAZARDS.filter((h) => isAlive(w.enemies[h.id])).map((h) => ({
      x: Math.round(w.enemies[h.id].x),
      chasing: w.enemies[h.id].chasing,
    })),
    markers,
    grenades: w.player.ammo.grenade,
    weapons: [...w.player.weapons],
    dashReady: w.t >= w.player.dashReadyAt,
    boss:
      bossEnemy && isAlive(bossEnemy)
        ? { name: ch.boss.title, hp: Math.max(0, bossEnemy.hp), maxHp: bossEnemy.maxHp }
        : null,
  };
}

function hudEqual(a: Hud, b: Hud) {
  return (
    a.hp === b.hp &&
    a.maxHp === b.maxHp &&
    a.coins === b.coins &&
    a.ammo === b.ammo &&
    a.weapon === b.weapon &&
    a.hasKnife === b.hasKnife &&
    a.timer === b.timer &&
    a.score === b.score &&
    a.kills === b.kills &&
    a.falls === b.falls &&
    a.combo === b.combo &&
    a.zone === b.zone &&
    a.objective === b.objective &&
    a.objectiveX === b.objectiveX &&
    a.prompt === b.prompt &&
    a.x === b.x &&
    a.checks.every((c, i) => b.checks[i]?.ok === c.ok && b.checks[i]?.t === c.t) &&
    a.recruited.join() === b.recruited.join() &&
    a.chasing.join() === b.chasing.join() &&
    a.markers.join() === b.markers.join() &&
    a.enemies.length === b.enemies.length &&
    a.enemies.every((e, i) => b.enemies[i].x === e.x && b.enemies[i].chasing === e.chasing) &&
    a.grenades === b.grenades &&
    a.weapons.join() === b.weapons.join() &&
    a.dashReady === b.dashReady &&
    (a.boss === b.boss ||
      (!!a.boss && !!b.boss && a.boss.hp === b.boss.hp && a.boss.name === b.boss.name))
  );
}

function pushToast(msg: string) {
  useGame.setState({ toast: msg });
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    useGame.setState({ toast: "" });
    toastTimer = 0;
  }, 2400);
}

function beginLoad(n: 1 | 2 | 3) {
  const token = ++loadToken;
  useGame.setState({ loadProgress: 0 });
  void preloadChapter(n, (p) => {
    if (token === loadToken) useGame.setState({ loadProgress: p });
  }).then(() => {
    if (token !== loadToken) return;
    const s = useGame.getState();
    if (s.phase === "loading") useGame.setState({ phase: "play", overlay: null });
  });
}

function finishMission() {
  const s = useGame.getState();
  const w = world;
  if (!w) return;
  const ch = chapterOf(w.chapter);
  const time = Math.floor(w.timer);
  const bonus = Math.max(0, Math.round((ch.parTime - w.timer) * 2));
  const score = w.score + bonus;
  const medal: Result["medal"] =
    w.timer < ch.parTime * 0.6 && w.falls === 0 ? "oro" : w.timer < ch.parTime ? "plata" : "bronce";
  const rec = s.save.missions[w.chapter];
  const newBestTime = rec.bestTime === null || time < rec.bestTime;
  const newBestScore = score > rec.bestScore;
  const save: Save = {
    ...s.save,
    hero: w.hero,
    totalCoins: s.save.totalCoins + w.coins,
    totalKills: s.save.totalKills + w.kills,
    missions: {
      ...s.save.missions,
      [w.chapter]: {
        done: true,
        bestTime: newBestTime ? time : rec.bestTime,
        bestScore: Math.max(rec.bestScore, score),
        plays: rec.plays + 1,
      },
    },
  };
  saveSave(save);
  w.ended = true;
  sfx("win");
  useGame.setState({
    save,
    result: {
      chapter: w.chapter,
      time,
      score,
      base: w.score,
      bonus,
      coins: w.coins,
      kills: w.kills,
      falls: w.falls,
      medal,
      newBestTime,
      newBestScore,
    },
    overlay: null,
    talkKey: null,
    phase: "cinema",
    clip: { src: ch.outro.src, title: ch.outro.title, line: ch.outro.line, next: "win" },
  });
}

export const useGame = create<State>((set, get) => ({
  booted: false,
  phase: "title",
  overlay: null,
  hero: null,
  chapter: 1,
  clip: null,
  talkKey: null,
  script: [],
  line: 0,
  toast: "",
  banner: null,
  hud: emptyHud,
  settings: DEFAULT_SETTINGS,
  save: DEFAULT_SAVE,
  loadProgress: 0,
  result: null,
  fps: 0,

  boot: () => {
    if (get().booted) return;
    const settings = loadSettings();
    const save = loadSave();
    configureAudio(settings.sound, settings.volume);
    set({ booted: true, settings, save, hero: save.hero });
  },

  play: () => {
    unlockAudio();
    sfx("ui");
    set({
      phase: "cinema",
      clip: {
        src: "/cinema/intro.mp4",
        title: "Team UPAP y Juan",
        line: "Marcos coordina. Gallaguer pregunta. El asado no se arma solo.",
        next: "select",
        sound: true,
      },
    });
  },
  continueGame: () => {
    unlockAudio();
    sfx("ui");
    const hero = get().save.hero;
    set({ hero, phase: hero ? "missions" : "select" });
  },
  choose: (id) => {
    sfx("ui");
    const save = { ...get().save, hero: id };
    saveSave(save);
    set({ hero: id, save, phase: "missions" });
  },
  pickMissions: () => {
    sfx("ui");
    world = null;
    set({ phase: "missions", overlay: null, talkKey: null, toast: "", clip: null });
  },
  goTitle: () => {
    world = null;
    set({ phase: "title", overlay: null, talkKey: null, toast: "", clip: null });
  },
  goSelect: () => {
    sfx("ui");
    set({ phase: "select", overlay: null });
  },

  startMission: (n) => {
    unlockAudio();
    sfx("ui");
    const hero = get().hero ?? "rafa";
    const ch = chapterOf(n);
    world = createWorld(n, hero, get().settings.difficulty);
    beginLoad(n);
    set({
      phase: "cinema",
      overlay: null,
      hero,
      chapter: n,
      talkKey: null,
      line: 0,
      toast: "",
      result: null,
      hud: buildHud(world),
      clip: { src: ch.intro.src, title: ch.intro.title, line: ch.intro.line, next: "play" },
    });
  },
  skipCinema: () => {
    const { clip, chapter } = get();
    const next = clip?.next ?? "play";
    if (next === "play") {
      if (!world) return set({ phase: "missions", clip: null });
      if (isChapterLoaded(chapter)) {
        set({ phase: "play", overlay: null, clip: null });
        pushToast("W salta · S agacha · Shift esquiva · E habla · G granada");
      } else {
        set({ phase: "loading", clip: null });
      }
      return;
    }
    set({ phase: next, clip: next === "win" ? clip : null });
  },

  openOverlay: (o) => {
    flushInput();
    set({ overlay: o });
  },
  closeOverlay: () => {
    flushInput();
    const s = get();
    if (s.overlay === "options" || s.overlay === "help") {
      set({ overlay: s.phase === "play" ? "pause" : null });
      return;
    }
    set({ overlay: null });
  },
  togglePause: () => {
    const s = get();
    if (s.phase !== "play") return;
    flushInput();
    if (s.overlay === null) {
      sfx("ui");
      set({ overlay: "pause" });
    } else if (s.overlay === "pause") set({ overlay: null });
  },
  restartMission: () => {
    const s = get();
    if (!world) return;
    sfx("ui");
    world = createWorld(s.chapter, s.hero ?? "rafa", s.settings.difficulty);
    flushInput();
    set({ overlay: null, talkKey: null, toast: "", hud: buildHud(world), phase: "play" });
  },
  quitToMenu: () => {
    sfx("ui");
    world = null;
    set({ phase: "missions", overlay: null, talkKey: null, toast: "", clip: null });
  },
  retry: () => {
    if (!world) return;
    const ev: WorldEvent[] = [];
    respawn(world, ev);
    get().handleEvents(ev);
    flushInput();
    set({ overlay: null });
  },

  setSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    configureAudio(settings.sound, settings.volume);
    if (patch.sound !== undefined || patch.volume !== undefined) {
      unlockAudio();
      sfx("ui");
    }
    set({ settings });
  },
  setDifficulty: (d) => {
    get().setSettings({ difficulty: d });
    sfx("ui");
  },
  resetProgress: () => {
    const save = { ...DEFAULT_SAVE, missions: { ...DEFAULT_SAVE.missions } };
    saveSave(save);
    set({ save, hero: null });
  },

  startTalk: (key) => {
    const w = world;
    if (!TALKS[key] || !w) return;
    const script = scriptFor(w, key);
    if (!script.length) return;
    markMet(w, key);
    flushInput();
    sfx("blip");
    set({ overlay: "talk", talkKey: key, script, line: 0 });
  },
  advance: (choice) => {
    const s = get();
    const w = world;
    if (!s.talkKey || !w) return;
    const script = s.script;
    const line = script[s.line];
    if (!line) return;
    sfx("blip");
    const close = () => {
      closeTalk(w);
      set({ overlay: null, talkKey: null, script: [], line: 0 });
      get().syncHud();
    };
    if (line.choices && choice !== undefined && line.choices[choice]) {
      const ev: WorldEvent[] = [];
      const res = applyChoice(w, s.talkKey, script, s.line, line.choices[choice], ev);
      get().handleEvents(ev);
      if (res.next === "close") close();
      else if (res.next === "line") set({ line: s.line + 1 });
      else if (res.next === "talk") {
        const next = scriptFor(w, res.key);
        set({ talkKey: res.key, script: next, line: 0 });
      } else if (res.next === "win") finishMission();
      return;
    }
    if (s.line + 1 < script.length) set({ line: s.line + 1 });
    else close();
  },

  dismissTalk: () => {
    const w = world;
    if (!w || get().overlay !== "talk") return;
    closeTalk(w);
    flushInput();
    set({ overlay: null, talkKey: null, script: [], line: 0 });
    get().syncHud();
  },

  handleEvents: (ev) => {
    if (!ev.length) return;
    const s = get();
    let hud = false;
    for (const e of ev) {
      switch (e.t) {
        case "toast":
          pushToast(e.msg);
          break;
        case "sfx":
          sfx(e.name);
          break;
        case "vibrate":
          if (s.settings.vibrate) vibrate(e.ms);
          break;
        case "hud":
          hud = true;
          break;
        case "talk":
          get().startTalk(e.key);
          hud = true;
          break;
        case "ko":
          sfx("ko");
          flushInput();
          set({ overlay: "ko" });
          hud = true;
          break;
        case "win":
          finishMission();
          break;
        case "zone":
          pushBanner(e.name, "zone");
          break;
        case "boss":
          if (e.title) pushBanner(e.title, "boss");
          else pushBanner("¡JEFE VENCIDO!", "boss");
          hud = true;
          break;
      }
    }
    if (hud) get().syncHud();
    ev.length = 0;
  },
  syncHud: () => {
    if (!world) return;
    const next = buildHud(world);
    if (!hudEqual(get().hud, next)) set({ hud: next });
  },
  setFps: (n) => {
    if (get().fps !== n) set({ fps: n });
  },
}));
