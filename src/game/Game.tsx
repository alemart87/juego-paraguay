import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  HAZARDS,
  HAZARD_BY_ID,
  HERO_BY_ID,
  HEROES,
  MISSIONS,
  TALKS,
  TEAM,
  chapterOf,
  objective,
  worldWidth,
  zoneAt,
  type HazardId,
  type HeroId,
} from "./content";
import { axis, bindKeys, pads, setKeys, setPad, wantsPunch } from "./input";
import { useGame } from "./store";

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}

const SPEED = 48;

const ITEM_IMG: Record<string, string> = {
  hielo: "/sprites/terere.png",
  carne: "/sprites/grill.png",
  carbon: "/sprites/fire.png",
  terere: "/sprites/terere.png",
  apuntes: "/sprites/book.png",
  cafe: "/sprites/terere.png",
  cedula: "/sprites/book.png",
  chat: "/sprites/book.png",
  foto: "/sprites/book.png",
};

function Title() {
  const play = useGame((s) => s.play);
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-bg">
      <img
        src="/art/splash.jpg"
        alt="Team UPAP y Juan"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16">
        <button
          type="button"
          onClick={play}
          className="press w-full max-w-xs rounded-full bg-accent py-4 text-lg font-bold text-accent-fg shadow-soft"
        >
          Jugar
        </button>
      </div>
    </div>
  );
}

function Select() {
  const choose = useGame((s) => s.choose);
  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Team UPAP</p>
      <h1 className="mt-1 font-display text-3xl">¿Quién sos hoy?</h1>
      <p className="mt-1 text-sm text-muted">Tres misiones. El asado es apenas el principio.</p>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
        {HEROES.map((hero) => (
          <button
            key={hero.id}
            type="button"
            onClick={() => choose(hero.id)}
            className="press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line"
          >
            <div className="select-stage relative h-44 overflow-hidden bg-black">
              <video
                src={hero.reel}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_18%]"
                autoPlay
                muted
                loop
                playsInline
                poster={hero.portrait}
              />
            </div>
            <div className="px-3 py-2.5">
              <p className="font-display text-lg">{hero.name}</p>
              <p className="text-xs text-muted">{hero.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Missions() {
  const start = useGame((s) => s.startMission);
  const hero = useGame((s) => s.hero);
  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Team UPAP</p>
      <h1 className="mt-1 font-display text-3xl">Elegí la historia</h1>
      <p className="mt-1 text-sm text-muted">
        {hero ? `Jugás como ${HERO_BY_ID[hero].name}.` : ""} Onichan molesta en las tres.
      </p>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        {MISSIONS.map((m) => (
          <button
            key={m.ch}
            type="button"
            onClick={() => start(m.ch)}
            className="press overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line"
          >
            <div className="relative h-28 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${m.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
              <p className="absolute bottom-2 left-3 font-display text-2xl text-paper">{m.title}</p>
            </div>
            <p className="px-3 py-2.5 text-sm leading-snug text-muted">{m.blurb}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Cinema() {
  const clip = useGame((s) => s.clip);
  const skip = useGame((s) => s.skipCinema);
  if (!clip) return null;
  return (
    <button type="button" onClick={skip} className="relative block min-h-dvh w-full overflow-hidden bg-black">
      <video
        src={clip.src}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        playsInline
        muted={!clip.sound}
        onEnded={skip}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{clip.title}</p>
        <p className="mt-1 font-display text-xl text-paper">{clip.line}</p>
        <span className="mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg">
          Saltar
        </span>
      </div>
    </button>
  );
}

function Win() {
  const pick = useGame((s) => s.pickMissions);
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden bg-bg px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))]">
      <img src="/art/splash.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 w-full max-w-xs">
        <button
          type="button"
          onClick={pick}
          className="press w-full rounded-full bg-accent py-4 text-lg font-bold text-accent-fg shadow-soft"
        >
          Otra misión
        </button>
      </div>
    </div>
  );
}

function Talk() {
  const talkKey = useGame((s) => s.talkKey);
  const idx = useGame((s) => s.line);
  const advance = useGame((s) => s.advance);
  if (!talkKey) return null;
  const script = TALKS[talkKey];
  const line = script[idx];
  const face =
    line.who === "narrator"
      ? null
      : (HERO_BY_ID[line.who as HeroId] ?? HAZARD_BY_ID[line.who as HazardId] ?? null);
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-16">
      <div className="rounded-2xl bg-surface/95 p-3 ring-1 ring-line">
        <div className="flex gap-3">
          {face ? (
            <img src={face.portrait} alt="" className="size-14 rounded-xl object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {face ? face.name : "Misión"}
            </p>
            <p className="mt-1 text-sm leading-snug text-paper">{line.text}</p>
          </div>
        </div>
        {line.choices ? (
          <div className="mt-3 grid gap-2">
            {line.choices.map((c, i) => (
              <button
                key={c.label}
                type="button"
                className="press h-11 rounded-xl bg-accent text-sm font-medium text-accent-fg"
                onClick={() => advance(i)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="press mt-3 h-12 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg"
            onClick={() => advance()}
          >
            Seguir
          </button>
        )}
      </div>
    </div>
  );
}

function Actor({
  src,
  steps,
  alt,
  x,
  face,
  walk,
  punch,
  atk = "punch",
  hit,
  fly,
  down,
  explode,
  cry,
  headless,
  shot,
  slashed,
  y = 0,
  rot = 0,
  height,
  bottom,
  z,
}: {
  src: string;
  steps?: string[];
  alt?: string;
  x: number;
  face: number;
  walk?: boolean;
  punch?: boolean;
  atk?: "punch" | "slash" | "aim";
  hit?: boolean;
  fly?: boolean;
  down?: boolean;
  explode?: boolean;
  cry?: boolean;
  headless?: boolean;
  shot?: boolean;
  slashed?: boolean;
  y?: number;
  rot?: number;
  height: string;
  bottom: string;
  z: number;
}) {
  const [fi, setFi] = useState(0);
  const cycling = Boolean(walk && steps && steps.length > 0 && !punch && !fly && !down && !explode);
  useEffect(() => {
    if (!cycling || !steps) {
      setFi(0);
      return;
    }
    const id = window.setInterval(() => setFi((n) => (n + 1) % steps.length), 115);
    return () => window.clearInterval(id);
  }, [cycling, steps]);
  const img = cycling && steps ? steps[fi] : src;
  const swing = punch ? (atk === "slash" ? "actor-slash" : atk === "aim" ? "actor-aim" : "actor-punch") : "";
  const cls = `actor ${explode ? "actor-explode" : fly || down ? "" : punch ? swing : hit ? "actor-hit" : cycling ? "" : cry ? "actor-cry" : "actor-idle"} ${down ? "actor-down" : ""} ${fly ? "actor-fly" : ""} ${headless ? "actor-headless" : ""} ${shot ? "actor-shot" : ""} ${slashed ? "actor-slashed" : ""} object-contain`;
  const style: CSSProperties = {
    left: `${x}vw`,
    height,
    bottom: `calc(${bottom} + ${y}vh)`,
    zIndex: z,
    ["--fx" as string]: String(-face),
    transform: fly || down ? `translateX(-50%) scaleX(var(--fx)) rotate(${rot}deg)` : undefined,
    filter: down ? "saturate(0.7) contrast(1.1)" : undefined,
  };
  return <img src={img} alt={alt ?? ""} draggable={false} className={cls} style={style} />;
}

function Pad({ dir }: { dir: "left" | "right" }) {
  return (
    <button
      type="button"
      className="pointer-events-auto grid size-16 place-items-center rounded-full bg-black/55 text-paper"
      aria-label={dir === "left" ? "Izquierda" : "Derecha"}
      onPointerDown={(e) => downPad(e, dir)}
      onPointerUp={() => setPad(dir, false)}
      onPointerCancel={() => setPad(dir, false)}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}

function downPad(e: PointerEvent<HTMLElement>, dir: "left" | "right") {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.setPointerCapture?.(e.pointerId);
  setPad(dir, true);
}

function Play() {
  const hero = useGame((s) => s.hero) ?? "rafa";
  const x = useGame((s) => s.x);
  const facing = useGame((s) => s.facing);
  const recruited = useGame((s) => s.recruited);
  const items = useGame((s) => s.items);
  const coins = useGame((s) => s.coins);
  const fire = useGame((s) => s.fire);
  const chapter = useGame((s) => s.chapter);
  const examScore = useGame((s) => s.examScore);
  const hazards = useGame((s) => s.hazards);
  const npcX = useGame((s) => s.npcX);
  const attacking = useGame((s) => s.attacking);
  const blood = useGame((s) => s.blood);
  const books = useGame((s) => s.books);
  const shots = useGame((s) => s.shots);
  const impacts = useGame((s) => s.impacts);
  const gibs = useGame((s) => s.gibs);
  const slimes = useGame((s) => s.slimes);
  const slimed = useGame((s) => s.slimed);
  const shake = useGame((s) => s.shake);
  const toast = useGame((s) => s.toast);
  const phase = useGame((s) => s.phase);
  const setX = useGame((s) => s.setX);
  const setFacing = useGame((s) => s.setFacing);
  const startTalk = useGame((s) => s.startTalk);
  const grabCoin = useGame((s) => s.grabCoin);
  const tickHazards = useGame((s) => s.tickHazards);
  const punch = useGame((s) => s.punch);
  const [walking, setWalking] = useState(false);
  const xRef = useRef(x);
  const faceRef = useRef(facing);
  const walkRef = useRef(false);
  xRef.current = x;
  faceRef.current = facing;

  const ch = chapterOf(chapter);
  const width = worldWidth(chapter);
  const cam = Math.max(0, Math.min(width - 100, x - 38));
  const zone = zoneAt(chapter, x);

  const nearNpc = ch.npcs.find((n) => {
    if (Math.abs(x - npcX[n.id]) >= 14 || npcX[n.id] > 900) return false;
    return (
      (chapter === 2 && n.id === "richard") ||
      (chapter === 2 && n.id === "hector") ||
      (chapter === 3 && n.id === "juan") ||
      (chapter === 3 && n.id === "rafa") ||
      !recruited.includes(n.id)
    );
  });
  const nearItem = ch.pickups.find((p) => !items.includes(p.id) && Math.abs(x - p.x) < 10);
  const nearGrill = !!(ch.grillX && Math.abs(x - ch.grillX) < 14);
  const nearExam = !!(
    ch.examX &&
    items.includes("apuntes") &&
    items.includes("cafe") &&
    items.includes("cedula") &&
    items.includes("fuerza") &&
    Math.abs(x - ch.examX) < 14
  );
  const nearHazard = HAZARDS.find((h) => {
    const st = hazards[h.id];
    return st.x < 900 && !st.fly && !st.down && !st.gone && !st.exploding && !st.calm && Math.abs(x - st.x) < 16;
  });
  const chasing = HAZARDS.filter(
    (h) =>
      hazards[h.id].chasing &&
      !hazards[h.id].fly &&
      !hazards[h.id].down &&
      !hazards[h.id].gone &&
      hazards[h.id].x < 900,
  );

  const checks =
    chapter === 1
      ? [
          { t: "Equipo", ok: TEAM.every((id) => id === hero || recruited.includes(id)) },
          { t: "Hielo", ok: items.includes("hielo") },
          { t: "Carne", ok: items.includes("carne") },
          { t: "Tereré", ok: items.includes("terere") },
          { t: "Carbón", ok: items.includes("carbon") },
          { t: "Fuego", ok: fire },
        ]
      : chapter === 2
        ? [
            { t: "Apuntes", ok: items.includes("apuntes") },
            { t: "Café", ok: items.includes("cafe") },
            { t: "Héctor", ok: items.includes("fuerza") },
            { t: "Cédula", ok: items.includes("cedula") },
            { t: "Examen", ok: examScore > 0 },
          ]
        : [
            { t: "Juan", ok: items.includes("aviso") },
            { t: "Chat", ok: items.includes("chat") },
            { t: "Foto", ok: items.includes("foto") },
            { t: "Pablito", ok: items.includes("echar") },
            { t: "Volver", ok: items.includes("honor") },
          ];

  useEffect(() => bindKeys(), []);
  useEffect(() => {
    window.__controlsTest = {
      getX: () => xRef.current,
      getYaw: () => xRef.current,
      getSpeed: () => (pads.left || pads.right || Math.abs(axis()) > 0 ? SPEED : 0),
      setKeys,
    };
    return () => {
      delete window.__controlsTest;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = useGame.getState();
      if (s.phase === "play") {
        const maxX = worldWidth(s.chapter) - 8;
        let dir = axis();
        if (pads.left) dir -= 1;
        if (pads.right) dir += 1;
        dir = Math.max(-1, Math.min(1, dir));
        const moving = dir !== 0;
        if (moving !== walkRef.current) {
          walkRef.current = moving;
          setWalking(moving);
        }
        if (dir) {
          const slow = now - s.slimed < 800;
          const spd = slow ? SPEED * 0.42 : SPEED;
          const nx = Math.max(6, Math.min(maxX, xRef.current + dir * spd * dt));
          xRef.current = nx;
          faceRef.current = dir < 0 ? -1 : 1;
          setX(nx);
          setFacing(faceRef.current);
        }
        if (wantsPunch()) punch();
        tickHazards(dt, xRef.current);
        for (const p of chapterOf(s.chapter).pickups) {
          if (p.kind === "coin" && !s.items.includes(p.id) && Math.abs(xRef.current - p.x) < 6) {
            grabCoin(p.id);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [grabCoin, punch, setFacing, setX, tickHazards]);

  function interact() {
    if (chapter === 3 && nearHazard?.id === "pablito") startTalk("pablito3");
    else if (nearHazard) startTalk(nearHazard.id);
    else if (nearExam) startTalk("examen");
    else if (nearNpc && chapter === 2 && nearNpc.id === "richard") startTalk("richard2");
    else if (nearNpc && chapter === 2 && nearNpc.id === "hector") startTalk("fuerza");
    else if (nearNpc && chapter === 3 && nearNpc.id === "juan") startTalk(items.includes("echar") ? "juan3" : "juanGo");
    else if (nearNpc) startTalk(nearNpc.id);
    else if (nearItem && nearItem.kind === "item" && nearItem.talk) startTalk(nearItem.talk);
    else if (nearGrill) startTalk("grill");
  }

  const followers = recruited.filter(
    (id) =>
      !(
        id === hero ||
        (chapter === 2 && (id === "richard" || id === "hector")) ||
        (chapter === 3 && id === "juan")
      ),
  );
  const canAct = !!(
    nearHazard ||
    nearNpc ||
    (nearItem && nearItem.kind === "item") ||
    nearGrill ||
    nearExam
  );

  const showNpc = (id: HeroId, px: number) => {
    if (id === hero || px > 900) return false;
    if ((chapter === 2 && (id === "richard" || id === "hector")) || (chapter === 3 && (id === "juan" || id === "rafa")))
      return true;
    return !recruited.includes(id);
  };

  return (
    <div
      className={`game-root relative h-dvh overflow-hidden bg-bg ${ch.grade} ${performance.now() - shake < 380 ? "game-shake" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {performance.now() - slimed < 520 ? (
        <img
          src="/sprites/slime.png"
          alt=""
          draggable={false}
          className="slime-hit"
          style={{ left: `${x}vw` }}
        />
      ) : null}
      <div
        className="absolute top-0 h-full will-change-transform"
        style={{ width: `${width}vw`, transform: `translateX(${-cam}vw)` }}
      >
        {ch.zones.map((z, i) => (
          <div
            key={z.id}
            className="absolute top-0 h-full bg-cover bg-center"
            style={{ left: `${i * 100}vw`, width: "101.2vw", backgroundImage: `url(${z.bg})` }}
          />
        ))}
        {ch.props.map((p, i) => (
          <img
            key={`${p.src}-${i}`}
            src={p.src}
            alt=""
            draggable={false}
            className="absolute bottom-[10%] z-[2] object-contain"
            style={{ left: `${p.x}vw`, height: `${p.h}vh`, transform: p.flip ? "scaleX(-1) translateX(50%)" : "translateX(-50%)" }}
          />
        ))}
        {ch.pickups.map((p) =>
          items.includes(p.id) ? null : p.kind === "coin" ? (
            <img
              key={p.id}
              src="/sprites/coin.png"
              alt=""
              draggable={false}
              className="weapon-drop"
              style={{ left: `${p.x}vw`, height: 22, width: 22 }}
            />
          ) : (
            <img
              key={p.id}
              src={ITEM_IMG[p.id] ?? "/sprites/book.png"}
              alt=""
              draggable={false}
              className="weapon-drop"
              style={{ left: `${p.x}vw`, height: 36, width: 36 }}
            />
          ),
        )}
        {ch.npcs.map((n) =>
          showNpc(n.id, npcX[n.id]) ? (
            <Actor
              key={n.id}
              src={HERO_BY_ID[n.id].sprite}
              steps={HERO_BY_ID[n.id].steps}
              alt={HERO_BY_ID[n.id].name}
              x={npcX[n.id]}
              face={npcX[n.id] < x ? 1 : -1}
              height="32vh"
              bottom="9%"
              z={3}
            />
          ) : null,
        )}
        {followers.map((id, i) => (
          <Actor
            key={`f-${id}`}
            src={HERO_BY_ID[id as HeroId].sprite}
            steps={HERO_BY_ID[id as HeroId].steps}
            alt={HERO_BY_ID[id as HeroId].name}
            x={x - facing * (9 + i * 8)}
            face={facing}
            walk={walking && !attacking}
            height="26vh"
            bottom="8%"
            z={4}
          />
        ))}
        {blood.map((b) => (
          <span
            key={b.id}
            className="blood"
            style={{
              left: `${b.x}vw`,
              bottom: `${b.y}%`,
              width: b.w,
              height: b.h,
              transform: `translateX(-50%) rotate(${b.rot}deg)`,
            }}
          />
        ))}
        {HAZARDS.filter((h) => hazards[h.id].x < 900 && !hazards[h.id].gone).map((h) => {
          const st = hazards[h.id];
          if (st.torn) {
            return (
              <span key={h.id}>
                <img
                  src={h.sprite}
                  alt=""
                  draggable={false}
                  className="torn-half torn-top object-contain"
                  style={{
                    left: `${st.x - 3}vw`,
                    bottom: `calc(10% + ${st.y + 6}vh)`,
                    height: "18vh",
                    zIndex: 6,
                    transform: `translateX(-50%) rotate(${st.rot * 0.45 - 18}deg)`,
                  }}
                />
                <img
                  src={h.sprite}
                  alt=""
                  draggable={false}
                  className="torn-half torn-bot object-contain"
                  style={{
                    left: `${st.x + 4}vw`,
                    bottom: `calc(10% + ${Math.max(0, st.y - 2)}vh)`,
                    height: "16vh",
                    zIndex: 6,
                    transform: `translateX(-50%) rotate(${st.rot * 0.7 + 22}deg)`,
                  }}
                />
              </span>
            );
          }
          return (
            <span key={h.id}>
              <Actor
                src={h.sprite}
                steps={h.steps}
                alt={h.name}
                x={st.x}
                face={st.x < x ? 1 : -1}
                walk={st.chasing && !st.fly && !st.down && !st.exploding}
                explode={st.exploding}
                cry={st.cry}
                headless={st.headless}
                hit={st.fly}
                fly={st.fly}
                down={st.down}
                shot={st.hurt === "gun"}
                slashed={st.hurt === "slash"}
                y={st.y}
                rot={st.rot}
                height="30vh"
                bottom="8%"
                z={h.id === "onichan" ? 6 : 4}
              />
              {!st.fly && !st.exploding && !st.down ? (
                <span
                  className={`npc-tag ${h.id === "onichan" ? "npc-tag-hot" : ""}`}
                  style={{ left: `${st.x}vw`, bottom: "40%" }}
                >
                  {h.name}
                </span>
              ) : null}
            </span>
          );
        })}
        {books.map((b) => (
          <img
            key={b.id}
            src="/sprites/book.png"
            alt=""
            draggable={false}
            className="book-shot"
            style={{ left: `${b.x}vw`, bottom: `${b.y}%`, transform: `rotate(${b.rot}deg)` }}
          />
        ))}
        {slimes.map((sl) => (
          <img
            key={sl.id}
            src="/sprites/slime.png"
            alt=""
            draggable={false}
            className="slime-shot"
            style={{ left: `${sl.x}vw`, bottom: `${sl.y}%` }}
          />
        ))}
        {hazards.onichan && hazards.onichan.x < 900 && !hazards.onichan.gone ? (
          <img
            src="/sprites/capi.png"
            alt="Capi"
            draggable={false}
            className={`capi-pet ${hazards.onichan.chasing ? "capi-run" : ""} ${performance.now() - hazards.onichan.lastThrow < 340 ? "capi-atk" : ""}`}
            style={{
              left: `${hazards.onichan.x + (hazards.onichan.x < x ? -12 : 12)}vw`,
              bottom: `calc(8% + ${hazards.onichan.y}vh)`,
              zIndex: 7,
              height: "12vh",
              transform: hazards.onichan.fly ? `rotate(${hazards.onichan.rot}deg)` : undefined,
            }}
          />
        ) : null}
        {shots.map((b) => (
          <img
            key={b.id}
            src="/sprites/bullet.png"
            alt=""
            draggable={false}
            className="bullet-shot"
            style={{
              left: `${b.x}vw`,
              bottom: `${b.y}%`,
              transform: `translateX(-50%) scaleX(${-b.face})`,
            }}
          />
        ))}
        {gibs.map((g) => (
          <img
            key={g.id}
            src={g.src}
            alt=""
            draggable={false}
            className="gib"
            style={{
              left: `${g.x}vw`,
              bottom: `${g.y}%`,
              transform: `translateX(-50%) rotate(${g.rot}deg)`,
            }}
          />
        ))}
        {impacts.map((fx) => (
          <img
            key={fx.id}
            src={
              fx.kind === "slash"
                ? "/sprites/slash.png"
                : fx.kind === "muzzle"
                  ? "/sprites/muzzle.png"
                  : fx.kind === "boom"
                    ? "/sprites/boom.png"
                    : fx.kind === "tracer"
                      ? "/sprites/tracer.png"
                      : "/sprites/impact.png"
            }
            alt=""
            draggable={false}
            className={`fx-${fx.kind}`}
            style={{
              left: `${fx.x}vw`,
              bottom: `${fx.y}%`,
              ["--wx" as string]: String(-facing),
            }}
          />
        ))}
        <Actor
          src={HERO_BY_ID[hero].sprite}
          steps={HERO_BY_ID[hero].steps}
          alt={HERO_BY_ID[hero].name}
          x={x}
          face={facing}
          walk={walking && !attacking}
          punch={attacking}
          atk="aim"
          height="34vh"
          bottom="8%"
          z={5}
        />
        <img
          src="/sprites/pistol.png"
          alt=""
          draggable={false}
          className={`held-weapon held-pistol ${attacking ? "held-fire" : ""}`}
          style={{
            left: `${x + facing * 3.4}vw`,
            bottom: "28%",
            zIndex: 6,
            height: 38,
            width: 54,
            ["--wx" as string]: String(-facing),
            transform: `translateX(-50%) scaleX(${-facing})`,
          }}
        />
        {ch.grillX ? (
          <img
            src="/sprites/fire.png"
            alt=""
            draggable={false}
            className="absolute bottom-[16%] z-[2] h-[16vh] -translate-x-1/2 object-contain"
            style={{
              left: `${ch.grillX}vw`,
              opacity: fire ? 1 : 0.45,
              filter: fire ? "none" : "grayscale(0.5)",
            }}
          />
        ) : null}
      </div>

      <div
        className="absolute inset-y-0 left-0 z-[8] w-[36%]"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => downPad(e, "left")}
        onPointerUp={() => setPad("left", false)}
        onPointerCancel={() => setPad("left", false)}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      />
      <div
        className="absolute inset-y-0 right-0 z-[8] w-[36%]"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => downPad(e, "right")}
        onPointerUp={() => setPad("right", false)}
        onPointerCancel={() => setPad("right", false)}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="rounded-xl bg-black/70 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-400">
            {ch.title} · {zone.name}
          </p>
          <p className="mission-alert max-w-[22ch] font-display text-[15px] leading-tight">
            {objective({ recruited, items, hero, chapter, hazards })}
          </p>
          <ul className="mt-1 space-y-0.5">
            {checks.map((c) => (
              <li key={c.t} className={`text-[10px] ${c.ok ? "text-accent" : "text-paper/70"}`}>
                {c.ok ? "✓" : "○"} {c.t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-black/70 px-2 py-1 text-[11px] text-accent">{coins} Gs</span>
          <span className="flex items-center rounded-md bg-black/70 px-1.5 py-1">
            <img src="/sprites/pistol.png" alt="" className="h-5 w-7 object-contain" />
          </span>
          {TEAM.map((id) => (
            <img
              key={id}
              src={HERO_BY_ID[id].portrait}
              alt=""
              draggable={false}
              className={
                recruited.includes(id)
                  ? "size-8 rounded-full object-cover ring-2 ring-accent"
                  : "size-8 rounded-full object-cover opacity-30 grayscale"
              }
            />
          ))}
        </div>
      </div>

      {toast ? (
        <div className="toast-alert pointer-events-none absolute left-1/2 top-36 z-20 w-max max-w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 px-4 py-2 text-center text-sm">
          {toast}
        </div>
      ) : null}

      <p className="pointer-events-none absolute bottom-[28%] left-1/2 z-[9] -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-paper">
        {chasing.length
          ? `¡${chasing.map((h) => h.name).join(" y ")} te persigue!`
          : nearExam
            ? "El examen está listo"
            : nearHazard
              ? `${nearHazard.name} está cerca`
              : nearNpc
                ? `${HERO_BY_ID[nearNpc.id].name} está cerca`
                : nearItem?.kind === "item"
                  ? "Hay algo acá"
                  : nearGrill
                    ? "El quincho"
                    : "Andá a la derecha →"}
      </p>

      <div className="pointer-events-none absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-0 right-0 z-10 flex items-end justify-between px-4">
        <Pad dir="left" />
        <div className="pointer-events-auto mb-2 flex flex-col items-center gap-2">
          {canAct ? (
            <button
              type="button"
              className="press min-h-12 min-w-14 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-soft"
              onClick={interact}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {nearExam ? "Rendir" : nearHazard || nearNpc ? "Hablar" : nearGrill ? "Asado" : "Agarrar"}
            </button>
          ) : null}
          <button
            type="button"
            className="press grid size-16 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg shadow-soft"
            aria-label="Disparar"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              pads.punch = true;
              punch();
            }}
            onPointerUp={() => {
              pads.punch = false;
            }}
            onPointerCancel={() => {
              pads.punch = false;
            }}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            Fuego
          </button>
        </div>
        <Pad dir="right" />
      </div>

      {phase === "talk" ? <Talk /> : null}
    </div>
  );
}

export function Game() {
  const [ready, setReady] = useState(false);
  const phase = useGame((s) => s.phase);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) return null;
  if (phase === "title") return <Title />;
  if (phase === "select") return <Select />;
  if (phase === "missions") return <Missions />;
  if (phase === "cinema") return <Cinema />;
  if (phase === "win") return <Win />;
  return <Play />;
}
