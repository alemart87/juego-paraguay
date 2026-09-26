/**
 * "Jesús te ama": conversación guiada. Todo el texto vive acá para que se pueda
 * revisar y corregir sin tocar la lógica. Voseo paraguayo, tono de consuelo,
 * nunca promesas. Las citas son de los Evangelios y los Salmos.
 */
export type Verse = { text: string; ref: string };
export type Option = { id: string; label: string; reply: string; verse: Verse };
export type Topic = {
  id: string;
  label: string;
  icon: string;
  /** Lo que dice Jesús al elegir el tema. */
  intro: string;
  question: string;
  options: Option[];
  /** Bendición final, con el nombre si lo dio. */
  blessing: (name: string) => string;
  /** Para la tarjeta compartible: "Hoy pedí por…". */
  shareLabel: string;
};

const you = (name: string) => (name ? `${name}, ` : "");

export const TOPICS: Topic[] = [
  {
    id: "salud",
    label: "Mi salud",
    icon: "🩺",
    intro: "Lo que carga tu cuerpo, lo cargo con vos. No estás solo en esto.",
    question: "¿Cómo lo estás llevando?",
    options: [
      {
        id: "miedo",
        label: "Tengo miedo",
        reply:
          "El miedo es humano; hasta yo tuve miedo en el huerto. Respirá. Hoy no tenés que poder con todo, solo con este día.",
        verse: {
          text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.",
          ref: "Isaías 41:10",
        },
      },
      {
        id: "cansancio",
        label: "Estoy cansado de luchar",
        reply:
          "Venís peleando hace mucho. Está bien apoyarte. El descanso también es parte de sanar.",
        verse: {
          text: "Vengan a mí todos los que están cansados y agobiados, y yo les daré descanso.",
          ref: "Mateo 11:28",
        },
      },
      {
        id: "tratamiento",
        label: "Estoy en tratamiento",
        reply:
          "Cada consulta, cada remedio, cada día que vas aunque no quieras: eso también es fe. Seguí. Y dejá que otros te acompañen.",
        verse: {
          text: "El Señor lo sostendrá en el lecho del dolor; en su enfermedad, le devolverá la salud.",
          ref: "Salmo 41:3",
        },
      },
    ],
    blessing: (name) =>
      `${you(name)}que tu cuerpo encuentre fuerza y tu corazón encuentre calma. Que los que te cuidan tengan manos sabias y que vos tengas paciencia con vos mismo. Yo estoy con vos, hoy y cada día.`,
    shareLabel: "mi salud",
  },
  {
    id: "familiar",
    label: "Alguien que amo",
    icon: "🤍",
    intro: "Amar a alguien que sufre duele el doble. Ese amor tuyo ya es una oración.",
    question: "¿Qué le pasa a esa persona?",
    options: [
      {
        id: "enfermo",
        label: "Está enfermo",
        reply:
          "No podés curarlo, pero podés estar. Una mano, un mate, un mensaje. Eso llega más lejos de lo que creés.",
        verse: {
          text: "El Señor está cerca de los que tienen el corazón quebrantado.",
          ref: "Salmo 34:18",
        },
      },
      {
        id: "lejos",
        label: "Está lejos",
        reply:
          "La distancia cansa, pero no rompe lo que es de verdad. Nombralo hoy en voz alta; yo escucho los nombres.",
        verse: {
          text: "Yo estoy con ustedes todos los días, hasta el fin del mundo.",
          ref: "Mateo 28:20",
        },
      },
      {
        id: "pelea",
        label: "Estamos peleados",
        reply:
          "Volver es difícil y vale la pena. No hace falta tener razón para dar el primer paso. Hace falta amor, y vos ya lo tenés.",
        verse: {
          text: "Cuando todavía estaba lejos, su padre lo vio, se conmovió, corrió a su encuentro y lo abrazó.",
          ref: "Lucas 15:20",
        },
      },
      {
        id: "partio",
        label: "Ya no está",
        reply:
          "El amor no se termina cuando alguien se va. Lo que compartieron sigue siendo tuyo. Llorá lo que necesites; yo también lloré por un amigo.",
        verse: { text: "Jesús lloró.", ref: "Juan 11:35" },
      },
    ],
    blessing: (name) =>
      `${you(name)}que esa persona que amás sienta tu cariño aunque no estés al lado. Que tenga alivio, compañía y paz. Y que vos tengas fuerzas para seguir queriendo así.`,
    shareLabel: "alguien que amo",
  },
  {
    id: "dinero",
    label: "La plata",
    icon: "🌾",
    intro: "Sé lo que pesa llegar a fin de mes con miedo. No es falta de fe: es la vida apretando.",
    question: "¿Qué te preocupa más?",
    options: [
      {
        id: "finmes",
        label: "Llegar a fin de mes",
        reply:
          "Hoy hacé lo que puedas con lo que tenés. Mañana tiene sus propios problemas, y también su propio pan.",
        verse: {
          text: "Miren las aves del cielo: no siembran ni cosechan, y su Padre celestial las alimenta. ¿No valen ustedes mucho más?",
          ref: "Mateo 6:26",
        },
      },
      {
        id: "deuda",
        label: "Una deuda",
        reply:
          "Una deuda no te define. Pedí ayuda sin vergüenza, ordená lo que puedas y andá de a un paso. La vergüenza pesa más que la deuda.",
        verse: {
          text: "Echa sobre el Señor tu carga, y él te sostendrá.",
          ref: "Salmo 55:22",
        },
      },
      {
        id: "trabajo",
        label: "No tengo trabajo",
        reply:
          "Buscar trabajo es un trabajo, y vos lo estás haciendo. Tocá una puerta más hoy. Contale a alguien lo que sabés hacer.",
        verse: {
          text: "Que el favor del Señor esté sobre nosotros; confirma la obra de nuestras manos.",
          ref: "Salmo 90:17",
        },
      },
    ],
    blessing: (name) =>
      `${you(name)}que no te falte el pan ni la dignidad. Que se abra una puerta esta semana y que tengas ojos para verla. Y que nunca midas lo que valés por lo que tenés.`,
    shareLabel: "mi trabajo y mi casa",
  },
  {
    id: "soledad",
    label: "Me siento solo",
    icon: "🌙",
    intro: "Que estés acá, a esta hora, diciéndolo, ya es un acto de valentía. Te escucho.",
    question: "¿Cómo es esa soledad?",
    options: [
      {
        id: "nadie",
        label: "Siento que a nadie le importo",
        reply:
          "A mí me importás. Y hay alguien más a quien le importás y todavía no lo sabe. Mandale un mensaje a una persona hoy. Una sola.",
        verse: {
          text: "Hasta los cabellos de su cabeza están todos contados. No tengan miedo.",
          ref: "Lucas 12:7",
        },
      },
      {
        id: "perdida",
        label: "Perdí a alguien",
        reply:
          "Lo que sentís es amor sin lugar a dónde ir. No lo apures. Yo lo guardo con vos.",
        verse: {
          text: "Él sana a los de corazón quebrantado y venda sus heridas.",
          ref: "Salmo 147:3",
        },
      },
      {
        id: "noche",
        label: "Las noches son largas",
        reply:
          "La noche miente: dice que siempre va a ser así. Amanece igual. Si no podés dormir, hablame; para eso estoy.",
        verse: {
          text: "Por la noche durará el llanto, y a la mañana vendrá la alegría.",
          ref: "Salmo 30:5",
        },
      },
    ],
    blessing: (name) =>
      `${you(name)}que esta noche sea más corta y que mañana alguien te sonría. Que encuentres una mesa donde sentarte y una voz que te llame por tu nombre. Ya no estás solo: yo me quedo.`,
    shareLabel: "mi corazón",
  },
  {
    id: "paz",
    label: "Necesito paz",
    icon: "🕊️",
    intro: "La paz que busco darte no es que todo se arregle. Es que puedas respirar mientras se arregla.",
    question: "¿Qué te la quita?",
    options: [
      {
        id: "culpa",
        label: "Cargo con una culpa",
        reply:
          "Lo que hiciste no es lo que sos. Pedí perdón a quien haga falta, perdonate vos, y soltá. Yo ya lo solté.",
        verse: {
          text: "Tampoco yo te condeno. Andá, y no peques más.",
          ref: "Juan 8:11",
        },
      },
      {
        id: "ansiedad",
        label: "La cabeza no para",
        reply:
          "Poné los pies en el piso. Contá cinco cosas que ves. Respirá hondo tres veces. Ahora sí: contame qué pasa.",
        verse: {
          text: "La paz les dejo, mi paz les doy. No se turbe su corazón ni tenga miedo.",
          ref: "Juan 14:27",
        },
      },
      {
        id: "decision",
        label: "Tengo que decidir algo",
        reply:
          "No hace falta ver todo el camino, solo el próximo paso. Elegí lo que te deje dormir tranquilo. Eso suele ser lo correcto.",
        verse: {
          text: "Tu palabra es lámpara a mis pies y luz en mi camino.",
          ref: "Salmo 119:105",
        },
      },
    ],
    blessing: (name) =>
      `${you(name)}que tu mente descanse y tu pecho se afloje. Que lo que no depende de vos lo puedas soltar, y lo que sí, lo hagas con calma. Mi paz va con vos.`,
    shareLabel: "mi paz",
  },
  {
    id: "gracias",
    label: "Quiero dar gracias",
    icon: "🌅",
    intro: "Qué lindo que vengas a agradecer. La gratitud es la oración más corta y la más completa.",
    question: "¿Por qué das gracias hoy?",
    options: [
      {
        id: "salud",
        label: "Por la salud",
        reply: "Cuidala. Dormí, comé bien, caminá. Agradecer también es cuidar lo que se te dio.",
        verse: {
          text: "Den gracias al Señor porque es bueno, porque es eterna su misericordia.",
          ref: "Salmo 118:1",
        },
      },
      {
        id: "familia",
        label: "Por mi gente",
        reply: "Decíselo a ellos también. Hoy. Un 'gracias por estar' cambia un día entero.",
        verse: {
          text: "Alegrémonos y gocémonos, porque este hijo mío estaba perdido y ha sido hallado.",
          ref: "Lucas 15:24",
        },
      },
      {
        id: "logro",
        label: "Por algo que logré",
        reply: "Lo trabajaste. Celebralo sin culpa y acordate de quién te ayudó a llegar.",
        verse: {
          text: "Toda buena dádiva y todo don perfecto desciende de lo alto.",
          ref: "Santiago 1:17",
        },
      },
    ],
    blessing: (name) =>
      `${you(name)}que sigas viendo lo bueno aun en los días grises, y que tu gratitud contagie a los que tenés cerca. Gracias a vos por venir a decírmelo.`,
    shareLabel: "todo lo que tengo",
  },
];

export const topic = (id: string) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];

/** Frases que suelta la imagen al tocarla mientras la oración se enciende. */
export const TOUCH_LINES = [
  "Estoy acá.",
  "Te escucho.",
  "No te sueltes.",
  "Respirá.",
  "Sos amado.",
  "Un día a la vez.",
  "No estás solo.",
  "Seguí.",
];

/** Agradecimientos según el aporte. Nunca prometen nada a cambio. */
export const THANKS_TIERS = [
  {
    min: 10,
    title: "Gracias de corazón",
    text: "Tu aporte ayuda a que este espacio siga abierto, gratis, para quien lo necesite a las tres de la mañana. Eso es lo que compraste: una puerta abierta para otro.",
  },
  {
    min: 25,
    title: "Gracias, de verdad",
    text: "Con tu aporte sostenemos este proyecto y podemos seguir escribiendo consuelo con cuidado. Te dejamos una tarjeta de luz para que compartas con alguien que la necesite.",
  },
  {
    min: 50,
    title: "Tu generosidad conmueve",
    text: "Sos parte de los que mantienen esto vivo para miles de personas. Gracias por creer que las palabras buenas valen la pena. Te dejamos una tarjeta de luz con tu nombre.",
  },
  {
    min: 100,
    title: "No sabemos cómo agradecerte",
    text: "Un aporte así sostiene este espacio durante semanas. Gracias por tu corazón grande. Si alguna vez necesitás que alguien te escuche, acá vamos a estar.",
  },
];

export const thanksTier = (amount: number) =>
  [...THANKS_TIERS].reverse().find((tier) => amount >= tier.min) ?? THANKS_TIERS[0];

export const MIN_DONATION = 10;
export const MAX_DONATION = 1000;
export const DONATION_PRESETS = [10, 20, 50, 100];
