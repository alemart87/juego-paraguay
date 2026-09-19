export type HeroId = "rafa" | "juan" | "richard" | "hector";
export type HazardId = "masivo" | "pablito" | "marcos" | "gallaguer" | "onichan";
export type TalkKey =
  | HeroId
  | HazardId
  | "carne"
  | "hielo"
  | "terere"
  | "carbon"
  | "grill"
  | "chat"
  | "apuntes"
  | "cafe"
  | "richard2"
  | "examen"
  | "pablito3"
  | "juan3"
  | "juanGo"
  | "fuerza"
  | "cedula"
  | "foto";

/**
 * Dialogue conditions. A line or choice with `when` only shows when every
 * comma-separated clause holds:
 *   flag:x / !flag:x        a memory flag set by an earlier choice or meeting
 *   item:x / !item:x        inventory
 *   recruited:x             team member
 *   weapon:x                currently held weapon
 *   lowhp                   under 35% health
 *   kills>=N                enemies taken down this mission
 *   boss                    the mission boss is beaten
 */
export type Cond = string;

export type Choice = {
  label: string;
  when?: Cond;
  join?: boolean;
  item?: string;
  coins?: number;
  escape?: boolean;
  chaseOff?: boolean;
  honor?: boolean;
  exam?: "ok" | "bad";
  fire?: boolean;
  calm?: boolean;
  /** Remember this choice. */
  set?: string;
  /** Heal the player. */
  heal?: number;
  /** Give ammo for every gun. */
  ammo?: boolean;
  /** Makes the speaker attack right away (no escape bump). */
  fight?: boolean;
};

export type Line = {
  who: HeroId | HazardId | "narrator";
  text: string;
  when?: Cond;
  choices?: Choice[];
};

export type Hero = {
  id: HeroId;
  name: string;
  role: string;
  tagline: string;
  portrait: string;
  sprite: string;
  steps: string[];
  reel: string;
  accent: string;
  /** Small gameplay perks so the hero choice matters. */
  perk: { label: string; speed: number; hp: number; ammo: number };
  /** What they yell when they hit someone as a follower. */
  warcry: string;
};

export type HazardDef = {
  id: HazardId;
  name: string;
  role: string;
  tagline: string;
  portrait: string;
  sprite: string;
  steps: string[];
  accent: string;
  speed: number;
  /** Hits (pistol bullets) needed to take them down. Melee on Marcos/Gallaguer is a one-shot gag. */
  hp: number;
  sight: number;
  leash: number;
  alert: string;
  lost: string;
  killed: string;
  chaseLabel: string;
  /** Things they yell while chasing. */
  barks: string[];
  /** Things they yell as a boss. */
  bossBarks: string[];
};

/* ------------------------------------------------------------------ */
/* Weapons                                                             */
/* ------------------------------------------------------------------ */

export type WeaponId = "fist" | "knife" | "bat" | "pistol" | "ak" | "shotgun" | "smg" | "grenade";
export type GunId = "pistol" | "ak" | "shotgun" | "smg" | "grenade";

export type WeaponDef = {
  id: WeaponId;
  name: string;
  short: string;
  kind: "melee" | "gun" | "throw";
  dmg: number;
  cooldown: number;
  /** Melee reach in world units. */
  reach?: number;
  /** Bullet range in world units (undefined = whole screen). */
  range?: number;
  pellets?: number;
  spread?: number;
  speed?: number;
  /** Ammo given by a pickup / at start. */
  pickup: number;
  start: number;
  /** Knockback multiplier for melee. */
  knock?: number;
  hint: string;
};

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  fist: {
    id: "fist",
    name: "Puño",
    short: "Puño",
    kind: "melee",
    dmg: 1,
    cooldown: 0.34,
    reach: 14,
    pickup: 0,
    start: 0,
    knock: 1,
    hint: "Tres golpes seguidos: el tercero remata.",
  },
  knife: {
    id: "knife",
    name: "Cuchillo",
    short: "Cuchi",
    kind: "melee",
    dmg: 2,
    cooldown: 0.38,
    reach: 20,
    pickup: 0,
    start: 0,
    knock: 0.8,
    hint: "Rápido y sangriento.",
  },
  bat: {
    id: "bat",
    name: "Bate",
    short: "Bate",
    kind: "melee",
    dmg: 2,
    cooldown: 0.52,
    reach: 22,
    pickup: 0,
    start: 0,
    knock: 1.6,
    hint: "Lento pero los manda a volar.",
  },
  pistol: {
    id: "pistol",
    name: "Pistola",
    short: "Pist",
    kind: "gun",
    dmg: 1,
    cooldown: 0.26,
    speed: 260,
    pickup: 8,
    start: 12,
    hint: "Precisa. Mantené para disparar seguido.",
  },
  ak: {
    id: "ak",
    name: "AK-47",
    short: "AK-47",
    kind: "gun",
    dmg: 2,
    cooldown: 0.11,
    speed: 330,
    spread: 1,
    pickup: 60,
    start: 1000,
    hint: "Arranca cargado con 1000 balas. Mantené apretado y barré la zona.",
  },
  shotgun: {
    id: "shotgun",
    name: "Escopeta",
    short: "Esco",
    kind: "gun",
    dmg: 1,
    cooldown: 0.78,
    speed: 210,
    range: 46,
    pellets: 3,
    spread: 3,
    pickup: 4,
    start: 6,
    hint: "Tres perdigones. Corta distancia.",
  },
  smg: {
    id: "smg",
    name: "Metralleta",
    short: "SMG",
    kind: "gun",
    dmg: 1,
    cooldown: 0.09,
    speed: 300,
    range: 90,
    spread: 2,
    pickup: 24,
    start: 30,
    hint: "Ráfaga. Se vacía rápido.",
  },
  grenade: {
    id: "grenade",
    name: "Granada",
    short: "Gran",
    kind: "throw",
    dmg: 3,
    cooldown: 0.9,
    pickup: 2,
    start: 2,
    hint: "Explota en área. Alejate.",
  },
};

export const WEAPON_NAME: Record<WeaponId, string> = Object.fromEntries(
  Object.values(WEAPONS).map((w) => [w.id, w.name]),
) as Record<WeaponId, string>;

/** Cycle order for the swap button (grenades have their own button). */
export const WEAPON_ORDER: WeaponId[] = ["ak", "pistol", "shotgun", "smg", "bat", "knife", "fist"];

function stepsOf(id: string) {
  return [0, 1, 2, 3].map((i) => `/sprites/walk/${id}-${i}.png`);
}

export const HEROES: Hero[] = [
  {
    id: "rafa",
    name: "Rafa",
    role: "El que arma",
    tagline: "Si hay silencio, hay asado.",
    portrait: "/characters/rafa.jpg",
    sprite: "/sprites/rafa.png",
    steps: stepsOf("rafa"),
    reel: "/select/rafa.mp4",
    accent: "#d4a45a",
    perk: { label: "Equilibrado", speed: 1, hp: 100, ammo: 12 },
    warcry: "¡Por el asado!",
  },
  {
    id: "juan",
    name: "Juan",
    role: "La mochila",
    tagline: "Poco mensaje. Mucho límite.",
    portrait: "/characters/juan.jpg",
    sprite: "/sprites/juan.png",
    steps: stepsOf("juan"),
    reel: "/select/juan.mp4",
    accent: "#c4b59a",
    perk: { label: "Más rápido", speed: 1.12, hp: 90, ammo: 10 },
    warcry: "Yo dispongo.",
  },
  {
    id: "richard",
    name: "Richard",
    role: "El ancla",
    tagline: "Menos charla. Más fecha.",
    portrait: "/characters/richard.jpg",
    sprite: "/sprites/richard.png",
    steps: stepsOf("richard"),
    reel: "/select/richard.mp4",
    accent: "#c2413b",
    perk: { label: "Más balas", speed: 0.96, hp: 100, ammo: 18 },
    warcry: "¡Menos charla!",
  },
  {
    id: "hector",
    name: "Héctor",
    role: "El pegamento",
    tagline: "Un reel, un partido, y fuerza.",
    portrait: "/characters/hector.jpg",
    sprite: "/sprites/hector.png",
    steps: stepsOf("hector"),
    reel: "/select/hector.mp4",
    accent: "#8aa0b8",
    perk: { label: "Más vida", speed: 0.94, hp: 130, ammo: 10 },
    warcry: "¡Fuerza!",
  },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h])) as Record<HeroId, Hero>;
export const TEAM: HeroId[] = ["rafa", "juan", "richard", "hector"];
export const NAMES: Record<HeroId, string> = {
  juan: "Juan",
  richard: "Richard",
  hector: "Héctor",
  rafa: "Rafa",
};

export const HAZARDS: HazardDef[] = [
  {
    id: "masivo",
    name: "Masivo Bro",
    role: "El coach",
    tagline: "SOS Pobro.",
    portrait: "/characters/masivo.jpg",
    sprite: "/sprites/masivo.png",
    steps: stepsOf("masivo"),
    accent: "#e8c15a",
    speed: 34,
    hp: 3,
    sight: 24,
    leash: 60,
    alert: "¡SOS Pobro! ¡CORRÉ!",
    lost: "Masivo: fuera de acá.",
    killed: "¡Masivo revienta!",
    chaseLabel: "GYM",
    barks: ["¡SOS POBRO!", "¡Gym, gordo!", "¡Vení a entrenar!", "¡Sin excusas!"],
    bossBarks: ["¡MODO BESTIA!", "¡Esto es PROTEÍNA!", "¡Nadie come sin sentadillas!", "¡AHÍ VOY!"],
  },
  {
    id: "pablito",
    name: "Pablito Pintos",
    role: "No te quedes",
    tagline: "Vení, no seas así.",
    portrait: "/characters/pablito.jpg",
    sprite: "/sprites/pablito.png",
    steps: stepsOf("pablito"),
    accent: "#e8a0c8",
    speed: 37,
    hp: 2,
    sight: 22,
    leash: 58,
    alert: "¡Pablito te vio! ¡ESCAPÁ!",
    lost: "Zafaste de Pablito.",
    killed: "¡Pablito explota!",
    chaseLabel: "VENÍ",
    barks: ["¡Vení, lindo!", "¡No seas frío!", "¡Hoy hay cama!", "¿Por qué corrés?"],
    bossBarks: [
      "¡Juan no aparece, yo sí!",
      "¡El cornudo no se entera!",
      "¡Esto es AHORA!",
      "¡Quedate!",
    ],
  },
  {
    id: "marcos",
    name: "Marcos",
    role: "Coordinador UPAP",
    tagline: "Tocame la panza.",
    portrait: "/characters/marcos.jpg",
    sprite: "/sprites/marcos.png",
    steps: stepsOf("marcos"),
    accent: "#b07ad4",
    speed: 24,
    hp: 2,
    sight: 22,
    leash: 56,
    alert: "¡Marcos tira libros!",
    lost: "Marcos se queda tirando tesis.",
    killed: "Marcos explota.",
    chaseLabel: "TESIS",
    barks: ["¡Tomá tesis!", "¡Richard me dejó en visto!", "¡Tocame la panza!", "¡Ay, nene!"],
    bossBarks: [
      "¡TESIS FINAL!",
      "¡Nadie rinde sin mi firma!",
      "¡Bibliografía completa!",
      "¡Capítulo diez!",
    ],
  },
  {
    id: "gallaguer",
    name: "Gallaguer",
    role: "El que escribe",
    tagline: "¿Escribe tu amiga?",
    portrait: "/characters/gallaguer.jpg",
    sprite: "/sprites/gallaguer.png",
    steps: stepsOf("gallaguer"),
    accent: "#5aa8d4",
    speed: 40,
    hp: 2,
    sight: 22,
    leash: 56,
    alert: "¡Gallaguer te vio!",
    lost: "Gallaguer perdió el hilo.",
    killed: "¡Le explota la cabeza!",
    chaseLabel: "¿ESCRIBE?",
    barks: ["¿Escribe tu amiga?", "¡Pasame el Insta!", "¡Es ciencia!", "¡Siempre lo encuentro!"],
    bossBarks: ["¡Audio a las tres!", "¡Investigación!", "¡Ya lo encontré!"],
  },
  {
    id: "onichan",
    name: "Onichan",
    role: "La streamer",
    tagline: "Estoy en vivo.",
    portrait: "/characters/onichan.jpg",
    sprite: "/sprites/onichan.png",
    steps: stepsOf("onichan"),
    accent: "#f4a0c8",
    speed: 30,
    hp: 2,
    sight: 40,
    leash: 66,
    alert: "¡Onichan está en vivo! ¡Capi tira slime!",
    lost: "Onichan cortó el live.",
    killed: "Onichan cortó. Capi sale volando.",
    chaseLabel: "EN VIVO",
    barks: ["¡Saludá al chat!", "¡Capi, slime!", "¡Es contenido!", "¡Suscribite!"],
    bossBarks: ["¡Live especial!", "¡Diez mil viendo!"],
  },
];

export const HAZARD_BY_ID = Object.fromEntries(HAZARDS.map((h) => [h.id, h])) as Record<
  HazardId,
  HazardDef
>;

/* ------------------------------------------------------------------ */
/* Dialogue                                                            */
/* ------------------------------------------------------------------ */

export const TALKS: Record<TalkKey, Line[]> = {
  juan: [
    {
      who: "juan",
      text: "Estoy re contra cansado. Si es asado, decime ya.",
      when: "!flag:met:juan",
    },
    {
      who: "juan",
      text: "Otra vez vos. ¿Ya hay fuego o seguís juntando cosas?",
      when: "flag:met:juan",
    },
    { who: "juan", text: "Yo dispongo. Sin grupo eterno. Sin vueltas." },
    {
      who: "juan",
      text: "Te veo con esa escopeta. Al menos alguien se preparó.",
      when: "weapon:shotgun",
    },
    {
      who: "juan",
      text: "Si hay fuego, voy. Si no, sigo en mi límite.",
      choices: [
        { label: "Hoy. Mochila y listo.", join: true },
        {
          label: "¿Tenés algo para el dolor?",
          when: "lowhp,!flag:juan:heal",
          heal: 25,
          set: "juan:heal",
        },
        { label: "Después vemos.", set: "juan:later" },
      ],
    },
  ],
  richard: [
    { who: "richard", text: "¿Hay fecha o es otro chat eterno?", when: "!flag:met:richard" },
    { who: "richard", text: "Volviste. ¿Ahora sí hay fecha?", when: "flag:met:richard" },
    { who: "richard", text: "El MEC no espera. El asado tampoco. Elegí." },
    {
      who: "richard",
      text: "Vi que ya bajaste a tres de esos. Menos charla, más eso.",
      when: "kills>=3",
    },
    {
      who: "richard",
      text: "Si hay fecha, yo llevo la carne. Menos charla.",
      choices: [
        { label: "Sábado. Ahora.", join: true },
        { label: "¿Te sobran balas?", when: "!flag:richard:ammo", ammo: true, set: "richard:ammo" },
        { label: "Aún no hay hora.", set: "richard:later" },
      ],
    },
  ],
  hector: [
    { who: "hector", text: "Fuerza. ¿Arma pues o seguimos en el aire?", when: "!flag:met:hector" },
    { who: "hector", text: "Fuerza. ¿Ya está el equipo o falta alguien?", when: "flag:met:hector" },
    { who: "hector", text: "Un reel, un partido, el asado. El finde está libre." },
    { who: "hector", text: "Estás hecho pelota. Tomá, un tereré y seguimos.", when: "lowhp" },
    {
      who: "hector",
      text: "Me sumo. Pero que sea de verdad.",
      choices: [
        { label: "Arma. Vení.", join: true },
        { label: "Fuerza. Curame.", when: "lowhp,!flag:hector:heal", heal: 30, set: "hector:heal" },
        { label: "Todavía no." },
      ],
    },
  ],
  rafa: [
    { who: "rafa", text: "Si hay silencio, yo armo el asado. Siempre.", when: "!flag:met:rafa" },
    { who: "rafa", text: "¿Y? ¿Juntaste todo o seguimos en el aire?", when: "flag:met:rafa" },
    { who: "rafa", text: "Hielo, carbón, carne, los cuatro. Esa es la misión." },
    {
      who: "rafa",
      text: "Cuidado con Masivo al final. Cuando se pone en modo bestia, esquivá (Shift) y pegale de lejos.",
      when: "!item:boss",
    },
    {
      who: "rafa",
      text: "Los cuatro. El fuego. No hay otra.",
      choices: [
        { label: "Vamos. Vos liderás.", join: true },
        { label: "¿Tenés balas?", when: "!flag:rafa:ammo", ammo: true, set: "rafa:ammo" },
        { label: "Después." },
      ],
    },
  ],
  carne: [
    { who: "narrator", text: "Mostrador de barrio. El corte espera, como el grupo." },
    {
      who: "narrator",
      text: "¿Llevamos la carne para el equipo?",
      choices: [{ label: "Esto es. Anotá.", item: "carne" }, { label: "Después paso." }],
    },
  ],
  hielo: [
    { who: "narrator", text: "Hielo del muelle. Sin esto la conservadora muere." },
    {
      who: "narrator",
      text: "¿Lo llevamos?",
      choices: [{ label: "Obvio.", item: "hielo" }, { label: "Después." }],
    },
  ],
  terere: [
    { who: "narrator", text: "Tereré. Nunca mezclen mamón, decía el grupo." },
    {
      who: "narrator",
      text: "¿Anotamos?",
      choices: [{ label: "Dale.", item: "terere" }, { label: "Sigo." }],
    },
  ],
  carbon: [
    { who: "narrator", text: "Un cajón de carbón. El fuego ya no tiene excusa." },
    {
      who: "narrator",
      text: "¿Lo cargamos?",
      choices: [{ label: "Arriba.", item: "carbon" }, { label: "Pesado." }],
    },
  ],
  grill: [
    {
      who: "narrator",
      text: "El quincho está listo. Falta gente, hielo, carbón o carne.",
      when: "!boss",
    },
    { who: "narrator", text: "Masivo quedó tirado. El quincho es de ustedes.", when: "boss" },
    {
      who: "narrator",
      text: "¿Encendemos el asado?",
      choices: [{ label: "Fuego. Misión 1.", fire: true }, { label: "Todavía no." }],
    },
  ],
  masivo: [
    {
      who: "masivo",
      text: "¿Y vos? SOS Pobro. SOS Gordo. ¿Gym o seguís así?",
      when: "!flag:met:masivo",
    },
    { who: "masivo", text: "Otra vez vos, Pobro. ¿Volviste por más?", when: "flag:met:masivo" },
    {
      who: "masivo",
      text: "¿Con esa pistolita me querés asustar? Yo levanto 200.",
      when: "weapon:pistol",
    },
    { who: "masivo", text: "¿Un bate? Ah, ahora sí hablamos de deporte.", when: "weapon:bat" },
    {
      who: "masivo",
      text: "Te doy unos guaraníes si corrés. Si no, fuera de acá.",
      choices: [
        { label: "Dame la plata y me voy.", coins: 8, escape: true, set: "masivo:coins" },
        { label: "Fuera de acá. Corro.", escape: true },
        { label: "Vení, gordo. Peleamos.", fight: true, set: "masivo:fight" },
      ],
    },
  ],
  pablito: [
    {
      who: "pablito",
      text: "Ey, lindo. Vení a mi pieza. Hoy no hay asado, hay cama.",
      when: "!flag:met:pablito",
    },
    { who: "pablito", text: "Volviste. Sabía que ibas a volver.", when: "flag:met:pablito" },
    {
      who: "pablito",
      text: "No seas frío. O ¿vas a escapar como todos?",
      choices: [
        { label: "Ni ahí. Me voy.", escape: true },
        { label: "Escapar ahora.", escape: true },
        { label: "Fuera de acá, Pablito.", fight: true, set: "pablito:fight" },
      ],
    },
  ],
  chat: [
    { who: "narrator", text: "El celular de Juan. Un chat que no debería existir." },
    { who: "narrator", text: "Pablito le escribió a su chica. Hora: ahora. Lugar: el muelle." },
    {
      who: "narrator",
      text: "¿Guardamos la prueba?",
      choices: [{ label: "Esto se lo muestro a Juan.", item: "chat" }, { label: "Después." }],
    },
  ],
  apuntes: [
    { who: "narrator", text: "Apuntes del MEC, olvidados en las ruinas de la UPAP." },
    {
      who: "narrator",
      text: "Richard los necesita para no aplazarse.",
      choices: [{ label: "Esto es para Richard.", item: "apuntes" }, { label: "Después." }],
    },
  ],
  cafe: [
    { who: "narrator", text: "Café de cancha. Amargo. Como rendir un domingo." },
    {
      who: "narrator",
      text: "¿Se lo llevamos a Richard?",
      choices: [{ label: "Que se despierte.", item: "cafe" }, { label: "Sigo." }],
    },
  ],
  cedula: [
    { who: "narrator", text: "La cédula de Richard, olvidada en un banco del patio." },
    {
      who: "narrator",
      text: "Sin esto no entra a Clínicas.",
      choices: [{ label: "Esto entra al aula.", item: "cedula" }, { label: "Después." }],
    },
  ],
  foto: [
    { who: "narrator", text: "Una captura. Pablito en el muelle. Hora: ahora." },
    {
      who: "narrator",
      text: "¿La guardamos como prueba?",
      choices: [{ label: "Esto se lo muestro a Juan.", item: "foto" }, { label: "Después." }],
    },
  ],
  fuerza: [
    { who: "hector", text: "Fuerza. Richard no rinde solo. Café no alcanza." },
    { who: "hector", text: "Yo lo banco. Vos conseguí la cédula y lleválo al aula." },
    {
      who: "hector",
      text: "Marcos anda diciendo que nadie rinde sin su firma. Prepará el bate.",
      when: "!item:boss",
    },
    {
      who: "hector",
      text: "Cuando esté listo, vamos. El MEC no espera.",
      choices: [
        { label: "Fuerza. Voy por la cédula.", item: "fuerza" },
        {
          label: "Curame primero.",
          when: "lowhp,!flag:hector:heal2",
          heal: 30,
          set: "hector:heal2",
        },
        { label: "Todavía no." },
      ],
    },
  ],
  richard2: [
    { who: "richard", text: "El asado ya fue. Ahora el MEC. Si no hay material, no rindo." },
    { who: "richard", text: "Apuntes. Café. Y que me lleven a Clínicas. Menos charla." },
    {
      who: "richard",
      text: "Cuando esté listo, vamos a rendir. Fecha: ahora.",
      choices: [{ label: "Voy por los apuntes y el café." }, { label: "Rendir ya.", exam: "ok" }],
    },
  ],
  examen: [
    { who: "narrator", text: "Clínicas. Aula fría. Richard se sienta. El reloj corre." },
    {
      who: "narrator",
      text: "Pregunta 1. El grupo se arma cuando…",
      choices: [
        { label: "Hay fecha y carne.", exam: "ok" },
        { label: "Hay 40 mensajes sin hora.", exam: "bad" },
      ],
    },
    {
      who: "narrator",
      text: "Pregunta 2. Juan dice «yo dispongo». Eso significa…",
      choices: [
        { label: "Tiene límite. Respetalo.", exam: "ok" },
        { label: "Que vaya igual.", exam: "bad" },
      ],
    },
    {
      who: "narrator",
      text: "Pregunta 3. Si hay silencio en el chat…",
      choices: [
        { label: "Rafa arma el asado.", exam: "ok" },
        { label: "Se cancela todo.", exam: "bad" },
      ],
    },
    {
      who: "narrator",
      text: "Pregunta 4. Marcos bloquea el aula con una tesis. ¿Qué hacés?",
      choices: [
        { label: "Lo enfrentás con el equipo.", exam: "ok" },
        { label: "Le tocás la panza y te vas.", exam: "bad" },
      ],
    },
  ],
  pablito3: [
    { who: "pablito", text: "¿Juan? Ese no aparece. Yo sí. Decile a tu chica que se quede." },
    { who: "pablito", text: "El cornudo ni se entera. Vení, que esto es ahora." },
    {
      who: "hector",
      text: "Fuerza no es esto. Fuera de acá.",
      choices: [
        { label: "Pablito, fuera. Juan no es cornudo.", chaseOff: true },
        { label: "Esto se va a podrir.", chaseOff: true },
        { label: "Esto se arregla a los golpes.", fight: true, set: "pablito:fight" },
      ],
    },
  ],
  juan3: [
    { who: "juan", text: "Vi el chat. Estoy re contra cansado de esta basura." },
    { who: "juan", text: "Si era verdad, yo ya no dispongo. Me borro." },
    {
      who: "juan",
      text: "Me dijeron que lo hiciste volar en el muelle. Eso es un amigo.",
      when: "boss",
    },
    {
      who: "juan",
      text: "Decime que lo echaste. Sin vueltas.",
      choices: [
        { label: "Lo echamos. Vos no sos cornudo.", honor: true },
        { label: "Todavía está por acá." },
      ],
    },
  ],
  marcos: [
    {
      who: "marcos",
      text: "Ay, nene. Soy Marcos, coordinador de UPAP. Richard me dejó en visto otra vez.",
      when: "!flag:met:marcos",
    },
    {
      who: "marcos",
      text: "Ay, nene, volviste. ¿Richard mandó algo? ¿Un audio? ¿Un sticker?",
      when: "flag:met:marcos",
    },
    {
      who: "marcos",
      text: "Fui su pareja. Todavía lo siento. Si me tocás la panza, me calmo. Si me pegás… no, no me pegues.",
    },
    {
      who: "marcos",
      text: "Richard está en tu equipo. Decile que me escriba. Por favor.",
      when: "recruited:richard",
    },
    {
      who: "marcos",
      text: "Richard tiene que estar acá. El grupo, el asado, el examen. Yo armo todo. Él es el único que me desarma.",
      choices: [
        { label: "Le toco la panza.", calm: true, set: "marcos:calm" },
        { label: "Richard no viene.", escape: true },
        { label: "Marcos, andá a terapia.", fight: true, set: "marcos:fight" },
      ],
    },
  ],
  gallaguer: [
    {
      who: "gallaguer",
      text: "Che, mirá esta mina. ¿Escribe tu amiga? Yo le quiero conocer. Ahora.",
      when: "!flag:met:gallaguer",
    },
    {
      who: "gallaguer",
      text: "Volviste. ¿Ya le pasaste mi Instagram a tu amiga?",
      when: "flag:met:gallaguer",
    },
    {
      who: "gallaguer",
      text: "A las novias del equipo les mando audio a las tres. Es investigación. No es celos. Es ciencia.",
    },
    {
      who: "gallaguer",
      text: "Pasame el Instagram. Si no me lo pasás, yo igual lo encuentro. Siempre lo encuentro.",
      choices: [
        { label: "Estás loco, Gallaguer.", escape: true },
        { label: "Borrá ese chat.", escape: true },
        {
          label: "Te lo paso si me das balas.",
          when: "!flag:gallaguer:ammo",
          ammo: true,
          set: "gallaguer:ammo",
        },
      ],
    },
  ],
  onichan: [
    {
      who: "onichan",
      text: "Hola bebé. Estoy en vivo. El chat quiere que te moleste.",
      when: "!flag:met:onichan",
    },
    { who: "onichan", text: "¡Volvió el bebé! Chat, saluden.", when: "flag:met:onichan" },
    { who: "onichan", text: "Capi tira slime. No es personal. Es contenido." },
    {
      who: "onichan",
      text: "Saludá al live o corré. Yo igual te sigo.",
      choices: [
        { label: "Fuera de acá, Onichan.", escape: true },
        { label: "Capi se queda. Vos no.", escape: true },
        { label: "Hola chat. (Saludás)", when: "!flag:onichan:hi", heal: 15, set: "onichan:hi" },
      ],
    },
  ],
  juanGo: [
    { who: "juan", text: "Estoy re contra cansado. Pablito le escribió a mi chica. Hoy." },
    { who: "juan", text: "Cuatro pasos. Sin vueltas." },
    {
      who: "juan",
      text: "1. El chat en el pasillo. 2. La foto en el bosque. 3. Enfrentá a Pablito en el muelle. 4. Volvé.",
      choices: [{ label: "Voy. Chat, foto, muelle, y vuelvo.", item: "aviso" }],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Levels                                                              */
/* ------------------------------------------------------------------ */

export type PickupKind =
  "coin" | "item" | "ammo" | "heal" | "knife" | "bat" | "shotgun" | "smg" | "grenade";
export type Pickup = {
  id: string;
  kind: PickupKind;
  x: number;
  /** Height above the ground (for things placed on platforms). */
  y?: number;
  talk?: TalkKey;
  label?: string;
};
export type NpcSpot = { id: HeroId; x: number };
export type Prop = { src: string; x: number; h: number; flip?: boolean };
export type Zone = { id: string; name: string; bg: string };
/** A floating ledge the player can jump onto (center x, width, height above ground). */
export type Platform = { x: number; w: number; h: number };
/** A solid crate: blocks walking, can be jumped over or stood on, stops projectiles. */
export type Crate = { x: number; w: number; h: number };
export type BossDef = {
  id: HazardId;
  zone: number;
  hp: number;
  title: string;
  intro: string;
  requires: string[];
  /** Whole team must be recruited before the boss shows. */
  team?: boolean;
};

export type Chapter = {
  chapter: 1 | 2 | 3;
  title: string;
  grade: "warm" | "day" | "night";
  intro: { src: string; title: string; line: string };
  outro: { src: string; title: string; line: string };
  startX: number;
  grillX?: number;
  examX?: number;
  zones: Zone[];
  npcs: NpcSpot[];
  pickups: Pickup[];
  props: Prop[];
  platforms: Platform[];
  crates: Crate[];
  /** Enemies that storm in when a zone is entered for the first time. */
  ambush: Partial<Record<number, HazardId[]>>;
  boss: BossDef;
  hazardHome: Record<HazardId, number>;
  parTime: number;
};

export const CHAPTERS: Record<1 | 2 | 3, Chapter> = {
  1: {
    chapter: 1,
    title: "Armar asado",
    grade: "warm",
    intro: {
      src: "/cinema/asado.mp4",
      title: "El chat está mudo",
      line: "Si hay silencio, hay que armar el asado.",
    },
    outro: {
      src: "/endings/asado.mp4",
      title: "Se hizo el asado",
      line: "Los cuatro. El fuego. No había otra.",
    },
    startX: 18,
    grillX: 548,
    parTime: 240,
    zones: [
      { id: "costanera", name: "Costanera", bg: "/stages/m1-costanera.jpg" },
      { id: "mercado", name: "El mercado", bg: "/stages/m1-mercado.jpg" },
      { id: "barrio", name: "El barrio", bg: "/stages/m1-barrio.jpg" },
      { id: "despensa", name: "La despensa", bg: "/stages/m1-mercado.jpg" },
      { id: "calle", name: "La calle", bg: "/stages/m1-barrio.jpg" },
      { id: "quincho", name: "El quincho", bg: "/stages/m1-quincho.jpg" },
    ],
    npcs: [
      { id: "rafa", x: 78 },
      { id: "juan", x: 188 },
      { id: "richard", x: 338 },
      { id: "hector", x: 508 },
    ],
    pickups: [
      { id: "c1", kind: "coin", x: 36 },
      { id: "k1", kind: "knife", x: 62, label: "Cuchillo" },
      { id: "hielo", kind: "item", x: 96, talk: "hielo", label: "Hielo" },
      { id: "c2", kind: "coin", x: 130, y: 12 },
      { id: "c2b", kind: "coin", x: 136, y: 12 },
      { id: "a1", kind: "ammo", x: 164, label: "Balas" },
      { id: "carne", kind: "item", x: 210, talk: "carne", label: "Carne" },
      { id: "bat", kind: "bat", x: 244, y: 13, label: "Bate" },
      { id: "c3", kind: "coin", x: 268 },
      { id: "h1", kind: "heal", x: 290, label: "Tereré" },
      { id: "c4", kind: "coin", x: 310 },
      { id: "sg", kind: "shotgun", x: 330, y: 23, label: "Escopeta" },
      { id: "terere", kind: "item", x: 368, talk: "terere", label: "Tereré" },
      { id: "a2", kind: "ammo", x: 398, label: "Balas" },
      { id: "c5", kind: "coin", x: 405, y: 12 },
      { id: "c5b", kind: "coin", x: 411, y: 12 },
      { id: "h2", kind: "heal", x: 440, label: "Tereré" },
      { id: "smg", kind: "smg", x: 470, y: 13, label: "Metralleta" },
      { id: "carbon", kind: "item", x: 498, talk: "carbon", label: "Carbón" },
      { id: "gr", kind: "grenade", x: 526, label: "Granadas" },
      { id: "c7", kind: "coin", x: 532 },
      { id: "a3", kind: "ammo", x: 540, label: "Balas" },
    ],
    props: [
      { src: "/sprites/palm.png", x: 12, h: 30 },
      { src: "/sprites/palm.png", x: 58, h: 28, flip: true },
      { src: "/sprites/dog.png", x: 86, h: 12 },
      { src: "/sprites/lamp.png", x: 160, h: 24 },
      { src: "/sprites/lamp.png", x: 230, h: 24 },
      { src: "/sprites/palm.png", x: 300, h: 32 },
      { src: "/sprites/lamp.png", x: 390, h: 24 },
      { src: "/sprites/palm.png", x: 450, h: 30, flip: true },
      { src: "/sprites/lamp.png", x: 520, h: 24 },
    ],
    platforms: [
      { x: 133, w: 22, h: 11 },
      { x: 244, w: 20, h: 12 },
      { x: 330, w: 18, h: 22 },
      { x: 408, w: 24, h: 11 },
      { x: 470, w: 20, h: 12 },
    ],
    crates: [],
    ambush: { 2: ["gallaguer"], 3: ["pablito"], 4: ["marcos", "gallaguer"] },
    boss: {
      id: "masivo",
      zone: 5,
      hp: 9,
      title: "Masivo Bro · MODO BESTIA",
      intro: "Masivo bloquea el quincho. Nadie come sin entrenar.",
      requires: ["carne", "hielo", "carbon", "terere"],
      team: true,
    },
    hazardHome: { onichan: 46, marcos: 118, gallaguer: 248, pablito: 370, masivo: 460 },
  },
  2: {
    chapter: 2,
    title: "El examen",
    grade: "day",
    intro: {
      src: "/cinema/examen.mp4",
      title: "El MEC no espera",
      line: "Richard rinde mañana. Menos charla. Más material.",
    },
    outro: {
      src: "/endings/examen.mp4",
      title: "Richard aprobó",
      line: "Había fecha. Había café. Aprobó.",
    },
    startX: 18,
    examX: 548,
    parTime: 210,
    zones: [
      { id: "campus", name: "Campus UPAP", bg: "/stages/m2-campus.jpg" },
      { id: "biblio", name: "La biblioteca", bg: "/stages/m2-biblio.jpg" },
      { id: "cancha", name: "La cancha", bg: "/stages/m2-cancha.jpg" },
      { id: "pasillo", name: "Pasillo UPAP", bg: "/stages/m2-campus.jpg" },
      { id: "patio", name: "El patio", bg: "/stages/m2-cancha.jpg" },
      { id: "aula", name: "El aula", bg: "/stages/m2-aula.jpg" },
    ],
    npcs: [
      { id: "richard", x: 72 },
      { id: "hector", x: 268 },
      { id: "rafa", x: 410 },
      { id: "juan", x: 999 },
    ],
    pickups: [
      { id: "c1", kind: "coin", x: 40 },
      { id: "k1", kind: "knife", x: 58, label: "Cuchillo" },
      { id: "apuntes", kind: "item", x: 128, talk: "apuntes", label: "Apuntes" },
      { id: "bat", kind: "bat", x: 150, y: 12, label: "Bate" },
      { id: "c2", kind: "coin", x: 168 },
      { id: "a1", kind: "ammo", x: 186, label: "Balas" },
      { id: "cafe", kind: "item", x: 228, talk: "cafe", label: "Café" },
      { id: "sg", kind: "shotgun", x: 245, y: 13, label: "Escopeta" },
      { id: "h1", kind: "heal", x: 292, label: "Tereré" },
      { id: "c3", kind: "coin", x: 310 },
      { id: "c3b", kind: "coin", x: 330, y: 23 },
      { id: "c4", kind: "coin", x: 360 },
      { id: "a2", kind: "ammo", x: 386, label: "Balas" },
      { id: "smg", kind: "smg", x: 395, y: 12, label: "Metralleta" },
      { id: "cedula", kind: "item", x: 438, talk: "cedula", label: "Cédula" },
      { id: "h2", kind: "heal", x: 462, label: "Tereré" },
      { id: "c5", kind: "coin", x: 490 },
      { id: "gr", kind: "grenade", x: 500, y: 13, label: "Granadas" },
      { id: "c6", kind: "coin", x: 520 },
      { id: "a3", kind: "ammo", x: 536, label: "Balas" },
    ],
    props: [
      { src: "/sprites/lamp.png", x: 44, h: 24 },
      { src: "/sprites/palm.png", x: 88, h: 28 },
      { src: "/sprites/ball.png", x: 230, h: 6 },
      { src: "/sprites/lamp.png", x: 340, h: 24 },
      { src: "/sprites/palm.png", x: 430, h: 28, flip: true },
      { src: "/sprites/lamp.png", x: 520, h: 24 },
    ],
    platforms: [
      { x: 150, w: 20, h: 11 },
      { x: 245, w: 22, h: 12 },
      { x: 330, w: 18, h: 22 },
      { x: 395, w: 20, h: 11 },
      { x: 500, w: 22, h: 12 },
    ],
    crates: [],
    ambush: { 2: ["pablito"], 3: ["gallaguer"], 4: ["masivo", "pablito"] },
    boss: {
      id: "marcos",
      zone: 5,
      hp: 8,
      title: "Marcos · TESIS FINAL",
      intro: "Marcos bloquea el aula. Nadie rinde sin su firma.",
      requires: ["apuntes", "cafe", "cedula", "fuerza"],
    },
    hazardHome: { onichan: 46, marcos: 108, gallaguer: 198, pablito: 360, masivo: 470 },
  },
  3: {
    chapter: 3,
    title: "Juan",
    grade: "night",
    intro: {
      src: "/cinema/juan.mp4",
      title: "Salvá a Juan",
      line: "Hablá con Juan. Agarrá el chat. Enfrentá a Pablito. Volvé.",
    },
    outro: {
      src: "/endings/juan.mp4",
      title: "Juan no es cornudo",
      line: "El equipo queda. Pablito, fuera de acá.",
    },
    startX: 18,
    parTime: 300,
    zones: [
      { id: "noche", name: "Costanera noche", bg: "/stages/m3-noche.jpg" },
      { id: "pasillo", name: "El pasillo", bg: "/stages/m3-pasillo.jpg" },
      { id: "bosque", name: "El bosque", bg: "/stages/m3-bosque.jpg" },
      { id: "atajo", name: "El atajo", bg: "/stages/m3-bosque.jpg" },
      { id: "costa", name: "La costa", bg: "/stages/m3-noche.jpg" },
      { id: "muelle", name: "El muelle", bg: "/stages/m3-muelle.jpg" },
    ],
    npcs: [
      { id: "juan", x: 70 },
      { id: "rafa", x: 520 },
      { id: "richard", x: 999 },
      { id: "hector", x: 999 },
    ],
    pickups: [
      { id: "c1", kind: "coin", x: 40 },
      { id: "k1", kind: "knife", x: 96, label: "Cuchillo" },
      { id: "c1b", kind: "coin", x: 130, y: 12 },
      { id: "chat", kind: "item", x: 148, talk: "chat", label: "Chat" },
      { id: "a1", kind: "ammo", x: 172, label: "Balas" },
      { id: "c2", kind: "coin", x: 190 },
      { id: "bat", kind: "bat", x: 215, y: 13, label: "Bate" },
      { id: "c3", kind: "coin", x: 250 },
      { id: "h1", kind: "heal", x: 280, label: "Tereré" },
      { id: "sg", kind: "shotgun", x: 300, y: 23, label: "Escopeta" },
      { id: "foto", kind: "item", x: 318, talk: "foto", label: "Foto" },
      { id: "a2", kind: "ammo", x: 350, label: "Balas" },
      { id: "c4", kind: "coin", x: 380 },
      { id: "smg", kind: "smg", x: 395, y: 12, label: "Metralleta" },
      { id: "h2", kind: "heal", x: 412, label: "Tereré" },
      { id: "c5", kind: "coin", x: 440 },
      { id: "gr", kind: "grenade", x: 455, y: 13, label: "Granadas" },
      { id: "a3", kind: "ammo", x: 468, label: "Balas" },
      { id: "c6", kind: "coin", x: 500 },
      { id: "h3", kind: "heal", x: 512, label: "Tereré" },
    ],
    props: [
      { src: "/sprites/lamp.png", x: 30, h: 26 },
      { src: "/sprites/palm.png", x: 88, h: 30 },
      { src: "/sprites/lamp.png", x: 155, h: 26 },
      { src: "/sprites/palm.png", x: 230, h: 32, flip: true },
      { src: "/sprites/lamp.png", x: 320, h: 26 },
      { src: "/sprites/palm.png", x: 410, h: 30 },
      { src: "/sprites/lamp.png", x: 500, h: 26 },
      { src: "/sprites/palm.png", x: 548, h: 32, flip: true },
    ],
    platforms: [
      { x: 130, w: 20, h: 11 },
      { x: 215, w: 22, h: 12 },
      { x: 300, w: 18, h: 22 },
      { x: 395, w: 22, h: 11 },
      { x: 455, w: 20, h: 12 },
    ],
    crates: [],
    ambush: { 1: ["gallaguer"], 3: ["masivo"], 4: ["marcos", "gallaguer"] },
    boss: {
      id: "pablito",
      zone: 5,
      hp: 9,
      title: "Pablito Pintos · DEFINITIVO",
      intro: "Pablito espera en el muelle. Hoy se termina.",
      requires: ["chat", "foto"],
    },
    hazardHome: { onichan: 46, marcos: 112, gallaguer: 230, masivo: 360, pablito: 490 },
  },
};

export const MISSIONS = [
  {
    ch: 1 as const,
    title: "Armar el asado",
    blurb:
      "Reuní a Rafa, Juan, Richard y Héctor. Juntá hielo, carne, tereré y carbón. Vencé a Masivo y encendé el fuego.",
    img: "/stages/m1-quincho.jpg",
  },
  {
    ch: 2 as const,
    title: "El examen de Richard",
    blurb:
      "Apuntes, café, la fuerza de Héctor y la cédula. Sacá a Marcos del aula y rendí el examen.",
    img: "/stages/m2-aula.jpg",
  },
  {
    ch: 3 as const,
    title: "Salvá a Juan",
    blurb: "Hablá con Juan. Conseguí el chat y la foto. Enfrentá a Pablito en el muelle y volvé.",
    img: "/stages/m3-muelle.jpg",
  },
];

export const ITEM_IMG: Record<string, string> = {
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

/** Sprite for a pickup, or null when it is drawn procedurally (bat, shotgun, smg, grenade). */
export function pickupSprite(p: Pickup): string | null {
  if (p.kind === "coin") return "/sprites/coin.png";
  if (p.kind === "ammo") return "/sprites/bullet.png";
  if (p.kind === "heal") return "/sprites/terere.png";
  if (p.kind === "knife") return "/sprites/knife.png";
  if (p.kind === "item") return ITEM_IMG[p.id] ?? "/sprites/book.png";
  return null;
}

export function chapterOf(n: 1 | 2 | 3) {
  return CHAPTERS[n];
}
export function worldWidth(n: 1 | 2 | 3) {
  return CHAPTERS[n].zones.length * 100;
}
export function zoneAt(n: 1 | 2 | 3, x: number) {
  const zones = CHAPTERS[n].zones;
  return zones[Math.max(0, Math.min(zones.length - 1, Math.floor(x / 100)))];
}
export function npcHome(n: 1 | 2 | 3) {
  const t: Record<HeroId, number> = { rafa: 80, juan: 80, richard: 80, hector: 80 };
  for (const spot of CHAPTERS[n].npcs) t[spot.id] = spot.x;
  return t;
}

/** Everything the HUD needs to render the mission checklist. */
export type Progress = {
  recruited: string[];
  items: string[];
  hero: HeroId | null;
  chapter: 1 | 2 | 3;
  fire: boolean;
  examScore: number;
};

export function checksFor(s: Progress): { t: string; ok: boolean }[] {
  if (s.chapter === 1)
    return [
      { t: "Equipo", ok: TEAM.every((id) => id === s.hero || s.recruited.includes(id)) },
      { t: "Hielo", ok: s.items.includes("hielo") },
      { t: "Carne", ok: s.items.includes("carne") },
      { t: "Tereré", ok: s.items.includes("terere") },
      { t: "Carbón", ok: s.items.includes("carbon") },
      { t: "Masivo", ok: s.items.includes("boss") },
      { t: "Fuego", ok: s.fire },
    ];
  if (s.chapter === 2)
    return [
      { t: "Apuntes", ok: s.items.includes("apuntes") },
      { t: "Café", ok: s.items.includes("cafe") },
      { t: "Héctor", ok: s.items.includes("fuerza") },
      { t: "Cédula", ok: s.items.includes("cedula") },
      { t: "Marcos", ok: s.items.includes("boss") },
      { t: "Examen", ok: s.examScore > 0 },
    ];
  return [
    { t: "Juan", ok: s.items.includes("aviso") },
    { t: "Chat", ok: s.items.includes("chat") },
    { t: "Foto", ok: s.items.includes("foto") },
    { t: "Pablito", ok: s.items.includes("echar") },
    { t: "Volver", ok: s.items.includes("honor") },
  ];
}

/** Current objective text plus where it is (for the map marker). */
export function objective(s: Progress): { text: string; x: number | null } {
  const ch = CHAPTERS[s.chapter];
  const npcX = (id: HeroId) => ch.npcs.find((n) => n.id === id)?.x ?? null;
  const itemX = (id: string) => ch.pickups.find((p) => p.id === id)?.x ?? null;
  const bossX = ch.boss.zone * 100 + 50;
  if (s.chapter === 1) {
    const missing = TEAM.filter((id) => id !== s.hero);
    for (const id of missing) {
      if (!s.recruited.includes(id)) {
        if (id === "rafa") return { text: "1/7 · Rafa en la costanera", x: npcX("rafa") };
        if (id === "juan") return { text: "1/7 · Juan en el mercado", x: npcX("juan") };
        if (id === "richard") return { text: "1/7 · Richard en el barrio", x: npcX("richard") };
        return { text: "1/7 · Héctor en la calle", x: npcX("hector") };
      }
    }
    if (!s.items.includes("hielo"))
      return { text: "2/7 · hielo en la costanera", x: itemX("hielo") };
    if (!s.items.includes("carne")) return { text: "3/7 · carne en el mercado", x: itemX("carne") };
    if (!s.items.includes("terere"))
      return { text: "4/7 · tereré en la despensa", x: itemX("terere") };
    if (!s.items.includes("carbon"))
      return { text: "5/7 · carbón en la calle", x: itemX("carbon") };
    if (!s.items.includes("boss")) return { text: "6/7 · vencé a Masivo en el quincho", x: bossX };
    return { text: "7/7 · encendé el fuego en el quincho", x: ch.grillX ?? null };
  }
  if (s.chapter === 2) {
    if (!s.items.includes("apuntes"))
      return { text: "1/6 · apuntes en la biblioteca", x: itemX("apuntes") };
    if (!s.items.includes("cafe")) return { text: "2/6 · café en la cancha", x: itemX("cafe") };
    if (!s.items.includes("fuerza"))
      return { text: "3/6 · Héctor en el pasillo", x: npcX("hector") };
    if (!s.items.includes("cedula"))
      return { text: "4/6 · cédula en el patio", x: itemX("cedula") };
    if (!s.items.includes("boss")) return { text: "5/6 · sacá a Marcos del aula", x: bossX };
    return { text: "6/6 · rendí el examen en el aula", x: ch.examX ?? null };
  }
  if (!s.items.includes("aviso"))
    return { text: "1/5 · hablá con Juan en la costanera", x: npcX("juan") };
  if (!s.items.includes("chat"))
    return { text: "2/5 · el chat está en el pasillo", x: itemX("chat") };
  if (!s.items.includes("foto"))
    return { text: "3/5 · la foto está en el bosque", x: itemX("foto") };
  if (!s.items.includes("echar"))
    return { text: "4/5 · enfrentá a Pablito en el muelle", x: bossX };
  return { text: "5/5 · volvé con Juan", x: npcX("juan") };
}
