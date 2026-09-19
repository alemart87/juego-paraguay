export type FighterId = "masivo" | "onichan" | "anatomic" | "comadre" | "papu" | "secre";
export type EpisodeId = 1 | 2 | 3 | 4;
export type WeaponId = "fist" | "knife" | "bat" | "pistol" | "ak" | "shotgun" | "smg" | "grenade";
export type Difficulty = "tranqui" | "picante";
export interface Boss {
  name: string;
  title: string;
  minion: string;
  color: string;
  portrait: string;
}
export const BOSSES: Record<EpisodeId, Boss> = {
  1: {
    name: "PASTOR LUISON",
    title: "El pastor del live sagrado",
    minion: "Criatura del culto",
    color: "#f6e75a",
    portrait: "/media/characters/boss-luison.webp",
  },
  2: {
    name: "LATA PARARA",
    title: "El rey de la lata poseída",
    minion: "Lata endemoniada",
    color: "#efb764",
    portrait: "/media/characters/boss-lata.webp",
  },
  3: {
    name: "LULAX",
    title: "El streamer del grito eterno",
    minion: "Micrófono poseído",
    color: "#b578ff",
    portrait: "/media/characters/boss-lulax.webp",
  },
  4: {
    name: "EL DICTADOR",
    title: "El patrón de la tanqueta",
    minion: "Pyrague del barrio",
    color: "#e8483f",
    portrait: "/battle/dictador-portrait.webp",
  },
};
export const boss = (id: EpisodeId) => BOSSES[id];
export interface Fighter {
  id: FighterId;
  name: string;
  role: string;
  quote: string;
  color: string;
  row: number;
  portrait: string;
  hp: number;
  speed: number;
  power: string;
  powerHint: string;
  superName: string;
  cooldown: number;
}
export const FIGHTERS: Fighter[] = [
  {
    id: "masivo",
    name: "Masivo Bro",
    role: "Fuerza bruta",
    quote: "Mucho filtro. Poco entrenamiento, bro.",
    color: "#efb764",
    row: 0,
    portrait: "/media/characters/masivo-bro.webp",
    hp: 150,
    speed: 255,
    power: "Embestida masiva",
    powerHint: "Atravesá al rival y rompé su guardia.",
    superName: "Modo Masivo",
    cooldown: 7,
  },
  {
    id: "onichan",
    name: "Onichan",
    role: "Velocidad & engaño",
    quote: "Tu ego no entra en este episodio, uwu.",
    color: "#f48dc5",
    row: 1,
    portrait: "/media/characters/onichan.webp",
    hp: 105,
    speed: 305,
    power: "Paso UwU",
    powerHint: "Desplazate con invulnerabilidad y una onda rosa.",
    superName: "Arco de temporada",
    cooldown: 6,
  },
  {
    id: "anatomic",
    name: "ANATOMIC BLOGS",
    role: "Control de mercado",
    quote: "No perdí. Estoy en corrección.",
    color: "#83caa8",
    row: 2,
    portrait: "/media/characters/anatomic-blogs.webp",
    hp: 115,
    speed: 270,
    power: "Vela verde",
    powerHint: "Escudo temporal que devuelve energía.",
    superName: "Mercado volátil",
    cooldown: 9,
  },
  {
    id: "comadre",
    name: "La Comadre",
    role: "Dueña del escenario",
    quote: "Vos levantás pesas. Yo levanto el rating.",
    color: "#ff725f",
    row: 3,
    portrait: "/media/characters/la-comadre.webp",
    hp: 120,
    speed: 280,
    power: "Fuera de mi live",
    powerHint: "Una onda de micrófono empuja a tus rivales.",
    superName: "La reina del feed",
    cooldown: 8,
  },
  {
    id: "papu",
    name: "El Papu",
    role: "Ritmo & trampas",
    quote: "No se trabó. Es la versión extendida.",
    color: "#88b5f4",
    row: 4,
    portrait: "/media/characters/el-papu.webp",
    hp: 125,
    speed: 275,
    power: "Pendrive remix",
    powerHint: "Un USB búmeran golpea de ida y vuelta.",
    superName: "Moto con subwoofer",
    cooldown: 7,
  },
  {
    id: "secre",
    name: "La Secre",
    role: "Defensa & burocracia",
    quote: "Para reclamar que no hay sistema, sacá turno.",
    color: "#c9d2b4",
    row: 5,
    portrait: "/media/characters/la-secre.webp",
    hp: 140,
    speed: 255,
    power: "Falta fotocopia",
    powerHint: "Sellá el suelo y frená a los enemigos.",
    superName: "Sistema caído",
    cooldown: 9,
  },
];
export const fighter = (id: FighterId) => FIGHTERS.find((f) => f.id === id)!;
export interface Episode {
  id: EpisodeId;
  location: string;
  title: string;
  subtitle: string;
  bg: string;
  color: string;
  intro: string;
  twist: string;
  rival: FighterId;
  alternate: FighterId;
  npc: FighterId;
  objectives: [string, string];
  taunt: string;
  choices: [string, string, string];
  replies: [string, string, string];
}
export const EPISODES: Episode[] = [
  {
    id: 1,
    location: "Costanera de Asunción",
    title: "En vivo y sin filtro",
    subtitle: "Dos egos. Una sola transmisión.",
    bg: "/battle/costanera.webp",
    color: "#efb764",
    intro:
      "Ñandutí Live prometió el escenario a Masivo y a Onichan. Pero el Pastor Luison tomó la señal y soltó sus mascotas sobrenaturales. Recuperá las antenas antes de su transmisión sagrada.",
    twist:
      "La señal vuelve justo cuando cae el último rayo. Entre el humo aparece una lata con una dirección del Mercado 4.",
    rival: "masivo",
    alternate: "onichan",
    npc: "anatomic",
    objectives: ["Cortá la invasión de criaturas", "Recuperá la señal del live"],
    taunt: "El rating está volátil. Yo te cubro… si no rompés el gráfico.",
    choices: ["Pedile un escudo", "Provocá al rival", "Recuperá energía"],
    replies: [
      "Vela verde. Tenés protección para el próximo cruce.",
      "Tu desafío ya está en el feed. Cargué tu súper.",
      "Diversificá: un poco de tereré, un poco de vida.",
    ],
  },
  {
    id: 2,
    location: "Mercado 4",
    title: "El pendrive de oro",
    subtitle: "El negocio del siglo pesa 32 GB.",
    bg: "/battle/mercado.webp",
    color: "#83caa8",
    intro:
      "Papu tiene tres cajas y demasiadas versiones de la historia. Lata Parara convirtió los puestos en una fábrica de latas poseídas. Recuperá los USB antes de que el mercado quede bajo espuma.",
    twist:
      "La última lata guarda el archivo y una transmisión de LULAX: el streamer espera detrás de una fila imposible en IPS.",
    rival: "comadre",
    alternate: "anatomic",
    npc: "papu",
    objectives: ["Limpiá el callejón de latas", "Encontrá el archivo original"],
    taunt: "Este USB tiene todo, menos garantía. ¿Qué necesitás, socio?",
    choices: ["Pedile munición", "Subí el volumen", "Un tereré, primero"],
    replies: [
      "Te cargo las armas. ¡Una sola compra, toda la partida!",
      "Bass boost activado. Tu próximo súper viene con remix.",
      "Esperá que arranque la moto… mejor tomá esto y seguí.",
    ],
  },
  {
    id: 3,
    location: "IPS · Ventanilla imposible",
    title: "Turno para el apocalipsis",
    subtitle: "El último enemigo nunca toma licencia.",
    bg: "/battle/ips.webp",
    color: "#c9d2b4",
    intro:
      "Para autorizar el video necesitás el formulario que autoriza pedir el formulario. LULAX tomó la sala de espera y sus micrófonos poseídos repiten insultos censurados sin parar.",
    twist:
      "Cae el último micrófono y sale el video completo. Por un segundo hay paz… hasta que todos discuten quién se lleva el crédito. «Vuelva mañana», imprime La Secre.",
    rival: "secre",
    alternate: "papu",
    npc: "secre",
    objectives: ["Silenciá los micrófonos", "Autorizá el archivo original"],
    taunt:
      "Ni yo controlo esa transmisión. LULAX convirtió cada micrófono en un problema con patas.",
    choices: ["Alianza contra el sistema", "Cargá el súper", "Necesito recuperarme"],
    replies: [
      "Por una vez, vamos a estar del mismo lado. Tenés un escudo.",
      "Autorizado. Que lo atienda tu poder especial.",
      "Esto sí hay: descanso y tereré. Seguí cuando estés listo.",
    ],
  },
  {
    id: 4,
    location: "Asunción infestada",
    title: "La noche de los pyragues",
    subtitle: "La ciudad escucha. La ciudad también acusa.",
    bg: "/battle/asuncion-infestada.webp",
    color: "#e8483f",
    intro:
      "Una tormenta dejó el centro a oscuras y los pyragues ocuparon cada bache. Lanzan caña, cigarrillos y consignas desde las esquinas. Cruzá la avenida y llegá al Palacio antes que arranque la tanqueta.",
    twist:
      "La tanqueta se apaga, la hondita cae al asfalto y Asunción recupera sus luces. El feed proclama ganador a todo el mundo al mismo tiempo.",
    rival: "comadre",
    alternate: "masivo",
    npc: "secre",
    objectives: ["Despejá la avenida de pyragues", "Abrí el acceso al Palacio"],
    taunt:
      "El archivo dice que esta calle estaba reparada. La calle dice otra cosa. Llegá al Palacio y terminemos el trámite.",
    choices: ["Sellá mi inmunidad", "Cargá el súper", "Dame tereré medicinal"],
    replies: [
      "Inmunidad provisoria aprobada. Ocho segundos, ni uno más.",
      "Sello rojo. Súper completo. Que atienda el siguiente.",
      "Receta paraguaya: tereré, descanso y seguir peleando.",
    ],
  },
];
export const episode = (id: EpisodeId) => EPISODES[id - 1];
export const rivalFor = (level: EpisodeId, hero: FighterId) => {
  const e = episode(level);
  return e.rival === hero ? e.alternate : e.rival;
};
export const WEAPON_LABEL: Record<WeaponId, string> = {
  fist: "Puños",
  knife: "Cuchillo",
  bat: "Bate",
  pistol: "Pistola",
  ak: "AK-47",
  shotgun: "Escopeta",
  smg: "SMG",
  grenade: "Granada",
};
export const LOADOUT: WeaponId[] = ["ak", "shotgun", "smg", "pistol", "bat", "knife", "fist"];
export const WEAPON_HINT: Record<WeaponId, string> = {
  fist: "Combo de tres golpes",
  knife: "Rápido a corta distancia",
  bat: "Rompeguardias",
  pistol: "Precisa y económica",
  ak: "Controlá la ráfaga",
  shotgun: "Dominá la corta distancia",
  smg: "Dispará en movimiento",
  grenade: "Control de área",
};
export const FICTION =
  "Ficción satírica. Personajes y situaciones de videojuego; sin afiliación con las personas o instituciones representadas.";
