import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as ChevronRight, r as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DiZPZGmI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function stepsOf(id) {
	return [
		0,
		1,
		2,
		3
	].map((i) => `/sprites/walk/${id}-${i}.png`);
}
var HEROES = [
	{
		id: "rafa",
		name: "Rafa",
		role: "El que arma",
		tagline: "Si hay silencio, hay asado.",
		portrait: "/characters/rafa.jpg",
		sprite: "/sprites/rafa.png",
		walk: "/sprites/walk-rafa.png",
		steps: stepsOf("rafa"),
		reel: "/select/rafa.mp4",
		accent: "#d4a45a"
	},
	{
		id: "juan",
		name: "Juan",
		role: "La mochila",
		tagline: "Poco mensaje. Mucho límite.",
		portrait: "/characters/juan.jpg",
		sprite: "/sprites/juan.png",
		walk: "/sprites/walk-juan.png",
		steps: stepsOf("juan"),
		reel: "/select/juan.mp4",
		accent: "#c4b59a"
	},
	{
		id: "richard",
		name: "Richard",
		role: "El ancla",
		tagline: "Menos charla. Más fecha.",
		portrait: "/characters/richard.jpg",
		sprite: "/sprites/richard.png",
		walk: "/sprites/walk-richard.png",
		steps: stepsOf("richard"),
		reel: "/select/richard.mp4",
		accent: "#c2413b"
	},
	{
		id: "hector",
		name: "Héctor",
		role: "El pegamento",
		tagline: "Un reel, un partido, y fuerza.",
		portrait: "/characters/hector.jpg",
		sprite: "/sprites/hector.png",
		walk: "/sprites/walk-hector.png",
		steps: stepsOf("hector"),
		reel: "/select/hector.mp4",
		accent: "#8aa0b8"
	}
];
var HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));
var TEAM = [
	"rafa",
	"juan",
	"richard",
	"hector"
];
var NAMES = {
	juan: "Juan",
	richard: "Richard",
	hector: "Héctor",
	rafa: "Rafa"
};
var HAZARDS = [
	{
		id: "masivo",
		name: "Masivo Bro",
		role: "El coach",
		tagline: "SOS Pobro.",
		portrait: "/characters/masivo.jpg",
		sprite: "/sprites/masivo.png",
		walk: "/sprites/walk-masivo.png",
		steps: stepsOf("masivo"),
		accent: "#e8c15a",
		home: 455,
		speed: 30
	},
	{
		id: "pablito",
		name: "Pablito Pintos",
		role: "No te quedes",
		tagline: "Vení, no seas así.",
		portrait: "/characters/pablito.jpg",
		sprite: "/sprites/pablito.png",
		walk: "/sprites/walk-pablito.png",
		steps: stepsOf("pablito"),
		accent: "#e8a0c8",
		home: 195,
		speed: 33
	},
	{
		id: "marcos",
		name: "Marcos",
		role: "Coordinador UPAP",
		tagline: "Tocame la panza.",
		portrait: "/characters/marcos.jpg",
		sprite: "/sprites/marcos.png",
		walk: "/sprites/walk-marcos.png",
		steps: stepsOf("marcos"),
		accent: "#b07ad4",
		home: 118,
		speed: 22
	},
	{
		id: "gallaguer",
		name: "Gallaguer",
		role: "El que escribe",
		tagline: "¿Escribe tu amiga?",
		portrait: "/characters/gallaguer.jpg",
		sprite: "/sprites/gallaguer.png",
		walk: "/sprites/walk-gallaguer.png",
		steps: stepsOf("gallaguer"),
		accent: "#5aa8d4",
		home: 236,
		speed: 36
	}
];
var HAZARD_BY_ID = Object.fromEntries(HAZARDS.map((h) => [h.id, h]));
var TALKS = {
	juan: [
		{
			who: "juan",
			text: "Estoy re contra cansado. Si es asado, decime ya."
		},
		{
			who: "juan",
			text: "Yo dispongo. Sin grupo eterno. Sin vueltas."
		},
		{
			who: "juan",
			text: "Si hay fuego, voy. Si no, sigo en mi límite.",
			choices: [{
				label: "Hoy. Mochila y listo.",
				join: true
			}, { label: "Después vemos." }]
		}
	],
	richard: [
		{
			who: "richard",
			text: "¿Hay fecha o es otro chat eterno?"
		},
		{
			who: "richard",
			text: "El MEC no espera. El asado tampoco. Elegí."
		},
		{
			who: "richard",
			text: "Si hay fecha, yo llevo la carne. Menos charla.",
			choices: [{
				label: "Sábado. Ahora.",
				join: true
			}, { label: "Aún no hay hora." }]
		}
	],
	hector: [
		{
			who: "hector",
			text: "Fuerza. ¿Arma pues o seguimos en el aire?"
		},
		{
			who: "hector",
			text: "Un reel, un partido, el asado. El finde está libre."
		},
		{
			who: "hector",
			text: "Me sumo. Pero que sea de verdad.",
			choices: [{
				label: "Arma. Vení.",
				join: true
			}, { label: "Todavía no." }]
		}
	],
	rafa: [
		{
			who: "rafa",
			text: "Si hay silencio, yo armo el asado. Siempre."
		},
		{
			who: "rafa",
			text: "Hielo, carbón, carne, los cuatro. Esa es la misión."
		},
		{
			who: "rafa",
			text: "Los cuatro. El fuego. No hay otra.",
			choices: [{
				label: "Vamos. Vos liderás.",
				join: true
			}, { label: "Después." }]
		}
	],
	carne: [{
		who: "narrator",
		text: "Mostrador de barrio. El corte espera, como el grupo."
	}, {
		who: "narrator",
		text: "¿Llevamos la carne para el equipo?",
		choices: [{
			label: "Esto es. Anotá.",
			item: "carne"
		}, { label: "Después paso." }]
	}],
	hielo: [{
		who: "narrator",
		text: "Hielo del muelle. Sin esto la conservadora muere."
	}, {
		who: "narrator",
		text: "¿Lo llevamos?",
		choices: [{
			label: "Obvio.",
			item: "hielo"
		}, { label: "Después." }]
	}],
	terere: [{
		who: "narrator",
		text: "Tereré. Nunca mezclen mamón, decía el grupo."
	}, {
		who: "narrator",
		text: "¿Anotamos?",
		choices: [{
			label: "Dale.",
			item: "terere"
		}, { label: "Sigo." }]
	}],
	carbon: [{
		who: "narrator",
		text: "Un cajón de carbón. El fuego ya no tiene excusa."
	}, {
		who: "narrator",
		text: "¿Lo cargamos?",
		choices: [{
			label: "Arriba.",
			item: "carbon"
		}, { label: "Pesado." }]
	}],
	grill: [{
		who: "narrator",
		text: "El quincho está listo. Falta gente, hielo, carbón o carne."
	}, {
		who: "narrator",
		text: "¿Encendemos el asado?",
		choices: [{
			label: "Fuego. Misión 1.",
			fire: true
		}, { label: "Todavía no." }]
	}],
	masivo: [{
		who: "masivo",
		text: "¿Y vos? SOS Pobro. SOS Gordo. ¿Gym o seguís así?"
	}, {
		who: "masivo",
		text: "Te doy unos guaraníes si corrés. Si no, fuera de acá.",
		choices: [{
			label: "Dame la plata y me voy.",
			coins: 8,
			escape: true
		}, {
			label: "Fuera de acá. Corro.",
			escape: true
		}]
	}],
	pablito: [{
		who: "pablito",
		text: "Ey, lindo. Vení a mi pieza. Hoy no hay asado, hay cama."
	}, {
		who: "pablito",
		text: "No seas frío. O ¿vas a escapar como todos?",
		choices: [{
			label: "Ni ahí. Me voy.",
			escape: true
		}, {
			label: "Escapar ahora.",
			escape: true
		}]
	}],
	chat: [
		{
			who: "narrator",
			text: "El celular de Juan. Un chat que no debería existir."
		},
		{
			who: "narrator",
			text: "Pablito le escribió a su chica. Hora: ahora. Lugar: el muelle."
		},
		{
			who: "narrator",
			text: "¿Guardamos la prueba?",
			choices: [{
				label: "Esto se lo muestro a Juan.",
				item: "chat"
			}, { label: "Después." }]
		}
	],
	apuntes: [{
		who: "narrator",
		text: "Apuntes del MEC, olvidados en las ruinas de la UPAP."
	}, {
		who: "narrator",
		text: "Richard los necesita para no aplazarse.",
		choices: [{
			label: "Esto es para Richard.",
			item: "apuntes"
		}, { label: "Después." }]
	}],
	cafe: [{
		who: "narrator",
		text: "Café de cancha. Amargo. Como rendir un domingo."
	}, {
		who: "narrator",
		text: "¿Se lo llevamos a Richard?",
		choices: [{
			label: "Que se despierte.",
			item: "cafe"
		}, { label: "Sigo." }]
	}],
	richard2: [
		{
			who: "richard",
			text: "El asado ya fue. Ahora el MEC. Si no hay material, no rindo."
		},
		{
			who: "richard",
			text: "Apuntes. Café. Y que me lleven a Clínicas. Menos charla."
		},
		{
			who: "richard",
			text: "Cuando esté listo, vamos a rendir. Fecha: ahora.",
			choices: [{ label: "Voy por los apuntes y el café." }, {
				label: "Rendir ya.",
				exam: "ok"
			}]
		}
	],
	examen: [
		{
			who: "narrator",
			text: "Clínicas. Aula fría. Richard se sienta. El reloj corre."
		},
		{
			who: "narrator",
			text: "Pregunta 1. El grupo se arma cuando…",
			choices: [{
				label: "Hay fecha y carne.",
				exam: "ok"
			}, {
				label: "Hay 40 mensajes sin hora.",
				exam: "bad"
			}]
		},
		{
			who: "narrator",
			text: "Pregunta 2. Juan dice «yo dispongo». Eso significa…",
			choices: [{
				label: "Tiene límite. Respetalo.",
				exam: "ok"
			}, {
				label: "Que vaya igual.",
				exam: "bad"
			}]
		},
		{
			who: "narrator",
			text: "Pregunta 3. Si hay silencio en el chat…",
			choices: [{
				label: "Rafa arma el asado.",
				exam: "ok"
			}, {
				label: "Se cancela todo.",
				exam: "bad"
			}]
		}
	],
	pablito3: [
		{
			who: "pablito",
			text: "¿Juan? Ese no aparece. Yo sí. Decile a tu chica que se quede."
		},
		{
			who: "pablito",
			text: "El cornudo ni se entera. Vení, que esto es ahora."
		},
		{
			who: "hector",
			text: "Fuerza no es esto. Fuera de acá.",
			choices: [{
				label: "Pablito, fuera. Juan no es cornudo.",
				chaseOff: true
			}, {
				label: "Esto se va a podrir.",
				chaseOff: true
			}]
		}
	],
	juan3: [
		{
			who: "juan",
			text: "Vi el chat. Estoy re contra cansado de esta basura."
		},
		{
			who: "juan",
			text: "Si era verdad, yo ya no dispongo. Me borro."
		},
		{
			who: "juan",
			text: "Decime que lo echaste. Sin vueltas.",
			choices: [{
				label: "Lo echamos. Vos no sos cornudo.",
				honor: true
			}, { label: "Todavía está por acá." }]
		}
	],
	marcos: [
		{
			who: "marcos",
			text: "Ay, nene. Soy Marcos, coordinador de UPAP. Richard me dejó en visto otra vez."
		},
		{
			who: "marcos",
			text: "Fui su pareja. Todavía lo siento. Si me tocás la panza, me calmo. Si me pegás… no, no me pegues."
		},
		{
			who: "marcos",
			text: "Richard tiene que estar acá. El grupo, el asado, el examen. Yo armo todo. Él es el único que me desarma.",
			choices: [{
				label: "Le toco la panza.",
				calm: true
			}, {
				label: "Richard no viene.",
				escape: true
			}]
		}
	],
	gallaguer: [
		{
			who: "gallaguer",
			text: "Che, mirá esta mina. ¿Escribe tu amiga? Yo le quiero conocer. Ahora."
		},
		{
			who: "gallaguer",
			text: "A las novias del equipo les mando audio a las tres. Es investigación. No es celos. Es ciencia."
		},
		{
			who: "gallaguer",
			text: "Pasame el Instagram. Si no me lo pasás, yo igual lo encuentro. Siempre lo encuentro.",
			choices: [{
				label: "Estás loco, Gallaguer.",
				escape: true
			}, {
				label: "Borrá ese chat.",
				escape: true
			}]
		}
	]
};
var CHAPTERS = {
	1: {
		chapter: 1,
		title: "Armar asado",
		grade: "grade-warm",
		intro: {
			src: "/cinema/asado.mp4",
			title: "El chat está mudo",
			line: "Si hay silencio, hay que armar el asado."
		},
		outro: {
			src: "/endings/asado.mp4",
			title: "Se hizo el asado",
			line: "Los cuatro. El fuego. No había otra."
		},
		startX: 16,
		grillX: 355,
		zones: [
			{
				id: "costanera",
				name: "Costanera",
				bg: "/stages/m1-costanera.jpg"
			},
			{
				id: "mercado",
				name: "El mercado",
				bg: "/stages/m1-mercado.jpg"
			},
			{
				id: "barrio",
				name: "El barrio",
				bg: "/stages/m1-barrio.jpg"
			},
			{
				id: "quincho",
				name: "El quincho",
				bg: "/stages/m1-quincho.jpg"
			}
		],
		npcs: [
			{
				id: "rafa",
				x: 72
			},
			{
				id: "juan",
				x: 148
			},
			{
				id: "richard",
				x: 248
			},
			{
				id: "hector",
				x: 328
			}
		],
		pickups: [
			{
				id: "c1",
				kind: "coin",
				x: 40
			},
			{
				id: "hielo",
				kind: "item",
				x: 92,
				talk: "hielo"
			},
			{
				id: "c2",
				kind: "coin",
				x: 128
			},
			{
				id: "carne",
				kind: "item",
				x: 178,
				talk: "carne"
			},
			{
				id: "c3",
				kind: "coin",
				x: 210
			},
			{
				id: "c4",
				kind: "coin",
				x: 270
			},
			{
				id: "carbon",
				kind: "item",
				x: 318,
				talk: "carbon"
			}
		],
		props: [
			{
				src: "/sprites/palm.png",
				x: 12,
				h: 30
			},
			{
				src: "/sprites/palm.png",
				x: 58,
				h: 28,
				flip: true
			},
			{
				src: "/sprites/dog.png",
				x: 96,
				h: 12
			},
			{
				src: "/sprites/lamp.png",
				x: 160,
				h: 24
			},
			{
				src: "/sprites/lamp.png",
				x: 230,
				h: 24
			},
			{
				src: "/sprites/palm.png",
				x: 300,
				h: 32
			}
		],
		hazardHome: {
			pablito: 200,
			masivo: 290,
			marcos: 108,
			gallaguer: 232
		}
	},
	2: {
		chapter: 2,
		title: "El examen",
		grade: "grade-day",
		intro: {
			src: "/cinema/examen.mp4",
			title: "El MEC no espera",
			line: "Richard rinde mañana. Menos charla. Más material."
		},
		outro: {
			src: "/endings/examen.mp4",
			title: "Richard aprobó",
			line: "Había fecha. Había café. Aprobó."
		},
		startX: 16,
		examX: 355,
		zones: [
			{
				id: "campus",
				name: "Campus UPAP",
				bg: "/stages/m2-campus.jpg"
			},
			{
				id: "biblio",
				name: "La biblioteca",
				bg: "/stages/m2-biblio.jpg"
			},
			{
				id: "cancha",
				name: "La cancha",
				bg: "/stages/m2-cancha.jpg"
			},
			{
				id: "aula",
				name: "El aula",
				bg: "/stages/m2-aula.jpg"
			}
		],
		npcs: [
			{
				id: "richard",
				x: 68
			},
			{
				id: "hector",
				x: 188
			},
			{
				id: "rafa",
				x: 268
			},
			{
				id: "juan",
				x: 999
			}
		],
		pickups: [
			{
				id: "c1",
				kind: "coin",
				x: 36
			},
			{
				id: "apuntes",
				kind: "item",
				x: 118,
				talk: "apuntes"
			},
			{
				id: "c2",
				kind: "coin",
				x: 155
			},
			{
				id: "cafe",
				kind: "item",
				x: 218,
				talk: "cafe"
			},
			{
				id: "c3",
				kind: "coin",
				x: 250
			},
			{
				id: "c4",
				kind: "coin",
				x: 310
			}
		],
		props: [
			{
				src: "/sprites/lamp.png",
				x: 44,
				h: 24
			},
			{
				src: "/sprites/palm.png",
				x: 88,
				h: 28
			},
			{
				src: "/sprites/ball.png",
				x: 210,
				h: 6
			},
			{
				src: "/sprites/lamp.png",
				x: 340,
				h: 24
			}
		],
		hazardHome: {
			masivo: 240,
			pablito: 999,
			marcos: 86,
			gallaguer: 175
		}
	},
	3: {
		chapter: 3,
		title: "Juan",
		grade: "grade-night",
		intro: {
			src: "/cinema/juan.mp4",
			title: "El chat que no debía",
			line: "Alguien le escribió a la chica de Juan. Pablito está cerca."
		},
		outro: {
			src: "/endings/juan.mp4",
			title: "Juan no es cornudo",
			line: "El equipo queda. Pablito, fuera de acá."
		},
		startX: 18,
		zones: [
			{
				id: "noche",
				name: "Costanera noche",
				bg: "/stages/m3-noche.jpg"
			},
			{
				id: "pasillo",
				name: "El pasillo",
				bg: "/stages/m3-pasillo.jpg"
			},
			{
				id: "bosque",
				name: "El bosque",
				bg: "/stages/m3-bosque.jpg"
			},
			{
				id: "muelle",
				name: "El muelle",
				bg: "/stages/m3-muelle.jpg"
			}
		],
		npcs: [
			{
				id: "juan",
				x: 62
			},
			{
				id: "rafa",
				x: 330
			},
			{
				id: "richard",
				x: 999
			},
			{
				id: "hector",
				x: 999
			}
		],
		pickups: [
			{
				id: "c1",
				kind: "coin",
				x: 40
			},
			{
				id: "chat",
				kind: "item",
				x: 128,
				talk: "chat"
			},
			{
				id: "c2",
				kind: "coin",
				x: 170
			},
			{
				id: "c3",
				kind: "coin",
				x: 250
			},
			{
				id: "c4",
				kind: "coin",
				x: 310
			}
		],
		props: [
			{
				src: "/sprites/lamp.png",
				x: 30,
				h: 26
			},
			{
				src: "/sprites/palm.png",
				x: 88,
				h: 30
			},
			{
				src: "/sprites/lamp.png",
				x: 155,
				h: 26
			},
			{
				src: "/sprites/palm.png",
				x: 230,
				h: 32,
				flip: true
			},
			{
				src: "/sprites/lamp.png",
				x: 348,
				h: 26
			}
		],
		hazardHome: {
			pablito: 268,
			masivo: 999,
			marcos: 95,
			gallaguer: 210
		}
	}
};
var MISSIONS = [
	{
		ch: 1,
		title: "Armar asado",
		blurb: "Costanera, mercado, barrio, quincho. Reuní al equipo y encendé el fuego.",
		img: "/stages/m1-quincho.jpg"
	},
	{
		ch: 2,
		title: "Que Richard pase el examen",
		blurb: "Campus UPAP. Apuntes, café, el aula. El MEC no espera.",
		img: "/stages/m2-aula.jpg"
	},
	{
		ch: 3,
		title: "Que Juan no sea cornudo",
		blurb: "Noche en Asunción. El chat, el muelle, Pablito. Pegale y volvé con Juan.",
		img: "/stages/m3-muelle.jpg"
	}
];
function chapterOf(n) {
	return CHAPTERS[n];
}
function worldWidth(n) {
	return CHAPTERS[n].zones.length * 100;
}
function zoneAt(n, x) {
	const zones = CHAPTERS[n].zones;
	return zones[Math.max(0, Math.min(zones.length - 1, Math.floor(x / 100)))];
}
function npcHome(n) {
	const t = {
		rafa: 80,
		juan: 80,
		richard: 80,
		hector: 80
	};
	for (const spot of CHAPTERS[n].npcs) t[spot.id] = spot.x;
	return t;
}
function hazardAt(x) {
	return {
		x,
		y: 0,
		vx: 0,
		vy: 0,
		rot: 0,
		spin: 0,
		fly: false,
		down: false,
		downAt: 0,
		chasing: false,
		escaped: false,
		caught: false,
		hit: 0,
		exploding: false,
		explodeAt: 0,
		gone: false,
		headless: false,
		calm: false,
		cry: false,
		lastThrow: 0,
		hurt: "",
		torn: false
	};
}
function hazardsFor(n) {
	const home = CHAPTERS[n].hazardHome;
	return {
		masivo: hazardAt(home.masivo),
		pablito: hazardAt(home.pablito),
		marcos: hazardAt(home.marcos),
		gallaguer: hazardAt(home.gallaguer)
	};
}
var bloodSeq = 1;
var gibSeq = 1;
var GIB_SRC = [
	"/sprites/gib1.png",
	"/sprites/gib2.png",
	"/sprites/spray.png"
];
function splat(x, y, n = 10) {
	return Array.from({ length: n }, () => ({
		id: bloodSeq++,
		x: x + (Math.random() - .5) * 10,
		y: y + Math.random() * 8,
		w: 14 + Math.random() * 28,
		h: 10 + Math.random() * 22,
		rot: Math.random() * 360
	}));
}
function rip(x, dir, n = 9) {
	return Array.from({ length: n }, (_, i) => ({
		id: gibSeq++,
		x: x + (Math.random() - .5) * 8,
		y: 8 + Math.random() * 16,
		vx: dir * (28 + Math.random() * 90) + (Math.random() - .5) * 36,
		vy: 48 + Math.random() * 78,
		rot: Math.random() * 360,
		spin: (Math.random() - .5) * 980,
		src: GIB_SRC[i % 3]
	}));
}
function objective(s) {
	if (s.hazards.pablito.chasing && s.chapter !== 3) return "¡ESCAPÁ de Pablito!";
	if (s.hazards.masivo.chasing) return "¡SOS Pobro! ¡CORRÉ!";
	if (s.hazards.marcos.chasing && !s.hazards.marcos.calm) return "¡Marcos tira libros!";
	if (s.hazards.gallaguer.chasing) return "¡Gallaguer te vio!";
	if (s.chapter === 1) {
		const missing = TEAM.filter((id) => id !== s.hero);
		for (const id of missing) if (!s.recruited.includes(id)) {
			if (id === "rafa") return "Asado · Rafa en la costanera";
			if (id === "juan") return "Asado · Juan en el mercado";
			if (id === "richard") return "Asado · Richard en el barrio";
			return "Asado · Héctor en el quincho";
		}
		if (!s.items.includes("hielo")) return "Asado · hielo en la costanera";
		if (!s.items.includes("carne")) return "Asado · carne en el mercado";
		if (!s.items.includes("carbon")) return "Asado · carbón en el quincho";
		return "Asado · encendé el fuego";
	}
	if (s.chapter === 2) {
		if (!s.items.includes("apuntes")) return "Examen · apuntes en la biblioteca";
		if (!s.items.includes("cafe")) return "Examen · café en la cancha";
		return "Examen · rendí en el aula";
	}
	if (!s.items.includes("chat")) return "Juan · el chat en el pasillo";
	if (!s.items.includes("echar")) return "Juan · pegale a Pablito en el muelle";
	return "Juan · volvé con Juan";
}
var held = /* @__PURE__ */ new Set();
var injected = null;
var pads = {
	left: false,
	right: false,
	punch: false
};
function bindKeys() {
	const down = (e) => {
		held.add(e.code);
		if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
	};
	const up = (e) => {
		held.delete(e.code);
	};
	const clear = () => held.clear();
	window.addEventListener("keydown", down, { passive: false });
	window.addEventListener("keyup", up);
	window.addEventListener("blur", clear);
	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
		window.removeEventListener("blur", clear);
	};
}
function isDown(code) {
	return injected ? injected.includes(code) : held.has(code);
}
function axis() {
	let v = 0;
	if (isDown("KeyA") || isDown("ArrowLeft")) v -= 1;
	if (isDown("KeyD") || isDown("ArrowRight")) v += 1;
	return v;
}
function setKeys(codes) {
	injected = codes.length ? codes : null;
}
function wantsPunch() {
	return pads.punch || isDown("Space") || isDown("KeyJ") || isDown("KeyK");
}
function setPad(dir, on) {
	pads[dir] = on;
	if (on) pads[dir === "left" ? "right" : "left"] = false;
}
var toastTimer = 0;
var punchGate = 0;
var bookSeq = 1;
var shotSeq = 1;
var fxSeq = 1;
function toast(msg) {
	useGame.setState({ toast: msg });
	if (toastTimer) window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => {
		useGame.setState({ toast: "" });
		toastTimer = 0;
	}, 2600);
}
function winCinema(n) {
	const ch = chapterOf(n);
	useGame.setState({
		clip: {
			src: ch.outro.src,
			title: ch.outro.title,
			line: ch.outro.line,
			next: "win"
		},
		phase: "cinema",
		talkKey: null
	});
}
var blank = {
	phase: "title",
	hero: null,
	x: 18,
	facing: 1,
	recruited: [],
	items: [],
	coins: 0,
	fire: false,
	chapter: 1,
	examScore: 0,
	attacking: false,
	npcX: npcHome(1),
	hazards: hazardsFor(1),
	blood: [],
	books: [],
	shots: [],
	impacts: [],
	gibs: [],
	weapon: "pistol",
	shake: 0,
	clip: null,
	talkKey: null,
	line: 0,
	toast: ""
};
var useGame = create((set, get) => ({
	...blank,
	play: () => set({
		phase: "cinema",
		clip: {
			src: "/cinema/intro.mp4",
			title: "Team UPAP y Juan",
			line: "Marcos coordina. Gallaguer pregunta. El asado no se arma solo.",
			next: "select",
			sound: true
		}
	}),
	choose: (id) => set({
		hero: id,
		phase: "missions"
	}),
	pickMissions: () => set({
		phase: "missions",
		talkKey: null,
		toast: "",
		clip: null
	}),
	startMission: (n) => {
		const hero = get().hero ?? "rafa";
		const ch = chapterOf(n);
		const recruited = n === 1 ? [hero] : [
			"rafa",
			"juan",
			"richard",
			"hector"
		];
		set({
			phase: "cinema",
			hero,
			chapter: n,
			facing: 1,
			x: ch.startX,
			recruited,
			items: ["pistol"],
			coins: 0,
			fire: n !== 1,
			examScore: 0,
			attacking: false,
			npcX: npcHome(n),
			hazards: hazardsFor(n),
			blood: [],
			books: [],
			shots: [],
			impacts: [],
			gibs: [],
			weapon: "pistol",
			shake: 0,
			talkKey: null,
			line: 0,
			toast: "",
			clip: {
				src: ch.intro.src,
				title: ch.intro.title,
				line: ch.intro.line,
				next: "play"
			}
		});
	},
	skipCinema: () => {
		const { clip } = get();
		set({
			phase: clip?.next ?? "play",
			clip: clip?.next === "win" ? clip : null
		});
	},
	setX: (x) => set({ x }),
	setFacing: (facing) => set({ facing }),
	grabCoin: (id) => {
		const s = get();
		if (s.items.includes(id)) return;
		set({
			items: [...s.items, id],
			coins: s.coins + 1
		});
	},
	grabWeapon: (id) => {
		const s = get();
		if (s.items.includes(id)) return;
		set({
			items: [...s.items, id],
			weapon: id
		});
		toast(id === "pistol" ? "Pistola. Apuntá y dispará." : "Cuchillo. Cortá de cerca.");
	},
	cycleWeapon: () => {
		const s = get();
		const owned = ["fist"];
		if (s.items.includes("knife")) owned.push("knife");
		if (s.items.includes("pistol")) owned.push("pistol");
		const next = owned[(owned.indexOf(s.weapon) + 1) % owned.length];
		set({ weapon: next });
		toast(next === "pistol" ? "Pistola." : next === "knife" ? "Cuchillo." : "Puño.");
	},
	punch: () => {
		const s = get();
		if (s.phase !== "play") return;
		const now = performance.now();
		if (now < punchGate) return;
		punchGate = now + (s.weapon === "pistol" ? 280 : 420);
		const maxX = worldWidth(s.chapter) - 8;
		set({
			attacking: true,
			shake: now
		});
		window.setTimeout(() => useGame.setState({ attacking: false }), s.weapon === "pistol" ? 160 : 280);
		if (s.weapon === "pistol") {
			set({
				shots: [
					...s.shots,
					{
						id: shotSeq++,
						x: s.x + s.facing * 11,
						y: 24,
						vx: s.facing * 230,
						face: s.facing
					},
					{
						id: shotSeq++,
						x: s.x + s.facing * 9,
						y: 22,
						vx: s.facing * 200,
						face: s.facing
					}
				],
				impacts: [
					...s.impacts,
					{
						id: fxSeq++,
						x: s.x + s.facing * 8,
						y: 24,
						kind: "muzzle"
					},
					{
						id: fxSeq++,
						x: s.x + s.facing * 24,
						y: 24,
						kind: "tracer"
					},
					{
						id: fxSeq++,
						x: s.x + s.facing * 18,
						y: 22,
						kind: "tracer"
					}
				],
				attacking: true,
				shake: now
			});
			toast("¡PUM!");
			return;
		}
		const isKnife = s.weapon === "knife";
		const reach = isKnife ? 28 : 18;
		const fist = s.x + s.facing * (isKnife ? 16 : 12);
		const hazards = { ...s.hazards };
		let hit = false;
		let blood = [...s.blood];
		const impacts = isKnife ? [
			...s.impacts,
			{
				id: fxSeq++,
				x: s.x + s.facing * 10,
				y: 22,
				kind: "slash"
			},
			{
				id: fxSeq++,
				x: s.x + s.facing * 13,
				y: 18,
				kind: "slash"
			}
		] : [...s.impacts];
		let gibs = [...s.gibs];
		for (const id of Object.keys(hazards)) {
			const h = hazards[id];
			if (h.x > 900 || h.fly || h.down || h.gone || h.exploding) continue;
			if (Math.abs(h.x - s.x) < reach || Math.abs(h.x - fist) < reach - 2) {
				const dir = s.facing;
				if (id === "marcos") {
					hazards[id] = {
						...h,
						cry: true,
						chasing: false,
						hit: now,
						hurt: isKnife ? "slash" : "fist",
						torn: isKnife,
						fly: isKnife,
						vx: isKnife ? dir * 70 : 0,
						vy: isKnife ? 60 : 0,
						spin: isKnife ? dir * 500 : 0
					};
					blood = [...blood, ...splat(h.x, 12, isKnife ? 18 : 6)].slice(-40);
					if (isKnife) {
						impacts.push({
							id: fxSeq++,
							x: h.x,
							y: 20,
							kind: "impact"
						});
						gibs = [...gibs, ...rip(h.x, dir, 10)].slice(-28);
					}
					set({
						hazards,
						blood,
						impacts,
						gibs,
						attacking: true,
						shake: now
					});
					toast("¡Marcos llora!");
					window.setTimeout(() => {
						const cur = useGame.getState();
						const m = cur.hazards.marcos;
						useGame.setState({
							hazards: {
								...cur.hazards,
								marcos: {
									...m,
									exploding: true,
									explodeAt: performance.now(),
									cry: true
								}
							},
							blood: [...cur.blood, ...splat(m.x, 14, 18)].slice(-32),
							shake: performance.now()
						});
						toast("Marcos explota.");
					}, 900);
					return;
				}
				if (id === "gallaguer") {
					hazards[id] = {
						...h,
						headless: true,
						exploding: true,
						explodeAt: now,
						chasing: false,
						fly: true,
						vx: dir * 40,
						vy: 90,
						spin: dir * 900,
						hit: now,
						hurt: isKnife ? "slash" : "fist",
						torn: isKnife
					};
					blood = [
						...blood,
						...splat(h.x, 22, 22),
						...splat(h.x, 8, 12)
					].slice(-40);
					if (isKnife) {
						impacts.push({
							id: fxSeq++,
							x: h.x,
							y: 22,
							kind: "impact"
						});
						gibs = [...gibs, ...rip(h.x, dir, 11)].slice(-28);
					}
					set({
						hazards,
						blood,
						impacts,
						gibs,
						attacking: true,
						shake: now
					});
					toast("¡Le explota la cabeza!");
					return;
				}
				hazards[id] = {
					...h,
					vx: dir * (isKnife ? 70 : 92 + Math.random() * 18),
					vy: isKnife ? 62 + Math.random() * 20 : 78 + Math.random() * 22,
					spin: dir * (isKnife ? 980 : 720 + Math.random() * 420),
					fly: true,
					down: false,
					chasing: false,
					caught: false,
					hit: now,
					hurt: isKnife ? "slash" : "fist",
					torn: isKnife
				};
				blood = [
					...blood,
					...splat(h.x, 12, isKnife ? 18 : 14),
					...splat(h.x + dir * 8, 18, isKnife ? 12 : 8)
				].slice(-40);
				if (isKnife) {
					impacts.push({
						id: fxSeq++,
						x: h.x,
						y: 18,
						kind: "impact"
					});
					gibs = [...gibs, ...rip(h.x, dir, 10)].slice(-28);
				}
				hit = true;
				if (id === "pablito" && s.chapter === 3 && !s.items.includes("echar")) {
					set({
						hazards,
						items: [...s.items, "echar"],
						attacking: true,
						blood,
						impacts,
						gibs,
						shake: now
					});
					toast("¡Pablito vuela! Hablá con Juan.");
					return;
				}
			}
		}
		const npcX = { ...s.npcX };
		for (const id of Object.keys(npcX)) {
			if (id === s.hero || npcX[id] > 900) continue;
			if (Math.abs(npcX[id] - s.x) < 14) {
				npcX[id] = Math.max(8, Math.min(maxX, npcX[id] + s.facing * 14));
				hit = true;
			}
		}
		set({
			hazards,
			npcX,
			blood,
			impacts,
			gibs,
			shake: hit ? now : s.shake
		});
		toast(hit ? s.weapon === "knife" ? "¡Lo despedazó!" : "¡SALE VOLANDO!" : "Al aire.");
	},
	tickHazards: (dt, px) => {
		const s = get();
		if (s.phase !== "play") return;
		const maxX = worldWidth(s.chapter) - 8;
		const hazards = { ...s.hazards };
		let dirty = false;
		let blood = s.blood;
		let books = [...s.books];
		const now = performance.now();
		for (const def of HAZARDS) {
			const h = { ...hazards[def.id] };
			if (h.gone || h.x > 900) continue;
			if (h.exploding) {
				h.rot += 420 * dt;
				h.y += 40 * dt;
				if (now - h.explodeAt > 800) {
					h.gone = true;
					h.x = 999;
				}
				hazards[def.id] = h;
				dirty = true;
				continue;
			}
			if (h.calm) {
				hazards[def.id] = h;
				continue;
			}
			if (h.cry) {
				hazards[def.id] = h;
				continue;
			}
			if (h.x > 900) continue;
			if (h.fly) {
				h.vy -= 210 * dt;
				h.x += h.vx * dt;
				h.y += h.vy * dt;
				h.rot += h.spin * dt;
				h.x = Math.max(4, Math.min(maxX, h.x));
				if (h.y <= 0) {
					h.y = 0;
					if (Math.abs(h.vy) > 36) {
						h.vy = Math.abs(h.vy) * .38;
						h.vx *= .55;
						h.spin *= .6;
						blood = [...blood, ...splat(h.x, 8, 8)].slice(-28);
					} else {
						h.fly = false;
						h.down = true;
						h.downAt = now;
						h.vx = 0;
						h.vy = 0;
						h.rot = h.spin >= 0 ? 90 : -90;
						blood = [...blood, ...splat(h.x, 6, 7)].slice(-28);
					}
				}
				hazards[def.id] = h;
				dirty = true;
				continue;
			}
			if (h.down) {
				if (!(def.id === "pablito" && s.chapter === 3 && s.items.includes("echar"))) {
					if (now - h.downAt > 2400) {
						h.down = false;
						h.rot = 0;
						dirty = true;
					}
				}
				hazards[def.id] = h;
				continue;
			}
			if (def.id === "pablito" && s.chapter === 3) {
				hazards[def.id] = h;
				continue;
			}
			if (now - h.hit < 400) {
				hazards[def.id] = h;
				continue;
			}
			const dx = px - h.x;
			const dist = Math.abs(dx);
			if (!h.chasing && dist < 20) {
				h.chasing = true;
				h.caught = false;
				dirty = true;
				toast(def.id === "masivo" ? "¡SOS Pobro! ¡CORRÉ!" : def.id === "marcos" ? "¡Marcos tira libros!" : def.id === "gallaguer" ? "¡Gallaguer te vio!" : "¡Pablito te vio! ¡ESCAPÁ!");
			}
			if (h.chasing) {
				const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
				if (dist > 14) h.x = Math.max(8, Math.min(maxX, h.x + dir * def.speed * dt));
				else {
					h.x = px - dir * 14;
					if (!h.caught) {
						h.caught = true;
						hazards[def.id] = h;
						set({
							hazards,
							blood,
							phase: "talk",
							talkKey: def.id,
							line: 0
						});
						return;
					}
				}
				if (dist > 56) {
					h.chasing = false;
					h.escaped = true;
					h.caught = false;
					h.x = chapterOf(s.chapter).hazardHome[def.id];
					toast(def.id === "masivo" ? "Masivo: fuera de acá." : def.id === "marcos" ? "Marcos se queda tirando tesis." : def.id === "gallaguer" ? "Gallaguer perdió el hilo." : "Zafaste de Pablito.");
				}
				if (def.id === "marcos" && now - h.lastThrow > 1100) {
					const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
					books.push({
						id: bookSeq++,
						x: h.x,
						y: 18,
						vx: dir * 48,
						rot: Math.random() * 360
					});
					h.lastThrow = now;
				}
				dirty = true;
			}
			hazards[def.id] = h;
		}
		books = books.map((b) => ({
			...b,
			x: b.x + b.vx * dt,
			rot: b.rot + 220 * dt,
			y: b.y + 6 * dt
		})).filter((b) => b.x > 0 && b.x < maxX && b.y < 40);
		const nextShots = [];
		const nextImpacts = s.impacts.slice(-10);
		let gibs = [...s.gibs];
		for (const shot of s.shots) {
			const nx = shot.x + shot.vx * dt;
			if (nx < 2 || nx > maxX) continue;
			let hitShot = false;
			for (const def of HAZARDS) {
				const h = hazards[def.id];
				if (h.gone || h.x > 900 || h.fly || h.exploding) continue;
				if (Math.abs(h.x - nx) < 10) {
					const dir = shot.face;
					nextImpacts.push({
						id: fxSeq++,
						x: h.x,
						y: 20,
						kind: "boom"
					}, {
						id: fxSeq++,
						x: h.x,
						y: 24,
						kind: "impact"
					});
					gibs = [...gibs, ...rip(h.x, dir, 12)].slice(-32);
					const dead = {
						...h,
						hurt: "gun",
						exploding: true,
						explodeAt: now,
						fly: true,
						torn: true,
						chasing: false,
						caught: false,
						headless: def.id === "gallaguer",
						vx: dir * 58,
						vy: 82,
						spin: dir * 820,
						hit: now
					};
					hazards[def.id] = dead;
					blood = [
						...blood,
						...splat(h.x, 16, 22),
						...splat(h.x + dir * 6, 10, 10)
					].slice(-40);
					const line = def.id === "gallaguer" ? "¡Le explota la cabeza!" : def.id === "marcos" ? "Marcos explota." : def.id === "masivo" ? "¡Masivo revienta!" : "¡Pablito explota!";
					if (def.id === "pablito" && s.chapter === 3 && !s.items.includes("echar")) {
						set({
							hazards,
							items: [...s.items, "echar"],
							blood,
							shots: nextShots,
							impacts: nextImpacts,
							gibs,
							shake: now
						});
						toast("¡Pablito explota! Hablá con Juan.");
						return;
					}
					toast(line);
					dirty = true;
					hitShot = true;
					break;
				}
			}
			if (!hitShot) nextShots.push({
				...shot,
				x: nx
			});
		}
		gibs = gibs.map((g) => ({
			...g,
			vy: g.vy - 210 * dt,
			x: g.x + g.vx * dt,
			y: g.y + g.vy * dt,
			rot: g.rot + g.spin * dt
		})).filter((g) => g.y > -20 && g.x > -10 && g.x < maxX + 10).slice(-28);
		const impacts = nextImpacts.slice(-16);
		if (dirty || blood !== s.blood || books.length > 0 || s.books.length > 0 || nextShots.length > 0 || s.shots.length > 0 || impacts.length !== s.impacts.length || gibs.length > 0 || s.gibs.length > 0) set({
			hazards,
			blood,
			books,
			shots: nextShots,
			impacts,
			gibs,
			shake: dirty ? now : s.shake
		});
	},
	startTalk: (key) => {
		if (TALKS[key]) set({
			phase: "talk",
			talkKey: key,
			line: 0
		});
	},
	advance: (choice) => {
		const s = get();
		if (!s.talkKey) return;
		const script = TALKS[s.talkKey];
		const line = script[s.line];
		const maxX = worldWidth(s.chapter) - 8;
		if (line.choices && choice !== void 0) {
			const pick = line.choices[choice];
			if (pick.join && s.talkKey) {
				const who = s.talkKey;
				if (!s.recruited.includes(who)) {
					set({
						recruited: [...s.recruited, who],
						phase: "play",
						talkKey: null
					});
					toast(`${NAMES[who] ?? who} se suma.`);
					return;
				}
			}
			if (pick.item && !s.items.includes(pick.item)) {
				set({
					items: [...s.items, pick.item],
					phase: "play",
					talkKey: null
				});
				toast(`${pick.item} listo.`);
				return;
			}
			if (pick.calm) {
				set({
					hazards: {
						...s.hazards,
						marcos: {
							...s.hazards.marcos,
							chasing: false,
							calm: true,
							caught: false
						}
					},
					phase: "play",
					talkKey: null
				});
				toast("Marcos se calma. La panza es sagrada.");
				return;
			}
			if (pick.coins) {
				const who = s.talkKey;
				const hazards = { ...s.hazards };
				if (hazards[who]) hazards[who] = {
					...hazards[who],
					chasing: true,
					caught: true
				};
				set({
					coins: s.coins + pick.coins,
					hazards,
					phase: "play",
					talkKey: null,
					x: s.x + (s.facing >= 0 ? 8 : -8)
				});
				toast("Masivo te tira unos Gs. ¡CORRE!");
				return;
			}
			if (pick.escape) {
				const who = s.talkKey;
				const hazards = { ...s.hazards };
				if (hazards[who]) hazards[who] = {
					...hazards[who],
					chasing: true,
					caught: true
				};
				const bump = s.x >= (hazards[who]?.x ?? s.x) ? 10 : -10;
				set({
					hazards,
					phase: "play",
					talkKey: null,
					x: Math.max(6, Math.min(maxX, s.x + bump))
				});
				toast("¡Corré!");
				return;
			}
			if (pick.chaseOff) {
				set({
					hazards: {
						...s.hazards,
						pablito: {
							...s.hazards.pablito,
							x: 12,
							chasing: false,
							escaped: true,
							caught: true,
							hit: performance.now()
						}
					},
					items: s.items.includes("echar") ? s.items : [...s.items, "echar"],
					phase: "play",
					talkKey: null
				});
				toast("Pablito salió corriendo. Hablá con Juan.");
				return;
			}
			if (pick.honor) {
				if (!s.items.includes("echar")) {
					set({
						phase: "play",
						talkKey: null
					});
					toast("Primero echá a Pablito.");
					return;
				}
				set({ items: [...s.items, "honor"] });
				winCinema(3);
				return;
			}
			if (pick.exam) {
				const score = s.examScore + (pick.exam === "ok" ? 1 : 0);
				if (s.talkKey === "richard2") {
					if (!s.items.includes("apuntes") || !s.items.includes("cafe")) {
						set({
							phase: "play",
							talkKey: null
						});
						toast("Faltan apuntes o café. Seguí a la derecha.");
						return;
					}
					set({
						examScore: 0,
						phase: "talk",
						talkKey: "examen",
						line: 0
					});
					return;
				}
				if (s.line + 1 < script.length) {
					set({
						examScore: score,
						line: s.line + 1
					});
					return;
				}
				if (score >= 2) {
					set({
						examScore: score,
						items: s.items.includes("exam") ? s.items : [...s.items, "exam"]
					});
					winCinema(2);
					return;
				}
				set({
					examScore: 0,
					phase: "play",
					talkKey: null
				});
				toast("Aplazado. Reintentá el examen.");
				return;
			}
			if (pick.fire) {
				const team = s.recruited.length >= 4;
				const stuff = [
					"carne",
					"hielo",
					"carbon"
				].every((id) => s.items.includes(id));
				if (team && stuff) {
					set({ fire: true });
					winCinema(1);
					return;
				}
				set({
					phase: "play",
					talkKey: null
				});
				toast(team ? "Falta hielo, carbón o carne." : "Falta el equipo.");
				return;
			}
			set({
				phase: "play",
				talkKey: null
			});
			return;
		}
		if (s.line + 1 < script.length) set({ line: s.line + 1 });
		else set({
			phase: "play",
			talkKey: null
		});
	},
	reset: () => set({ ...blank })
}));
var SPEED = 48;
function Title() {
	const play = useGame((s) => s.play);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh w-full overflow-hidden bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/art/splash.jpg",
			alt: "Team UPAP y Juan",
			className: "absolute inset-0 h-full w-full object-cover object-center"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 bottom-0 z-10 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: play,
				className: "press w-full max-w-xs rounded-full bg-accent py-4 text-lg font-bold text-accent-fg shadow-soft",
				children: "Jugar"
			})
		})]
	});
}
function Select() {
	const choose = useGame((s) => s.choose);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
				children: "Team UPAP"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "¿Quién sos hoy?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Tres misiones. El asado es apenas el principio."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid flex-1 grid-cols-2 gap-3",
				children: HEROES.map((hero) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => choose(hero.id),
					className: "press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "select-stage relative h-44 overflow-hidden bg-black",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: hero.reel,
							className: "pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_18%]",
							autoPlay: true,
							muted: true,
							loop: true,
							playsInline: true,
							poster: hero.portrait
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg",
							children: hero.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: hero.tagline
						})]
					})]
				}, hero.id))
			})
		]
	});
}
function Missions() {
	const start = useGame((s) => s.startMission);
	const hero = useGame((s) => s.hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
				children: "Team UPAP"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "Elegí la historia"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [hero ? `Jugás como ${HERO_BY_ID[hero].name}.` : "", " Cada misión es un mundo distinto."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-1 flex-col gap-3",
				children: MISSIONS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => start(m.ch),
					className: "press overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-32 overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 bg-cover bg-center",
								style: { backgroundImage: `url(${m.img})` }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "absolute bottom-2 left-3 font-display text-2xl text-paper",
								children: m.title
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-2.5 text-sm text-muted",
						children: m.blurb
					})]
				}, m.ch))
			})
		]
	});
}
function Cinema() {
	const clip = useGame((s) => s.clip);
	const skip = useGame((s) => s.skipCinema);
	if (!clip) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-black",
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: clip.src,
				className: "absolute inset-0 h-full w-full object-cover",
				autoPlay: true,
				muted: !clip.sound,
				playsInline: true,
				onEnded: skip
			}, clip.src),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mission-alert font-display text-3xl leading-tight",
						children: clip.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-[32ch] text-sm text-paper/85",
						children: clip.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press mt-5 h-12 w-full rounded-full bg-accent font-medium text-accent-fg",
						onClick: skip,
						children: "Seguir"
					})
				]
			})
		]
	});
}
function Win() {
	const reset = useGame((s) => s.reset);
	const pick = useGame((s) => s.pickMissions);
	const recruited = useGame((s) => s.recruited);
	const chapter = useGame((s) => s.chapter);
	const clip = useGame((s) => s.clip) ?? {
		src: chapterOf(chapter).outro.src,
		title: chapterOf(chapter).outro.title,
		line: chapterOf(chapter).outro.line
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col overflow-hidden bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover",
				src: clip.src,
				autoPlay: true,
				loop: true,
				muted: true,
				playsInline: true
			}, clip.src),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
						children: "Final"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-4xl text-paper",
						children: clip.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-paper/80",
						children: clip.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex justify-center gap-2",
						children: TEAM.filter((id) => recruited.includes(id)).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: HERO_BY_ID[id].portrait,
							alt: HERO_BY_ID[id].name,
							className: "size-12 rounded-full object-cover ring-2 ring-accent"
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: pick,
						className: "press mt-6 h-12 w-full rounded-full bg-accent font-medium text-accent-fg",
						children: "Otra historia"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: reset,
						className: "press mt-2 h-11 w-full rounded-full text-sm text-paper/80",
						children: "Inicio"
					})
				]
			})
		]
	});
}
function Talk() {
	const talkKey = useGame((s) => s.talkKey);
	const lineI = useGame((s) => s.line);
	const advance = useGame((s) => s.advance);
	if (!talkKey) return null;
	const line = TALKS[talkKey][lineI];
	const who = line.who === "narrator" ? null : HERO_BY_ID[line.who] ?? HAZARD_BY_ID[line.who] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex flex-col justify-end bg-black/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-t-3xl bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-soft ring-1 ring-line",
			children: [
				who ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: who.portrait,
						alt: "",
						className: "size-10 rounded-full object-cover ring-2 ring-accent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-tight",
						children: who.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted",
						children: who.role
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-[11px] uppercase tracking-[0.16em] text-accent",
					children: "Narrador"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base leading-relaxed text-fg",
					children: line.text
				}),
				line.choices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-2",
					children: line.choices.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press min-h-12 rounded-xl bg-elevated px-3 text-left text-sm ring-1 ring-line",
						onClick: () => advance(i),
						children: c.label
					}, c.label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "press mt-3 h-12 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg",
					onClick: () => advance(),
					children: "Seguir"
				})
			]
		})
	});
}
function Actor({ src, steps, alt, x, face, walk, punch, atk = "punch", hit, fly, down, explode, cry, headless, shot, slashed, y = 0, rot = 0, height, bottom, z }) {
	const [fi, setFi] = (0, import_react.useState)(0);
	const cycling = Boolean(walk && steps && steps.length > 0 && !punch && !fly && !down && !explode);
	(0, import_react.useEffect)(() => {
		if (!cycling || !steps) {
			setFi(0);
			return;
		}
		const id = window.setInterval(() => setFi((n) => (n + 1) % steps.length), 115);
		return () => window.clearInterval(id);
	}, [cycling, steps]);
	const img = cycling && steps ? steps[fi] : src;
	const cls = `actor ${explode ? "actor-explode" : fly || down ? "" : punch ? punch ? atk === "slash" ? "actor-slash" : atk === "aim" ? "actor-aim" : "actor-punch" : "" : hit ? "actor-hit" : cycling ? "" : cry ? "actor-cry" : "actor-idle"} ${down ? "actor-down" : ""} ${fly ? "actor-fly" : ""} ${headless ? "actor-headless" : ""} ${shot ? "actor-shot" : ""} ${slashed ? "actor-slashed" : ""} object-contain`;
	const style = {
		left: `${x}vw`,
		height,
		bottom: `calc(${bottom} + ${y}vh)`,
		zIndex: z,
		["--fx"]: String(-face),
		transform: fly || down ? `translateX(-50%) scaleX(var(--fx)) rotate(${rot}deg)` : void 0,
		filter: down ? "saturate(0.7) contrast(1.1)" : void 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: img,
		alt: alt ?? "",
		draggable: false,
		className: cls,
		style
	});
}
function Pad({ dir }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "button",
		"aria-label": dir === "left" ? "Izquierda" : "Derecha",
		className: "pad pointer-events-auto grid size-[4.5rem] place-items-center rounded-full border border-white/30 bg-black/55 text-paper",
		onPointerDown: (e) => downPad(e, dir),
		onPointerUp: () => setPad(dir, false),
		onPointerCancel: () => setPad(dir, false),
		onContextMenu: (e) => e.preventDefault(),
		onTouchStart: (e) => e.preventDefault(),
		children: dir === "left" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-9" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-9" })
	});
}
function downPad(e, dir) {
	e.preventDefault();
	e.stopPropagation();
	e.currentTarget.setPointerCapture?.(e.pointerId);
	setPad(dir, true);
}
function Play() {
	const phase = useGame((s) => s.phase);
	const hero = useGame((s) => s.hero) ?? "rafa";
	const x = useGame((s) => s.x);
	const facing = useGame((s) => s.facing);
	const recruited = useGame((s) => s.recruited);
	const items = useGame((s) => s.items);
	const coins = useGame((s) => s.coins);
	const fire = useGame((s) => s.fire);
	const chapter = useGame((s) => s.chapter);
	const hazards = useGame((s) => s.hazards);
	const npcX = useGame((s) => s.npcX);
	const attacking = useGame((s) => s.attacking);
	const blood = useGame((s) => s.blood);
	const books = useGame((s) => s.books);
	const shots = useGame((s) => s.shots);
	const impacts = useGame((s) => s.impacts);
	const gibs = useGame((s) => s.gibs);
	useGame((s) => s.weapon);
	const shake = useGame((s) => s.shake);
	const toast = useGame((s) => s.toast);
	const setX = useGame((s) => s.setX);
	const setFacing = useGame((s) => s.setFacing);
	const startTalk = useGame((s) => s.startTalk);
	const grabCoin = useGame((s) => s.grabCoin);
	const grabWeapon = useGame((s) => s.grabWeapon);
	useGame((s) => s.cycleWeapon);
	const tickHazards = useGame((s) => s.tickHazards);
	const punch = useGame((s) => s.punch);
	const [walking, setWalking] = (0, import_react.useState)(false);
	const xRef = (0, import_react.useRef)(x);
	const faceRef = (0, import_react.useRef)(facing);
	const walkRef = (0, import_react.useRef)(false);
	xRef.current = x;
	faceRef.current = facing;
	const ch = chapterOf(chapter);
	const width = worldWidth(chapter);
	const zone = zoneAt(chapter, x);
	const cam = Math.max(0, Math.min(width - 100, x - 32));
	const nearNpc = ch.npcs.find((n) => {
		if (n.id === hero || n.x > 900) return false;
		const px = npcX[n.id] ?? n.x;
		if (px > 900 || Math.abs(x - px) >= 14) return false;
		return chapter === 2 && n.id === "richard" || chapter === 2 && n.id === "hector" || chapter === 3 && n.id === "juan" || chapter === 3 && n.id === "rafa" || !recruited.includes(n.id);
	});
	const nearItem = ch.pickups.find((p) => !items.includes(p.id) && Math.abs(x - p.x) < 10);
	const nearGrill = !!(ch.grillX && Math.abs(x - ch.grillX) < 14);
	const nearExam = !!(ch.examX && items.includes("apuntes") && items.includes("cafe") && Math.abs(x - ch.examX) < 14);
	const nearHazard = HAZARDS.find((h) => {
		const st = hazards[h.id];
		return st.x < 900 && !st.fly && !st.down && !st.gone && !st.exploding && !st.calm && Math.abs(x - st.x) < 16;
	});
	const chasing = HAZARDS.filter((h) => h.id && hazards[h.id].chasing && !hazards[h.id].fly && !hazards[h.id].down && !hazards[h.id].gone && hazards[h.id].x < 900);
	(0, import_react.useEffect)(() => bindKeys(), []);
	(0, import_react.useEffect)(() => {
		window.__controlsTest = {
			getX: () => xRef.current,
			getYaw: () => xRef.current,
			getSpeed: () => pads.left || pads.right || Math.abs(axis()) > 0 ? SPEED : 0,
			setKeys
		};
		return () => {
			delete window.__controlsTest;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let raf = 0;
		let last = performance.now();
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			const s = useGame.getState();
			if (s.phase === "play") {
				const maxX = worldWidth(s.chapter) - 8;
				let dir = axis();
				if (pads.left) dir -= 1;
				if (pads.right) dir += 1;
				dir = Math.max(-1, Math.min(1, dir));
				const moving = dir !== 0;
				if (moving !== walkRef.current) {
					walkRef.current = moving;
					setWalking(moving);
				}
				if (dir) {
					const nx = Math.max(6, Math.min(maxX, xRef.current + dir * SPEED * dt));
					xRef.current = nx;
					faceRef.current = dir < 0 ? -1 : 1;
					setX(nx);
					setFacing(faceRef.current);
				}
				if (wantsPunch()) punch();
				tickHazards(dt, xRef.current);
				for (const p of chapterOf(s.chapter).pickups) {
					if (p.kind === "coin" && !s.items.includes(p.id) && Math.abs(xRef.current - p.x) < 6) grabCoin(p.id);
					if (p.kind === "weapon" && (p.weapon === "knife" || p.weapon === "pistol") && !s.items.includes(p.id) && Math.abs(xRef.current - p.x) < 8) grabWeapon(p.weapon);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		grabCoin,
		grabWeapon,
		punch,
		setFacing,
		setX,
		tickHazards
	]);
	function interact() {
		if (chapter === 3 && nearHazard?.id === "pablito") startTalk("pablito3");
		else if (nearHazard && chapter !== 3) startTalk(nearHazard.id);
		else if (nearExam) startTalk("examen");
		else if (nearNpc && chapter === 2 && nearNpc.id === "richard") startTalk("richard2");
		else if (nearNpc && chapter === 3 && nearNpc.id === "juan") startTalk("juan3");
		else if (nearNpc) startTalk(nearNpc.id);
		else if (nearItem && nearItem.kind === "weapon" && nearItem.weapon) grabWeapon(nearItem.weapon);
		else if (nearItem && nearItem.kind === "item" && nearItem.talk) startTalk(nearItem.talk);
		else if (nearGrill) startTalk("grill");
	}
	const followers = recruited.filter((id) => !(id === hero || chapter === 2 && (id === "richard" || id === "hector") || chapter === 3 && id === "juan"));
	const canAct = !!(nearHazard || nearNpc || nearItem && (nearItem.kind === "item" || nearItem.kind === "weapon") || nearGrill || nearExam);
	const showNpc = (id, px) => {
		if (id === hero || px > 900) return false;
		if (chapter === 2 && (id === "richard" || id === "hector") || chapter === 3 && (id === "juan" || id === "rafa")) return true;
		return !recruited.includes(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `game-root relative h-dvh overflow-hidden bg-bg ${ch.grade} ${performance.now() - shake < 380 ? "game-shake" : ""}`,
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0 h-full will-change-transform",
				style: {
					width: `${width}vw`,
					transform: `translateX(${-cam}vw)`
				},
				children: [
					ch.zones.map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-0 h-full bg-cover bg-center",
						style: {
							left: `${i * 100}vw`,
							width: "101.2vw",
							backgroundImage: `url(${z.bg})`
						}
					}, z.id)),
					ch.props.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.src,
						alt: "",
						draggable: false,
						className: "absolute bottom-[14%] object-contain",
						style: {
							left: `${p.x}vw`,
							height: `${p.h}vh`,
							transform: `translateX(-50%) scaleX(${p.flip ? -1 : 1})`,
							zIndex: 1
						}
					}, i)),
					ch.pickups.filter((p) => !items.includes(p.id)).map((p) => p.kind === "coin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute bottom-[16%] z-[2] grid size-7 -translate-x-1/2 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-fg",
						style: { left: `${p.x}vw` },
						children: "Gs"
					}, p.id) : p.kind === "weapon" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.weapon === "pistol" ? "/sprites/pistol.png" : "/sprites/knife.png",
						alt: p.weapon === "pistol" ? "Pistola" : "Cuchillo",
						draggable: false,
						className: "weapon-drop",
						style: {
							left: `${p.x}vw`,
							height: 28,
							width: p.weapon === "pistol" ? 52 : 72
						}
					}, p.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute bottom-[16%] z-[2] -translate-x-1/2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white",
						style: { left: `${p.x}vw` },
						children: p.id
					}, p.id)),
					ch.npcs.filter((n) => showNpc(n.id, npcX[n.id] ?? n.x)).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Actor, {
						src: HERO_BY_ID[n.id].sprite,
						steps: HERO_BY_ID[n.id].steps,
						alt: HERO_BY_ID[n.id].name,
						x: npcX[n.id] ?? n.x,
						face: x >= (npcX[n.id] ?? n.x) ? 1 : -1,
						height: "28vh",
						bottom: "13%",
						z: 2
					}, n.id)),
					blood.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "blood",
						style: {
							left: `${b.x}vw`,
							bottom: `${b.y}%`,
							width: b.w,
							height: b.h,
							transform: `translateX(-50%) rotate(${b.rot}deg)`
						}
					}, b.id)),
					HAZARDS.filter((h) => hazards[h.id].x < 900 && !hazards[h.id].gone).map((h) => {
						const st = hazards[h.id];
						if (st.torn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: h.sprite,
							alt: "",
							draggable: false,
							className: "torn-half torn-top object-contain",
							style: {
								left: `${st.x - 3}vw`,
								bottom: `calc(10% + ${st.y + 6}vh)`,
								height: "18vh",
								zIndex: 6,
								transform: `translateX(-50%) rotate(${st.rot * .45 - 18}deg)`
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: h.sprite,
							alt: "",
							draggable: false,
							className: "torn-half torn-bot object-contain",
							style: {
								left: `${st.x + 4}vw`,
								bottom: `calc(10% + ${Math.max(0, st.y - 2)}vh)`,
								height: "16vh",
								zIndex: 6,
								transform: `translateX(-50%) rotate(${st.rot * .7 + 22}deg)`
							}
						})] }, h.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Actor, {
							src: h.sprite,
							steps: h.steps,
							alt: h.name,
							x: st.x,
							face: st.x < x ? 1 : -1,
							walk: st.chasing && !st.fly && !st.down && !st.exploding,
							explode: st.exploding,
							cry: st.cry,
							headless: st.headless,
							hit: st.fly,
							fly: st.fly,
							down: st.down,
							shot: st.hurt === "gun",
							slashed: st.hurt === "slash",
							y: st.y,
							rot: st.rot,
							height: "30vh",
							bottom: "10%",
							z: 4
						}, h.id);
					}),
					books.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/sprites/book.png",
						alt: "",
						draggable: false,
						className: "book-shot",
						style: {
							left: `${b.x}vw`,
							bottom: `${b.y}%`,
							transform: `translateX(-50%) rotate(${b.rot}deg)`
						}
					}, b.id)),
					shots.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/sprites/bullet.png",
						alt: "",
						draggable: false,
						className: "bullet-shot",
						style: {
							left: `${b.x}vw`,
							bottom: `${b.y}%`,
							transform: `translateX(-50%) scaleX(${b.face})`
						}
					}, b.id)),
					gibs.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: g.src,
						alt: "",
						draggable: false,
						className: "gib",
						style: {
							left: `${g.x}vw`,
							bottom: `calc(10% + ${g.y}vh)`,
							transform: `translateX(-50%) rotate(${g.rot}deg)`
						}
					}, g.id)),
					impacts.map((fx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: fx.kind === "slash" ? "/sprites/slash.png" : fx.kind === "muzzle" ? "/sprites/muzzle.png" : fx.kind === "boom" ? "/sprites/boom.png" : fx.kind === "tracer" ? "/sprites/tracer.png" : "/sprites/impact.png",
						alt: "",
						draggable: false,
						className: `fx-${fx.kind}`,
						style: {
							left: `${fx.x}vw`,
							bottom: `${fx.y}%`,
							["--wx"]: String(-facing)
						}
					}, fx.id)),
					followers.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Actor, {
						src: HERO_BY_ID[id].sprite,
						steps: HERO_BY_ID[id].steps,
						x: x - facing * (18 + i * 14),
						face: facing,
						walk: walking,
						height: "24vh",
						bottom: "12%",
						z: 3
					}, id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Actor, {
						src: HERO_BY_ID[hero].sprite,
						steps: HERO_BY_ID[hero].steps,
						alt: HERO_BY_ID[hero].name,
						x,
						face: facing,
						walk: walking && !attacking,
						punch: attacking,
						atk: "aim",
						height: "34vh",
						bottom: "8%",
						z: 5
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/sprites/pistol.png",
						alt: "",
						draggable: false,
						className: `held-weapon held-pistol ${attacking ? "held-fire" : ""}`,
						style: {
							left: `${x + facing * 3.4}vw`,
							bottom: "28%",
							zIndex: 6,
							height: 38,
							width: 54,
							["--wx"]: String(-facing),
							transform: `translateX(-50%) scaleX(${-facing})`
						}
					}),
					ch.grillX ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/sprites/fire.png",
						alt: "",
						draggable: false,
						className: "absolute bottom-[16%] z-[2] h-[16vh] -translate-x-1/2 object-contain",
						style: {
							left: `${ch.grillX}vw`,
							opacity: fire ? 1 : .45,
							filter: fire ? "none" : "grayscale(0.5)"
						}
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 left-0 z-[8] w-[36%]",
				style: { touchAction: "none" },
				onPointerDown: (e) => downPad(e, "left"),
				onPointerUp: () => setPad("left", false),
				onPointerCancel: () => setPad("left", false),
				onContextMenu: (e) => e.preventDefault(),
				onTouchStart: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 right-0 z-[8] w-[36%]",
				style: { touchAction: "none" },
				onPointerDown: (e) => downPad(e, "right"),
				onPointerUp: () => setPad("right", false),
				onPointerCancel: () => setPad("right", false),
				onContextMenu: (e) => e.preventDefault(),
				onTouchStart: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-black/70 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-red-400",
						children: [
							ch.title,
							" · ",
							zone.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mission-alert max-w-[22ch] font-display text-[15px] leading-tight",
						children: objective({
							recruited,
							items,
							hero,
							chapter,
							hazards
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-md bg-black/70 px-2 py-1 text-[11px] text-accent",
							children: [coins, " Gs"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex items-center rounded-md bg-black/70 px-1.5 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/sprites/pistol.png",
								alt: "",
								className: "h-5 w-7 object-contain"
							})
						}),
						TEAM.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: HERO_BY_ID[id].portrait,
							alt: "",
							draggable: false,
							className: recruited.includes(id) ? "size-8 rounded-full object-cover ring-2 ring-accent" : "size-8 rounded-full object-cover opacity-30 grayscale"
						}, id))
					]
				})]
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-alert pointer-events-none absolute left-1/2 top-20 z-20 w-max max-w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 px-4 py-2 text-center text-sm",
				children: toast
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute bottom-[28%] left-1/2 z-[9] -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-paper",
				children: chasing.length ? `¡${chasing.map((h) => h.name).join(" y ")} te persigue!` : nearExam ? "El examen está listo" : nearHazard ? `${nearHazard.name} está cerca` : nearNpc ? `${HERO_BY_ID[nearNpc.id].name} está cerca` : nearItem?.kind === "item" ? "Hay algo acá" : nearGrill ? "El quincho" : "Manténé ← o →"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-0 right-0 z-10 flex items-end justify-between px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, { dir: "left" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto mb-2 flex flex-col items-center gap-2",
						children: [canAct ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "press min-h-12 min-w-14 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-soft",
							onClick: interact,
							onPointerDown: (e) => e.stopPropagation(),
							children: nearExam ? "Rendir" : nearHazard || nearNpc ? "Hablar" : nearGrill ? "Asado" : "Agarrar"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "press grid size-16 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg shadow-soft",
							"aria-label": "Disparar",
							onPointerDown: (e) => {
								e.preventDefault();
								e.stopPropagation();
								pads.punch = true;
								punch();
							},
							onPointerUp: () => {
								pads.punch = false;
							},
							onPointerCancel: () => {
								pads.punch = false;
							},
							onContextMenu: (e) => e.preventDefault(),
							onTouchStart: (e) => e.preventDefault(),
							children: "Fuego"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, { dir: "right" })
				]
			}),
			phase === "talk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Talk, {}) : null
		]
	});
}
function Game() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const phase = useGame((s) => s.phase);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "relative block min-h-dvh w-full overflow-hidden bg-bg",
		"aria-label": "Jugar",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/art/splash.jpg",
			alt: "",
			className: "pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_22%]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Jugar"
		})]
	});
	if (phase === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {});
	if (phase === "select") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {});
	if (phase === "missions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Missions, {});
	if (phase === "cinema") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cinema, {});
	if (phase === "win") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Win, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { Home as component };
