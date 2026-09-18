import { create } from "zustand";
import {
  type HeroId,
  type HazardId,
  type TalkKey,
  type HazardState,
  type Blood,
  type WeaponId,
  type Shot,
  type Gib,
  type SlimeShot,
  TALKS,
  HAZARDS,
  NAMES,
  chapterOf,
  worldWidth,
  npcHome,
  hazardsFor,
  hazardAt,
  splat,
  rip,
} from "./content";

export type Phase = "title" | "select" | "missions" | "cinema" | "play" | "talk" | "win";

export type Clip = { src: string; title: string; line: string; next: Phase; sound?: boolean };

export type BookShot = { id: number; x: number; y: number; vx: number; rot: number };
export type Impact = { id: number; x: number; y: number; kind: "slash" | "muzzle" | "impact" | "boom" | "tracer" };

type State = {
  phase: Phase;
  hero: HeroId | null;
  x: number;
  facing: 1 | -1;
  recruited: string[];
  items: string[];
  coins: number;
  fire: boolean;
  chapter: 1 | 2 | 3;
  examScore: number;
  attacking: boolean;
  npcX: Record<HeroId, number>;
  hazards: Record<HazardId, HazardState>;
  blood: Blood[];
  books: BookShot[];
  slimes: SlimeShot[];
  shots: Shot[];
  impacts: Impact[];
  gibs: Gib[];
  weapon: WeaponId;
  slimed: number;
  shake: number;
  clip: Clip | null;
  talkKey: TalkKey | null;
  line: number;
  toast: string;
  play: () => void;
  choose: (id: HeroId) => void;
  pickMissions: () => void;
  startMission: (n: 1 | 2 | 3) => void;
  skipCinema: () => void;
  setX: (x: number) => void;
  setFacing: (f: 1 | -1) => void;
  grabCoin: (id: string) => void;
  grabWeapon: (id: "knife" | "pistol") => void;
  cycleWeapon: () => void;
  punch: () => void;
  tickHazards: (dt: number, x: number) => void;
  startTalk: (key: TalkKey) => void;
  advance: (choice?: number) => void;
  reset: () => void;
};

let toastTimer = 0;
let punchGate = 0;
let bookSeq = 1;
let slimeSeq = 1;
let shotSeq = 1;
let fxSeq = 1;

function toast(msg: string) {
  useGame.setState({ toast: msg });
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    useGame.setState({ toast: "" });
    toastTimer = 0;
  }, 2600);
}

function winCinema(n: 1 | 2 | 3) {
  const ch = chapterOf(n);
  useGame.setState({
    clip: { src: ch.outro.src, title: ch.outro.title, line: ch.outro.line, next: "win" },
    phase: "cinema",
    talkKey: null,
  });
}

const blank = {
  phase: "title" as Phase,
  hero: null as HeroId | null,
  x: 18,
  facing: 1 as 1 | -1,
  recruited: [] as string[],
  items: [] as string[],
  coins: 0,
  fire: false,
  chapter: 1 as 1 | 2 | 3,
  examScore: 0,
  attacking: false,
  npcX: npcHome(1),
  hazards: hazardsFor(1),
  blood: [] as Blood[],
  books: [] as BookShot[],
  slimes: [] as SlimeShot[],
  shots: [] as Shot[],
  impacts: [] as Impact[],
  gibs: [] as Gib[],
  weapon: "pistol" as WeaponId,
  slimed: 0,
  shake: 0,
  clip: null as Clip | null,
  talkKey: null as TalkKey | null,
  line: 0,
  toast: "",
};

export const useGame = create<State>((set, get) => ({
  ...blank,
  play: () =>
    set({
      phase: "cinema",
      clip: {
        src: "/cinema/intro.mp4",
        title: "Team UPAP y Juan",
        line: "Marcos coordina. Gallaguer pregunta. El asado no se arma solo.",
        next: "select",
        sound: true,
      },
    }),
  choose: (id) => set({ hero: id, phase: "missions" }),
  pickMissions: () => set({ phase: "missions", talkKey: null, toast: "", clip: null }),
  startMission: (n) => {
    const hero = get().hero ?? "rafa";
    const ch = chapterOf(n);
    const recruited = n === 1 ? [hero] : ["rafa", "juan", "richard", "hector"];
    set({
      phase: "cinema",
      hero,
      chapter: n,
      facing: 1,
      x: ch.startX,
      recruited,
      items: ["pistol"],
      coins: 0,
      fire: n !== 1,
      examScore: 0,
      attacking: false,
      npcX: npcHome(n),
      hazards: hazardsFor(n),
      blood: [],
      books: [],
      slimes: [],
      shots: [],
      impacts: [],
      gibs: [],
      weapon: "pistol",
      slimed: 0,
      shake: 0,
      talkKey: null,
      line: 0,
      toast: "",
      clip: {
        src: ch.intro.src,
        title: ch.intro.title,
        line: ch.intro.line,
        next: "play",
      },
    });
  },
  skipCinema: () => {
    const { clip } = get();
    const next = clip?.next ?? "play";
    set({
      phase: next,
      clip: next === "win" ? clip : null,
    });
    if (next === "play") toast("¡Onichan está en vivo! Capi tira slime.");
  },
  setX: (x) => set({ x }),
  setFacing: (facing) => set({ facing }),
  grabCoin: (id) => {
    const s = get();
    if (s.items.includes(id)) return;
    set({ items: [...s.items, id], coins: s.coins + 1 });
  },
  grabWeapon: (id) => {
    const s = get();
    if (s.items.includes(id)) return;
    set({ items: [...s.items, id], weapon: id });
    toast(id === "pistol" ? "Pistola. Apuntá y dispará." : "Cuchillo. Cortá de cerca.");
  },
  cycleWeapon: () => {
    const s = get();
    const owned: WeaponId[] = ["fist"];
    if (s.items.includes("knife")) owned.push("knife");
    if (s.items.includes("pistol")) owned.push("pistol");
    const i = owned.indexOf(s.weapon);
    const next = owned[(i + 1) % owned.length];
    set({ weapon: next });
    toast(next === "pistol" ? "Pistola." : next === "knife" ? "Cuchillo." : "Puño.");
  },
  punch: () => {
    const s = get();
    if (s.phase !== "play") return;
    const now = performance.now();
    if (now < punchGate) return;
    punchGate = now + (s.weapon === "pistol" ? 280 : 420);
    const maxX = worldWidth(s.chapter) - 8;
    set({ attacking: true, shake: now });
    window.setTimeout(() => useGame.setState({ attacking: false }), s.weapon === "pistol" ? 160 : 280);
    if (s.weapon === "pistol") {
      set({
        shots: [
          ...s.shots,
          { id: shotSeq++, x: s.x + s.facing * 11, y: 24, vx: s.facing * 230, face: s.facing },
          { id: shotSeq++, x: s.x + s.facing * 9, y: 22, vx: s.facing * 200, face: s.facing },
        ],
        impacts: [
          ...s.impacts,
          { id: fxSeq++, x: s.x + s.facing * 8, y: 24, kind: "muzzle" },
          { id: fxSeq++, x: s.x + s.facing * 24, y: 24, kind: "tracer" },
          { id: fxSeq++, x: s.x + s.facing * 18, y: 22, kind: "tracer" },
        ],
        attacking: true,
        shake: now,
      });
      toast("¡PUM!");
      return;
    }
    const isKnife = s.weapon === "knife";
    const reach = isKnife ? 28 : 18;
    const fist = s.x + s.facing * (isKnife ? 16 : 12);
    const hazards = { ...s.hazards };
    let hit = false;
    let blood = [...s.blood];
    const impacts: Impact[] = isKnife
      ? [
          ...s.impacts,
          { id: fxSeq++, x: s.x + s.facing * 10, y: 22, kind: "slash" },
          { id: fxSeq++, x: s.x + s.facing * 13, y: 18, kind: "slash" },
        ]
      : [...s.impacts];
    let gibs = [...s.gibs];
    for (const id of Object.keys(hazards) as HazardId[]) {
      const h = hazards[id];
      if (h.x > 900 || h.fly || h.down || h.gone || h.exploding) continue;
      if (Math.abs(h.x - s.x) < reach || Math.abs(h.x - fist) < reach - 2) {
        const dir = s.facing;
        if (id === "marcos") {
          hazards[id] = {
            ...h,
            cry: true,
            chasing: false,
            hit: now,
            hurt: isKnife ? "slash" : "fist",
            torn: isKnife,
            fly: isKnife,
            vx: isKnife ? dir * 70 : 0,
            vy: isKnife ? 60 : 0,
            spin: isKnife ? dir * 500 : 0,
          };
          blood = [...blood, ...splat(h.x, 12, isKnife ? 18 : 6)].slice(-40);
          if (isKnife) {
            impacts.push({ id: fxSeq++, x: h.x, y: 20, kind: "impact" });
            gibs = [...gibs, ...rip(h.x, dir, 10)].slice(-28);
          }
          set({ hazards, blood, impacts, gibs, attacking: true, shake: now });
          toast("¡Marcos llora!");
          window.setTimeout(() => {
            const cur = useGame.getState();
            const m = cur.hazards.marcos;
            useGame.setState({
              hazards: {
                ...cur.hazards,
                marcos: { ...m, exploding: true, explodeAt: performance.now(), cry: true },
              },
              blood: [...cur.blood, ...splat(m.x, 14, 18)].slice(-32),
              shake: performance.now(),
            });
            toast("Marcos explota.");
          }, 900);
          return;
        }
        if (id === "gallaguer") {
          hazards[id] = {
            ...h,
            headless: true,
            exploding: true,
            explodeAt: now,
            chasing: false,
            fly: true,
            vx: dir * 40,
            vy: 90,
            spin: dir * 900,
            hit: now,
            hurt: isKnife ? "slash" : "fist",
            torn: isKnife,
          };
          blood = [...blood, ...splat(h.x, 22, 22), ...splat(h.x, 8, 12)].slice(-40);
          if (isKnife) {
            impacts.push({ id: fxSeq++, x: h.x, y: 22, kind: "impact" });
            gibs = [...gibs, ...rip(h.x, dir, 11)].slice(-28);
          }
          set({ hazards, blood, impacts, gibs, attacking: true, shake: now });
          toast("¡Le explota la cabeza!");
          return;
        }
        hazards[id] = {
          ...h,
          vx: dir * (isKnife ? 70 : 92 + Math.random() * 18),
          vy: isKnife ? 62 + Math.random() * 20 : 78 + Math.random() * 22,
          spin: dir * (isKnife ? 980 : 720 + Math.random() * 420),
          fly: true,
          down: false,
          chasing: false,
          caught: false,
          hit: now,
          hurt: isKnife ? "slash" : "fist",
          torn: isKnife,
        };
        blood = [...blood, ...splat(h.x, 12, isKnife ? 18 : 14), ...splat(h.x + dir * 8, 18, isKnife ? 12 : 8)].slice(-40);
        if (isKnife) {
          impacts.push({ id: fxSeq++, x: h.x, y: 18, kind: "impact" });
          gibs = [...gibs, ...rip(h.x, dir, 10)].slice(-28);
        }
        hit = true;
        if (id === "pablito" && s.chapter === 3 && !s.items.includes("echar")) {
          set({
            hazards,
            items: [...s.items, "echar"],
            attacking: true,
            blood,
            impacts,
            gibs,
            shake: now,
          });
          toast("¡Pablito vuela! Hablá con Juan.");
          return;
        }
      }
    }
    const npcX = { ...s.npcX };
    for (const id of Object.keys(npcX) as HeroId[]) {
      if (id === s.hero || npcX[id] > 900) continue;
      if (Math.abs(npcX[id] - s.x) < 14) {
        npcX[id] = Math.max(8, Math.min(maxX, npcX[id] + s.facing * 14));
        hit = true;
      }
    }
    set({ hazards, npcX, blood, impacts, gibs, shake: hit ? now : s.shake });
    toast(hit ? (s.weapon === "knife" ? "¡Lo despedazó!" : "¡SALE VOLANDO!") : "Al aire.");
  },
  tickHazards: (dt, px) => {
    const s = get();
    if (s.phase !== "play") return;
    const maxX = worldWidth(s.chapter) - 8;
    const hazards = { ...s.hazards };
    let dirty = false;
    let blood = s.blood;
    let books = [...s.books];
    let slimes = [...s.slimes];
    let slimed = s.slimed;
    const now = performance.now();
    for (const def of HAZARDS) {
      const h = { ...hazards[def.id] };
      if ((h.gone || h.x > 900) && def.id === "onichan" && h.gone && now - h.explodeAt > 6500) {
        hazards.onichan = { ...hazardAt(chapterOf(s.chapter).hazardHome.onichan) };
        toast("Onichan volvió. Sigue en vivo.");
        dirty = true;
        continue;
      }
      if (h.gone || h.x > 900) continue;
      if (h.exploding) {
        h.rot += 420 * dt;
        h.y += 40 * dt;
        if (now - h.explodeAt > 800) {
          h.gone = true;
          h.x = 999;
        }
        hazards[def.id] = h;
        dirty = true;
        continue;
      }
      if (h.calm) {
        hazards[def.id] = h;
        continue;
      }
      if (h.cry) {
        hazards[def.id] = h;
        continue;
      }
      if (h.x > 900) continue;
      if (h.fly) {
        h.vy -= 210 * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.rot += h.spin * dt;
        h.x = Math.max(4, Math.min(maxX, h.x));
        if (h.y <= 0) {
          h.y = 0;
          if (Math.abs(h.vy) > 36) {
            h.vy = Math.abs(h.vy) * 0.38;
            h.vx *= 0.55;
            h.spin *= 0.6;
            blood = [...blood, ...splat(h.x, 8, 8)].slice(-28);
          } else {
            h.fly = false;
            h.down = true;
            h.downAt = now;
            h.vx = 0;
            h.vy = 0;
            h.rot = h.spin >= 0 ? 90 : -90;
            blood = [...blood, ...splat(h.x, 6, 7)].slice(-28);
          }
        }
        hazards[def.id] = h;
        dirty = true;
        continue;
      }
      if (h.down) {
        if (!(def.id === "pablito" && s.chapter === 3 && s.items.includes("echar"))) {
          if (now - h.downAt > 2400) {
            h.down = false;
            h.rot = 0;
            dirty = true;
          }
        }
        hazards[def.id] = h;
        continue;
      }
      if (now - h.hit < 400) {
        hazards[def.id] = h;
        continue;
      }
      const dx = px - h.x;
      const dist = Math.abs(dx);
      if (!h.chasing && def.id === "onichan") {
        const home = chapterOf(s.chapter).hazardHome.onichan;
        h.x = home + Math.sin(now / 650) * 18;
        dirty = true;
      }
      if (!h.chasing && dist < (def.id === "onichan" ? 42 : 22)) {
        h.chasing = true;
        h.caught = false;
        dirty = true;
        toast(
          def.id === "masivo"
            ? "¡SOS Pobro! ¡CORRÉ!"
            : def.id === "marcos"
              ? "¡Marcos tira libros!"
              : def.id === "gallaguer"
                ? "¡Gallaguer te vio!"
                : def.id === "onichan"
                  ? "¡Onichan está en vivo! ¡Capi tira slime!"
                  : "¡Pablito te vio! ¡ESCAPÁ!",
        );
      }
      if (h.chasing) {
        const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        if (def.id === "onichan") {
          if (dist < 20) h.x = Math.max(8, Math.min(maxX, h.x - dir * def.speed * dt));
          else if (dist > 28) h.x = Math.max(8, Math.min(maxX, h.x + dir * def.speed * dt));
          if (now - h.lastThrow > 550) {
            slimes.push({ id: slimeSeq++, x: h.x + (dir > 0 ? -12 : 12), y: 11, vx: dir * 95 });
            h.lastThrow = now;
          }
          if (dist > 64) {
            h.chasing = false;
            h.escaped = true;
            h.caught = false;
            h.x = chapterOf(s.chapter).hazardHome[def.id];
            toast("Onichan cortó el live.");
          }
          dirty = true;
          hazards[def.id] = h;
          continue;
        }
        if (dist > 14) h.x = Math.max(8, Math.min(maxX, h.x + dir * def.speed * dt));
        else {
          h.x = px - dir * 14;
          if (!h.caught) {
            h.caught = true;
            hazards[def.id] = h;
            set({ hazards, blood, phase: "talk", talkKey: def.id, line: 0 });
            return;
          }
        }
        if (dist > 56) {
          h.chasing = false;
          h.escaped = true;
          h.caught = false;
          h.x = chapterOf(s.chapter).hazardHome[def.id];
          toast(
            def.id === "masivo"
              ? "Masivo: fuera de acá."
              : def.id === "marcos"
                ? "Marcos se queda tirando tesis."
                : def.id === "gallaguer"
                  ? "Gallaguer perdió el hilo."
                  : "Zafaste de Pablito.",
          );
        }
        if (def.id === "marcos" && now - h.lastThrow > 1100) {
          const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
          books.push({
            id: bookSeq++,
            x: h.x,
            y: 18,
            vx: dir * 48,
            rot: Math.random() * 360,
          });
          h.lastThrow = now;
        }
        dirty = true;
      }
      hazards[def.id] = h;
    }
    books = books
      .map((b) => ({ ...b, x: b.x + b.vx * dt, rot: b.rot + 220 * dt, y: b.y + 6 * dt }))
      .filter((b) => {
        if (Math.abs(b.x - px) < 7 && b.y < 26) {
          slimed = now;
          toast("¡Un libro te pegó!");
          return false;
        }
        return b.x > 0 && b.x < maxX && b.y < 40;
      });
    slimes = slimes
      .map((sl) => ({ ...sl, x: sl.x + sl.vx * dt, y: sl.y + 5 * dt }))
      .filter((sl) => {
        if (Math.abs(sl.x - px) < 7 && sl.y < 26) {
          slimed = now;
          toast("¡Capi te llenó de slime!");
          return false;
        }
        return sl.x > 0 && sl.x < maxX && sl.y < 38;
      })
      .slice(-12);
    const nextShots: Shot[] = [];
    const nextImpacts: Impact[] = s.impacts.slice(-10);
    let gibs = [...s.gibs];
    for (const shot of s.shots) {
      const nx = shot.x + shot.vx * dt;
      if (nx < 2 || nx > maxX) continue;
      let hitShot = false;
      for (const def of HAZARDS) {
        const h = hazards[def.id];
        if (h.gone || h.x > 900 || h.fly || h.exploding) continue;
        if (Math.abs(h.x - nx) < 10) {
          const dir = shot.face;
          nextImpacts.push(
            { id: fxSeq++, x: h.x, y: 20, kind: "boom" },
            { id: fxSeq++, x: h.x, y: 24, kind: "impact" },
          );
          gibs = [...gibs, ...rip(h.x, dir, 12)].slice(-32);
          const dead: HazardState = {
            ...h,
            hurt: "gun",
            exploding: true,
            explodeAt: now,
            fly: true,
            torn: true,
            chasing: false,
            caught: false,
            headless: def.id === "gallaguer",
            vx: dir * 58,
            vy: 82,
            spin: dir * 820,
            hit: now,
          };
          hazards[def.id] = dead;
          blood = [...blood, ...splat(h.x, 16, 22), ...splat(h.x + dir * 6, 10, 10)].slice(-40);
          const line =
            def.id === "gallaguer"
              ? "¡Le explota la cabeza!"
              : def.id === "marcos"
                ? "Marcos explota."
                : def.id === "masivo"
                  ? "¡Masivo revienta!"
                  : def.id === "onichan"
                    ? "Onichan cortó. Capi sale volando."
                    : "¡Pablito explota!";
          if (def.id === "pablito" && s.chapter === 3 && !s.items.includes("echar")) {
            set({
              hazards,
              items: [...s.items, "echar"],
              blood,
              shots: nextShots,
              impacts: nextImpacts,
              gibs,
              shake: now,
            });
            toast("¡Pablito explota! Hablá con Juan.");
            return;
          }
          toast(line);
          dirty = true;
          hitShot = true;
          break;
        }
      }
      if (!hitShot) nextShots.push({ ...shot, x: nx });
    }
    gibs = gibs
      .map((g) => ({
        ...g,
        vy: g.vy - 210 * dt,
        x: g.x + g.vx * dt,
        y: g.y + g.vy * dt,
        rot: g.rot + g.spin * dt,
      }))
      .filter((g) => g.y > -20 && g.x > -10 && g.x < maxX + 10)
      .slice(-28);
    const impacts = nextImpacts.slice(-16);
    if (
      dirty ||
      blood !== s.blood ||
      books.length > 0 ||
      s.books.length > 0 ||
      slimes.length > 0 ||
      s.slimes.length > 0 ||
      nextShots.length > 0 ||
      s.shots.length > 0 ||
      impacts.length !== s.impacts.length ||
      gibs.length > 0 ||
      s.gibs.length > 0 ||
      slimed !== s.slimed
    ) {
      set({ hazards, blood, books, slimes, shots: nextShots, impacts, gibs, slimed, shake: dirty ? now : s.shake });
    }
  },
  startTalk: (key) => {
    if (TALKS[key]) set({ phase: "talk", talkKey: key, line: 0 });
  },
  advance: (choice) => {
    const s = get();
    if (!s.talkKey) return;
    const script = TALKS[s.talkKey];
    const line = script[s.line];
    const maxX = worldWidth(s.chapter) - 8;
    if (line.choices && choice !== undefined) {
      const pick = line.choices[choice];
      if (pick.join && s.talkKey) {
        const who = s.talkKey;
        if (!s.recruited.includes(who)) {
          set({ recruited: [...s.recruited, who], phase: "play", talkKey: null });
          toast(`${NAMES[who as HeroId] ?? who} se suma.`);
          return;
        }
      }
      if (pick.item && !s.items.includes(pick.item)) {
        const msg =
          pick.item === "aviso"
            ? "Paso 1. El chat está en el pasillo."
            : pick.item === "chat"
              ? "Paso 2. La foto está en el bosque."
              : pick.item === "foto"
                ? "Paso 3. Disparale a Pablito en el muelle."
                : pick.item === "fuerza"
                  ? "Héctor te banco. Falta la cédula en el patio."
                  : pick.item === "cedula"
                    ? "Cédula lista. Al aula."
                    : pick.item === "terere"
                      ? "Tereré listo. Falta el carbón."
                      : `${pick.item} listo.`;
        set({ items: [...s.items, pick.item], phase: "play", talkKey: null });
        toast(msg);
        return;
      }
      if (pick.calm) {
        const hazards = {
          ...s.hazards,
          marcos: { ...s.hazards.marcos, chasing: false, calm: true, caught: false },
        };
        set({ hazards, phase: "play", talkKey: null });
        toast("Marcos se calma. La panza es sagrada.");
        return;
      }
      if (pick.coins) {
        const who = s.talkKey as HazardId;
        const hazards = { ...s.hazards };
        if (hazards[who]) hazards[who] = { ...hazards[who], chasing: true, caught: true };
        set({
          coins: s.coins + pick.coins,
          hazards,
          phase: "play",
          talkKey: null,
          x: s.x + (s.facing >= 0 ? 8 : -8),
        });
        toast("Masivo te tira unos Gs. ¡CORRE!");
        return;
      }
      if (pick.escape) {
        const who = s.talkKey as HazardId;
        const hazards = { ...s.hazards };
        if (hazards[who]) hazards[who] = { ...hazards[who], chasing: true, caught: true };
        const bump = s.x >= (hazards[who]?.x ?? s.x) ? 10 : -10;
        set({
          hazards,
          phase: "play",
          talkKey: null,
          x: Math.max(6, Math.min(maxX, s.x + bump)),
        });
        toast("¡Corré!");
        return;
      }
      if (pick.chaseOff) {
        set({
          hazards: {
            ...s.hazards,
            pablito: {
              ...s.hazards.pablito,
              x: 12,
              chasing: false,
              escaped: true,
              caught: true,
              hit: performance.now(),
            },
          },
          items: s.items.includes("echar") ? s.items : [...s.items, "echar"],
          phase: "play",
          talkKey: null,
        });
        toast("Pablito salió corriendo. Hablá con Juan.");
        return;
      }
      if (pick.honor) {
        if (!s.items.includes("echar") || !s.items.includes("foto")) {
          set({ phase: "play", talkKey: null });
          toast("Falta la foto o echar a Pablito.");
          return;
        }
        set({ items: [...s.items, "honor"] });
        winCinema(3);
        return;
      }
      if (pick.exam) {
        const score = s.examScore + (pick.exam === "ok" ? 1 : 0);
        if (s.talkKey === "richard2") {
          if (!s.items.includes("apuntes") || !s.items.includes("cafe") || !s.items.includes("cedula") || !s.items.includes("fuerza")) {
            set({ phase: "play", talkKey: null });
            toast("Faltan apuntes, café, cédula o Héctor. Seguí a la derecha.");
            return;
          }
          set({ examScore: 0, phase: "talk", talkKey: "examen", line: 0 });
          return;
        }
        if (s.line + 1 < script.length) {
          set({ examScore: score, line: s.line + 1 });
          return;
        }
        if (score >= 2) {
          set({
            examScore: score,
            items: s.items.includes("exam") ? s.items : [...s.items, "exam"],
          });
          winCinema(2);
          return;
        }
        set({ examScore: 0, phase: "play", talkKey: null });
        toast("Aplazado. Reintentá el examen.");
        return;
      }
      if (pick.fire) {
        const team = s.recruited.length >= 4;
        const stuff = ["carne", "hielo", "carbon", "terere"].every((id) => s.items.includes(id));
        if (team && stuff) {
          set({ fire: true });
          winCinema(1);
          return;
        }
        set({ phase: "play", talkKey: null });
        toast(team ? "Falta hielo, carbón, carne o tereré." : "Falta el equipo.");
        return;
      }
      set({ phase: "play", talkKey: null });
      return;
    }
    if (s.line + 1 < script.length) set({ line: s.line + 1 });
    else set({ phase: "play", talkKey: null });
  },
  reset: () => set({ ...blank }),
}));
