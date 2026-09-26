import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Camera, Lock, Pause, Play, Volume2, VolumeX } from "lucide-react";
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
  selectWeapon,
  sendToJail,
  throwPunch,
  WEAPON_IDS,
  WEAPON_STATS,
  weaponSide,
  activeWeapon,
  type RunResult,
  type Snapshot,
  type Weapon,
  type World,
} from "./engine";
import { drawScene, loadArt, type Art } from "./render";
import { captureFrame } from "./share";
import { ShareSheet } from "./ShareSheet";
import { GameIcon } from "./GameIcon";

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
  const cackle = /ja/i.test(text);
  u.pitch = cackle ? 1.8 : 1.25;
  u.rate = cackle ? 1.4 : 1.2;
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
  owned = ["punos"],
  prices = {},
  soundOn,
  onToggleSound,
  onEnd,
  onLockedWeapon,
  hold = false,
}: {
  mode: "demo" | "play";
  weapon: Weapon;
  goldTitle: boolean;
  owned?: Weapon[];
  prices?: Partial<Record<Weapon, number>>;
  soundOn: boolean;
  onToggleSound?: () => void;
  onEnd?: (run: RunResult, shot: HTMLCanvasElement | null) => void;
  /** Tapped a weapon whose free try is spent: offer the purchase in-game. */
  onLockedWeapon?: (id: Weapon) => void;
  /** External pause (e.g. the in-game purchase dialog is open). */
  hold?: boolean;
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
  const [share, setShare] = useState<{ blob: Blob; score: number; resume: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ownedKey = owned.join(",");
  const pricesRef = useRef(prices);
  pricesRef.current = prices;
  const [offer, setOffer] = useState<Weapon | null>(null);
  const offerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialOwned = useRef(owned);

  const flash = (msg: string, ms = 1900) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), ms);
  };

  soundRef.current = soundOn;
  onEndRef.current = onEnd;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const w = createWorld({
      weapon,
      goldTitle,
      demo: mode === "demo",
      owned: [...initialOwned.current],
    });
    worldRef.current = w;
    let alive = true;
    void loadArt()
      .then((art) => {
        if (alive) artRef.current = art;
      })
      .catch(() => undefined);
    const pointers = new Map<number, { x: number; y: number; at: number; side: -1 | 1 }>();

    // Logical units keep the engine resolution-independent; the backing store is
    // sized in device pixels so the photo and vectors stay sharp.
    let unit = 1;
    const fit = () => {
      const cw = wrap.clientWidth || 360;
      const ch = wrap.clientHeight || 640;
      const P = Math.min(cw / 96, ch / 128);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      unit = P * dpr;
      resize(w, cw / P, ch / P);
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
      const side = weaponSide(activeWeapon(w), p.x < w.W / 2 ? -1 : 1);
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
      ctx.setTransform(unit, 0, 0, unit, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawScene(w, ctx, artRef.current);
      for (const ev of drainEvents(w)) {
        if (ev.type === "sfx") {
          if (soundRef.current) sfx(ev.name);
        } else if (ev.type === "say") {
          if (soundRef.current && mode === "play") speak(ev.text);
        } else if (ev.type === "vibrate") vibrate(ev.ms);
        else if (ev.type === "trial") {
          // Tappable offer right after the free hit
          setOffer(ev.weapon);
          if (offerTimer.current) clearTimeout(offerTimer.current);
          offerTimer.current = setTimeout(() => setOffer(null), 4500);
        } else if (ev.type === "snap") {
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
      alive = false;
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
    // The world is only rebuilt for a new run; purchases update it in place below.
  }, [mode, weapon, goldTitle]);

  // A weapon bought mid-match unlocks immediately without restarting the round.
  useEffect(() => {
    const w = worldRef.current;
    if (!w) return;
    const list = ownedKey.split(",") as Weapon[];
    const fresh = list.filter((id) => !w.owned.includes(id));
    w.owned = list;
    if (fresh.length) {
      selectWeapon(w, fresh[fresh.length - 1]);
      setHud(snapshot(w));
    }
  }, [ownedKey]);

  useEffect(() => {
    if (hold) pausedRef.current = true;
    else if (!paused) pausedRef.current = false;
  }, [hold, paused]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  const screenshot = async () => {
    const canvas = canvasRef.current;
    const w = worldRef.current;
    if (!canvas || !w) return;
    if (soundRef.current) sfx("ui");
    const wasPaused = pausedRef.current;
    pausedRef.current = true;
    try {
      const blob = await captureFrame(canvas, w.score);
      setShare({ blob, score: w.score, resume: !wasPaused });
    } catch {
      pausedRef.current = wasPaused;
      flash("No se pudo sacar la foto");
    }
  };

  const closeShare = () => {
    if (share?.resume) pausedRef.current = false;
    setShare(null);
  };

  const jail = () => {
    const w = worldRef.current;
    if (!w || pausedRef.current) return;
    if (sendToJail(w)) setHud(snapshot(w));
  };

  const pickWeapon = (id: Weapon) => {
    const w = worldRef.current;
    if (!w) return;
    const res = selectWeapon(w, id);
    if (soundRef.current) sfx(res === "locked" ? "empty" : "swap");
    if (res === "trial") flash(`🎁 ${WEAPON_STATS[id].label}: 1 golpe gratis. ¡Usalo!`);
    else if (res === "locked") {
      if (onLockedWeapon) onLockedWeapon(id);
      else flash("🔒 Ya usaste tu prueba");
    }
    setHud(snapshot(w));
  };

  const hpPct = hud ? Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100)) : 100;
  const secs = hud ? Math.ceil(hud.timeLeft) : 75;
  const specialPct = hud ? Math.round(hud.special * 100) : 0;

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
          <div className={`ab-hud-bar ${hud.finalRound ? "final" : ""}`}>
            <span>
              H. RIVAS · {hud.finalRound ? "ROUND FINAL" : `RND ${hud.round}/${hud.rounds}`}
              {hud.kos > 0 ? ` · ${hud.kos} K.O.` : ""}
            </span>
            <div className="ab-hp">
              <i style={{ width: `${hpPct}%` }} />
            </div>
            <div
              className={`ab-special ${hud.specialQueue > 0 || hud.specialName ? "ready" : ""}`}
              style={hud.specialColor ? { "--special": hud.specialColor } as CSSProperties : undefined}
              aria-label={`Arma especial ${specialPct}%`}
            >
              <span>
                {hud.specialName
                  ? `⚡ ${hud.specialName}`
                  : hud.specialQueue > 0
                    ? "⚡ ¡ARMA ESPECIAL LISTA!"
                    : `ARMA ESPECIAL · ${specialPct}%`}
              </span>
              <i style={{ width: `${hud.specialQueue > 0 ? 100 : specialPct}%` }} />
            </div>
          </div>
          {hud.combo >= 2 && (
            <div className="ab-combo" key={hud.combo}>
              COMBO <b>×{hud.combo}</b>
            </div>
          )}
          {hud.canJail && (
            <button className="ab-jail-btn" onClick={jail}>
              <span>🚔</span> ¡A LA CÁRCEL!
            </button>
          )}
          {!hud.jailed && (
            <div className="ab-weapon-bar" role="toolbar" aria-label="Armas">
              {WEAPON_IDS.map((id) => {
                const has = owned.includes(id);
                const free = !has && (hud.trialsLeft[id] ?? 0) > 0;
                const on = hud.weapon === id;
                return (
                  <button
                    key={id}
                    className={`ab-wbtn ${on ? "on" : ""} ${has ? "" : free ? "free" : "locked"}`}
                    aria-label={`${WEAPON_STATS[id].label}${has ? "" : free ? ", 1 golpe gratis" : ", bloqueada"}`}
                    aria-pressed={on}
                    onClick={() => pickWeapon(id)}
                  >
                    <GameIcon kind={id} size={30} />
                    {!has && (free ? <em>GRATIS</em> : <Lock size={12} className="ab-wlock" />)}
                  </button>
                );
              })}
            </div>
          )}
          {hud.bonusMazo > 0 && (
            <div className="ab-bonus">🔨 MAZO DORADO {hud.bonusMazo.toFixed(1)}s</div>
          )}
          {(hud.powerName || hud.shield || hud.hype) && (
            <div className="ab-status" aria-live="polite">
              {hud.powerName && (
                <div
                  className="ab-power"
                  style={{ "--power": hud.powerColor ?? "#e8332a" } as CSSProperties}
                >
                  ⚡ HERNÁN: {hud.powerName}
                </div>
              )}
              {hud.shield && (
                <div className="ab-power" style={{ "--power": "#ffd23f" } as CSSProperties}>
                  🛡 TÍTULO BLINDADO · MENOS DAÑO
                </div>
              )}
              {hud.hype && (
                <div className="ab-power" style={{ "--power": "#2ec27e" } as CSSProperties}>
                  🧉 TERERÉ ENERGÉTICO · ESQUIVA
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {toast && <div className="ab-toast">{toast}</div>}
      {offer && mode === "play" && (
        <button
          className="ab-offer"
          onClick={() => {
            setOffer(null);
            onLockedWeapon?.(offer);
          }}
        >
          <GameIcon kind={offer} size={34} />
          <span>
            ¿Te gustó {WEAPON_STATS[offer].label}?
            <b>COMPRALA YA · USD {(prices[offer] ?? 0).toFixed(2)}</b>
          </span>
        </button>
      )}
      {share && (
        <ShareSheet
          blob={share.blob}
          filename={`hernan-rivas-abogado-${Date.now()}.png`}
          message={`Le estoy pegando a Hernán Rivas: ${share.score.toLocaleString("es-PY")} puntos 🥊 ¿Me superás?`}
          title="¡Foto del ring!"
          onClose={closeShare}
        />
      )}
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
