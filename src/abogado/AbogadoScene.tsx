import { useEffect, useRef, useState } from "react";
import { Camera, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { sfx, vibrate } from "@/game/audio";
import {
  createWorld,
  drainEvents,
  layout,
  resize,
  result,
  snapshot,
  step,
  tapAt,
  throwPunch,
  WEAPON_STATS,
  activeWeapon,
  type RunResult,
  type Snapshot,
  type Weapon,
  type World,
} from "./engine";
import { buildArt, drawScene, type Art } from "./render";
import { captureFrame, shareBlob } from "./share";

let lastSpeak = 0;
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const now = performance.now();
  if (now - lastSpeak < 1400) return;
  lastSpeak = now;
  const u = new SpeechSynthesisUtterance(text.replace(/[¡!¿?]/g, ""));
  const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("es"));
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "es-PY";
  u.pitch = 1.25;
  u.rate = 1.2;
  u.volume = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

type QaWindow = Window & {
  __abogado?: { world: () => World; punch: (x: number, y: number) => void };
};

export function AbogadoScene({
  mode,
  weapon,
  goldTitle,
  soundOn,
  onToggleSound,
  onEnd,
}: {
  mode: "demo" | "play";
  weapon: Weapon;
  goldTitle: boolean;
  soundOn: boolean;
  onToggleSound?: () => void;
  onEnd?: (run: RunResult, shot: HTMLCanvasElement | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const artRef = useRef<Art | null>(null);
  const shotRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(false);
  const soundRef = useRef(soundOn);
  const onEndRef = useRef(onEnd);
  const [hud, setHud] = useState<Snapshot | null>(null);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");

  soundRef.current = soundOn;
  onEndRef.current = onEnd;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const w = createWorld({ weapon, goldTitle, demo: mode === "demo" });
    worldRef.current = w;
    artRef.current = buildArt();
    const pointers = new Map<number, { x: number; y: number; at: number; side: -1 | 1 }>();

    const fit = () => {
      const cw = wrap.clientWidth || 360;
      const ch = wrap.clientHeight || 640;
      const P = Math.max(2, Math.floor(Math.min(cw / 96, ch / 128)));
      const W = Math.ceil(cw / P);
      const H = Math.ceil(ch / P);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${W * P}px`;
      canvas.style.height = `${H * P}px`;
      resize(w, W, H);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const toLogical = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * w.W,
        y: ((e.clientY - r.top) / r.height) * w.H,
      };
    };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      if (pausedRef.current) return;
      const p = toLogical(e);
      tapAt(w, p.x, p.y);
      const side: -1 | 1 = activeWeapon(w) === "mazo" ? 1 : p.x < w.W / 2 ? -1 : 1;
      pointers.set(e.pointerId, { ...p, at: w.t, side });
      w.charging = { side, start: w.t };
    };
    const up = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      if (!p) return;
      if (w.charging?.side === p.side) w.charging = null;
      const need = WEAPON_STATS[activeWeapon(w)].charge;
      if (w.t - p.at >= need && !pausedRef.current) throwPunch(w, p.x, p.y, p.side, true);
    };
    const cancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      w.charging = null;
    };
    const keyHeld = new Map<string, number>();
    const keyTarget = (key: string) => {
      const L = layout(w);
      switch (key) {
        case "a":
        case "arrowleft":
          return { x: L.headCx - 4, y: L.headCy, side: -1 as const };
        case "d":
        case "arrowright":
          return { x: L.headCx + 4, y: L.headCy, side: 1 as const };
        case "s":
        case "arrowdown":
          return {
            x: L.cx + (Math.random() < 0.5 ? -10 : 10),
            y: L.neckY + 26,
            side: (Math.random() < 0.5 ? -1 : 1) as -1 | 1,
          };
        case "w":
        case "arrowup":
        case " ":
          return { x: L.headCx, y: L.headCy + 6, side: 1 as const };
        default:
          return null;
      }
    };
    const keydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "p" || key === "escape") {
        if (mode === "play") setPausedBoth(!pausedRef.current);
        return;
      }
      const t = keyTarget(key);
      if (!t || pausedRef.current) return;
      e.preventDefault();
      if (e.repeat) return;
      keyHeld.set(key, w.t);
      w.charging = { side: t.side, start: w.t };
      throwPunch(w, t.x, t.y, t.side);
    };
    const keyup = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const at = keyHeld.get(key);
      keyHeld.delete(key);
      w.charging = null;
      const t = keyTarget(key);
      if (at === undefined || !t) return;
      if (w.t - at >= WEAPON_STATS[activeWeapon(w)].charge) throwPunch(w, t.x, t.y, t.side, true);
    };
    const setPausedBoth = (v: boolean) => {
      pausedRef.current = v;
      setPaused(v);
    };
    const hidden = () => {
      if (document.hidden && mode === "play") setPausedBoth(true);
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    document.addEventListener("visibilitychange", hidden);
    (window as QaWindow).__abogado = {
      world: () => w,
      punch: (x, y) => tapAt(w, x, y),
    };

    let raf = 0;
    let last = performance.now();
    let hudAt = 0;
    let snapAt = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) step(w, dt);
      drawScene(w, ctx, artRef.current!);
      for (const ev of drainEvents(w)) {
        if (ev.type === "sfx") {
          if (soundRef.current) sfx(ev.name);
        } else if (ev.type === "say") {
          if (soundRef.current && mode === "play") speak(ev.text);
        } else if (ev.type === "vibrate") vibrate(ev.ms);
        else if (ev.type === "snap") {
          // Wait for the KO flash to fade so the share card gets a clean action frame.
          if (!ev.fallback || !shotRef.current) snapAt = now + (ev.fallback ? 0 : 320);
        } else if (ev.type === "end") onEndRef.current?.(result(w), shotRef.current);
      }
      if (snapAt && now >= snapAt) {
        snapAt = 0;
        const shot = shotRef.current ?? document.createElement("canvas");
        shot.width = canvas.width;
        shot.height = canvas.height;
        const sc = shot.getContext("2d")!;
        sc.imageSmoothingEnabled = false;
        sc.drawImage(canvas, 0, 0);
        shotRef.current = shot;
      }
      if (mode === "play" && now - hudAt > 90) {
        hudAt = now;
        setHud(snapshot(w));
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      document.removeEventListener("visibilitychange", hidden);
      delete (window as QaWindow).__abogado;
      if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, [mode, weapon, goldTitle]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  const screenshot = async () => {
    const canvas = canvasRef.current;
    const w = worldRef.current;
    if (!canvas || !w) return;
    if (soundRef.current) sfx("ui");
    try {
      const blob = await captureFrame(canvas, w.score);
      const how = await shareBlob(
        blob,
        `hernan-rivas-abogado-${Date.now()}.png`,
        `Le estoy pegando a Hernán Rivas: ${w.score.toLocaleString("es-PY")} puntos 🥊`,
      );
      setToast(
        how === "downloaded" ? "📸 Captura guardada" : how === "shared" ? "📸 ¡Compartida!" : "",
      );
    } catch {
      setToast("No se pudo capturar");
    }
    setTimeout(() => setToast(""), 1800);
  };

  const hpPct = hud ? Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100)) : 100;
  const secs = hud ? Math.ceil(hud.timeLeft) : 60;

  return (
    <div className={`ab-scene ab-scene-${mode}`} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="ab-canvas"
        aria-label="Ring: tocá la cara o el cuerpo del abogado para pegarle"
        onContextMenu={(e) => e.preventDefault()}
      />
      {mode === "play" && hud && (
        <div className="ab-hud">
          <div className="ab-hud-top">
            <div className="ab-hud-score">
              <small>PUNTOS</small>
              <strong>{hud.score.toLocaleString("es-PY")}</strong>
            </div>
            <div className={`ab-hud-time ${secs <= 10 ? "urgent" : ""}`}>{secs}</div>
            <div className="ab-hud-actions">
              <button aria-label="Sacar captura" onClick={() => void screenshot()}>
                <Camera size={18} />
              </button>
              <button aria-label={soundOn ? "Silenciar" : "Activar sonido"} onClick={onToggleSound}>
                {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button aria-label={paused ? "Reanudar" : "Pausa"} onClick={togglePause}>
                {paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
            </div>
          </div>
          <div className="ab-hud-bar">
            <span>
              H. RIVAS · RND {hud.round}
              {hud.kos > 0 ? ` · ${hud.kos} K.O.` : ""}
            </span>
            <div className="ab-hp">
              <i style={{ width: `${hpPct}%` }} />
            </div>
          </div>
          {hud.combo >= 2 && (
            <div className="ab-combo" key={hud.combo}>
              COMBO <b>×{hud.combo}</b>
            </div>
          )}
          {hud.bonusMazo > 0 && (
            <div className="ab-bonus">🔨 MAZO DORADO {hud.bonusMazo.toFixed(1)}s</div>
          )}
        </div>
      )}
      {toast && <div className="ab-toast">{toast}</div>}
      {paused && mode === "play" && (
        <div className="ab-pause">
          <strong>PAUSA</strong>
          <button className="ab-btn ab-btn-primary" onClick={togglePause}>
            <Play size={16} /> SEGUIR PEGANDO
          </button>
        </div>
      )}
    </div>
  );
}
