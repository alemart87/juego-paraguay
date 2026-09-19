import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { ArrowUp, ChevronsRight, Crosshair, Flame, Hand, Pause, Repeat2, Zap } from "lucide-react";
import { configureAudio, sfx, unlockAudio } from "../game/audio";
import {
  drainEvents,
  snapshot,
  step,
  type Action,
  type GameEvent,
  type Input,
  type Snapshot,
  type World,
} from "./engine";
import { loadArt, render } from "./render";
import { episode, fighter, WEAPON_LABEL } from "./content";
import type { Save } from "./persistence";

type ControlsProbe = {
  getX: () => number;
  getY: () => number;
  getSpeed: () => number;
  getYaw: () => number;
  setKeys: (keys: string[]) => void;
};
declare global {
  interface Window {
    __battleControls?: ControlsProbe;
    __battleWorld?: () => World;
    __battleStep?: (move: number, attack: boolean, actions: Action[]) => void;
  }
}
const KEY_ACTION: Record<string, Action> = {
  Space: "jump",
  KeyW: "jump",
  ArrowUp: "jump",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  KeyR: "power",
  KeyQ: "swap",
  KeyG: "grenade",
  KeyE: "interact",
};
export function Scene({
  world,
  settings,
  onEvent,
  onPause,
}: {
  world: World;
  settings: Save;
  onEvent: (e: GameEvent) => void;
  onPause: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const input = useRef<Input>({ move: 0, attack: false, actions: new Set() });
  const held = useRef(new Set<string>());
  const callbacks = useRef({ onEvent, onPause });
  callbacks.current = { onEvent, onPause };
  const touch = useRef({ move: 0, attack: false });
  const joy = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<Snapshot>(() => snapshot(world));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [fps, setFps] = useState(60);
  const clear = () => {
    held.current.clear();
    input.current.actions.clear();
    input.current.move = 0;
    input.current.attack = false;
    touch.current = { move: 0, attack: false };
    if (joy.current) joy.current.style.transform = "translate(0px, 0px)";
  };
  useEffect(() => {
    let disposed = false,
      raf = 0,
      last = 0,
      accumulator = 0,
      hudAt = 0,
      frames = 0,
      fpsAt = performance.now();
    let ratio = 1;
    let smoothFrame = 16;
    const ctx = canvas.current!.getContext("2d", { alpha: false })!;
    const resize = () => {
      if (!canvas.current || !stage.current) return;
      const r = stage.current.getBoundingClientRect();
      ratio = Math.min(settings.quality === "low" ? 1 : 1.5, window.devicePixelRatio || 1);
      canvas.current.width = Math.round(r.width * ratio);
      canvas.current.height = Math.round(r.height * ratio);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage.current!);
    resize();
    configureAudio(settings.sound, 0.85);
    const keydown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "Space",
          "KeyA",
          "KeyD",
          "KeyJ",
          "KeyW",
          "KeyR",
          "KeyG",
          "KeyQ",
          "KeyE",
          "ShiftLeft",
          "ShiftRight",
          "Escape",
        ].includes(e.code)
      )
        e.preventDefault();
      if (e.code === "Escape") {
        clear();
        callbacks.current.onPause();
        return;
      }
      if (world.paused) return;
      if (!e.repeat && KEY_ACTION[e.code]) input.current.actions.add(KEY_ACTION[e.code]);
      held.current.add(e.code);
    };
    const keyup = (e: KeyboardEvent) => held.current.delete(e.code);
    const blur = () => {
      clear();
      if (!world.ended && !world.paused) callbacks.current.onPause();
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    if (import.meta.env.DEV || new URLSearchParams(location.search).has("qa")) {
      window.__battleControls = {
        getX: () => world.player.x,
        getY: () => world.player.y,
        getSpeed: () => world.player.vx,
        getYaw: () => world.player.face,
        setKeys: (keys) => {
          held.current = new Set(keys);
          for (const key of keys) if (KEY_ACTION[key]) input.current.actions.add(KEY_ACTION[key]);
        },
      };
      window.__battleWorld = () => world;
      window.__battleStep = (move, attack, actions) =>
        step(world, { move, attack, actions: new Set(actions) }, 1 / 60);
    }
    loadArt(world.level)
      .then((art) => {
        if (disposed) return;
        setReady(true);
        const loop = (now: number) => {
          if (disposed) return;
          const delta = last ? Math.min(0.1, (now - last) / 1000) : 0;
          last = now;
          smoothFrame = smoothFrame * 0.95 + delta * 1000 * 0.05;
          if (world.paused) {
            clear();
            accumulator = 0;
          } else accumulator += delta;
          input.current.move =
            touch.current.move ||
            (held.current.has("KeyD") || held.current.has("ArrowRight") ? 1 : 0) -
              (held.current.has("KeyA") || held.current.has("ArrowLeft") ? 1 : 0);
          input.current.attack = touch.current.attack || held.current.has("KeyJ");
          let steps = 0;
          while (accumulator >= 1 / 60 && steps < 6) {
            step(world, input.current, 1 / 60);
            input.current.actions.clear();
            accumulator -= 1 / 60;
            steps++;
          }
          if (steps >= 6) accumulator = 0;
          for (const e of drainEvents(world)) {
            if (e.type === "sfx") sfx(e.name);
            else callbacks.current.onEvent(e);
          }
          if (now - hudAt > 100) {
            setHud(snapshot(world));
            hudAt = now;
          }
          if (!canvas.current || !stage.current || disposed) return;
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          render(
            ctx,
            world,
            art,
            canvas.current!.width / ratio,
            canvas.current!.height / ratio,
            settings.shake,
          );
          frames++;
          if (now - fpsAt > 1000) {
            setFps(Math.min(120, Math.round((frames * 1000) / (now - fpsAt))));
            frames = 0;
            fpsAt = now;
            if (settings.quality === "auto" && smoothFrame > 24 && ratio > 1) {
              ratio = 1;
              const r = stage.current!.getBoundingClientRect();
              canvas.current!.width = Math.round(r.width);
              canvas.current!.height = Math.round(r.height);
            }
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      })
      .catch((e) => {
        if (!disposed) setError(e instanceof Error ? e.message : "No se pudo cargar el escenario.");
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      clear();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      delete window.__battleControls;
      delete window.__battleWorld;
      delete window.__battleStep;
    };
  }, [world, settings.quality, settings.shake, settings.sound]);
  const trigger = (a: Action) => {
    unlockAudio();
    input.current.actions.add(a);
  };
  const stickPointer = useRef<number | null>(null);
  const updateStick = (e: PointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== e.pointerId) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = Math.max(-36, Math.min(36, e.clientX - r.left - r.width / 2));
    const dy = Math.max(-24, Math.min(24, e.clientY - r.top - r.height / 2));
    touch.current.move = Math.abs(dx) < 5 ? 0 : dx / 36;
    if (joy.current) joy.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const releaseStick = () => {
    stickPointer.current = null;
    touch.current.move = 0;
    if (joy.current) joy.current.style.transform = "translate(0px,0px)";
  };
  const f = fighter(world.hero);
  return (
    <div className={`battle-stage ${settings.leftHanded ? "left-handed" : ""}`} ref={stage}>
      <canvas ref={canvas} aria-label={`Batalla en ${episode(world.level).location}`} />
      {!ready && (
        <div className="stage-loading">
          <span className="loading-mark">IB</span>
          <h2>{error ? "No cargó el escenario" : "Preparando el quilombo…"}</h2>
          <p>{error || "Cargando personajes y locación"}</p>
          {error && (
            <button className="primary" onClick={() => location.reload()}>
              Reintentar
            </button>
          )}
        </div>
      )}
      <div className="battle-hud">
        <div className="health-block">
          <img src={f.portrait} alt="" />
          <div>
            <strong>{f.name}</strong>
            <div className="health-track">
              <i style={{ width: `${(hud.hp / hud.maxHp) * 100}%` }} />
            </div>
            <span>
              {hud.hp} / {hud.maxHp} <span className="hud-small">VIDA</span>
            </span>
          </div>
        </div>
        <div className="score-block">
          <small>PUNTOS</small>
          <b>{Math.round(hud.score).toLocaleString("es-PY")}</b>
          {hud.combo > 1 && <span>COMBO ×{hud.combo}</span>}
        </div>
        <button
          className="icon-button pause-button"
          aria-label="Pausar"
          onClick={() => {
            clear();
            onPause();
          }}
        >
          <Pause size={21} />
        </button>
      </div>
      <div className="mission-hud">
        <span>{String(world.level).padStart(2, "0")} / 04</span>
        <p>{hud.objective}</p>
        <div className="mission-track">
          <i style={{ width: `${hud.progress * 100}%` }} />
        </div>
      </div>
      {hud.boss && (
        <div className="boss-hud">
          <div>
            <strong>{hud.boss.name}</strong>
            <span>
              FASE {hud.boss.phase}
              {hud.boss.maxLives > 1 ? ` · VIDA ${hud.boss.lives}/${hud.boss.maxLives}` : ""}
            </span>
          </div>
          <div className="boss-track">
            <i style={{ width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%` }} />
          </div>
        </div>
      )}
      <div className="weapon-hud">
        <button onClick={() => trigger("swap")} aria-label="Cambiar arma">
          <Crosshair size={19} />
          <span>
            {WEAPON_LABEL[hud.weapon]}
            <small>{Number.isFinite(hud.ammo) ? `${hud.ammo} balas` : "Sin límite"}</small>
          </span>
          <Repeat2 size={16} />
        </button>
      </div>
      <div className="hype-hud">
        <div>
          <Zap size={14} />
          <b>{hud.super === 100 ? "SÚPER LISTO" : `${hud.super}% HYPE`}</b>
        </div>
        <i style={{ width: `${hud.super}%` }} />
      </div>
      {hud.interact && (
        <button className="interact-button" onClick={() => trigger("interact")}>
          <Hand size={19} />
          {hud.interact}
          <kbd>E</kbd>
        </button>
      )}
      <div className="touch-controls">
        <div
          className="joystick"
          role="group"
          aria-label="Joystick de movimiento"
          onPointerDown={(e) => {
            if (stickPointer.current !== null) return;
            stickPointer.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            unlockAudio();
            updateStick(e);
          }}
          onPointerMove={updateStick}
          onPointerUp={releaseStick}
          onPointerCancel={releaseStick}
          onLostPointerCapture={releaseStick}
        >
          <span className="joystick-axis">‹ ›</span>
          <div ref={joy} className="joystick-knob" />
        </div>
        <div className="action-pad">
          <Pad
            className="power-pad"
            label={hud.super === 100 ? "Súper" : f.power}
            onDown={() => trigger("power")}
          >
            <Zap />
            <small>
              {hud.super === 100
                ? "SÚPER"
                : hud.cooldown > 0
                  ? `${Math.ceil(hud.cooldown)}s`
                  : "PODER"}
            </small>
          </Pad>
          <Pad className="dash-pad" label="Esquivar" onDown={() => trigger("dash")}>
            <ChevronsRight />
            <small>ESQUIVAR</small>
          </Pad>
          <Pad
            className="attack-pad"
            label="Atacar"
            onDown={() => {
              unlockAudio();
              touch.current.attack = true;
            }}
            onUp={() => (touch.current.attack = false)}
          >
            <Crosshair size={29} />
            <small>ATACAR</small>
          </Pad>
          <Pad className="jump-pad" label="Saltar" onDown={() => trigger("jump")}>
            <ArrowUp size={24} />
            <small>SALTAR</small>
          </Pad>
          <Pad className="grenade-pad" label="Lanzar granada" onDown={() => trigger("grenade")}>
            <Flame size={16} />
            <small>{hud.grenades}</small>
          </Pad>
        </div>
      </div>
      <div className="keyboard-help">
        <span>
          <kbd>A</kbd>
          <kbd>D</kbd> mover
        </span>
        <span>
          <kbd>ESPACIO</kbd> saltar
        </span>
        <span>
          <kbd>J</kbd> atacar
        </span>
        <span>
          <kbd>SHIFT</kbd> esquivar
        </span>
        <span>
          <kbd>R</kbd> poder
        </span>
        <span>
          <kbd>Q</kbd> arma
        </span>
        <span>
          <kbd>G</kbd> granada
        </span>
      </div>
      <span className="performance-mark">
        {fps} FPS · {Math.floor(hud.time / 60)}:{String(Math.floor(hud.time % 60)).padStart(2, "0")}
      </span>
    </div>
  );
}
function Pad({
  children,
  label,
  onDown,
  onUp,
  className,
}: {
  children: ReactNode;
  label: string;
  onDown: () => void;
  onUp?: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      className={`pad-button ${className}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={onUp}
    >
      {children}
    </button>
  );
}
