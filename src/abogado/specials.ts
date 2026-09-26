/**
 * Cartas del ring. Editá acá frases, orden y números; el motor y el render
 * leen estas listas tal cual.
 *
 * - SPECIALS: nuestras armas especiales. Se cargan con puntos y caen sobre Hernán.
 * - POWERUPS: los refuerzos de Hernán. Aparecen solos cada tanto y lo potencian.
 */
export type SpecialCard = {
  id: string;
  /** Nombre corto de la carta (HUD y banner). */
  name: string;
  /** PNG recortado en public/abogado/specials. */
  src: string;
  /** Frase grande que grita la carta al caer. */
  phrase: string;
  /** Lo que responde Hernán cuando la carta lo golpea. */
  reply: string;
  /** Color de la carta y de los rayos. */
  color: string;
  /** Daño como fracción de la vida máxima del round. */
  damage: number;
};

export const SPECIALS: SpecialCard[] = [
  {
    id: "kattya",
    name: "KATTYA GONZÁLEZ",
    src: "/abogado/specials/kattya.png",
    phrase: "¡SOS UN FRAUDE, HERNÁN!",
    reply: "¡Kattya es mala! ¡Ayyy!",
    color: "#1f3fb5",
    damage: 0.36,
  },
  {
    id: "sole",
    name: "SOLE NÚÑEZ",
    src: "/abogado/specials/sole.png",
    phrase: "¡A ESTUDIAR, HERNÁN!",
    reply: "¡La Sole no, por favor!",
    color: "#e98aa0",
    damage: 0.34,
  },
];

export type PowerEffect = "heal" | "shield" | "hype";
export type PowerCard = {
  id: string;
  name: string;
  src: string;
  /** Texto grande que aparece con la carta. */
  shout: string;
  /** Lo que grita Hernán, riéndose, cuando le llega el refuerzo. */
  line: string;
  color: string;
  effect: PowerEffect;
  /** Duración del efecto en segundos (0 = instantáneo). */
  seconds: number;
};

export const POWERUPS: PowerCard[] = [
  {
    id: "bachi",
    name: "PODER BACHI",
    src: "/abogado/specials/bachi.png",
    shout: "¡GRACIAS BACHI!",
    line: "¡Me dieron poder! ¡AAAJAJA! ¡Gracias Bachi!",
    color: "#e8332a",
    effect: "heal",
    seconds: 0,
  },
  {
    id: "oficial",
    name: "FOTO OFICIAL",
    src: "/abogado/specials/hernan-oficial.png",
    shout: "¡TÍTULO BLINDADO!",
    line: "¡Mi foto oficial me protege! ¡JAJAJA!",
    color: "#ffd23f",
    effect: "shield",
    seconds: 9,
  },
  {
    id: "terere",
    name: "TERERÉ DEL SENADO",
    src: "/abogado/specials/hernan-terere.png",
    shout: "¡TERERÉ ENERGÉTICO!",
    line: "¡Tereré del Senado! ¡Ahora sí, JAJAJA!",
    color: "#2ec27e",
    effect: "hype",
    seconds: 10,
  },
];

/** Puntos que llenan el medidor una vez. */
export const SPECIAL_COST = 3600;
/** Duración de la carta en pantalla (segundos). */
export const SPECIAL_SECONDS = 2.8;
/** Momento del impacto dentro de la animación. */
export const SPECIAL_HIT_AT = 0.62;
/** Cada cuánto (segundos, mín y máx) le llega un refuerzo a Hernán. */
export const POWER_INTERVAL: [number, number] = [16, 24];
export const POWER_SECONDS = 2.6;
export const POWER_HIT_AT = 0.6;
/** Cuánto cura Bachi (fracción de la vida máxima). */
export const HEAL_FRACTION = 0.35;
