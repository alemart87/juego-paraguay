import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  Bomb,
  Crosshair,
  Gamepad2,
  Hammer,
  Hand,
  HelpCircle,
  MessageCircle,
  Pause,
  Play as PlayIcon,
  RotateCcw,
  Settings as SettingsIcon,
  Swords,
  Trophy,
  Wind,
  X,
} from "lucide-react";
import {
  HAZARD_BY_ID,
  HERO_BY_ID,
  HEROES,
  MISSIONS,
  TEAM,
  WEAPONS,
  chapterOf,
  type HazardId,
  type HeroId,
  type WeaponId,
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
  stick,
} from "./input";
import { vibrate } from "./audio";
import { drawWorld, viewWidthFor } from "./render";
import { TUNING, formatTime, type Difficulty, type Quality } from "./settings";
import { getWorld, useGame } from "./store";
import { unlockAudio } from "./audio";
import { stepWorld, type WorldEvent } from "./world";

/** Shown on the title screen and pause menu so it is obvious which build is running. */
export const APP_VERSION = "v3.1 · móvil vertical";

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
            la lista de la misión. Cada misión termina con un jefe. Si te quedás sin vida volvés al
            inicio de la zona.
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
              <Key>W</Key> <Key>↑</Key> o <Key>Espacio</Key> saltar · esquiva el slime y sube a
              plataformas
            </li>
            <li>
              <Key>S</Key> o <Key>↓</Key> agacharse · esquiva libros · con salto bajás de la
              plataforma
            </li>
            <li>
              <Key>Shift</Key> o <Key>L</Key> esquivar (dash) · invulnerable un instante
            </li>
            <li>
              <Key>J</Key> <Key>K</Key> <Key>X</Key> o <Key>F</Key> atacar · mantené con armas de
              fuego · en el aire es pisotón
            </li>
            <li>
              <Key>G</Key> tirar granada
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
            Apoyá el dedo en la mitad izquierda y arrastrá: aparece un joystick. Arrastrá hacia
            arriba para saltar y hacia abajo para agacharte. Tocá la mitad derecha para atacar.
            Botones de saltar, esquivar, granada, arma y hablar abajo a la derecha.
          </p>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Mando</p>
          <p className="text-muted">
            Stick o cruceta mueve · A salta · X / RT ataca · B esquiva · Y habla · RB cambia arma ·
            LB granada · LT o abajo agacha · Start pausa.
          </p>
        </div>
        <div className="rounded-2xl bg-elevated p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Consejos
          </p>
          <ul className="grid gap-1.5 text-muted">
            <li>· Tres golpes seguidos: el tercero remata con el doble de daño.</li>
            <li>· Bate y escopeta mandan a volar. La metralleta vacía el cargador en segundos.</li>
            <li>· Arrancás con un AK-47 y 1000 balas: mantené apretado y barré la zona.</li>
            <li>· Esquivá la embestida del jefe y pegale cuando frena.</li>
            <li>
              · Los compañeros que reclutás pelean a tu lado. Los enemigos sueltan balas y Gs.
            </li>
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
        <p className="text-[10px] uppercase tracking-[0.2em] text-paper/50">{APP_VERSION}</p>
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
              onClick={() => (active ? choose(h.id) : setSel(h.id))}
              className={`press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-2 ${active ? "ring-accent" : "ring-line"}`}
            >
              <div className="select-stage relative h-32 overflow-hidden bg-black sm:h-40">
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
            <p className="text-lg font-bold text-paper">1000</p>balas AK-47
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 -mx-4 mt-auto bg-gradient-to-t from-bg via-bg/95 to-transparent px-4 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-5">
        <Btn onClick={() => choose(sel)} className="w-full py-4 text-lg">
          Jugar con {hero.name}
        </Btn>
        <p className="mt-1.5 text-center text-[11px] text-muted">
          Tocá una tarjeta para elegir y de nuevo para empezar.
        </p>
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
          {Math.round(p * 100)}% · W salta · S agacha · Shift esquiva · G granada
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

/**
 * Height of the on-screen keyboard (or other browser UI) covering the bottom of
 * the layout viewport. iOS Safari does not resize the page for the keyboard, it
 * only shrinks the visual viewport, so the sheet is lifted by this amount.
 */
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > 40 ? Math.round(covered) : 0);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}

function faceOf(who: string) {
  return who === "narrator"
    ? null
    : (HERO_BY_ID[who as HeroId] ?? HAZARD_BY_ID[who as HazardId] ?? null);
}

/**
 * Conversation sheet. A chat log that scrolls inside a fixed-height bottom sheet,
 * with the script choices and the free-text field pinned underneath, so nothing
 * ever grows past the phone screen or zooms the page.
 */
function Talk() {
  const talkKey = useGame((s) => s.talkKey);
  const script = useGame((s) => s.script);
  const idx = useGame((s) => s.line);
  const advance = useGame((s) => s.advance);
  const dismiss = useGame((s) => s.dismissTalk);
  const sendAgent = useGame((s) => s.sendAgent);
  const agentChat = useGame((s) => s.agentChat);
  const agentBusy = useGame((s) => s.agentBusy);
  const [shown, setShown] = useState(0);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inset = useKeyboardInset();
  const line = talkKey ? (script[idx] ?? null) : null;
  const text = line?.text ?? "";
  const canChat = Boolean(line && line.who !== "narrator");
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
    setDraft("");
  }, [talkKey]);
  // Keep the newest bubble in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [idx, shown, agentChat, agentBusy]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!line) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
  const face = faceOf(line.who);
  const complete = shown >= text.length;
  const submitChat = () => {
    const t = draft.trim();
    if (!t || agentBusy) return;
    setDraft("");
    void sendAgent(t);
    inputRef.current?.focus();
  };
  const npcBubble =
    "rounded-2xl rounded-bl-md bg-elevated px-3 py-2 text-sm leading-snug text-paper";
  const bubbles: ReactNode[] = [];
  for (let i = 0; i <= idx; i++) {
    const l = script[i];
    if (!l) continue;
    const f = faceOf(l.who);
    const current = i === idx;
    bubbles.push(
      <div key={`l${i}`} className={`flex items-end gap-2 ${current ? "" : "opacity-60"}`}>
        {f ? (
          <img src={f.portrait} alt="" className="size-7 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="size-7 shrink-0" />
        )}
        <div className="min-w-0 max-w-[85%]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            {f ? f.name : "Misión"}
          </p>
          <p
            className={`mt-0.5 ${npcBubble}`}
            onClick={current ? () => setShown(text.length) : undefined}
          >
            {current ? text.slice(0, shown) : l.text}
            {current && !complete ? <span className="text-accent">▌</span> : null}
          </p>
        </div>
      </div>,
    );
  }
  agentChat.forEach((m, i) => {
    bubbles.push(
      m.role === "user" ? (
        <div key={`c${i}`} className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-sm leading-snug text-accent-fg">
            {m.text}
          </p>
        </div>
      ) : (
        <div key={`c${i}`} className="flex items-end gap-2">
          <span className="size-7 shrink-0" />
          <p className={`max-w-[85%] ${npcBubble}`}>{m.text}</p>
        </div>
      ),
    );
  });
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-10"
      style={inset ? { transform: `translateY(-${inset}px)` } : undefined}
    >
      <div
        className="pointer-events-auto modal-in flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface/95 ring-1 ring-line sm:mb-3 sm:rounded-2xl"
        style={{
          maxHeight: inset ? `calc(100dvh - ${inset}px - 0.5rem)` : "min(72dvh, 34rem)",
          paddingBottom: inset ? 0 : "env(safe-area-inset-bottom)",
        }}
        data-testid="talk-sheet"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
          {face ? (
            <img src={face.portrait} alt="" className="size-9 rounded-lg object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper">
              {face ? face.name : "Misión"}
            </p>
            <p className="truncate text-[11px] text-muted">
              {face ? `${face.role}${canChat ? " · agente" : ""}` : "Objetivo"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            className="press grid size-9 shrink-0 place-items-center rounded-full bg-elevated text-muted"
            onClick={dismiss}
          >
            <X className="size-4" />
          </button>
        </div>
        <div
          ref={logRef}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-3 py-2"
          style={{ minHeight: "5.5rem" }}
        >
          <div className="grid gap-2">
            {bubbles}
            {agentBusy ? (
              <div className="flex items-end gap-2">
                <span className="size-7 shrink-0" />
                <p className="rounded-2xl rounded-bl-md bg-elevated px-3 py-2 text-sm text-muted">
                  <span className="animate-pulse">escribiendo…</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 border-t border-line px-3 pb-2 pt-2">
          {line.choices ? (
            <div className="grid gap-1.5">
              {line.choices.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  className="press flex min-h-10 items-center gap-2 rounded-xl bg-accent px-3 py-1.5 text-left text-sm font-medium text-accent-fg"
                  onClick={() => advance(i)}
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-black/20 text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">{c.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="press h-10 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg"
              onClick={() => (complete ? advance() : setShown(text.length))}
            >
              {complete ? "Seguir" : "…"}
            </button>
          )}
          {canChat ? (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submitChat();
              }}
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Escribile a ${face?.name ?? "él"}…`}
                aria-label={`Escribile a ${face?.name ?? "el personaje"}`}
                maxLength={400}
                autoComplete="off"
                autoCapitalize="sentences"
                enterKeyHint="send"
                disabled={agentBusy}
                className="h-11 min-w-0 flex-1 rounded-xl bg-black/40 px-3 text-base text-paper outline-none ring-1 ring-line placeholder:text-muted focus:ring-accent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={agentBusy || !draft.trim()}
                className="press h-11 shrink-0 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg disabled:opacity-40"
              >
                Decir
              </button>
            </form>
          ) : null}
        </div>
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

function WeaponIcon({ weapon, size }: { weapon: WeaponId; size: number }) {
  if (weapon === "fist") return <Hand size={size} />;
  if (weapon === "knife") return <Swords size={size} />;
  if (weapon === "bat") return <Hammer size={size} />;
  return <Crosshair size={size} />;
}

function TouchControls() {
  const prompt = useGame((s) => s.hud.prompt);
  const weapon = useGame((s) => s.hud.weapon);
  const ammo = useGame((s) => s.hud.ammo);
  const grenades = useGame((s) => s.hud.grenades);
  const dashReady = useGame((s) => s.hud.dashReady);
  const leftHanded = useGame((s) => s.settings.leftHanded);
  const haptic = useGame((s) => s.settings.vibrate);
  const tap = (a: () => void) => () => {
    if (haptic) vibrate(12);
    a();
  };
  const isGunWeapon = WEAPONS[weapon].kind !== "melee";
  const act = (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      {prompt ? (
        <button
          type="button"
          className="press pointer-events-auto flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-soft"
          onPointerDown={(e) => {
            e.stopPropagation();
            unlockAudio();
            if (haptic) vibrate(12);
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
            onDown={tap(() => press("swap"))}
            size="size-12"
            className="bg-black/55"
          />
          <PadButton
            label="Granada"
            icon={
              <span className="flex flex-col items-center leading-none">
                <Bomb size={20} />
                <span className="mt-0.5 text-[10px] font-bold">{grenades}</span>
              </span>
            }
            onDown={tap(() => press("grenade"))}
            size="size-14"
            className={
              grenades > 0
                ? "bg-emerald-800/80 ring-2 ring-emerald-300/40"
                : "bg-black/45 opacity-60"
            }
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <PadButton
            label="Esquivar"
            icon={
              <span className="flex flex-col items-center leading-none">
                <Wind size={20} />
                <span className="mt-0.5 text-[10px] font-bold">Dash</span>
              </span>
            }
            onDown={tap(() => press("dash"))}
            size="size-14"
            className={
              dashReady ? "bg-sky-800/80 ring-2 ring-sky-300/40" : "bg-black/45 opacity-60"
            }
          />
          <PadButton
            label="Saltar"
            icon={<span className="text-sm font-bold">Saltar</span>}
            onDown={tap(() => press("jump"))}
            size="size-16"
            className="bg-black/60 ring-2 ring-paper/30"
          />
        </div>
        <PadButton
          label="Atacar"
          icon={
            <span className="flex flex-col items-center leading-none">
              <WeaponIcon weapon={weapon} size={26} />
              <span className="mt-1 text-[11px] font-bold">
                {isGunWeapon ? `${ammo}` : WEAPONS[weapon].short}
              </span>
            </span>
          }
          onDown={() => {
            if (haptic) vibrate(10);
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
      <p className="pointer-events-none mb-4 max-w-[9rem] text-[10px] leading-tight text-paper/60">
        Arrastrá acá para moverte · arriba salta · abajo agacha
      </p>
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
  const grenades = useGame((s) => s.hud.grenades);
  const dashReady = useGame((s) => s.hud.dashReady);
  const boss = useGame((s) => s.hud.boss);
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
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 max-w-[50%] rounded-xl bg-black/70 px-2.5 py-1.5 sm:max-w-[46%]">
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
        <div className="flex min-w-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
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
            </div>
            <span className="rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-accent sm:hidden">
              {recruited.length}/{TEAM.length}
            </span>
            <button
              type="button"
              aria-label="Pausa"
              onClick={togglePause}
              className="pointer-events-auto ml-1 grid size-9 place-items-center rounded-full bg-black/70 text-paper ring-1 ring-line"
            >
              <Pause size={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 text-[11px] font-semibold">
            <span className="rounded-md bg-black/70 px-2 py-1 text-accent">{coins} Gs</span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-paper">{formatTime(timer)}</span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-paper">
              {score}
              {combo > 1 ? ` x${combo}` : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-paper">
              <WeaponIcon weapon={weapon} size={13} />
              {WEAPONS[weapon].kind === "melee"
                ? WEAPONS[weapon].name
                : `${WEAPONS[weapon].short} ${ammo}`}
            </span>
            {grenades > 0 ? (
              <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                <Bomb size={13} /> {grenades}
              </span>
            ) : null}
            <span
              className={`flex items-center rounded-md bg-black/70 px-1.5 py-1 text-[11px] ${dashReady ? "text-sky-300" : "text-paper/30"}`}
              title="Esquive"
            >
              <Wind size={13} />
            </span>
            <div className="relative h-5 w-20 overflow-hidden rounded-md bg-black/70 ring-1 ring-line sm:w-28">
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
      {boss ? (
        <div className="mx-auto mt-1.5 w-full max-w-md rounded-xl bg-black/70 px-3 py-1.5 ring-1 ring-red-500/40">
          <p className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-red-300">
            <span>{boss.name}</span>
            <span>
              {boss.hp}/{boss.maxHp}
            </span>
          </p>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 transition-[width] duration-200"
              style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
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
            ? " Consejo: esquivá con Shift, agachate (S) ante los libros y saltá el slime. El AK-47 los frena de lejos."
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
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-paper/40">
          {APP_VERSION}
        </p>
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
  const banner = useGame((s) => s.banner);
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
      w.viewW = viewWidthFor(W, H);
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

  /* Touch on the canvas: a virtual stick on the move half, tap on the other half attacks. */
  const dragRef = useRef<{ id: number; x: number; y: number; jumped: boolean } | null>(null);
  const stickBase = useRef<HTMLDivElement>(null);
  const stickKnob = useRef<HTMLDivElement>(null);
  const showStick = (x: number, y: number, dx: number, dy: number, on: boolean) => {
    const b = stickBase.current;
    const k = stickKnob.current;
    if (!b || !k) return;
    b.style.opacity = on ? "1" : "0";
    b.style.transform = `translate(${x - 44}px, ${y - 44}px)`;
    const len = Math.hypot(dx, dy);
    const m = len > 34 ? 34 / len : 1;
    k.style.transform = `translate(${x - 22 + dx * m}px, ${y - 22 + dy * m}px)`;
    k.style.opacity = on ? "1" : "0";
  };
  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    unlockAudio();
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const half = rect.width / 2;
    const lh = useGame.getState().settings.leftHanded;
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const moveSide = lh ? lx > half : lx < half;
    if (moveSide) {
      dragRef.current = { id: e.pointerId, x: lx, y: ly, jumped: false };
      e.currentTarget.setPointerCapture?.(e.pointerId);
      stick.active = true;
      stick.x = 0;
      stick.down = false;
      showStick(lx, ly, 0, 0, true);
    } else {
      pads.attack = true;
      press("attack");
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - d.x;
    const dy = e.clientY - rect.top - d.y;
    stick.x = Math.abs(dx) < 8 ? 0 : Math.max(-1, Math.min(1, dx / 36));
    stick.down = dy > 30;
    if (dy < -38 && !d.jumped) {
      d.jumped = true;
      press("jump");
    } else if (dy > -16) d.jumped = false;
    showStick(d.x, d.y, dx, dy, true);
  };
  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (d && d.id === e.pointerId) {
      dragRef.current = null;
      stick.active = false;
      stick.x = 0;
      stick.down = false;
      showStick(d.x, d.y, 0, 0, false);
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
      {touch ? (
        <>
          <div
            ref={stickBase}
            className="pointer-events-none absolute left-0 top-0 z-[9] size-[88px] rounded-full border-2 border-paper/40 bg-black/25 opacity-0 transition-opacity"
          />
          <div
            ref={stickKnob}
            className="pointer-events-none absolute left-0 top-0 z-[9] size-11 rounded-full bg-paper/80 opacity-0 shadow-soft"
          />
        </>
      ) : null}
      <Hud />
      {toast ? (
        <div className="pointer-events-none absolute inset-x-4 top-[7.5rem] z-20 flex justify-center">
          <div key={toast} className="toast-alert max-w-full px-4 py-2 text-center text-sm">
            {toast}
          </div>
        </div>
      ) : null}
      {banner ? (
        <div
          key={banner.key}
          className={`banner-in pointer-events-none absolute left-1/2 top-[38%] z-20 -translate-x-1/2 px-6 py-2 text-center ${
            banner.kind === "boss"
              ? "rounded-2xl bg-red-900/85 font-display text-2xl text-white ring-2 ring-red-400/60"
              : "rounded-full bg-black/70 font-display text-xl text-paper"
          }`}
        >
          {banner.kind === "boss" ? "JEFE · " : ""}
          {banner.text}
        </div>
      ) : null}
      {touch && overlay !== "talk" ? <TouchControls /> : null}
      {!touch && overlay === null ? (
        <p className="pointer-events-none absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-paper/80">
          A/D mover · W saltar · S agachar · Shift esquivar · J atacar · G granada · E hablar · Q
          arma · Esc pausa{hasGamepad() ? " · mando conectado" : ""}
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
