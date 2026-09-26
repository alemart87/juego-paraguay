/**
 * Armas especiales: cartas con fotos recortadas que caen sobre el abogado cuando
 * el medidor se llena. Editá acá las frases y el orden; el motor y el render
 * leen esta lista tal cual.
 */
export type SpecialId = "bachi" | "oficial" | "terere";

export type SpecialCard = {
  id: SpecialId;
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
    id: "bachi",
    name: "CARTA BACHI",
    src: "/abogado/specials/bachi.png",
    phrase: "¡BACHI ES MI AMIGO, ¿Y QUÉ?!",
    reply: "¡Bachi, defendeme vos!",
    color: "#ff2d55",
    damage: 0.34,
  },
  {
    id: "oficial",
    name: "FOTO OFICIAL",
    src: "/abogado/specials/hernan-oficial.png",
    phrase: "¡MIRÁ MI FOTO DE ABOGADO!",
    reply: "¡Esa foto es del título!",
    color: "#1f5fd6",
    damage: 0.3,
  },
  {
    id: "terere",
    name: "TERERÉ EN EL SENADO",
    src: "/abogado/specials/hernan-terere.png",
    phrase: "¡ESTOY TRABAJANDO! ¡TOMANDO TERERÉ!",
    reply: "¡Se me cayó el tereré!",
    color: "#2ec27e",
    damage: 0.32,
  },
];

/** Puntos que llenan el medidor una vez. */
export const SPECIAL_COST = 3200;
/** Duración de la carta en pantalla (segundos). */
export const SPECIAL_SECONDS = 2.8;
/** Momento del impacto dentro de la animación. */
export const SPECIAL_HIT_AT = 0.62;
