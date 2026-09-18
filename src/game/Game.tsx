import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Gamepad2,
  Hand,
  HelpCircle,
  MessageCircle,
  Pause,
  Play as PlayIcon,
  RotateCcw,
  Settings as SettingsIcon,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import {
  HAZARD_BY_ID,
  HERO_BY_ID,
  HEROES,
  MISSIONS,
  TALKS,
  TEAM,
  WEAPON_NAME,
  chapterOf,
  type HazardId,
  type HeroId,
} from "./content";
import {
  axis,
  bindKeys,
  hasGamepad,
  isTouchDevice,
  pads,
  pollInput,
  press,
  setKeys,
  setPad,
  swipe,
} from "./input";
import { drawWorld } from "./render";
import { TUNING, formatTime, type Difficulty, type Quality } from "./settings";
import { getWorld, useGame } from "./store";
import { unlockAudio } from "./audio";
import { stepWorld, type WorldEvent } from "./world";

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

/* ------------------------------------------------------------------ */
/* Shared UI bits                                                      */
/* ------------------------------------------------------------------ */

function Btn({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const base =
    variant === "primary"
      ? "bg-accent text-accent-fg shadow-soft"
      : variant === "danger"
        ? "bg-red-700 text-white"
        : "bg-surface text-paper ring-1 ring-line";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        unlockAudio();
        onClick?.();
      }}
      className={`press flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-bold disabled:opacity-40 ${base} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${className}`}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/70 p-3 backdrop-blur-[2px] sm:items-center">
      <div
        className={`modal-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-line ${wide ? "max-w-xl" : "max-w-md"}`}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="font-display text-2xl">{title}</h2>
          {onClose ? (
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="press grid size-10 place-items-center rounded-full bg-elevated text-paper"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
        <div className="overflow-y-auto px-5 pb-5 pt-3">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Options / Help                                                      */
/* ------------------------------------------------------------------ */

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-semibold text-paper">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-accent" : "bg-black/50"}`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-paper transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; t: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="rounded-2xl bg-elevated px-4 py-3">
      <p className="text-sm font-semibold text-paper">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`press rounded-full px-3 py-1.5 text-sm font-semibold ${
              value === o.v ? "bg-accent text-accent-fg" : "bg-black/40 text-paper ring-1 ring-line"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionsPanel({ onClose }: { onClose: () => void }) {
  const settings = useGame((s) => s.settings);
  const set = useGame((s) => s.setSettings);
  const reset = useGame((s) => s.resetProgress);
  const phase = useGame((s) => s.phase);
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <Modal title="Opciones" onClose={onClose}>
      <div className="grid gap-2">
        <Chips<Difficulty>
          label={phase === "play" ? "Dificultad (aplica en la próxima misión)" : "Dificultad"}
          value={settings.difficulty}
          options={[
            { v: "facil", t: "Fácil" },
            { v: "normal", t: "Normal" },
            { v: "dificil", t: "Difícil" },
          ]}
          onChange={(v) => set({ difficulty: v })}
        />
        <p className="px-1 text-xs text-muted">
          {settings.difficulty === "facil"
            ? "Enemigos lentos, menos daño, más balas."
            : settings.difficulty === "normal"
              ? "La experiencia pensada. Saltá para esquivar."
              : "Enemigos rápidos, daño alto, pocas balas y vuelven antes."}
        </p>
        <Toggle
          label="Sonido"
          hint="Efectos generados en el momento"
          value={settings.sound}
          onChange={(v) => set({ sound: v })}
        />
        {settings.sound ? (
          <label className="flex items-center gap-3 rounded-2xl bg-elevated px-4 py-3">
            <span className="text-sm font-semibold text-paper">Volumen</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.volume * 100)}
              onChange={(e) => set({ volume: Number(e.target.value) / 100 })}
              className="flex-1 accent-accent"
            />
          </label>
        ) : null}
        <Toggle
          label="Vibración"
          hint="En celulares compatibles"
          value={settings.vibrate}
          onChange={(v) => set({ vibrate: v })}
        />
        <Toggle
          label="Sangre y pedazos"
          hint="Apagalo si preferís algo más suave"
          value={settings.gore}
          onChange={(v) => set({ gore: v })}
        />
        <Toggle
          label="Sacudida de pantalla"
          value={settings.shake}
          onChange={(v) => set({ shake: v })}
        />
        <Chips<Quality>
          label="Calidad gráfica"
          value={settings.quality}
          options={[
            { v: "auto", t: "Auto" },
            { v: "baja", t: "Baja" },
            { v: "alta", t: "Alta" },
          ]}
          onChange={(v) => set({ quality: v })}
        />
        <Chips<"auto" | "on" | "off">
          label="Controles táctiles"
          value={settings.touchControls}
          options={[
            { v: "auto", t: "Auto" },
            { v: "on", t: "Mostrar" },
            { v: "off", t: "Ocultar" },
          ]}
          onChange={(v) => set({ touchControls: v })}
        />
        <Toggle
          label="Zurdo"
          hint="Botones de acción a la izquierda"
          value={settings.leftHanded}
          onChange={(v) => set({ leftHanded: v })}
        />
        <Toggle
          label="Mostrar FPS"
          value={settings.showFps}
          onChange={(v) => set({ showFps: v })}
        />
        {phase !== "play" ? (
          confirmReset ? (
            <div className="flex gap-2">
              <Btn
                variant="danger"
                className="flex-1"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Sí, borrar
              </Btn>
              <Btn variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
                No
              </Btn>
            </div>
          ) : (
            <Btn variant="ghost" onClick={() => setConfirmReset(true)}>
              Borrar progreso guardado
            </Btn>
          )
        ) : null}
      </div>
    </Modal>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[11px] text-paper ring-1 ring-line">
      {children}
    </kbd>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Cómo jugar" onClose={onClose}>
      <div className="grid gap-3 text-sm text-paper">
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Objetivo
          </p>
          <p className="text-muted">
            Seguí la flecha dorada. Hablá con la gente (<Key>E</Key>), agarrá lo que brilla y cumplí
            la lista de la misión. Si te queda sin vida volvés al inicio de la zona.
          </p>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Teclado
          </p>
          <ul className="grid gap-1.5 text-muted">
            <li>
              <Key>A</Key> <Key>D</Key> o <Key>←</Key> <Key>→</Key> moverse
            </li>
            <li>
              <Key>W</Key> <Key>↑</Key> o <Key>Espacio</Key> saltar (esquiva libros y slime)
            </li>
            <li>
              <Key>J</Key> <Key>K</Key> <Key>X</Key> o <Key>F</Key> atacar · mantené para disparar
              seguido
            </li>
            <li>
              <Key>E</Key> o <Key>Enter</Key> hablar / agarrar
            </li>
            <li>
              <Key>Q</Key> o <Key>Tab</Key> cambiar de arma
            </li>
            <li>
              <Key>Esc</Key> o <Key>P</Key> pausa
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Táctil</p>
          <p className="text-muted">
            Flechas para moverte o arrastrá el dedo en la mitad izquierda. Tocá la mitad derecha
            para disparar. Botones de saltar, arma y hablar abajo a la derecha.
          </p>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Mando</p>
          <p className="text-muted">
            Stick o cruceta mueve · A salta · X / RT ataca · B habla · LB/RB cambia arma · Start
            pausa.
          </p>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Consejos
          </p>
          <ul className="grid gap-1.5 text-muted">
            <li>· Masivo aguanta 3 balas. El cuchillo hace el doble de daño que el puño.</li>
            <li>· Los enemigos vuelven a los pocos segundos. Aprovechá para avanzar.</li>
            <li>· El tereré cura. Las balas se agarran solas al pasar.</li>
            <li>· Las Gs suman puntos y el tiempo también: terminá rápido para medalla de oro.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function Title() {
  const play = useGame((s) => s.play);
  const cont = useGame((s) => s.continueGame);
  const save = useGame((s) => s.save);
  const overlay = useGame((s) => s.overlay);
  const open = useGame((s) => s.openOverlay);
  const close = useGame((s) => s.closeOverlay);
  const done = [1, 2, 3].filter((n) => save.missions[n as 1 | 2 | 3].done).length;
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-bg">
      <img
        src="/art/splash.jpg"
        alt="Team UPAP y Juan"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-20">
        {save.hero ? (
          <p className="text-xs text-paper/80">
            {HERO_BY_ID[save.hero].name} · {done}/3 misiones · {save.totalCoins} Gs juntadas
          </p>
        ) : null}
        <Btn
          onClick={save.hero ? cont : play}
          className="w-full max-w-xs py-4 text-lg"
          icon={<PlayIcon size={20} />}
        >
          {save.hero ? "Continuar" : "Jugar"}
        </Btn>
        {save.hero ? (
          <Btn variant="ghost" onClick={play} className="w-full max-w-xs">
            Ver intro y elegir de nuevo
          </Btn>
        ) : null}
        <div className="flex w-full max-w-xs gap-2">
          <Btn
            variant="ghost"
            className="flex-1"
            onClick={() => open("options")}
            icon={<SettingsIcon size={18} />}
          >
            Opciones
          </Btn>
          <Btn
            variant="ghost"
            className="flex-1"
            onClick={() => open("help")}
            icon={<HelpCircle size={18} />}
          >
            Cómo jugar
          </Btn>
        </div>
      </div>
      {overlay === "options" ? <OptionsPanel onClose={close} /> : null}
      {overlay === "help" ? <HelpPanel onClose={close} /> : null}
    </div>
  );
}

function Select() {
  const choose = useGame((s) => s.choose);
  const current = useGame((s) => s.hero);
  const [sel, setSel] = useState<HeroId>(current ?? "rafa");
  const hero = HERO_BY_ID[sel];
  return (
    <Screen>
      <Eyebrow>Team UPAP</Eyebrow>
      <h1 className="mt-1 font-display text-3xl">¿Quién sos hoy?</h1>
      <p className="mt-1 text-sm text-muted">
        Cada uno juega distinto. Tres misiones. El asado es apenas el principio.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HEROES.map((h) => {
          const active = h.id === sel;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setSel(h.id)}
              className={`press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-2 ${active ? "ring-accent" : "ring-line"}`}
            >
              <div className="select-stage relative h-40 overflow-hidden bg-black">
                {active ? (
                  <video
                    src={h.reel}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_18%]"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={h.portrait}
                  />
                ) : (
                  <img
                    src={h.portrait}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_18%] opacity-80"
                  />
                )}
              </div>
              <div className="px-3 py-2">
                <p className="font-display text-lg">{h.name}</p>
                <p className="text-xs text-muted">{h.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-line">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {hero.role} · {hero.perk.label}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-muted">
          <div className="rounded-xl bg-elevated py-2">
            <p className="text-lg font-bold text-paper">{hero.perk.hp}</p>vida
          </div>
          <div className="rounded-xl bg-elevated py-2">
            <p className="text-lg font-bold text-paper">{Math.round(hero.perk.speed * 100)}%</p>
            velocidad
          </div>
          <div className="rounded-xl bg-elevated py-2">
            <p className="text-lg font-bold text-paper">{hero.perk.ammo}</p>balas base
          </div>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <Btn onClick={() => choose(sel)} className="w-full py-4 text-lg">
          Jugar con {hero.name}
        </Btn>
      </div>
    </Screen>
  );
}

function Missions() {
  const start = useGame((s) => s.startMission);
  const hero = useGame((s) => s.hero);
  const save = useGame((s) => s.save);
  const settings = useGame((s) => s.settings);
  const setDifficulty = useGame((s) => s.setDifficulty);
  const goSelect = useGame((s) => s.goSelect);
  const goTitle = useGame((s) => s.goTitle);
  const overlay = useGame((s) => s.overlay);
  const open = useGame((s) => s.openOverlay);
  const close = useGame((s) => s.closeOverlay);
  return (
    <Screen>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Eyebrow>Team UPAP</Eyebrow>
          <h1 className="mt-1 font-display text-3xl">Elegí la historia</h1>
          <p className="mt-1 text-sm text-muted">
            {hero ? `Jugás como ${HERO_BY_ID[hero].name}.` : ""} Onichan molesta en las tres.
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Opciones"
            onClick={() => open("options")}
            className="press grid size-10 place-items-center rounded-full bg-surface ring-1 ring-line"
          >
            <SettingsIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Cómo jugar"
            onClick={() => open("help")}
            className="press grid size-10 place-items-center rounded-full bg-surface ring-1 ring-line"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Dificultad</span>
        {(["facil", "normal", "dificil"] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={`press rounded-full px-3 py-1 text-xs font-semibold ${settings.difficulty === d ? "bg-accent text-accent-fg" : "bg-surface text-paper ring-1 ring-line"}`}
          >
            {TUNING[d].label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-start">
        {MISSIONS.map((m) => {
          const rec = save.missions[m.ch];
          return (
            <button
              key={m.ch}
              type="button"
              onClick={() => start(m.ch)}
              className="press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line"
            >
              <div className="relative h-28 overflow-hidden sm:h-36">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${m.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
                <p className="absolute bottom-2 left-3 font-display text-2xl text-paper">
                  {m.title}
                </p>
                {rec.done ? (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-fg">
                    <Trophy size={12} /> Completada
                  </span>
                ) : null}
              </div>
              <p className="px-3 py-2.5 text-sm leading-snug text-muted">{m.blurb}</p>
              <p className="px-3 pb-3 text-xs text-paper/70">
                {rec.bestTime !== null ? `Mejor tiempo ${formatTime(rec.bestTime)} · ` : ""}
                {rec.bestScore ? `Récord ${rec.bestScore} pts · ` : ""}
                {rec.plays
                  ? `${rec.plays} ${rec.plays === 1 ? "intento" : "intentos"}`
                  : "Sin jugar"}
                {" · "}meta {formatTime(chapterOf(m.ch).parTime)}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <Btn variant="ghost" className="flex-1" onClick={goSelect}>
          Cambiar personaje
        </Btn>
        <Btn variant="ghost" className="flex-1" onClick={goTitle}>
          Inicio
        </Btn>
      </div>
      {overlay === "options" ? <OptionsPanel onClose={close} /> : null}
      {overlay === "help" ? <HelpPanel onClose={close} /> : null}
    </Screen>
  );
}

function Cinema() {
  const clip = useGame((s) => s.clip);
  const skip = useGame((s) => s.skipCinema);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space" || e.code === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);
  if (!clip) return null;
  return (
    <button
      type="button"
      onClick={skip}
      className="relative block min-h-dvh w-full overflow-hidden bg-black"
    >
      <video
        src={clip.src}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        playsInline
        preload="auto"
        muted={!clip.sound}
        onEnded={skip}
        onError={skip}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16 text-left">
        <Eyebrow>{clip.title}</Eyebrow>
        <p className="mt-1 font-display text-xl text-paper">{clip.line}</p>
        <span className="mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg">
          Saltar
        </span>
      </div>
    </button>
  );
}

function Loading() {
  const p = useGame((s) => s.loadProgress);
  const chapter = useGame((s) => s.chapter);
  const ch = chapterOf(chapter);
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-bg px-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${ch.zones[0].bg})` }}
      />
      <div className="relative w-full max-w-sm">
        <Eyebrow>{ch.title}</Eyebrow>
        <h1 className="mt-1 font-display text-3xl">Cargando…</h1>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-line">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${Math.round(p * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {Math.round(p * 100)}% · saltá (W) para esquivar libros y slime
        </p>
      </div>
    </div>
  );
}

function Win() {
  const pick = useGame((s) => s.pickMissions);
  const start = useGame((s) => s.startMission);
  const result = useGame((s) => s.result);
  const medalColor =
    result?.medal === "oro"
      ? "text-yellow-300"
      : result?.medal === "plata"
        ? "text-slate-200"
        : "text-amber-600";
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden bg-bg px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))]">
      <img src="/art/splash.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      <div className="relative z-10 w-full max-w-sm">
        {result ? (
          <div className="modal-in mb-3 rounded-3xl bg-surface/95 p-4 ring-1 ring-line">
            <Eyebrow>Misión cumplida</Eyebrow>
            <p className={`mt-1 flex items-center gap-2 font-display text-3xl ${medalColor}`}>
              <Trophy size={26} /> Medalla de {result.medal}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-elevated p-2.5">
                <p className="text-[11px] uppercase tracking-widest text-muted">Tiempo</p>
                <p className="text-xl font-bold text-paper">{formatTime(result.time)}</p>
                {result.newBestTime ? (
                  <p className="text-[11px] text-accent">¡Nuevo récord!</p>
                ) : null}
              </div>
              <div className="rounded-xl bg-elevated p-2.5">
                <p className="text-[11px] uppercase tracking-widest text-muted">Puntos</p>
                <p className="text-xl font-bold text-paper">{result.score}</p>
                {result.newBestScore ? (
                  <p className="text-[11px] text-accent">¡Nuevo récord!</p>
                ) : null}
              </div>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
              <li>Base: {result.base}</li>
              <li>Bonus tiempo: +{result.bonus}</li>
              <li>Gs: {result.coins}</li>
              <li>Bajas: {result.kills}</li>
              <li>Caídas: {result.falls}</li>
              <li>Meta: {formatTime(chapterOf(result.chapter).parTime)}</li>
            </ul>
          </div>
        ) : null}
        <div className="grid gap-2">
          <Btn onClick={pick} className="w-full py-4 text-lg">
            Otra misión
          </Btn>
          {result ? (
            <Btn
              variant="ghost"
              onClick={() => start(result.chapter)}
              icon={<RotateCcw size={18} />}
            >
              Repetir esta misión
            </Btn>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Talk overlay                                                        */
/* ------------------------------------------------------------------ */

function Talk() {
  const talkKey = useGame((s) => s.talkKey);
  const idx = useGame((s) => s.line);
  const advance = useGame((s) => s.advance);
  const [shown, setShown] = useState(0);
  const line = talkKey ? TALKS[talkKey][idx] : null;
  const text = line?.text ?? "";
  useEffect(() => {
    setShown(0);
    if (!text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setShown(i);
      if (i >= text.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [text, idx, talkKey]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!line) return;
      if (e.code === "Enter" || e.code === "Space" || e.code === "KeyE") {
        e.preventDefault();
        if (shown < text.length) setShown(text.length);
        else if (!line.choices) advance();
        else if (line.choices.length === 1) advance(0);
      } else if (e.code === "Digit1" || e.code === "Digit2" || e.code === "Digit3") {
        const n = Number(e.code.slice(-1)) - 1;
        if (line.choices?.[n]) advance(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [line, advance, shown, text.length]);
  if (!talkKey || !line) return null;
  const face =
    line.who === "narrator"
      ? null
      : (HERO_BY_ID[line.who as HeroId] ?? HAZARD_BY_ID[line.who as HazardId] ?? null);
  const complete = shown >= text.length;
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-16">
      <div className="modal-in mx-auto max-w-lg rounded-2xl bg-surface/95 p-3 ring-1 ring-line">
        <div className="flex gap-3">
          {face ? (
            <img src={face.portrait} alt="" className="size-14 rounded-xl object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {face ? face.name : "Misión"}
            </p>
            <p
              className="mt-1 min-h-[2.6em] text-sm leading-snug text-paper"
              onClick={() => setShown(text.length)}
            >
              {text.slice(0, shown)}
              {!complete ? <span className="text-accent">▌</span> : null}
            </p>
          </div>
        </div>
        {line.choices ? (
          <div className="mt-3 grid gap-2">
            {line.choices.map((c, i) => (
              <button
                key={c.label}
                type="button"
                className="press flex min-h-11 items-center gap-2 rounded-xl bg-accent px-3 text-left text-sm font-medium text-accent-fg"
                onClick={() => advance(i)}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black/20 text-xs font-bold">
                  {i + 1}
                </span>
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="press mt-3 h-12 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg"
            onClick={() => (complete ? advance() : setShown(text.length))}
          >
            {complete ? "Seguir" : "…"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Play                                                                */
/* ------------------------------------------------------------------ */

function PadButton({
  label,
  icon,
  onDown,
  onUp,
  size = "size-16",
  className = "",
}: {
  label: string;
  icon: ReactNode;
  onDown: () => void;
  onUp?: () => void;
  size?: string;
  className?: string;
}) {
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    unlockAudio();
    onDown();
  };
  return (
    <button
      type="button"
      aria-label={label}
      className={`pad pointer-events-auto grid ${size} place-items-center rounded-full text-paper ${className}`}
      onPointerDown={down}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={onUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {icon}
    </button>
  );
}

function TouchControls() {
  const prompt = useGame((s) => s.hud.prompt);
  const weapon = useGame((s) => s.hud.weapon);
  const ammo = useGame((s) => s.hud.ammo);
  const leftHanded = useGame((s) => s.settings.leftHanded);
  const move = (
    <div className="pointer-events-auto flex items-end gap-3">
      <PadButton
        label="Izquierda"
        icon={<ChevronLeft size={30} />}
        onDown={() => setPad("left", true)}
        onUp={() => setPad("left", false)}
        size="size-[4.4rem]"
        className="bg-black/55"
      />
      <PadButton
        label="Derecha"
        icon={<ChevronRight size={30} />}
        onDown={() => setPad("right", true)}
        onUp={() => setPad("right", false)}
        size="size-[4.4rem]"
        className="bg-black/55"
      />
    </div>
  );
  const act = (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      {prompt ? (
        <button
          type="button"
          className="press pointer-events-auto flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-soft"
          onPointerDown={(e) => {
            e.stopPropagation();
            unlockAudio();
            press("interact");
          }}
        >
          <MessageCircle size={16} /> {prompt}
        </button>
      ) : null}
      <div className="flex items-end gap-2">
        <div className="flex flex-col items-center gap-2">
          <PadButton
            label="Cambiar arma"
            icon={<Swords size={20} />}
            onDown={() => press("swap")}
            size="size-12"
            className="bg-black/55 text-xs"
          />
          <PadButton
            label="Saltar"
            icon={<span className="text-sm font-bold">Saltar</span>}
            onDown={() => press("jump")}
            size="size-16"
            className="bg-black/60 ring-2 ring-paper/30"
          />
        </div>
        <PadButton
          label="Atacar"
          icon={
            <span className="flex flex-col items-center leading-none">
              {weapon === "pistol" ? (
                <Crosshair size={26} />
              ) : weapon === "knife" ? (
                <Swords size={26} />
              ) : (
                <Hand size={26} />
              )}
              <span className="mt-1 text-[11px] font-bold">
                {weapon === "pistol" ? `${ammo}` : WEAPON_NAME[weapon]}
              </span>
            </span>
          }
          onDown={() => {
            pads.attack = true;
            press("attack");
          }}
          onUp={() => {
            pads.attack = false;
          }}
          size="size-20"
          className="bg-accent text-accent-fg shadow-soft"
        />
      </div>
    </div>
  );
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-[max(0.6rem,env(safe-area-inset-bottom))] z-20 flex items-end justify-between px-4 ${leftHanded ? "flex-row-reverse" : ""}`}
    >
      {move}
      {act}
    </div>
  );
}

function MiniMap() {
  const x = useGame((s) => s.hud.x);
  const width = useGame((s) => s.hud.width);
  const objectiveX = useGame((s) => s.hud.objectiveX);
  const enemies = useGame((s) => s.hud.enemies);
  const markers = useGame((s) => s.hud.markers);
  const chapter = useGame((s) => s.chapter);
  const zones = chapterOf(chapter).zones;
  const pct = (v: number) => `${(v / width) * 100}%`;
  return (
    <div className="pointer-events-none relative mx-auto mt-1 h-2.5 w-full max-w-md rounded-full bg-black/60 ring-1 ring-line">
      {zones.map((z, i) =>
        i ? (
          <span
            key={z.id}
            className="absolute top-0 h-full w-px bg-paper/25"
            style={{ left: pct(i * 100) }}
          />
        ) : null,
      )}
      {markers.map((m) => (
        <span
          key={m}
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/60"
          style={{ left: pct(m) }}
        />
      ))}
      {enemies.map((e, i) => (
        <span
          key={i}
          className={`absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${e.chasing ? "bg-red-500" : "bg-red-400/60"}`}
          style={{ left: pct(e.x) }}
        />
      ))}
      {objectiveX !== null ? (
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent"
          style={{ left: pct(objectiveX) }}
        />
      ) : null}
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper ring-2 ring-black/60"
        style={{ left: pct(x) }}
      />
    </div>
  );
}

function Hud() {
  const hp = useGame((s) => s.hud.hp);
  const maxHp = useGame((s) => s.hud.maxHp);
  const coins = useGame((s) => s.hud.coins);
  const ammo = useGame((s) => s.hud.ammo);
  const weapon = useGame((s) => s.hud.weapon);
  const timer = useGame((s) => s.hud.timer);
  const score = useGame((s) => s.hud.score);
  const combo = useGame((s) => s.hud.combo);
  const zone = useGame((s) => s.hud.zone);
  const objective = useGame((s) => s.hud.objective);
  const checks = useGame((s) => s.hud.checks);
  const recruited = useGame((s) => s.hud.recruited);
  const chasing = useGame((s) => s.hud.chasing);
  const chapter = useGame((s) => s.chapter);
  const hero = useGame((s) => s.hero);
  const fps = useGame((s) => s.fps);
  const showFps = useGame((s) => s.settings.showFps);
  const togglePause = useGame((s) => s.togglePause);
  const ch = chapterOf(chapter);
  const hpFrac = Math.max(0, hp / maxHp);
  const hpColor = hpFrac > 0.5 ? "bg-emerald-400" : hpFrac > 0.25 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-2 pt-[max(0.4rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-2">
        <div className="max-w-[46%] rounded-xl bg-black/70 px-2.5 py-1.5">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
            {ch.title} · {zone}
          </p>
          <p
            key={objective}
            className="objective-pop font-display text-[14px] leading-tight text-paper"
          >
            {chasing.length ? `¡${chasing.join(" y ")} te persigue!` : objective}
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
            {checks.map((c) => (
              <li key={c.t} className={`text-[9px] ${c.ok ? "text-accent" : "text-paper/60"}`}>
                {c.ok ? "✓" : "○"} {c.t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {TEAM.map((id) => (
              <img
                key={id}
                src={HERO_BY_ID[id].portrait}
                alt=""
                draggable={false}
                className={
                  id === hero || recruited.includes(id)
                    ? "size-7 rounded-full object-cover ring-2 ring-accent"
                    : "size-7 rounded-full object-cover opacity-30 grayscale"
                }
              />
            ))}
            <button
              type="button"
              aria-label="Pausa"
              onClick={togglePause}
              className="pointer-events-auto ml-1 grid size-9 place-items-center rounded-full bg-black/70 text-paper ring-1 ring-line"
            >
              <Pause size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            <span className="rounded-md bg-black/70 px-2 py-1 text-accent">{coins} Gs</span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-paper">{formatTime(timer)}</span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-paper">
              {score} pts{combo > 1 ? ` x${combo}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-paper">
              {weapon === "pistol" ? (
                <Crosshair size={13} />
              ) : weapon === "knife" ? (
                <Swords size={13} />
              ) : (
                <Hand size={13} />
              )}
              {weapon === "pistol" ? `${ammo} balas` : WEAPON_NAME[weapon]}
            </span>
            <div className="relative h-5 w-28 overflow-hidden rounded-md bg-black/70 ring-1 ring-line">
              <div
                className={`h-full ${hpColor} transition-[width] duration-200`}
                style={{ width: `${hpFrac * 100}%` }}
              />
              <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-white drop-shadow">
                {hp}/{maxHp}
              </span>
            </div>
            {showFps ? (
              <span className="rounded-md bg-black/70 px-1.5 py-1 text-[10px] text-muted">
                {fps} fps
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <MiniMap />
    </div>
  );
}

function PauseMenu() {
  const overlay = useGame((s) => s.overlay);
  const togglePause = useGame((s) => s.togglePause);
  const restart = useGame((s) => s.restartMission);
  const quit = useGame((s) => s.quitToMenu);
  const open = useGame((s) => s.openOverlay);
  const close = useGame((s) => s.closeOverlay);
  const retry = useGame((s) => s.retry);
  const falls = useGame((s) => s.hud.falls);
  if (overlay === "options") return <OptionsPanel onClose={close} />;
  if (overlay === "help") return <HelpPanel onClose={close} />;
  if (overlay === "ko")
    return (
      <Modal title="Te agarraron">
        <p className="text-sm text-muted">
          Volvés al inicio de la zona con toda la vida. Perdés 5 Gs y 100 puntos.
          {falls >= 2
            ? " Consejo: saltá (W) para esquivar libros y slime, y disparale a Masivo desde lejos."
            : ""}
        </p>
        <div className="mt-4 grid gap-2">
          <Btn onClick={retry} icon={<RotateCcw size={18} />}>
            Reintentar
          </Btn>
          <Btn variant="ghost" onClick={restart}>
            Reiniciar misión
          </Btn>
          <Btn variant="ghost" onClick={quit}>
            Salir al menú
          </Btn>
        </div>
      </Modal>
    );
  if (overlay !== "pause") return null;
  return (
    <Modal title="Pausa" onClose={togglePause}>
      <div className="grid gap-2">
        <Btn onClick={togglePause} icon={<PlayIcon size={18} />}>
          Reanudar
        </Btn>
        <Btn variant="ghost" onClick={() => open("options")} icon={<SettingsIcon size={18} />}>
          Opciones
        </Btn>
        <Btn variant="ghost" onClick={() => open("help")} icon={<HelpCircle size={18} />}>
          Cómo jugar
        </Btn>
        <Btn variant="ghost" onClick={restart} icon={<RotateCcw size={18} />}>
          Reiniciar misión
        </Btn>
        <Btn variant="danger" onClick={quit}>
          Salir al menú
        </Btn>
      </div>
    </Modal>
  );
}

function pickDpr(quality: Quality) {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  if (quality === "baja") return 1;
  if (quality === "alta") return Math.min(3, dpr);
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const cap = cores <= 4 ? 1.5 : 2;
  return Math.min(cap, dpr);
}

function Play() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const toast = useGame((s) => s.toast);
  const overlay = useGame((s) => s.overlay);
  const quality = useGame((s) => s.settings.quality);
  const touchPref = useGame((s) => s.settings.touchControls);
  const [touch, setTouch] = useState(false);
  const touchRef = useRef(false);
  const dprRef = useRef(1);
  const sizeRef = useRef({ W: 1, H: 1 });

  useEffect(() => {
    const on = touchPref === "on" || (touchPref === "auto" && isTouchDevice());
    touchRef.current = on;
    setTouch(on);
  }, [touchPref]);

  useEffect(() => bindKeys(), []);
  useEffect(() => {
    window.__controlsTest = {
      getX: () => getWorld()?.player.x ?? 0,
      getYaw: () => getWorld()?.player.x ?? 0,
      getSpeed: () =>
        pads.left || pads.right || Math.abs(axis()) > 0 ? (getWorld()?.player.speed ?? 60) : 0,
      setKeys,
    };
    if (import.meta.env.DEV) {
      const dbg = window as unknown as { __gameState?: () => unknown; __world?: () => unknown };
      dbg.__gameState = () => useGame.getState();
      dbg.__world = () => getWorld();
    }
    return () => {
      delete window.__controlsTest;
    };
  }, []);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    const host = hostRef.current;
    if (!c || !host) return;
    const W = Math.max(1, host.clientWidth);
    const H = Math.max(1, host.clientHeight);
    const dpr = dprRef.current;
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    c.style.width = `${W}px`;
    c.style.height = `${H}px`;
    sizeRef.current = { W, H };
  }, []);

  useEffect(() => {
    dprRef.current = pickDpr(quality);
    resize();
  }, [quality, resize]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => resize());
    ro.observe(host);
    resize();
    return () => ro.disconnect();
  }, [resize]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: false });
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let hudAt = 0;
    let frames = 0;
    let fpsAt = last;
    let slowFrames = 0;
    let fastFrames = 0;
    const ev: WorldEvent[] = [];
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = useGame.getState();
      const w = getWorld();
      if (!w) return;
      const inp = pollInput();
      if (inp.pause) {
        if (st.overlay === "talk") st.dismissTalk();
        else st.togglePause();
      }
      if (st.phase === "play" && st.overlay === null && !w.ended) {
        stepWorld(w, inp, dt, ev);
        if (ev.length) st.handleEvents(ev);
      }
      if (now - hudAt > 200) {
        hudAt = now;
        st.syncHud();
      }
      const { W, H } = sizeRef.current;
      const dpr = dprRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = useGame.getState();
      drawWorld(ctx, w, W, H, {
        gore: s.settings.gore,
        shake: s.settings.shake,
        objectiveX: s.hud.objectiveX,
        prompts: !touchRef.current,
      });
      /* fps + adaptive resolution */
      frames++;
      const ft = performance.now() - now;
      if (s.settings.quality === "auto") {
        if (ft > 20) slowFrames++;
        else if (ft < 9) fastFrames++;
        if (slowFrames > 45 && dprRef.current > 1) {
          dprRef.current = Math.max(1, dprRef.current - 0.25);
          slowFrames = 0;
          fastFrames = 0;
          resize();
        } else if (fastFrames > 600 && dprRef.current < pickDpr("auto")) {
          dprRef.current = Math.min(pickDpr("auto"), dprRef.current + 0.25);
          fastFrames = 0;
          resize();
        }
      }
      if (now - fpsAt >= 1000) {
        s.setFps(Math.round((frames * 1000) / (now - fpsAt)));
        frames = 0;
        fpsAt = now;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [resize]);

  /* Touch on the canvas: drag on the left half moves, tap on the right half attacks. */
  const dragRef = useRef<{ id: number; x: number } | null>(null);
  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    unlockAudio();
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    const half = e.currentTarget.clientWidth / 2;
    const lh = useGame.getState().settings.leftHanded;
    const moveSide = lh ? e.clientX > half : e.clientX < half;
    if (moveSide) {
      dragRef.current = { id: e.pointerId, x: e.clientX };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } else {
      pads.attack = true;
      press("attack");
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    swipe.dir = dx > 14 ? 1 : dx < -14 ? -1 : 0;
  };
  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (d && d.id === e.pointerId) {
      dragRef.current = null;
      swipe.dir = 0;
    } else pads.attack = false;
  };

  return (
    <div
      ref={hostRef}
      className="game-root relative h-dvh w-full overflow-hidden bg-bg"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block touch-none select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      <Hud />
      {toast ? (
        <div
          key={toast}
          className="toast-alert pointer-events-none absolute left-1/2 top-[7.5rem] z-20 w-max max-w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 px-4 py-2 text-center text-sm"
        >
          {toast}
        </div>
      ) : null}
      {touch && overlay !== "talk" ? <TouchControls /> : null}
      {!touch && overlay === null ? (
        <p className="pointer-events-none absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-paper/80">
          A/D mover · W saltar · J atacar · E hablar · Q arma · Esc pausa
          {hasGamepad() ? " · mando conectado" : ""}
        </p>
      ) : null}
      {overlay === "talk" ? <Talk /> : null}
      <PauseMenu />
      {overlay === "pause" ? (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-paper">
          <Gamepad2 size={12} className="mr-1 inline" /> Pausa
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export function Game() {
  const booted = useGame((s) => s.booted);
  const boot = useGame((s) => s.boot);
  const phase = useGame((s) => s.phase);
  useEffect(() => {
    boot();
  }, [boot]);
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  if (!booted) return <div className="min-h-dvh bg-bg" />;
  if (phase === "title") return <Title />;
  if (phase === "select") return <Select />;
  if (phase === "missions") return <Missions />;
  if (phase === "cinema") return <Cinema />;
  if (phase === "loading") return <Loading />;
  if (phase === "win") return <Win />;
  return <Play />;
}
