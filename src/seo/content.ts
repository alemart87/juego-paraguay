export const SITE_URL = "https://www.influencerspy.pro";

export type CharacterPage = {
  slug: string;
  name: string;
  type: "combatiente" | "jefe";
  kicker: string;
  description: string;
  portrait: string;
  color: string;
  playStyle: string;
  ability: string;
  tactics: string[];
  story: string[];
};

export const CHARACTERS: CharacterPage[] = [
  {
    slug: "masivo-bro",
    name: "Masivo Bro",
    type: "combatiente",
    kicker: "Fuerza bruta · rompeguardias",
    description:
      "Conocé a Masivo Bro en Influencers Battle: poderes, estilo de combate, consejos y su papel dentro de la campaña paraguaya.",
    portrait: "/battle/masivo-bro.webp",
    color: "#efb764",
    playStyle:
      "Es el personaje más directo. Tiene mucha vida, golpes pesados y una embestida que atraviesa formaciones. Funciona especialmente bien para aprender el juego.",
    ability:
      "Embestida masiva rompe la guardia, empuja enemigos y permite salir de una esquina. Con el hype completo activa Modo Masivo.",
    tactics: [
      "Guardá la embestida para enemigos protegidos o grupos compactos.",
      "Combiná dos golpes cortos antes de cruzar al rival.",
      "Su vida alta permite jugar cerca, pero el dash sigue siendo esencial contra los jefes.",
    ],
    story: [
      "En el universo ficticio del juego, Masivo Bro entra a la batalla convencido de que el feed se conquista como un gimnasio: con constancia, volumen y una entrada imposible de ignorar.",
      "Su rivalidad con Onichan y La Comadre impulsa buena parte del drama. Las discusiones se convierten en misiones, los comentarios en proyectiles y cada escenario obliga al grupo a colaborar aunque nadie quiera admitirlo.",
    ],
  },
  {
    slug: "onichan",
    name: "Onichan",
    type: "combatiente",
    kicker: "Velocidad · engaño · Paso UwU",
    description:
      "Guía de Onichan en Influencers Battle: historia ficticia, poderes, movilidad y tácticas para dominar los cuatro episodios.",
    portrait: "/battle/onichan.webp",
    color: "#f48dc5",
    playStyle:
      "Es la luchadora más rápida del elenco. Su menor cantidad de vida se compensa con desplazamientos veloces y ventanas breves de invulnerabilidad.",
    ability:
      "Paso UwU atraviesa ataques y deja una onda rosa. Arco de temporada amplía el alcance y convierte su movilidad en una ofensiva continua.",
    tactics: [
      "Entrá y salí del combate; no intercambies golpes de frente.",
      "Usá el poder cuando aparezca una señal roja de ataque.",
      "Las armas rápidas mantienen el combo mientras reposicionás al personaje.",
    ],
    story: [
      "Onichan convierte referencias otaku, dramatismo digital y velocidad en un estilo de pelea imprevisible. Dentro de esta ficción satírica, cada episodio parece una temporada nueva de su propia serie.",
      "Su conflicto con Masivo Bro alimenta el caos inicial, pero la amenaza de los jefes obliga a transformar la rivalidad en una alianza incómoda.",
    ],
  },
  {
    slug: "anatomic-blogs",
    name: "ANATOMIC BLOGS",
    type: "combatiente",
    kicker: "Control · escudo · mercado volátil",
    description:
      "Todo sobre ANATOMIC BLOGS en Influencers Battle: su escudo, súper, estrategia y participación en la historia.",
    portrait: "/battle/anatomic-blogs.webp",
    color: "#83caa8",
    playStyle:
      "Controla el ritmo de la pelea con defensa temporal. Es ideal para quien prefiere esperar el ataque enemigo y responder en el momento justo.",
    ability:
      "Vela verde genera un escudo que devuelve energía. Mercado volátil transforma una defensa bien calculada en una ofensiva de alto impacto.",
    tactics: [
      "Activá el escudo antes de ataques largos del jefe.",
      "Aprovechá la protección para recuperar munición o sostener el combo.",
      "No gastes el súper contra enemigos aislados: esperá una oleada.",
    ],
    story: [
      "En la campaña, ANATOMIC BLOGS interpreta cada batalla como si fuera un gráfico: subidas, correcciones y una promesa constante de que la próxima vela será verde.",
      "Su obsesión ficticia con el mercado cripto se vuelve útil cuando el equipo necesita protección, energía y una explicación demasiado complicada para un problema sencillo.",
    ],
  },
  {
    slug: "la-comadre",
    name: "La Comadre",
    type: "combatiente",
    kicker: "Control de masas · dueña del escenario",
    description:
      "Descubrí a La Comadre en Influencers Battle: poder de micrófono, consejos de combate y rivalidades de la campaña.",
    portrait: "/battle/la-comadre.webp",
    color: "#ff725f",
    playStyle:
      "Domina grupos con ondas de empuje. Mantiene a los enemigos lejos y crea espacio para disparar o recuperar objetivos.",
    ability:
      "Fuera de mi live lanza una onda de micrófono. La reina del feed aumenta el control del escenario y desarma oleadas completas.",
    tactics: [
      "Empujá enemigos hacia un mismo lado antes de disparar.",
      "Reservá el poder para cortar cargas y ataques encadenados.",
      "Su alcance permite controlar plataformas sin exponerse demasiado.",
    ],
    story: [
      "La Comadre llega dispuesta a convertir cada pelea en el programa más visto del país. En este universo de ficción, no reconoce aliados permanentes: solamente momentos convenientes.",
      "Su rivalidad con el resto del elenco genera diálogos, treguas y decisiones que cambian pequeñas ventajas durante cada episodio.",
    ],
  },
  {
    slug: "el-papu",
    name: "El Papu",
    type: "combatiente",
    kicker: "Trampas · ritmo · pendrive búmeran",
    description:
      "Guía de El Papu en Influencers Battle: cómo usar Pendrive Remix, sus mejores armas y su historia en Mercado 4.",
    portrait: "/battle/el-papu.webp",
    color: "#88b5f4",
    playStyle:
      "Mezcla ataques a distancia y trayectorias de regreso. Recompensa a quien calcula dónde estará el enemigo después del primer impacto.",
    ability:
      "Pendrive remix viaja como un búmeran y golpea dos veces. Moto con subwoofer convierte el escenario en una zona de daño rítmico.",
    tactics: [
      "Lanzá el pendrive detrás del enemigo para asegurar el golpe de regreso.",
      "Movete mientras el proyectil está activo y encerrá al objetivo.",
      "En Mercado 4 aprovechá los pasillos para multiplicar impactos.",
    ],
    story: [
      "El Papu asegura que levantó un imperio vendiendo música en pendrives. El juego trata esa versión como un misterio absurdo y la convierte en el centro del segundo episodio.",
      "Su moto ruidosa, los archivos duplicados y una persecución entre puestos forman una aventura que culmina contra Lata Parara.",
    ],
  },
  {
    slug: "la-secre",
    name: "La Secre",
    type: "combatiente",
    kicker: "Defensa · sellos · burocracia fantástica",
    description:
      "Conocé a La Secre, personaje de Influencers Battle inspirado en la sátira burocrática: poderes, estrategia e historia.",
    portrait: "/battle/la-secre.webp",
    color: "#c9d2b4",
    playStyle:
      "Es una defensora resistente que frena enemigos y controla zonas. Sus sellos reducen la velocidad del rival y facilitan ataques seguros.",
    ability:
      "Falta fotocopia sella el suelo. Sistema caído amplía la zona y paraliza por un instante a los enemigos alcanzados.",
    tactics: [
      "Colocá sellos antes de comenzar una interacción u objetivo.",
      "Usá armas pesadas contra enemigos atrapados.",
      "Su vida alta ayuda en IPS, donde las oleadas llegan desde ambos lados.",
    ],
    story: [
      "La Secre es una caricatura ficticia de trámites imposibles y sistemas que siempre parecen estar a punto de volver. La sátira apunta a la burocracia y nunca a pacientes ni dolencias reales.",
      "Durante el episodio de IPS, debe decidir entre defender el procedimiento o ayudar al grupo a silenciar los micrófonos poseídos de LULAX.",
    ],
  },
  {
    slug: "pablito-pintos",
    name: "Pablito Pintos",
    type: "combatiente",
    kicker: "Premium · encanto y control",
    description:
      "Pablito Pintos es un personaje premium jugable de Influencers Battle con velocidad, control de masas y una prueba gratis de 10 segundos.",
    portrait: "/battle/pablito.webp",
    color: "#ff3190",
    playStyle:
      "Combina la mayor velocidad del elenco con ráfagas de encanto que frenan grupos enteros. Puede moverse, saltar, disparar, usar dash y encadenar combos como cualquier combatiente.",
    ability:
      "Flash irresistible congela la ofensiva rival y la súper Reina de la pasarela cubre gran parte del escenario con una onda rosa.",
    tactics: [
      "Probá sus movimientos durante 10 segundos antes de decidir la compra.",
      "Usá Flash irresistible cuando una oleada rodee al personaje.",
      "Su velocidad permite mantener combos largos sin quedar encerrado.",
    ],
    story: [
      "Dentro del universo satírico del juego, Pablito convierte cada escenario en una pasarela de combate donde un flash puede detener hasta al enemigo más ruidoso.",
      "Es un desbloqueo permanente asociado al perfil del jugador y funciona en los cuatro episodios.",
    ],
  },
  {
    slug: "marito",
    name: "Marito",
    type: "combatiente",
    kicker: "Ultra premium · comando aéreo",
    description:
      "Marito es el personaje ultra premium de Influencers Battle: inmune, equipado con misiles explosivos, súper nuclear y entrada en helicóptero.",
    portrait: "/battle/marito.webp",
    color: "#f6e75a",
    playStyle:
      "Tiene movimiento, salto, dash y controles completos, pero reemplaza el disparo normal por misiles guiados. Durante los primeros segundos desciende desde su helicóptero.",
    ability:
      "Ataque presidencial lanza una salva de misiles guiados y Protocolo nuclear provoca una explosión de área total contra todos los enemigos activos.",
    tactics: [
      "La inmunidad permanente permite concentrarse en velocidad y puntaje.",
      "Dispará desde el helicóptero para limpiar la primera oleada.",
      "Reservá la súper para las fases de jefe con enemigos adicionales.",
    ],
    story: [
      "Marito llega a la campaña como una caricatura política ficticia con recursos absurdamente superiores: helicóptero, misiles e inmunidad total.",
      "El personaje puede probarse durante 10 segundos y luego desbloquearse de forma permanente para el perfil del jugador.",
    ],
  },
  {
    slug: "padre-apostol",
    name: "Padre Apóstol",
    type: "jefe",
    kicker: "Jefe 01 · rayos y trompetas",
    description:
      "Guía del Padre Apóstol, primer jefe de Influencers Battle: fases, ataques, Luizones y consejos para vencerlo.",
    portrait: "/battle/padre-apostol.webp",
    color: "#f6e75a",
    playStyle:
      "Convoca rayos sobre el altar, ondas de trompeta y Luizones del templo. Sus señales doradas indican dónde caerá el siguiente ataque.",
    ability:
      "La última fase acelera los rayos y combina enemigos terrestres con proyectiles desde arriba.",
    tactics: [
      "No permanezcas debajo de una señal dorada.",
      "Eliminá primero a los Luizones para recuperar espacio.",
      "Guardá el súper para la fase final, cuando las trompetas se superponen.",
    ],
    story: [
      "El primer episodio ocurre en el Templo del Último Avivamiento, una locación fantástica con ángeles, luces imposibles y una transmisión fuera de control.",
      "Padre Apóstol es un villano ficticio creado para la campaña. Su caída revela la pista que conduce al Mercado 4.",
    ],
  },
  {
    slug: "lata-parara",
    name: "Lata Parara",
    type: "jefe",
    kicker: "Jefe 02 · lata poseída",
    description:
      "Cómo derrotar a Lata Parara en Mercado 4: ataques, fases y estrategia del segundo jefe de Influencers Battle.",
    portrait: "/battle/boss-lata.webp",
    color: "#efb764",
    playStyle:
      "Lanza latas en arcos, genera espuma que bloquea pasillos y convoca latas endemoniadas entre los puestos del mercado.",
    ability: "Su fase final aumenta la cantidad de rebotes y reduce el espacio seguro.",
    tactics: [
      "Saltá las latas bajas y atravesá con dash las trayectorias altas.",
      "Evitá quedar encerrado contra un puesto.",
      "Las escopetas limpian rápidamente las latas pequeñas.",
    ],
    story: [
      "Lata Parara domina una recreación colorida y caótica del Mercado 4. El jefe combina humor, movimiento y un escenario reconocible de Asunción.",
      "Al derrotarlo aparece una transmisión que dirige al equipo hacia la ventanilla imposible de IPS.",
    ],
  },
  {
    slug: "lulax",
    name: "LULAX",
    type: "jefe",
    kicker: "Jefe 03 · micrófonos poseídos",
    description:
      "Guía para vencer a LULAX y sus micrófonos poseídos en el episodio de IPS de Influencers Battle.",
    portrait: "/battle/boss-lulax.webp",
    color: "#b578ff",
    playStyle:
      "Llena la pantalla con ondas de palabras censuradas y micrófonos móviles. Sus ataques alternan entre suelo y aire.",
    ability: "El grito eterno encadena ondas que obligan a combinar salto, dash y ataque.",
    tactics: [
      "Leé el color de la señal antes de saltar.",
      "Destruí micrófonos para reducir la presión del escenario.",
      "No uses todo el dash al inicio: la última onda llega con retraso.",
    ],
    story: [
      "LULAX toma la sala de espera de una versión fantástica de IPS y convierte cada micrófono en una criatura ruidosa.",
      "El episodio mezcla crítica burocrática con acción arcade y mantiene el humor lejos de pacientes o situaciones médicas reales.",
    ],
  },
  {
    slug: "el-dictador",
    name: "El Dictador",
    type: "jefe",
    kicker: "Jefe 04 · tanqueta y doble vida",
    description:
      "Estrategia contra El Dictador, jefe final de Influencers Battle: tanqueta, hondita paraguaya y segunda fase.",
    portrait: "/battle/dictador-portrait.webp",
    color: "#e8483f",
    playStyle:
      "Ataca desde una tanqueta con proyectiles de hondita, cargas frontales y oleadas de pyragues. Es el único jefe con dos vidas completas.",
    ability: "Después de perder la primera vida, la tanqueta acelera y combina todos sus patrones.",
    tactics: [
      "Conservá granadas y súper para la segunda vida.",
      "Saltá la carga y castigá la parte trasera de la tanqueta.",
      "Eliminá pyragues para evitar proyectiles desde ambos extremos.",
    ],
    story: [
      "El Dictador es el antagonista final de la ficción y espera frente a una Asunción nocturna e infestada. Representa una caricatura autoritaria dentro del universo del juego.",
      "La batalla final cierra la campaña cuando la tanqueta se apaga y las luces de la ciudad vuelven a encenderse.",
    ],
  },
];

export const characterBySlug = (slug: string) => CHARACTERS.find((entry) => entry.slug === slug);
