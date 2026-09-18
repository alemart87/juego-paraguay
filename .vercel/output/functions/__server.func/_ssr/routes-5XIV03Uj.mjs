import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Settings, c as Pause, d as Gamepad2, f as Crosshair, h as ChevronLeft, i as Swords, l as MessageCircle, m as ChevronRight, n as Trophy, o as RotateCcw, p as CircleHelp, s as Play, t as X, u as Hand } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-5XIV03Uj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEAPON_NAME = {
	fist: "Puño",
	knife: "Cuchillo",
	pistol: "Pistola"
};
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
		steps: stepsOf("rafa"),
		reel: "/select/rafa.mp4",
		accent: "#d4a45a",
		perk: {
			label: "Equilibrado",
			speed: 1,
			hp: 100,
			ammo: 12
		}
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
		perk: {
			label: "Más rápido",
			speed: 1.12,
			hp: 90,
			ammo: 10
		}
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
		perk: {
			label: "Más balas",
			speed: .96,
			hp: 100,
			ammo: 18
		}
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
		perk: {
			label: "Más vida",
			speed: .94,
			hp: 130,
			ammo: 10
		}
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
		steps: stepsOf("masivo"),
		accent: "#e8c15a",
		speed: 34,
		hp: 3,
		sight: 24,
		leash: 60,
		alert: "¡SOS Pobro! ¡CORRÉ!",
		lost: "Masivo: fuera de acá.",
		killed: "¡Masivo revienta!",
		chaseLabel: "GYM"
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
		chaseLabel: "VENÍ"
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
		chaseLabel: "TESIS"
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
		chaseLabel: "¿ESCRIBE?"
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
		chaseLabel: "EN VIVO"
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
	cedula: [{
		who: "narrator",
		text: "La cédula de Richard, olvidada en un banco del patio."
	}, {
		who: "narrator",
		text: "Sin esto no entra a Clínicas.",
		choices: [{
			label: "Esto entra al aula.",
			item: "cedula"
		}, { label: "Después." }]
	}],
	foto: [{
		who: "narrator",
		text: "Una captura. Pablito en el muelle. Hora: ahora."
	}, {
		who: "narrator",
		text: "¿La guardamos como prueba?",
		choices: [{
			label: "Esto se lo muestro a Juan.",
			item: "foto"
		}, { label: "Después." }]
	}],
	fuerza: [
		{
			who: "hector",
			text: "Fuerza. Richard no rinde solo. Café no alcanza."
		},
		{
			who: "hector",
			text: "Yo lo banco. Vos conseguí la cédula y lleválo al aula."
		},
		{
			who: "hector",
			text: "Cuando esté listo, vamos. El MEC no espera.",
			choices: [{
				label: "Fuerza. Voy por la cédula.",
				item: "fuerza"
			}, { label: "Todavía no." }]
		}
	],
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
	],
	onichan: [
		{
			who: "onichan",
			text: "Hola bebé. Estoy en vivo. El chat quiere que te moleste."
		},
		{
			who: "onichan",
			text: "Capi tira slime. No es personal. Es contenido."
		},
		{
			who: "onichan",
			text: "Saludá al live o corré. Yo igual te sigo.",
			choices: [{
				label: "Fuera de acá, Onichan.",
				escape: true
			}, {
				label: "Capi se queda. Vos no.",
				escape: true
			}]
		}
	],
	juanGo: [
		{
			who: "juan",
			text: "Estoy re contra cansado. Pablito le escribió a mi chica. Hoy."
		},
		{
			who: "juan",
			text: "Cuatro pasos. Sin vueltas."
		},
		{
			who: "juan",
			text: "1. El chat en el pasillo. 2. La foto en el bosque. 3. Disparale a Pablito en el muelle. 4. Volvé.",
			choices: [{
				label: "Voy. Chat, foto, muelle, y vuelvo.",
				item: "aviso"
			}]
		}
	]
};
var CHAPTERS = {
	1: {
		chapter: 1,
		title: "Armar asado",
		grade: "warm",
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
		startX: 18,
		grillX: 548,
		parTime: 180,
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
				id: "despensa",
				name: "La despensa",
				bg: "/stages/m1-mercado.jpg"
			},
			{
				id: "calle",
				name: "La calle",
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
				x: 78
			},
			{
				id: "juan",
				x: 188
			},
			{
				id: "richard",
				x: 338
			},
			{
				id: "hector",
				x: 508
			}
		],
		pickups: [
			{
				id: "c1",
				kind: "coin",
				x: 36
			},
			{
				id: "k1",
				kind: "knife",
				x: 62,
				label: "Cuchillo"
			},
			{
				id: "hielo",
				kind: "item",
				x: 96,
				talk: "hielo",
				label: "Hielo"
			},
			{
				id: "c2",
				kind: "coin",
				x: 140
			},
			{
				id: "a1",
				kind: "ammo",
				x: 164,
				label: "Balas"
			},
			{
				id: "carne",
				kind: "item",
				x: 210,
				talk: "carne",
				label: "Carne"
			},
			{
				id: "c3",
				kind: "coin",
				x: 268
			},
			{
				id: "h1",
				kind: "heal",
				x: 290,
				label: "Tereré"
			},
			{
				id: "c4",
				kind: "coin",
				x: 310
			},
			{
				id: "terere",
				kind: "item",
				x: 368,
				talk: "terere",
				label: "Tereré"
			},
			{
				id: "a2",
				kind: "ammo",
				x: 398,
				label: "Balas"
			},
			{
				id: "c5",
				kind: "coin",
				x: 420
			},
			{
				id: "h2",
				kind: "heal",
				x: 440,
				label: "Tereré"
			},
			{
				id: "c6",
				kind: "coin",
				x: 470
			},
			{
				id: "carbon",
				kind: "item",
				x: 498,
				talk: "carbon",
				label: "Carbón"
			},
			{
				id: "c7",
				kind: "coin",
				x: 530
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
				x: 86,
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
			},
			{
				src: "/sprites/lamp.png",
				x: 390,
				h: 24
			},
			{
				src: "/sprites/palm.png",
				x: 450,
				h: 30,
				flip: true
			},
			{
				src: "/sprites/lamp.png",
				x: 520,
				h: 24
			}
		],
		hazardHome: {
			onichan: 46,
			marcos: 118,
			gallaguer: 248,
			pablito: 370,
			masivo: 460
		}
	},
	2: {
		chapter: 2,
		title: "El examen",
		grade: "day",
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
		startX: 18,
		examX: 548,
		parTime: 150,
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
				id: "pasillo",
				name: "Pasillo UPAP",
				bg: "/stages/m2-campus.jpg"
			},
			{
				id: "patio",
				name: "El patio",
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
				x: 72
			},
			{
				id: "hector",
				x: 268
			},
			{
				id: "rafa",
				x: 410
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
				x: 40
			},
			{
				id: "k1",
				kind: "knife",
				x: 58,
				label: "Cuchillo"
			},
			{
				id: "apuntes",
				kind: "item",
				x: 128,
				talk: "apuntes",
				label: "Apuntes"
			},
			{
				id: "c2",
				kind: "coin",
				x: 168
			},
			{
				id: "a1",
				kind: "ammo",
				x: 186,
				label: "Balas"
			},
			{
				id: "cafe",
				kind: "item",
				x: 228,
				talk: "cafe",
				label: "Café"
			},
			{
				id: "h1",
				kind: "heal",
				x: 292,
				label: "Tereré"
			},
			{
				id: "c3",
				kind: "coin",
				x: 310
			},
			{
				id: "c4",
				kind: "coin",
				x: 360
			},
			{
				id: "a2",
				kind: "ammo",
				x: 386,
				label: "Balas"
			},
			{
				id: "cedula",
				kind: "item",
				x: 438,
				talk: "cedula",
				label: "Cédula"
			},
			{
				id: "h2",
				kind: "heal",
				x: 462,
				label: "Tereré"
			},
			{
				id: "c5",
				kind: "coin",
				x: 490
			},
			{
				id: "c6",
				kind: "coin",
				x: 520
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
				x: 230,
				h: 6
			},
			{
				src: "/sprites/lamp.png",
				x: 340,
				h: 24
			},
			{
				src: "/sprites/palm.png",
				x: 430,
				h: 28,
				flip: true
			},
			{
				src: "/sprites/lamp.png",
				x: 520,
				h: 24
			}
		],
		hazardHome: {
			onichan: 46,
			marcos: 108,
			gallaguer: 198,
			pablito: 360,
			masivo: 470
		}
	},
	3: {
		chapter: 3,
		title: "Juan",
		grade: "night",
		intro: {
			src: "/cinema/juan.mp4",
			title: "Salvá a Juan",
			line: "Hablá con Juan. Agarrá el chat. Disparale a Pablito. Volvé."
		},
		outro: {
			src: "/endings/juan.mp4",
			title: "Juan no es cornudo",
			line: "El equipo queda. Pablito, fuera de acá."
		},
		startX: 18,
		parTime: 210,
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
				id: "atajo",
				name: "El atajo",
				bg: "/stages/m3-bosque.jpg"
			},
			{
				id: "costa",
				name: "La costa",
				bg: "/stages/m3-noche.jpg"
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
				x: 70
			},
			{
				id: "rafa",
				x: 520
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
				id: "k1",
				kind: "knife",
				x: 96,
				label: "Cuchillo"
			},
			{
				id: "chat",
				kind: "item",
				x: 148,
				talk: "chat",
				label: "Chat"
			},
			{
				id: "a1",
				kind: "ammo",
				x: 172,
				label: "Balas"
			},
			{
				id: "c2",
				kind: "coin",
				x: 190
			},
			{
				id: "c3",
				kind: "coin",
				x: 250
			},
			{
				id: "h1",
				kind: "heal",
				x: 280,
				label: "Tereré"
			},
			{
				id: "foto",
				kind: "item",
				x: 318,
				talk: "foto",
				label: "Foto"
			},
			{
				id: "a2",
				kind: "ammo",
				x: 350,
				label: "Balas"
			},
			{
				id: "c4",
				kind: "coin",
				x: 380
			},
			{
				id: "h2",
				kind: "heal",
				x: 412,
				label: "Tereré"
			},
			{
				id: "c5",
				kind: "coin",
				x: 440
			},
			{
				id: "a3",
				kind: "ammo",
				x: 468,
				label: "Balas"
			},
			{
				id: "c6",
				kind: "coin",
				x: 500
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
				x: 320,
				h: 26
			},
			{
				src: "/sprites/palm.png",
				x: 410,
				h: 30
			},
			{
				src: "/sprites/lamp.png",
				x: 500,
				h: 26
			},
			{
				src: "/sprites/palm.png",
				x: 548,
				h: 32,
				flip: true
			}
		],
		hazardHome: {
			onichan: 46,
			marcos: 112,
			gallaguer: 230,
			masivo: 360,
			pablito: 490
		}
	}
};
var MISSIONS = [
	{
		ch: 1,
		title: "Armar el asado",
		blurb: "Reuní a Rafa, Juan, Richard y Héctor. Juntá hielo, carne, tereré y carbón. Encendé el fuego en el quincho.",
		img: "/stages/m1-quincho.jpg"
	},
	{
		ch: 2,
		title: "El examen de Richard",
		blurb: "Apuntes, café, la fuerza de Héctor y la cédula. Después, rendí el examen en el aula.",
		img: "/stages/m2-aula.jpg"
	},
	{
		ch: 3,
		title: "Salvá a Juan",
		blurb: "Hablá con Juan. Conseguí el chat y la foto. Disparale a Pablito en el muelle y volvé.",
		img: "/stages/m3-muelle.jpg"
	}
];
var ITEM_IMG = {
	hielo: "/sprites/terere.png",
	carne: "/sprites/grill.png",
	carbon: "/sprites/fire.png",
	terere: "/sprites/terere.png",
	apuntes: "/sprites/book.png",
	cafe: "/sprites/terere.png",
	cedula: "/sprites/book.png",
	chat: "/sprites/book.png",
	foto: "/sprites/book.png"
};
function pickupSprite(p) {
	if (p.kind === "coin") return "/sprites/coin.png";
	if (p.kind === "ammo") return "/sprites/bullet.png";
	if (p.kind === "heal") return "/sprites/terere.png";
	if (p.kind === "knife") return "/sprites/knife.png";
	return ITEM_IMG[p.id] ?? "/sprites/book.png";
}
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
function checksFor(s) {
	if (s.chapter === 1) return [
		{
			t: "Equipo",
			ok: TEAM.every((id) => id === s.hero || s.recruited.includes(id))
		},
		{
			t: "Hielo",
			ok: s.items.includes("hielo")
		},
		{
			t: "Carne",
			ok: s.items.includes("carne")
		},
		{
			t: "Tereré",
			ok: s.items.includes("terere")
		},
		{
			t: "Carbón",
			ok: s.items.includes("carbon")
		},
		{
			t: "Fuego",
			ok: s.fire
		}
	];
	if (s.chapter === 2) return [
		{
			t: "Apuntes",
			ok: s.items.includes("apuntes")
		},
		{
			t: "Café",
			ok: s.items.includes("cafe")
		},
		{
			t: "Héctor",
			ok: s.items.includes("fuerza")
		},
		{
			t: "Cédula",
			ok: s.items.includes("cedula")
		},
		{
			t: "Examen",
			ok: s.examScore > 0
		}
	];
	return [
		{
			t: "Juan",
			ok: s.items.includes("aviso")
		},
		{
			t: "Chat",
			ok: s.items.includes("chat")
		},
		{
			t: "Foto",
			ok: s.items.includes("foto")
		},
		{
			t: "Pablito",
			ok: s.items.includes("echar")
		},
		{
			t: "Volver",
			ok: s.items.includes("honor")
		}
	];
}
/** Current objective text plus where it is (for the map marker). */
function objective(s) {
	const ch = CHAPTERS[s.chapter];
	const npcX = (id) => ch.npcs.find((n) => n.id === id)?.x ?? null;
	const itemX = (id) => ch.pickups.find((p) => p.id === id)?.x ?? null;
	if (s.chapter === 1) {
		const missing = TEAM.filter((id) => id !== s.hero);
		for (const id of missing) if (!s.recruited.includes(id)) {
			if (id === "rafa") return {
				text: "1/6 · Rafa en la costanera",
				x: npcX("rafa")
			};
			if (id === "juan") return {
				text: "1/6 · Juan en el mercado",
				x: npcX("juan")
			};
			if (id === "richard") return {
				text: "1/6 · Richard en el barrio",
				x: npcX("richard")
			};
			return {
				text: "1/6 · Héctor en la calle",
				x: npcX("hector")
			};
		}
		if (!s.items.includes("hielo")) return {
			text: "2/6 · hielo en la costanera",
			x: itemX("hielo")
		};
		if (!s.items.includes("carne")) return {
			text: "3/6 · carne en el mercado",
			x: itemX("carne")
		};
		if (!s.items.includes("terere")) return {
			text: "4/6 · tereré en la despensa",
			x: itemX("terere")
		};
		if (!s.items.includes("carbon")) return {
			text: "5/6 · carbón en la calle",
			x: itemX("carbon")
		};
		return {
			text: "6/6 · encendé el fuego en el quincho",
			x: ch.grillX ?? null
		};
	}
	if (s.chapter === 2) {
		if (!s.items.includes("apuntes")) return {
			text: "1/5 · apuntes en la biblioteca",
			x: itemX("apuntes")
		};
		if (!s.items.includes("cafe")) return {
			text: "2/5 · café en la cancha",
			x: itemX("cafe")
		};
		if (!s.items.includes("fuerza")) return {
			text: "3/5 · Héctor en el pasillo",
			x: npcX("hector")
		};
		if (!s.items.includes("cedula")) return {
			text: "4/5 · cédula en el patio",
			x: itemX("cedula")
		};
		return {
			text: "5/5 · rendí el examen en el aula",
			x: ch.examX ?? null
		};
	}
	if (!s.items.includes("aviso")) return {
		text: "1/5 · hablá con Juan en la costanera",
		x: npcX("juan")
	};
	if (!s.items.includes("chat")) return {
		text: "2/5 · el chat está en el pasillo",
		x: itemX("chat")
	};
	if (!s.items.includes("foto")) return {
		text: "3/5 · la foto está en el bosque",
		x: itemX("foto")
	};
	if (!s.items.includes("echar")) return {
		text: "4/5 · disparale a Pablito en el muelle",
		x: ch.hazardHome.pablito
	};
	return {
		text: "5/5 · volvé con Juan",
		x: npcX("juan")
	};
}
var held = /* @__PURE__ */ new Set();
var injected = null;
var pressed = /* @__PURE__ */ new Set();
var gamepadSeen = false;
var padPrev = [];
var pads = {
	left: false,
	right: false,
	attack: false
};
/** Drag-to-move on the left half of the screen: -1 / 0 / 1. */
var swipe = { dir: 0 };
var GAME_KEYS = /* @__PURE__ */ new Set([
	"Space",
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"KeyA",
	"KeyD",
	"KeyW",
	"KeyS",
	"KeyJ",
	"KeyK",
	"KeyX",
	"KeyF",
	"KeyE",
	"KeyQ",
	"Tab",
	"Enter"
]);
var KEY_ACTION = {
	KeyW: "jump",
	ArrowUp: "jump",
	Space: "jump",
	KeyJ: "attack",
	KeyK: "attack",
	KeyX: "attack",
	KeyF: "attack",
	ControlLeft: "attack",
	ControlRight: "attack",
	KeyE: "interact",
	Enter: "interact",
	KeyQ: "swap",
	Tab: "swap",
	Escape: "pause",
	KeyP: "pause"
};
function bindKeys() {
	const down = (e) => {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
		if (GAME_KEYS.has(e.code)) e.preventDefault();
		if (e.repeat) return;
		held.add(e.code);
		const a = KEY_ACTION[e.code];
		if (a) pressed.add(a);
	};
	const up = (e) => {
		held.delete(e.code);
	};
	const clear = () => {
		held.clear();
		pads.left = pads.right = pads.attack = false;
		swipe.dir = 0;
	};
	window.addEventListener("keydown", down, { passive: false });
	window.addEventListener("keyup", up);
	window.addEventListener("blur", clear);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clear();
	});
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
/** Used by the automated controls self-test. */
function setKeys(codes) {
	injected = codes.length ? codes : null;
}
function press(a) {
	pressed.add(a);
}
function setPad(dir, on) {
	pads[dir] = on;
	if (on) pads[dir === "left" ? "right" : "left"] = false;
}
function hasGamepad() {
	return gamepadSeen;
}
function readGamepad(out) {
	if (typeof navigator === "undefined" || !navigator.getGamepads) return;
	let gp = null;
	try {
		for (const g of navigator.getGamepads()) if (g) gp = g;
	} catch {
		return;
	}
	if (!gp) return;
	gamepadSeen = true;
	const ax = gp.axes[0] ?? 0;
	if (Math.abs(ax) > .25) out.moveX += ax;
	const b = (i) => !!gp.buttons[i]?.pressed;
	if (b(14)) out.moveX -= 1;
	if (b(15)) out.moveX += 1;
	const edge = (i, a) => {
		const now = b(i);
		if (now && !padPrev[i]) pressed.add(a);
		padPrev[i] = now;
	};
	edge(0, "jump");
	edge(2, "attack");
	edge(7, "attack");
	edge(1, "interact");
	edge(3, "interact");
	edge(4, "swap");
	edge(5, "swap");
	edge(9, "pause");
	if (b(2) || b(7)) out.attackHeld = true;
}
/** Returns which actions were pressed this frame and clears them. */
function pollInput() {
	const raw = {
		moveX: axis(),
		attackHeld: false
	};
	if (pads.left) raw.moveX -= 1;
	if (pads.right) raw.moveX += 1;
	raw.moveX += swipe.dir;
	readGamepad(raw);
	const attackHeld = raw.attackHeld || pads.attack || isDown("KeyJ") || isDown("KeyK") || isDown("KeyX") || isDown("KeyF") || isDown("ControlLeft");
	const out = {
		moveX: Math.max(-1, Math.min(1, raw.moveX)),
		jump: pressed.has("jump"),
		attack: pressed.has("attack"),
		attackHeld,
		interact: pressed.has("interact"),
		swap: pressed.has("swap"),
		pause: pressed.has("pause")
	};
	pressed.clear();
	return out;
}
/** Drop any queued edge actions (used when a menu opens). */
function flushInput() {
	pressed.clear();
}
function isTouchDevice() {
	if (typeof window === "undefined") return false;
	return window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
}
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var FX_SPRITES = [
	"/sprites/pistol.png",
	"/sprites/knife.png",
	"/sprites/bullet.png",
	"/sprites/muzzle.png",
	"/sprites/tracer.png",
	"/sprites/impact.png",
	"/sprites/boom.png",
	"/sprites/slash.png",
	"/sprites/gib1.png",
	"/sprites/gib2.png",
	"/sprites/spray.png",
	"/sprites/slime.png",
	"/sprites/capi.png",
	"/sprites/book.png",
	"/sprites/coin.png",
	"/sprites/terere.png",
	"/sprites/fire.png"
];
function maxHeightFor(src) {
	if (src.startsWith("/stages/")) return 1440;
	if (src.includes("/sprites/walk/") || /\/sprites\/(rafa|juan|richard|hector|masivo|pablito|marcos|gallaguer|onichan)\.png$/.test(src)) return 720;
	return 360;
}
function shrink(img, maxH) {
	if (img.naturalHeight <= maxH || typeof document === "undefined") return {
		img,
		w: img.naturalWidth,
		h: img.naturalHeight
	};
	const s = maxH / img.naturalHeight;
	const w = Math.max(1, Math.round(img.naturalWidth * s));
	const h = maxH;
	const c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	const g = c.getContext("2d");
	if (!g) return {
		img,
		w: img.naturalWidth,
		h: img.naturalHeight
	};
	g.imageSmoothingEnabled = true;
	g.imageSmoothingQuality = "high";
	g.drawImage(img, 0, 0, w, h);
	return {
		img: c,
		w,
		h
	};
}
function loadSprite(src) {
	const hit = cache.get(src);
	if (hit) return Promise.resolve(hit);
	const inflight = pending.get(src);
	if (inflight) return inflight;
	const p = new Promise((resolve) => {
		if (typeof Image === "undefined") return resolve(null);
		const img = new Image();
		img.decoding = "async";
		img.onload = () => {
			const sp = shrink(img, maxHeightFor(src));
			cache.set(src, sp);
			pending.delete(src);
			resolve(sp);
		};
		img.onerror = () => {
			pending.delete(src);
			resolve(null);
		};
		img.src = src;
	});
	pending.set(src, p);
	return p;
}
function getSprite(src) {
	return cache.get(src) ?? null;
}
function chapterAssets(ch) {
	const set = /* @__PURE__ */ new Set();
	for (const z of ch.zones) set.add(z.bg);
	for (const p of ch.props) set.add(p.src);
	for (const p of ch.pickups) set.add(pickupSprite(p));
	for (const h of HEROES) {
		set.add(h.sprite);
		h.steps.forEach((s) => set.add(s));
	}
	for (const h of HAZARDS) {
		set.add(h.sprite);
		h.steps.forEach((s) => set.add(s));
	}
	FX_SPRITES.forEach((s) => set.add(s));
	return [...set];
}
/**
* Preload a chapter. `onProgress` gets 0..1. Resolves when every image has
* either loaded or failed (a missing sprite never blocks play).
*/
async function preloadChapter(n, onProgress) {
	const list = chapterAssets(CHAPTERS[n]);
	let done = 0;
	onProgress?.(0);
	await Promise.all(list.map((src) => loadSprite(src).then(() => {
		done++;
		onProgress?.(done / list.length);
	})));
}
function isChapterLoaded(n) {
	return chapterAssets(CHAPTERS[n]).every((s) => cache.has(s));
}
var DEFAULT_SETTINGS = {
	difficulty: "normal",
	sound: true,
	volume: .8,
	vibrate: true,
	gore: true,
	shake: true,
	quality: "auto",
	leftHanded: false,
	showFps: false,
	touchControls: "auto"
};
var emptyRecord = () => ({
	done: false,
	bestTime: null,
	bestScore: 0,
	plays: 0
});
var DEFAULT_SAVE = {
	version: 1,
	hero: null,
	missions: {
		1: emptyRecord(),
		2: emptyRecord(),
		3: emptyRecord()
	},
	totalCoins: 0,
	totalKills: 0
};
var SETTINGS_KEY = "upap.settings.v1";
var SAVE_KEY = "upap.save.v1";
function read(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return {
			...fallback,
			...parsed
		};
	} catch {
		return fallback;
	}
}
function write(key, value) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function loadSettings() {
	const s = read(SETTINGS_KEY, DEFAULT_SETTINGS);
	s.volume = Math.max(0, Math.min(1, Number(s.volume) || 0));
	return s;
}
function saveSettings(s) {
	write(SETTINGS_KEY, s);
}
function loadSave() {
	const s = read(SAVE_KEY, DEFAULT_SAVE);
	s.missions = {
		1: {
			...emptyRecord(),
			...s.missions?.[1] ?? {}
		},
		2: {
			...emptyRecord(),
			...s.missions?.[2] ?? {}
		},
		3: {
			...emptyRecord(),
			...s.missions?.[3] ?? {}
		}
	};
	return s;
}
function saveSave(s) {
	write(SAVE_KEY, s);
}
var TUNING = {
	facil: {
		enemySpeed: .82,
		damage: .6,
		projectileRate: .7,
		startAmmo: 20,
		ammoPickup: 10,
		respawnSeconds: 14,
		enemyHp: .7,
		label: "Fácil"
	},
	normal: {
		enemySpeed: 1,
		damage: 1,
		projectileRate: 1,
		startAmmo: 12,
		ammoPickup: 8,
		respawnSeconds: 10,
		enemyHp: 1,
		label: "Normal"
	},
	dificil: {
		enemySpeed: 1.18,
		damage: 1.5,
		projectileRate: 1.35,
		startAmmo: 8,
		ammoPickup: 6,
		respawnSeconds: 7,
		enemyHp: 1.5,
		label: "Difícil"
	}
};
function formatTime(sec) {
	return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
}
var BASE_SPEED = 60;
var GROUND_LINE = 8;
function enemyAt(id, x, hpMul) {
	const def = HAZARD_BY_ID[id];
	const hp = Math.max(1, Math.round(def.hp * hpMul));
	return {
		id,
		x,
		y: 0,
		vx: 0,
		vy: 0,
		rot: 0,
		spin: 0,
		hp,
		maxHp: hp,
		fly: false,
		down: false,
		downAt: 0,
		chasing: false,
		caught: false,
		hit: -10,
		exploding: false,
		explodeAt: 0,
		gone: false,
		respawnAt: 0,
		headless: false,
		calm: false,
		cry: false,
		cryUntil: 0,
		lastThrow: -10,
		hurt: "",
		torn: false,
		flash: 0
	};
}
function createWorld(chapter, hero, difficulty) {
	const ch = chapterOf(chapter);
	const tune = TUNING[difficulty];
	const perk = HERO_BY_ID[hero].perk;
	const home = ch.hazardHome;
	const enemies = {
		masivo: enemyAt("masivo", home.masivo, tune.enemyHp),
		pablito: enemyAt("pablito", home.pablito, tune.enemyHp),
		marcos: enemyAt("marcos", home.marcos, tune.enemyHp),
		gallaguer: enemyAt("gallaguer", home.gallaguer, tune.enemyHp),
		onichan: enemyAt("onichan", home.onichan, tune.enemyHp)
	};
	const maxHp = perk.hp;
	return {
		chapter,
		hero,
		difficulty,
		tune,
		width: worldWidth(chapter),
		t: 0,
		timer: 0,
		player: {
			x: ch.startX,
			y: 0,
			vx: 0,
			vy: 0,
			facing: 1,
			hp: maxHp,
			maxHp,
			speed: BASE_SPEED * perk.speed,
			invUntil: 0,
			slowUntil: 0,
			attackUntil: 0,
			attackKind: "pistol",
			weapon: "pistol",
			ammo: Math.round(tune.startAmmo * (perk.ammo / 12)),
			hasKnife: false,
			grounded: true,
			jumpBuffer: 0,
			coyote: 0,
			lastAttack: -10,
			hurtAt: -10,
			walking: false
		},
		enemies,
		npcX: npcHome(chapter),
		recruited: chapter === 1 ? [hero] : [
			"rafa",
			"juan",
			"richard",
			"hector"
		],
		items: [],
		coins: 0,
		fire: chapter !== 1,
		examScore: 0,
		blood: [],
		gibs: [],
		shots: [],
		books: [],
		slimes: [],
		fx: [],
		shakeUntil: 0,
		shakePower: 0,
		slimedUntil: 0,
		camX: Math.max(0, ch.startX - 38),
		kills: 0,
		falls: 0,
		score: 0,
		combo: 0,
		comboUntil: 0,
		talkLockUntil: 3,
		ended: false
	};
}
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shake(w, power) {
	w.shakeUntil = w.t + .35;
	w.shakePower = Math.max(w.shakePower * (w.shakeUntil > w.t ? .5 : 0), power);
}
function splat(w, x, y, n) {
	for (let i = 0; i < n; i++) w.blood.push({
		x: x + (Math.random() - .5) * 10,
		y: y + Math.random() * 8,
		w: 14 + Math.random() * 28,
		h: 10 + Math.random() * 22,
		rot: Math.random() * 360,
		born: w.t
	});
	if (w.blood.length > 48) w.blood.splice(0, w.blood.length - 48);
}
function rip(w, x, dir, n) {
	for (let i = 0; i < n; i++) w.gibs.push({
		x: x + (Math.random() - .5) * 8,
		y: 8 + Math.random() * 16,
		vx: dir * (28 + Math.random() * 90) + (Math.random() - .5) * 36,
		vy: 48 + Math.random() * 78,
		rot: Math.random() * 360,
		spin: (Math.random() - .5) * 980,
		src: i % 3
	});
	if (w.gibs.length > 36) w.gibs.splice(0, w.gibs.length - 36);
}
function fx(w, x, y, kind, face = 1, text) {
	w.fx.push({
		x,
		y,
		kind,
		born: w.t,
		face,
		text
	});
	if (w.fx.length > 24) w.fx.splice(0, w.fx.length - 24);
}
function addScore(w, n) {
	w.score = Math.max(0, w.score + n);
}
function isAlive(e) {
	return !e.gone && !e.exploding && e.x < 900;
}
function canTalk(e) {
	return isAlive(e) && !e.fly && !e.down && !e.calm && !e.cry;
}
function interactTarget(w) {
	const ch = chapterOf(w.chapter);
	const px = w.player.x;
	for (const def of HAZARDS) {
		const e = w.enemies[def.id];
		if (canTalk(e) && !e.chasing && Math.abs(px - e.x) < 16) return {
			kind: "talk",
			key: w.chapter === 3 && def.id === "pablito" ? "pablito3" : def.id,
			label: def.name,
			verb: "Hablar"
		};
	}
	if (ch.examX && [
		"apuntes",
		"cafe",
		"cedula",
		"fuerza"
	].every((i) => w.items.includes(i)) && Math.abs(px - ch.examX) < 14) return {
		kind: "talk",
		key: "examen",
		label: "El examen",
		verb: "Rendir"
	};
	for (const n of ch.npcs) {
		const nx = w.npcX[n.id];
		if (nx > 900 || Math.abs(px - nx) >= 14) continue;
		const name = NAMES[n.id];
		if (w.chapter === 2 && n.id === "richard") return {
			kind: "talk",
			key: "richard2",
			label: name,
			verb: "Hablar"
		};
		if (w.chapter === 2 && n.id === "hector") return {
			kind: "talk",
			key: "fuerza",
			label: name,
			verb: "Hablar"
		};
		if (w.chapter === 3 && n.id === "juan") return {
			kind: "talk",
			key: w.items.includes("echar") ? "juan3" : "juanGo",
			label: name,
			verb: "Hablar"
		};
		if (!w.recruited.includes(n.id) || w.chapter === 3) return {
			kind: "talk",
			key: n.id,
			label: name,
			verb: "Hablar"
		};
	}
	for (const p of ch.pickups) if (p.kind === "item" && p.talk && !w.items.includes(p.id) && Math.abs(px - p.x) < 10) return {
		kind: "pickup",
		pickup: p,
		label: p.label ?? p.id,
		verb: "Agarrar"
	};
	if (ch.grillX && Math.abs(px - ch.grillX) < 14) return {
		kind: "talk",
		key: "grill",
		label: "El quincho",
		verb: "Asado"
	};
	return null;
}
function npcVisible(w, id) {
	const px = w.npcX[id];
	if (id === w.hero || px > 900) return false;
	if (w.chapter === 2 && (id === "richard" || id === "hector")) return true;
	if (w.chapter === 3 && (id === "juan" || id === "rafa")) return true;
	return !w.recruited.includes(id);
}
function followers(w) {
	return w.recruited.filter((id) => !(id === w.hero || w.chapter === 2 && (id === "richard" || id === "hector") || w.chapter === 3 && id === "juan"));
}
function hurtPlayer(w, amount, ev, why) {
	const p = w.player;
	if (w.t < p.invUntil || w.ended) return false;
	const dmg = Math.max(1, Math.round(amount * w.tune.damage));
	p.hp = Math.max(0, p.hp - dmg);
	p.invUntil = w.t + .75;
	p.hurtAt = w.t;
	ev.push({
		t: "sfx",
		name: "hurt"
	}, {
		t: "vibrate",
		ms: 60
	}, { t: "hud" });
	if (why) ev.push({
		t: "toast",
		msg: why
	});
	shake(w, 5);
	if (p.hp <= 0) {
		w.ended = true;
		ev.push({ t: "ko" });
	}
	return true;
}
function killEnemy(w, e, dir, how, ev) {
	const def = HAZARD_BY_ID[e.id];
	e.hp = 0;
	e.hurt = how;
	e.exploding = true;
	e.explodeAt = w.t;
	e.fly = true;
	e.torn = how !== "fist";
	e.chasing = false;
	e.caught = false;
	e.headless = e.id === "gallaguer";
	e.vx = dir * 58;
	e.vy = 82;
	e.spin = dir * 820;
	e.hit = w.t;
	e.flash = 1;
	splat(w, e.x, 16, 22);
	splat(w, e.x + dir * 6, 10, 10);
	rip(w, e.x, dir, 12);
	fx(w, e.x, 20, "boom");
	fx(w, e.x, 24, "impact");
	w.kills++;
	w.combo = w.t < w.comboUntil ? w.combo + 1 : 1;
	w.comboUntil = w.t + 4;
	const base = e.id === "masivo" ? 80 : 50;
	addScore(w, base * w.combo);
	fx(w, e.x, 34, "pop", 1, w.combo > 1 ? `+${base * w.combo} · x${w.combo}` : `+${base}`);
	shake(w, 9);
	ev.push({
		t: "sfx",
		name: "boom"
	}, {
		t: "vibrate",
		ms: 120
	}, { t: "hud" });
	if (e.id === "pablito" && w.chapter === 3 && !w.items.includes("echar")) {
		w.items.push("echar");
		addScore(w, 100);
		ev.push({
			t: "toast",
			msg: "¡Pablito explota! Hablá con Juan."
		});
		return;
	}
	ev.push({
		t: "toast",
		msg: def.killed
	});
}
function damageEnemy(w, e, dmg, dir, how, ev) {
	const def = HAZARD_BY_ID[e.id];
	if (how !== "gun" && e.id === "marcos" && !e.cry) {
		e.cry = true;
		e.cryUntil = w.t + .9;
		e.chasing = false;
		e.hit = w.t;
		e.hurt = how;
		e.flash = 1;
		splat(w, e.x, 12, how === "slash" ? 18 : 6);
		if (how === "slash") {
			fx(w, e.x, 20, "impact");
			rip(w, e.x, dir, 8);
		}
		shake(w, 6);
		ev.push({
			t: "toast",
			msg: "¡Marcos llora!"
		}, {
			t: "sfx",
			name: "hit"
		});
		return;
	}
	if (how !== "gun" && e.id === "gallaguer") {
		killEnemy(w, e, dir, how, ev);
		return;
	}
	e.hp -= dmg;
	e.flash = 1;
	e.hit = w.t;
	e.hurt = how;
	if (e.hp <= 0) {
		killEnemy(w, e, dir, how, ev);
		return;
	}
	ev.push({
		t: "sfx",
		name: "hit"
	}, {
		t: "vibrate",
		ms: 30
	});
	splat(w, e.x, 12, how === "gun" ? 6 : 10);
	if (how === "gun") {
		e.x = clamp(e.x + dir * 5, 4, w.width - 8);
		fx(w, e.x, 22, "impact");
		ev.push({
			t: "toast",
			msg: `${def.name}: ${e.hp}/${e.maxHp}`
		});
		return;
	}
	e.fly = true;
	e.down = false;
	e.chasing = false;
	e.caught = false;
	e.vx = dir * (how === "slash" ? 70 : 92 + Math.random() * 18);
	e.vy = how === "slash" ? 62 + Math.random() * 20 : 78 + Math.random() * 22;
	e.spin = dir * (how === "slash" ? 980 : 720 + Math.random() * 420);
	e.torn = false;
	if (how === "slash") {
		fx(w, e.x, 18, "impact");
		rip(w, e.x, dir, 5);
	}
	ev.push({
		t: "toast",
		msg: how === "slash" ? "¡Corte!" : "¡SALE VOLANDO!"
	});
}
function attack(w, ev) {
	const p = w.player;
	const weapon = p.weapon;
	const cooldown = weapon === "pistol" ? .26 : weapon === "knife" ? .4 : .36;
	if (w.t - p.lastAttack < cooldown) return;
	if (weapon === "pistol" && p.ammo <= 0) {
		p.lastAttack = w.t;
		ev.push({
			t: "sfx",
			name: "empty"
		}, {
			t: "toast",
			msg: "Sin balas. Cambiá de arma (Q)."
		});
		return;
	}
	p.lastAttack = w.t;
	p.attackKind = weapon;
	p.attackUntil = w.t + (weapon === "pistol" ? .16 : .28);
	const dir = p.facing;
	if (weapon === "pistol") {
		p.ammo--;
		w.shots.push({
			x: p.x + dir * 9,
			y: 24 + p.y,
			vx: dir * 260,
			face: dir
		});
		fx(w, p.x + dir * 8, 24 + p.y, "muzzle", dir);
		fx(w, p.x + dir * 22, 24 + p.y, "tracer", dir);
		shake(w, 3);
		ev.push({
			t: "sfx",
			name: "shot"
		}, { t: "hud" });
		return;
	}
	const isKnife = weapon === "knife";
	const reach = isKnife ? 20 : 14;
	const dmg = isKnife ? 2 : 1;
	const how = isKnife ? "slash" : "fist";
	ev.push({
		t: "sfx",
		name: isKnife ? "slash" : "punch"
	});
	if (isKnife) fx(w, p.x + dir * 10, 22 + p.y, "slash", dir);
	let hit = false;
	for (const def of HAZARDS) {
		const e = w.enemies[def.id];
		if (!isAlive(e) || e.fly || e.down) continue;
		if ((e.x - p.x) * dir > -4 && Math.abs(e.x - p.x) < reach) {
			damageEnemy(w, e, dmg, dir, how, ev);
			hit = true;
		}
	}
	for (const id of Object.keys(w.npcX)) {
		if (!npcVisible(w, id)) continue;
		if (Math.abs(w.npcX[id] - p.x) < reach) {
			w.npcX[id] = clamp(w.npcX[id] + dir * 12, 8, w.width - 8);
			hit = true;
		}
	}
	if (hit) shake(w, 4);
}
function swapWeapon(w, ev) {
	const p = w.player;
	const owned = ["pistol", "fist"];
	if (p.hasKnife) owned.splice(1, 0, "knife");
	p.weapon = owned[(owned.indexOf(p.weapon) + 1) % owned.length];
	ev.push({
		t: "sfx",
		name: "swap"
	}, { t: "hud" });
}
function grab(w, p, ev) {
	w.items.push(p.id);
	const pl = w.player;
	if (p.kind === "coin") {
		w.coins++;
		addScore(w, 10);
		ev.push({
			t: "sfx",
			name: "coin"
		});
		fx(w, p.x, 26, "pop", 1, "+1 Gs");
	} else if (p.kind === "ammo") {
		pl.ammo += w.tune.ammoPickup;
		addScore(w, 5);
		ev.push({
			t: "sfx",
			name: "pickup"
		}, {
			t: "toast",
			msg: `+${w.tune.ammoPickup} balas`
		});
		fx(w, p.x, 26, "pop", 1, `+${w.tune.ammoPickup}`);
	} else if (p.kind === "heal") {
		const before = pl.hp;
		pl.hp = Math.min(pl.maxHp, pl.hp + 30);
		addScore(w, 5);
		ev.push({
			t: "sfx",
			name: "heal"
		}, {
			t: "toast",
			msg: "Tereré. Un respiro."
		});
		fx(w, p.x, 28, "heal", 1, `+${pl.hp - before}`);
	} else if (p.kind === "knife") {
		pl.hasKnife = true;
		pl.weapon = "knife";
		addScore(w, 20);
		ev.push({
			t: "sfx",
			name: "pickup"
		}, {
			t: "toast",
			msg: "Cuchillo. Cortá de cerca. Q cambia de arma."
		});
	}
	ev.push({ t: "hud" });
}
function respawnAllowed(w, e) {
	if (e.id === "pablito" && w.chapter === 3 && w.items.includes("echar")) return false;
	return true;
}
function stepEnemy(w, e, ev) {
	const def = HAZARD_BY_ID[e.id];
	const p = w.player;
	const t = w.t;
	const maxX = w.width - 8;
	const home = chapterOf(w.chapter).hazardHome[e.id];
	if (e.flash > 0) e.flash = Math.max(0, e.flash - 4 * w.dt);
	if (e.gone) {
		if (t >= e.respawnAt && respawnAllowed(w, e) && Math.abs(p.x - home) > 40) {
			Object.assign(e, enemyAt(e.id, home, w.tune.enemyHp));
			ev.push({
				t: "toast",
				msg: `${def.name} volvió.`
			});
		}
		return;
	}
	if (e.exploding) {
		e.rot += 420 * w.dt;
		e.y += 40 * w.dt;
		e.x = clamp(e.x + e.vx * .4 * w.dt, 4, maxX);
		if (t - e.explodeAt > .8) {
			e.gone = true;
			e.respawnAt = t + w.tune.respawnSeconds;
		}
		return;
	}
	if (e.cry) {
		if (t >= e.cryUntil) {
			e.cry = false;
			killEnemy(w, e, p.facing, e.hurt === "slash" ? "slash" : "fist", ev);
		}
		return;
	}
	if (e.calm) return;
	if (e.fly) {
		e.vy -= 210 * w.dt;
		e.x = clamp(e.x + e.vx * w.dt, 4, maxX);
		e.y += e.vy * w.dt;
		e.rot += e.spin * w.dt;
		if (e.y <= 0) {
			e.y = 0;
			if (Math.abs(e.vy) > 36) {
				e.vy = Math.abs(e.vy) * .38;
				e.vx *= .55;
				e.spin *= .6;
				splat(w, e.x, 8, 6);
				ev.push({
					t: "sfx",
					name: "land"
				});
			} else {
				e.fly = false;
				e.down = true;
				e.downAt = t;
				e.vx = 0;
				e.vy = 0;
				e.rot = e.spin >= 0 ? 90 : -90;
				splat(w, e.x, 6, 5);
			}
		}
		return;
	}
	if (e.down) {
		if (!(e.id === "pablito" && w.chapter === 3 && w.items.includes("echar")) && t - e.downAt > 2.2) {
			e.down = false;
			e.rot = 0;
			e.chasing = true;
		}
		return;
	}
	if (t - e.hit < .4) return;
	const dx = p.x - e.x;
	const dist = Math.abs(dx);
	const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
	const speed = def.speed * w.tune.enemySpeed;
	if (!e.chasing) {
		if (e.id === "onichan") e.x = home + Math.sin(t * 1.54) * 18;
		if (dist < def.sight && t > w.talkLockUntil) {
			e.chasing = true;
			e.caught = false;
			ev.push({
				t: "toast",
				msg: def.alert
			}, {
				t: "sfx",
				name: "alert"
			}, { t: "hud" });
		}
		return;
	}
	if (dist > def.leash) {
		e.chasing = false;
		e.caught = false;
		e.x = home;
		ev.push({
			t: "toast",
			msg: def.lost
		}, { t: "hud" });
		return;
	}
	if (e.id === "onichan") {
		if (dist < 20) e.x = clamp(e.x - dir * speed * w.dt, 8, maxX);
		else if (dist > 28) e.x = clamp(e.x + dir * speed * w.dt, 8, maxX);
		if (t - e.lastThrow > .6 / w.tune.projectileRate) {
			w.slimes.push({
				x: e.x + (dir > 0 ? -12 : 12),
				y: 11,
				vx: dir * 95
			});
			e.lastThrow = t;
		}
		return;
	}
	if (dist > 14) e.x = clamp(e.x + dir * speed * w.dt, 8, maxX);
	else if (p.grounded && t > p.invUntil && t > w.talkLockUntil) {
		e.x = p.x - dir * 14;
		if (!e.caught) {
			e.caught = true;
			const key = e.id === "pablito" && w.chapter === 3 ? "pablito3" : e.id;
			if (hurtPlayer(w, 5, ev, "")) {
				if (!w.ended) ev.push({
					t: "talk",
					key
				});
			}
		}
	}
	if (e.id === "marcos" && t - e.lastThrow > 1.1 / w.tune.projectileRate) {
		w.books.push({
			x: e.x,
			y: 18,
			vx: dir * 52,
			rot: Math.random() * 360
		});
		e.lastThrow = t;
	}
}
function stepWorld(world, input, dtRaw, ev) {
	const w = world;
	const dt = Math.min(.05, Math.max(.001, dtRaw));
	w.dt = dt;
	w.t += dt;
	if (w.ended) return;
	w.timer += dt;
	const p = w.player;
	const ch = chapterOf(w.chapter);
	const maxX = w.width - 8;
	const slowed = w.t < p.slowUntil;
	const target = clamp(input.moveX, -1, 1) * p.speed * (slowed ? .48 : 1);
	p.vx += (target - p.vx) * Math.min(1, 18 * dt);
	if (Math.abs(p.vx) < .5 && input.moveX === 0) p.vx = 0;
	p.x = clamp(p.x + p.vx * dt, 6, maxX);
	if (input.moveX !== 0) p.facing = input.moveX < 0 ? -1 : 1;
	p.walking = Math.abs(p.vx) > 6 && p.grounded;
	if (input.jump) p.jumpBuffer = .12;
	else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
	if (p.grounded) p.coyote = .1;
	else p.coyote = Math.max(0, p.coyote - dt);
	if (p.jumpBuffer > 0 && (p.grounded || p.coyote > 0)) {
		p.vy = 82;
		p.grounded = false;
		p.coyote = 0;
		p.jumpBuffer = 0;
		ev.push({
			t: "sfx",
			name: "jump"
		});
	}
	if (!p.grounded) {
		p.vy -= 215 * dt;
		p.y += p.vy * dt;
		if (p.y <= 0) {
			p.y = 0;
			p.vy = 0;
			p.grounded = true;
			ev.push({
				t: "sfx",
				name: "land"
			});
		}
	}
	if (input.swap) swapWeapon(w, ev);
	if (input.attack || input.attackHeld && p.weapon === "pistol") attack(w, ev);
	for (const pk of ch.pickups) {
		if (pk.kind === "item" || w.items.includes(pk.id)) continue;
		if (Math.abs(p.x - pk.x) < 6 && p.y < 12) grab(w, pk, ev);
	}
	if (input.interact) {
		const tg = interactTarget(w);
		if (tg) {
			if (tg.kind === "talk") ev.push({
				t: "talk",
				key: tg.key
			});
			else if (tg.pickup.talk) ev.push({
				t: "talk",
				key: tg.pickup.talk
			});
		}
	}
	for (const def of HAZARDS) stepEnemy(w, w.enemies[def.id], ev);
	const feet = p.y;
	const head = p.y + 26;
	w.books = w.books.filter((b) => {
		b.x += b.vx * dt;
		b.rot += 220 * dt;
		b.y += 6 * dt;
		const h = b.y - GROUND_LINE;
		if (Math.abs(b.x - p.x) < 7 && h < head && h > feet - 4) {
			hurtPlayer(w, 12, ev, "¡Un libro te pegó!");
			return false;
		}
		return b.x > 0 && b.x < maxX && b.y < 40;
	});
	w.slimes = w.slimes.filter((s) => {
		s.x += s.vx * dt;
		s.y += 5 * dt;
		const h = s.y - GROUND_LINE;
		if (Math.abs(s.x - p.x) < 7 && h < head && h > feet - 4) {
			if (hurtPlayer(w, 8, ev, "¡Capi te llenó de slime!")) {
				p.slowUntil = w.t + .8;
				w.slimedUntil = w.t + .5;
			}
			return false;
		}
		return s.x > 0 && s.x < maxX && s.y < 38;
	});
	if (w.slimes.length > 14) w.slimes.splice(0, w.slimes.length - 14);
	w.shots = w.shots.filter((shot) => {
		const nx = shot.x + shot.vx * dt;
		if (nx < 2 || nx > maxX) return false;
		for (const def of HAZARDS) {
			const e = w.enemies[def.id];
			if (!isAlive(e) || e.fly) continue;
			const lo = Math.min(shot.x, nx) - 4;
			const hi = Math.max(shot.x, nx) + 4;
			if (e.x >= lo && e.x <= hi) {
				damageEnemy(w, e, 1, shot.face, "gun", ev);
				return false;
			}
		}
		shot.x = nx;
		return true;
	});
	w.gibs = w.gibs.filter((g) => {
		g.vy -= 210 * dt;
		g.x += g.vx * dt;
		g.y += g.vy * dt;
		g.rot += g.spin * dt;
		return g.y > -20 && g.x > -10 && g.x < maxX + 10;
	});
	if (w.fx.length) w.fx = w.fx.filter((f) => w.t - f.born < (f.kind === "pop" || f.kind === "heal" ? .9 : .6));
	if (w.blood.length) w.blood = w.blood.filter((b) => w.t - b.born < 14);
	if (w.t > w.comboUntil) w.combo = 0;
	const camTarget = clamp(p.x - 38 + p.facing * 4, 0, w.width - 100);
	w.camX += (camTarget - w.camX) * Math.min(1, 7 * dt);
}
function respawn(w, ev) {
	const p = w.player;
	p.x = clamp(Math.floor(p.x / 100) * 100 + 14, 6, w.width - 8);
	p.y = 0;
	p.vy = 0;
	p.vx = 0;
	p.grounded = true;
	p.hp = p.maxHp;
	p.invUntil = w.t + 2.5;
	p.slowUntil = 0;
	w.coins = Math.max(0, w.coins - 5);
	w.falls++;
	addScore(w, -100);
	w.books = [];
	w.slimes = [];
	w.shots = [];
	w.slimedUntil = 0;
	w.talkLockUntil = w.t + 2;
	for (const def of HAZARDS) {
		const e = w.enemies[def.id];
		if (e.chasing && isAlive(e)) {
			e.chasing = false;
			e.caught = false;
			e.x = chapterOf(w.chapter).hazardHome[def.id];
		}
	}
	w.camX = clamp(p.x - 38, 0, w.width - 100);
	w.ended = false;
	ev.push({
		t: "toast",
		msg: "Volvés al inicio de la zona. −5 Gs."
	}, { t: "hud" });
}
function closeTalk(w) {
	w.talkLockUntil = w.t + 1.2;
	w.player.invUntil = Math.max(w.player.invUntil, w.t + 1.5);
}
function applyChoice(w, key, lineIdx, pick, ev) {
	const script = TALKS[key];
	const maxX = w.width - 8;
	const p = w.player;
	if (pick.join) {
		if (!w.recruited.includes(key)) {
			w.recruited.push(key);
			addScore(w, 100);
			ev.push({
				t: "toast",
				msg: `${NAMES[key] ?? key} se suma.`
			}, {
				t: "sfx",
				name: "recruit"
			}, { t: "hud" });
			return { next: "close" };
		}
	}
	if (pick.item && !w.items.includes(pick.item)) {
		const msg = pick.item === "aviso" ? "Paso 1. El chat está en el pasillo." : pick.item === "chat" ? "Paso 2. La foto está en el bosque." : pick.item === "foto" ? "Paso 3. Disparale a Pablito en el muelle." : pick.item === "fuerza" ? "Héctor te banca. Falta la cédula en el patio." : pick.item === "cedula" ? "Cédula lista. Al aula." : pick.item === "terere" ? "Tereré listo. Falta el carbón." : pick.item === "carne" ? "Carne lista. Falta el tereré." : pick.item === "hielo" ? "Hielo listo. Falta la carne." : pick.item === "carbon" ? "Carbón listo. ¡Al quincho!" : pick.item === "apuntes" ? "Apuntes listos. Falta el café." : pick.item === "cafe" ? "Café listo. Hablá con Héctor." : pick.item === "chat" ? "Paso 2. La foto está en el bosque." : `${pick.item} listo.`;
		w.items.push(pick.item);
		addScore(w, 100);
		ev.push({
			t: "toast",
			msg
		}, {
			t: "sfx",
			name: "pickup"
		}, { t: "hud" });
		return { next: "close" };
	}
	if (pick.calm) {
		const m = w.enemies.marcos;
		m.chasing = false;
		m.calm = true;
		m.caught = false;
		addScore(w, 30);
		ev.push({
			t: "toast",
			msg: "Marcos se calma. La panza es sagrada."
		}, { t: "hud" });
		return { next: "close" };
	}
	if (pick.coins) {
		w.coins += pick.coins;
		addScore(w, pick.coins * 10);
		const e = w.enemies[key];
		if (e) {
			e.chasing = true;
			e.caught = true;
		}
		p.x = clamp(p.x + (p.facing >= 0 ? 8 : -8), 6, maxX);
		ev.push({
			t: "toast",
			msg: "Masivo te tira unos Gs. ¡CORRÉ!"
		}, {
			t: "sfx",
			name: "coin"
		}, { t: "hud" });
		return { next: "close" };
	}
	if (pick.escape) {
		const e = w.enemies[key];
		const bump = p.x >= (e?.x ?? p.x) ? 10 : -10;
		if (e) {
			e.chasing = true;
			e.caught = true;
			e.hit = w.t + 1;
			e.x = clamp(e.x - bump * .8, 4, maxX);
		}
		p.x = clamp(p.x + bump, 6, maxX);
		ev.push({
			t: "toast",
			msg: "¡Corré! Saltá para esquivar."
		});
		return { next: "close" };
	}
	if (pick.chaseOff) {
		const e = w.enemies.pablito;
		e.x = 12;
		e.chasing = false;
		e.caught = true;
		e.hit = w.t;
		if (!w.items.includes("echar")) {
			w.items.push("echar");
			addScore(w, 100);
		}
		ev.push({
			t: "toast",
			msg: "Pablito salió corriendo. Hablá con Juan."
		}, { t: "hud" });
		return { next: "close" };
	}
	if (pick.honor) {
		if (!w.items.includes("echar") || !w.items.includes("foto")) {
			ev.push({
				t: "toast",
				msg: "Falta la foto o echar a Pablito."
			});
			return { next: "close" };
		}
		w.items.push("honor");
		addScore(w, 300);
		return { next: "win" };
	}
	if (pick.exam) {
		if (key === "richard2") {
			if (![
				"apuntes",
				"cafe",
				"cedula",
				"fuerza"
			].every((i) => w.items.includes(i))) {
				ev.push({
					t: "toast",
					msg: "Faltan apuntes, café, cédula o Héctor. Seguí a la derecha."
				});
				return { next: "close" };
			}
			w.examScore = 0;
			return {
				next: "talk",
				key: "examen"
			};
		}
		const score = w.examScore + (pick.exam === "ok" ? 1 : 0);
		w.examScore = score;
		if (lineIdx + 1 < script.length) return { next: "line" };
		if (score >= 2) {
			if (!w.items.includes("exam")) w.items.push("exam");
			addScore(w, 200 + score * 50);
			return { next: "win" };
		}
		w.examScore = 0;
		ev.push({
			t: "toast",
			msg: "Aplazado. Reintentá el examen."
		}, { t: "hud" });
		return { next: "close" };
	}
	if (pick.fire) {
		const team = w.recruited.length >= 4;
		const stuff = [
			"carne",
			"hielo",
			"carbon",
			"terere"
		].every((id) => w.items.includes(id));
		if (team && stuff) {
			w.fire = true;
			addScore(w, 300);
			return { next: "win" };
		}
		ev.push({
			t: "toast",
			msg: team ? "Falta hielo, carbón, carne o tereré." : "Falta el equipo."
		});
		return { next: "close" };
	}
	return { next: "close" };
}
var GIBS = [
	"/sprites/gib1.png",
	"/sprites/gib2.png",
	"/sprites/spray.png"
];
var GROUND = .92;
var bloodBlob = null;
function bloodSprite() {
	if (bloodBlob || typeof document === "undefined") return bloodBlob;
	const c = document.createElement("canvas");
	c.width = 64;
	c.height = 48;
	const g = c.getContext("2d");
	if (!g) return null;
	const grad = g.createRadialGradient(22, 14, 2, 32, 24, 30);
	grad.addColorStop(0, "#ff2a3a");
	grad.addColorStop(.55, "#9b0b18");
	grad.addColorStop(1, "#4a040800");
	g.fillStyle = grad;
	g.beginPath();
	g.ellipse(32, 24, 30, 22, 0, 0, Math.PI * 2);
	g.fill();
	bloodBlob = c;
	return c;
}
var X$1 = (f, x) => (x - f.cam) * (f.W / 100);
var VH = (f, v) => v * f.H / 100;
var groundY = (f) => f.H * GROUND;
function drawSprite(f, sp, cx, baseY, hPx, o = {}) {
	if (!sp) return;
	const { ctx } = f;
	const w = hPx * sp.w / sp.h;
	ctx.save();
	ctx.translate(cx + (o.dx ?? 0), baseY + (o.dy ?? 0));
	if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
	const s = o.scale ?? 1;
	ctx.scale(o.flip ? -s : s, s);
	if (o.alpha !== void 0) ctx.globalAlpha = Math.max(0, Math.min(1, o.alpha));
	const top = o.clipTop ?? 0;
	const bottom = o.clipBottom ?? 0;
	const sy = sp.h * top;
	const sh = sp.h * (1 - top - bottom);
	const dh = hPx * (1 - top - bottom);
	const dy = -hPx * (1 - top);
	ctx.drawImage(sp.img, 0, sy, sp.w, sh, -w / 2, dy, w, dh);
	if (o.flash) {
		ctx.globalCompositeOperation = "lighter";
		ctx.globalAlpha = (o.alpha ?? 1) * o.flash * .9;
		ctx.drawImage(sp.img, 0, sy, sp.w, sh, -w / 2, dy, w, dh);
	}
	ctx.restore();
}
function drawTag(f, text, cx, cy, o = {}) {
	const { ctx } = f;
	const size = o.size ?? 10;
	ctx.save();
	ctx.font = `700 ${size}px Figtree, "Segoe UI", system-ui, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const tw = ctx.measureText(text).width;
	const pad = o.pad ?? 7;
	const w = tw + pad * 2;
	const h = size + pad;
	ctx.fillStyle = o.bg ?? "rgba(0,0,0,0.72)";
	ctx.beginPath();
	ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
	ctx.fill();
	ctx.fillStyle = o.fg ?? "#ebe4d6";
	ctx.fillText(text, cx, cy + .5);
	ctx.restore();
}
function actorFrame(f, sprite, steps, walk) {
	if (walk && steps && steps.length) return getSprite(steps[Math.floor(f.t * 8.7) % steps.length]) ?? getSprite(sprite);
	return getSprite(sprite);
}
function drawActor(f, sprite, steps, x, yVh, hVh, face, a = {}) {
	const sp = actorFrame(f, sprite, steps, !!a.walk);
	const cx = X$1(f, x);
	const base = groundY(f) - VH(f, yVh);
	let dy = 0;
	let dx = 0;
	let rot = 0;
	if (a.idle && !a.walk) dy = Math.sin(f.t * 2.9 + x) * VH(f, .35);
	if (a.attackKind && a.attackT !== void 0 && a.attackT < 1) {
		const bell = Math.sin(a.attackT * Math.PI);
		if (a.attackKind === "aim") {
			dx = -face * bell * f.W * .008;
			rot = -face * bell * 5;
		} else if (a.attackKind === "punch") {
			dx = face * bell * f.W * .02;
			rot = face * bell * 14;
		} else {
			dx = face * bell * f.W * .016;
			rot = face * bell * 22;
		}
	}
	if (a.cry) rot = Math.sin(f.t * 9) * 7;
	drawSprite(f, sp, cx, base, VH(f, hVh), {
		flip: face === 1,
		rot,
		dx,
		dy,
		flash: a.flash,
		alpha: a.alpha
	});
}
function drawEnemy(f, w, e) {
	if (e.gone || e.x > 900) return;
	const def = HAZARD_BY_ID[e.id];
	const face = e.x < w.player.x ? 1 : -1;
	const cx = X$1(f, e.x);
	const base = groundY(f) - VH(f, e.y);
	const H = VH(f, 30);
	const body = getSprite(def.sprite);
	if (e.exploding) {
		const p = Math.min(1, (w.t - e.explodeAt) / .8);
		if (e.torn) {
			drawSprite(f, body, cx - f.W * .03, base - VH(f, 6), H * .6, {
				flip: face === 1,
				rot: e.rot * .45 - 18,
				alpha: 1 - p,
				clipBottom: .52,
				flash: .5
			});
			drawSprite(f, body, cx + f.W * .04, base + VH(f, 2), H * .53, {
				flip: face === 1,
				rot: e.rot * .7 + 22,
				alpha: 1 - p,
				clipTop: .48,
				flash: .5
			});
		} else drawSprite(f, body, cx, base, H, {
			flip: face === 1,
			rot: e.rot * .2,
			scale: 1 + p * .8,
			alpha: 1 - p,
			clipTop: e.headless ? .22 : 0,
			flash: .6
		});
		return;
	}
	if (e.fly || e.down) {
		if (e.torn) {
			drawSprite(f, body, cx - f.W * .03, base - VH(f, 6), H * .6, {
				flip: face === 1,
				rot: e.rot * .45 - 18,
				clipBottom: .52,
				flash: e.flash
			});
			drawSprite(f, body, cx + f.W * .04, base + VH(f, 2), H * .53, {
				flip: face === 1,
				rot: e.rot * .7 + 22,
				clipTop: .48,
				flash: e.flash
			});
		} else drawSprite(f, body, cx, base, H, {
			flip: face === 1,
			rot: e.rot,
			flash: e.flash,
			alpha: e.down ? .92 : 1
		});
		return;
	}
	const walking = e.chasing && !e.calm && !e.cry;
	drawActor(f, def.sprite, def.steps, e.x, e.y, 30, face, {
		walk: walking,
		idle: !walking,
		cry: e.cry,
		flash: e.flash
	});
	const top = base - H;
	drawTag(f, e.chasing ? `${def.name} · ${def.chaseLabel}` : e.calm ? `${def.name} · calmado` : def.name, cx, top - 16, {
		bg: e.chasing ? "rgba(194,65,59,0.92)" : "rgba(0,0,0,0.72)",
		fg: e.chasing ? "#fff" : "#ebe4d6"
	});
	if (e.maxHp > 1 && !e.calm) {
		const { ctx } = f;
		const pw = 10;
		const total = e.maxHp * 13 - 3;
		for (let i = 0; i < e.maxHp; i++) {
			ctx.fillStyle = i < e.hp ? "#ff3b4a" : "rgba(0,0,0,0.55)";
			ctx.beginPath();
			ctx.roundRect(cx - total / 2 + i * 13, top - 6, pw, 4, 2);
			ctx.fill();
		}
	}
}
function drawWorld(ctx, w, W, H, opts) {
	const ch = chapterOf(w.chapter);
	const f = {
		ctx,
		W,
		H,
		cam: w.camX,
		t: w.t
	};
	ctx.save();
	ctx.clearRect(0, 0, W, H);
	if (opts.shake && w.t < w.shakeUntil) {
		const k = (w.shakeUntil - w.t) / .35 * w.shakePower;
		ctx.translate((Math.random() - .5) * k * 2, (Math.random() - .5) * k * 1.4);
	}
	const first = Math.max(0, Math.floor(w.camX / 100));
	const last = Math.min(ch.zones.length - 1, Math.floor((w.camX + 100) / 100));
	for (let i = first; i <= last; i++) {
		const z = ch.zones[i];
		const sp = getSprite(z.bg);
		const zx = X$1(f, i * 100);
		if (!sp) {
			ctx.fillStyle = "#101820";
			ctx.fillRect(zx, 0, W + 2, H);
			continue;
		}
		const s = Math.max(W / sp.w, H / sp.h);
		const sw = W / s;
		const sh = H / s;
		ctx.drawImage(sp.img, (sp.w - sw) / 2, (sp.h - sh) / 2, sw, sh, zx, 0, W + 2, H);
	}
	for (const p of ch.props) {
		if (p.x < w.camX - 20 || p.x > w.camX + 120) continue;
		drawSprite(f, getSprite(p.src), X$1(f, p.x), H * .9, VH(f, p.h), { flip: p.flip });
	}
	if (ch.grillX) {
		drawSprite(f, getSprite("/sprites/fire.png"), X$1(f, ch.grillX), H * .84, VH(f, 16), { alpha: w.fire ? 1 : .45 });
		drawTag(f, w.fire ? "¡Asado!" : "El quincho", X$1(f, ch.grillX), H * .84 - VH(f, 19));
	}
	if (ch.examX) {
		const ready = [
			"apuntes",
			"cafe",
			"cedula",
			"fuerza"
		].every((i) => w.items.includes(i));
		drawTag(f, ready ? "Examen listo" : "El aula", X$1(f, ch.examX), H * .6, {
			bg: ready ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.72)",
			fg: ready ? "#0b0f14" : "#ebe4d6",
			size: 11
		});
	}
	for (const p of ch.pickups) {
		if (w.items.includes(p.id) || p.x < w.camX - 10 || p.x > w.camX + 110) continue;
		const bob = Math.sin(w.t * 3.6 + p.x) * VH(f, .6);
		const size = p.kind === "coin" ? 24 : p.kind === "ammo" ? 26 : p.kind === "heal" ? 34 : p.kind === "knife" ? 10 : 38;
		const base = H * .84 + bob;
		drawSprite(f, getSprite(pickupSprite(p)), X$1(f, p.x), base, size, { rot: p.kind === "knife" ? -30 : 0 });
		if (p.kind !== "coin" && p.label) drawTag(f, p.label, X$1(f, p.x), base + 12, {
			size: 9,
			pad: 5,
			bg: p.kind === "item" ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.6)",
			fg: p.kind === "item" ? "#0b0f14" : "#ebe4d6"
		});
	}
	if (opts.gore && w.blood.length) {
		const blob = bloodSprite();
		if (blob) for (const b of w.blood) {
			if (b.x < w.camX - 10 || b.x > w.camX + 110) continue;
			const age = w.t - b.born;
			ctx.save();
			ctx.globalAlpha = age > 10 ? Math.max(0, .9 * (1 - (age - 10) / 4)) : .9;
			ctx.translate(X$1(f, b.x), H - VH(f, b.y));
			ctx.rotate(b.rot * Math.PI / 180);
			ctx.drawImage(blob, -b.w / 2, -b.h / 2, b.w, b.h);
			ctx.restore();
		}
	}
	for (const n of ch.npcs) {
		if (!npcVisible(w, n.id)) continue;
		const nx = w.npcX[n.id];
		if (nx < w.camX - 20 || nx > w.camX + 120) continue;
		const hero = HERO_BY_ID[n.id];
		const face = nx < w.player.x ? 1 : -1;
		drawActor(f, hero.sprite, hero.steps, nx, 0, 32, face, { idle: true });
		const near = Math.abs(nx - w.player.x) < 14;
		drawTag(f, near && opts.prompts ? `${NAMES[n.id]} · E` : NAMES[n.id], X$1(f, nx), groundY(f) - VH(f, 34), {
			bg: near ? "rgba(212,164,90,0.95)" : "rgba(0,0,0,0.72)",
			fg: near ? "#0b0f14" : "#ebe4d6"
		});
	}
	const p = w.player;
	followers(w).forEach((id, i) => {
		const hero = HERO_BY_ID[id];
		const fx = p.x - p.facing * (9 + i * 8);
		drawActor(f, hero.sprite, hero.steps, fx, 0, 26, p.facing, {
			walk: p.walking,
			idle: true
		});
	});
	for (const def of HAZARDS) drawEnemy(f, w, w.enemies[def.id]);
	const oni = w.enemies.onichan;
	if (isAlive(oni)) {
		const capi = getSprite("/sprites/capi.png");
		const side = oni.x < p.x ? -12 : 12;
		const hop = oni.chasing ? Math.abs(Math.sin(w.t * 11)) * VH(f, 2) : Math.sin(w.t * 4.5) * VH(f, .8);
		const spit = w.t - oni.lastThrow < .32 ? 1.3 : 1;
		drawSprite(f, capi, X$1(f, oni.x + side), groundY(f) - VH(f, oni.y) - hop, VH(f, 12), {
			flip: side < 0,
			scale: spit,
			rot: oni.fly ? oni.rot : 0
		});
	}
	for (const b of w.books) drawSprite(f, getSprite("/sprites/book.png"), X$1(f, b.x), H - VH(f, b.y), VH(f, 7), { rot: b.rot });
	for (const s of w.slimes) drawSprite(f, getSprite("/sprites/slime.png"), X$1(f, s.x), H - VH(f, s.y), VH(f, 3.4), { rot: (w.t * 900 + s.x * 30) % 360 });
	for (const s of w.shots) drawSprite(f, getSprite("/sprites/bullet.png"), X$1(f, s.x), H - VH(f, s.y) + 9, 18, { flip: s.face === 1 });
	if (opts.gore) for (const g of w.gibs) drawSprite(f, getSprite(GIBS[g.src]), X$1(f, g.x), H - VH(f, g.y) + 19, 38, { rot: g.rot });
	const attackT = p.attackUntil > w.t ? 1 - (p.attackUntil - w.t) / (p.attackKind === "pistol" ? .16 : .28) : 1;
	const invisible = w.t < p.invUntil && Math.floor(w.t * 18) % 2 === 0;
	const hero = HERO_BY_ID[w.hero];
	drawActor(f, hero.sprite, hero.steps, p.x, p.y, 34, p.facing, {
		walk: p.walking && attackT >= 1,
		idle: true,
		attackKind: p.attackKind === "pistol" ? "aim" : p.attackKind === "knife" ? "slash" : "punch",
		attackT,
		alpha: invisible ? .45 : 1,
		flash: w.t - p.hurtAt < .2 ? .8 : 0
	});
	if (p.weapon !== "fist") {
		const wsp = getSprite(p.weapon === "pistol" ? "/sprites/pistol.png" : "/sprites/knife.png");
		const kick = attackT < 1 ? Math.sin(attackT * Math.PI) : 0;
		const rot = p.weapon === "pistol" ? -kick * 18 * p.facing : attackT < 1 ? (-80 + attackT * 150) * p.facing : 12 * p.facing;
		drawSprite(f, wsp, X$1(f, p.x + p.facing * 3.4), groundY(f) - VH(f, p.y + 20) + (p.weapon === "pistol" ? 12 : 8), p.weapon === "pistol" ? 38 : 12, {
			flip: p.facing === 1,
			rot,
			alpha: invisible ? .45 : 1
		});
	}
	for (const e of w.fx) {
		const age = w.t - e.born;
		const cx = X$1(f, e.x);
		const cy = H - VH(f, e.y);
		if (e.kind === "pop" || e.kind === "heal") {
			const pr = age / .9;
			ctx.save();
			ctx.globalAlpha = 1 - pr;
			ctx.font = `800 ${Math.round(Math.min(W, H) * .028)}px Figtree, system-ui, sans-serif`;
			ctx.textAlign = "center";
			ctx.fillStyle = e.kind === "heal" ? "#8fd46a" : "#ffd27a";
			ctx.strokeStyle = "rgba(0,0,0,0.7)";
			ctx.lineWidth = 3;
			ctx.strokeText(e.text ?? "", cx, cy - pr * VH(f, 8));
			ctx.fillText(e.text ?? "", cx, cy - pr * VH(f, 8));
			ctx.restore();
			continue;
		}
		const life = e.kind === "tracer" ? .16 : e.kind === "muzzle" ? .2 : e.kind === "slash" ? .32 : e.kind === "boom" ? .55 : .4;
		const pr = Math.min(1, age / life);
		if (pr >= 1) continue;
		const sp = getSprite(e.kind === "slash" ? "/sprites/slash.png" : e.kind === "muzzle" ? "/sprites/muzzle.png" : e.kind === "boom" ? "/sprites/boom.png" : e.kind === "tracer" ? "/sprites/tracer.png" : "/sprites/impact.png");
		if (!sp) continue;
		if (e.kind === "tracer") {
			ctx.save();
			ctx.globalAlpha = 1 - pr;
			const tw = W * .3;
			const th = 14;
			ctx.translate(cx, cy);
			ctx.scale(e.face === 1 ? -1 : 1, 1);
			ctx.drawImage(sp.img, -tw / 2, -7, tw, th);
			ctx.restore();
			continue;
		}
		const size = e.kind === "boom" ? 160 : e.kind === "slash" ? 110 : e.kind === "muzzle" ? 86 : 90;
		const scale = pr < .35 ? .6 + pr / .35 * .55 : 1.15 + (pr - .35) / .65 * .25;
		drawSprite(f, sp, cx, cy + size / 2, size, {
			scale,
			alpha: pr < .35 ? 1 : 1 - (pr - .35) / .65,
			flip: e.face === 1
		});
	}
	const target = opts.prompts ? interactTarget(w) : null;
	if (target) drawTag(f, `${target.verb} · ${target.label}`, X$1(f, p.x), groundY(f) - VH(f, p.y + 38), {
		bg: "rgba(212,164,90,0.96)",
		fg: "#0b0f14",
		size: 12,
		pad: 9
	});
	ctx.restore();
	ctx.save();
	if (ch.grade === "warm") {
		ctx.globalCompositeOperation = "overlay";
		ctx.fillStyle = "rgba(255,170,90,0.12)";
		ctx.fillRect(0, 0, W, H);
	} else if (ch.grade === "night") {
		ctx.globalCompositeOperation = "multiply";
		ctx.fillStyle = "rgba(120,140,210,0.55)";
		ctx.fillRect(0, 0, W, H);
	}
	ctx.restore();
	const hurtAge = w.t - p.hurtAt;
	if (hurtAge < .35) {
		ctx.save();
		ctx.globalAlpha = (1 - hurtAge / .35) * .55;
		const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7);
		g.addColorStop(0, "rgba(180,0,20,0)");
		g.addColorStop(1, "rgba(180,0,20,1)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
		ctx.restore();
	}
	if (w.t < w.slimedUntil) {
		ctx.save();
		ctx.globalAlpha = (w.slimedUntil - w.t) / .5 * .35;
		ctx.fillStyle = "#8fd46a";
		ctx.fillRect(0, 0, W, H);
		ctx.restore();
	}
	if (p.hp <= p.maxHp * .25 && p.hp > 0) {
		ctx.save();
		ctx.globalAlpha = .18 + Math.sin(w.t * 5) * .08;
		const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
		g.addColorStop(0, "rgba(180,0,20,0)");
		g.addColorStop(1, "rgba(180,0,20,1)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
		ctx.restore();
	}
	if (opts.objectiveX !== null) {
		const ox = opts.objectiveX;
		const off = ox < w.camX + 4 ? -1 : ox > w.camX + 96 ? 1 : 0;
		if (off !== 0) {
			const dist = Math.round(Math.abs(ox - p.x));
			const ex = off > 0 ? W - 30 : 30;
			const ey = H * .5;
			ctx.save();
			ctx.fillStyle = "rgba(212,164,90,0.95)";
			ctx.beginPath();
			if (off > 0) {
				ctx.moveTo(ex + 12, ey);
				ctx.lineTo(ex - 6, ey - 12);
				ctx.lineTo(ex - 6, ey + 12);
			} else {
				ctx.moveTo(ex - 12, ey);
				ctx.lineTo(ex + 6, ey - 12);
				ctx.lineTo(ex + 6, ey + 12);
			}
			ctx.closePath();
			ctx.fill();
			ctx.restore();
			drawTag(f, `${dist} m`, ex, ey + 22, {
				bg: "rgba(0,0,0,0.7)",
				fg: "#ffd27a",
				size: 10
			});
		}
	}
	for (const def of HAZARDS) {
		const e = w.enemies[def.id];
		if (opts.prompts && canTalk(e) && !e.chasing && Math.abs(e.x - p.x) < 16) drawTag(f, "E · Hablar", X$1(f, e.x), groundY(f) - VH(f, 44), {
			bg: "rgba(0,0,0,0.6)",
			size: 9
		});
	}
}
var ctx = null;
var master = null;
var noiseBuf = null;
var enabled = true;
var volume = .8;
var lastPlay = {};
function ensure() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const AC = window.AudioContext ?? window.webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
		master = ctx.createGain();
		master.gain.value = enabled ? volume : 0;
		master.connect(ctx.destination);
		const len = ctx.sampleRate * .6;
		noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
		const d = noiseBuf.getChannelData(0);
		for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
	}
	return ctx;
}
/** Call synchronously inside a user gesture. Safe to call many times. */
function unlockAudio() {
	const c = ensure();
	if (c && c.state === "suspended") c.resume();
}
function configureAudio(on, vol) {
	enabled = on;
	volume = vol;
	if (master && ctx) master.gain.setTargetAtTime(on ? vol : 0, ctx.currentTime, .02);
}
function tone(freq, dur, opts = {}) {
	const c = ctx;
	if (!c || !master) return;
	const t0 = c.currentTime + (opts.delay ?? 0);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = opts.type ?? "square";
	o.frequency.setValueAtTime(freq, t0);
	if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + dur);
	const a = opts.attack ?? .004;
	g.gain.setValueAtTime(1e-4, t0);
	g.gain.exponentialRampToValueAtTime(opts.gain ?? .2, t0 + a);
	g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
	o.connect(g).connect(master);
	o.start(t0);
	o.stop(t0 + dur + .02);
}
function noise(dur, opts = {}) {
	const c = ctx;
	if (!c || !master || !noiseBuf) return;
	const t0 = c.currentTime + (opts.delay ?? 0);
	const src = c.createBufferSource();
	src.buffer = noiseBuf;
	const f = c.createBiquadFilter();
	f.type = "lowpass";
	f.Q.value = opts.q ?? .8;
	f.frequency.setValueAtTime(opts.from ?? 4e3, t0);
	f.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to ?? 300), t0 + dur);
	const g = c.createGain();
	g.gain.setValueAtTime(opts.gain ?? .3, t0);
	g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
	src.connect(f).connect(g).connect(master);
	src.start(t0);
	src.stop(t0 + dur + .02);
}
var MIN_GAP = {
	shot: 40,
	hit: 60,
	coin: 30,
	blip: 30,
	alert: 800,
	hurt: 120
};
function sfx(name) {
	if (!enabled) return;
	const c = ensure();
	if (!c || c.state !== "running") return;
	const now = performance.now();
	const gap = MIN_GAP[name] ?? 0;
	if (gap && now - (lastPlay[name] ?? -1e9) < gap) return;
	lastPlay[name] = now;
	switch (name) {
		case "shot":
			noise(.14, {
				gain: .5,
				from: 6e3,
				to: 400
			});
			tone(180, .1, {
				type: "sawtooth",
				gain: .25,
				slide: 40
			});
			break;
		case "empty":
			tone(900, .04, {
				type: "square",
				gain: .12
			});
			tone(600, .05, {
				type: "square",
				gain: .1,
				delay: .06
			});
			break;
		case "punch":
			noise(.09, {
				gain: .35,
				from: 1200,
				to: 200
			});
			tone(120, .08, {
				type: "sine",
				gain: .3,
				slide: 50
			});
			break;
		case "slash":
			noise(.16, {
				gain: .3,
				from: 9e3,
				to: 1500,
				q: 2
			});
			break;
		case "hit":
			noise(.12, {
				gain: .4,
				from: 2500,
				to: 200
			});
			tone(90, .12, {
				type: "triangle",
				gain: .3,
				slide: 40
			});
			break;
		case "hurt":
			tone(320, .18, {
				type: "sawtooth",
				gain: .22,
				slide: 120
			});
			noise(.1, {
				gain: .2,
				from: 1500,
				to: 300
			});
			break;
		case "coin":
			tone(1046, .07, {
				type: "square",
				gain: .12
			});
			tone(1568, .14, {
				type: "square",
				gain: .12,
				delay: .06
			});
			break;
		case "pickup":
			tone(523, .08, {
				type: "triangle",
				gain: .2
			});
			tone(784, .1, {
				type: "triangle",
				gain: .2,
				delay: .08
			});
			tone(1046, .16, {
				type: "triangle",
				gain: .2,
				delay: .16
			});
			break;
		case "heal":
			tone(660, .12, {
				type: "sine",
				gain: .2
			});
			tone(880, .2, {
				type: "sine",
				gain: .2,
				delay: .1
			});
			break;
		case "jump":
			tone(300, .16, {
				type: "square",
				gain: .12,
				slide: 700
			});
			break;
		case "land":
			noise(.06, {
				gain: .15,
				from: 900,
				to: 120
			});
			break;
		case "boom":
			noise(.5, {
				gain: .7,
				from: 3e3,
				to: 60
			});
			tone(70, .4, {
				type: "sine",
				gain: .5,
				slide: 30
			});
			break;
		case "alert":
			tone(880, .08, {
				type: "square",
				gain: .15
			});
			tone(660, .08, {
				type: "square",
				gain: .15,
				delay: .09
			});
			tone(880, .12, {
				type: "square",
				gain: .15,
				delay: .18
			});
			break;
		case "blip":
			tone(1200, .03, {
				type: "square",
				gain: .08
			});
			break;
		case "ui":
			tone(700, .05, {
				type: "triangle",
				gain: .12
			});
			break;
		case "swap":
			tone(500, .05, {
				type: "square",
				gain: .1
			});
			tone(750, .07, {
				type: "square",
				gain: .1,
				delay: .05
			});
			break;
		case "recruit":
			[
				523,
				659,
				784,
				1046
			].forEach((f, i) => tone(f, .16, {
				type: "triangle",
				gain: .18,
				delay: i * .08
			}));
			break;
		case "win":
			[
				523,
				659,
				784,
				1046,
				784,
				1046,
				1318
			].forEach((f, i) => tone(f, .22, {
				type: "triangle",
				gain: .2,
				delay: i * .11
			}));
			break;
		case "ko": [
			440,
			415,
			392,
			330
		].forEach((f, i) => tone(f, .3, {
			type: "sawtooth",
			gain: .16,
			delay: i * .2
		}));
	}
}
function vibrate(ms) {
	if (typeof navigator === "undefined" || !navigator.vibrate) return;
	try {
		navigator.vibrate(ms);
	} catch {}
}
var world = null;
function getWorld() {
	return world;
}
var toastTimer = 0;
var loadToken = 0;
var emptyHud = {
	hp: 100,
	maxHp: 100,
	coins: 0,
	ammo: 0,
	weapon: "pistol",
	hasKnife: false,
	timer: 0,
	score: 0,
	kills: 0,
	falls: 0,
	combo: 0,
	zone: "",
	objective: "",
	objectiveX: null,
	checks: [],
	recruited: [],
	chasing: [],
	prompt: null,
	x: 0,
	width: 600,
	enemies: [],
	markers: []
};
function buildHud(w) {
	const prog = {
		recruited: w.recruited,
		items: w.items,
		hero: w.hero,
		chapter: w.chapter,
		fire: w.fire,
		examScore: w.examScore
	};
	const obj = objective(prog);
	const target = interactTarget(w);
	const ch = chapterOf(w.chapter);
	const markers = [];
	for (const p of ch.pickups) if (p.kind === "item" && !w.items.includes(p.id)) markers.push(p.x);
	return {
		hp: Math.round(w.player.hp),
		maxHp: w.player.maxHp,
		coins: w.coins,
		ammo: w.player.ammo,
		weapon: w.player.weapon,
		hasKnife: w.player.hasKnife,
		timer: Math.floor(w.timer),
		score: w.score,
		kills: w.kills,
		falls: w.falls,
		combo: w.combo,
		zone: zoneAt(w.chapter, w.player.x).name,
		objective: obj.text,
		objectiveX: obj.x,
		checks: checksFor(prog),
		recruited: [...w.recruited],
		chasing: HAZARDS.filter((h) => w.enemies[h.id].chasing && isAlive(w.enemies[h.id])).map((h) => h.name),
		prompt: target ? `${target.verb} · ${target.label}` : null,
		x: Math.round(w.player.x),
		width: w.width,
		enemies: HAZARDS.filter((h) => isAlive(w.enemies[h.id])).map((h) => ({
			x: Math.round(w.enemies[h.id].x),
			chasing: w.enemies[h.id].chasing
		})),
		markers
	};
}
function hudEqual(a, b) {
	return a.hp === b.hp && a.maxHp === b.maxHp && a.coins === b.coins && a.ammo === b.ammo && a.weapon === b.weapon && a.hasKnife === b.hasKnife && a.timer === b.timer && a.score === b.score && a.kills === b.kills && a.falls === b.falls && a.combo === b.combo && a.zone === b.zone && a.objective === b.objective && a.objectiveX === b.objectiveX && a.prompt === b.prompt && a.x === b.x && a.checks.every((c, i) => b.checks[i]?.ok === c.ok && b.checks[i]?.t === c.t) && a.recruited.join() === b.recruited.join() && a.chasing.join() === b.chasing.join() && a.markers.join() === b.markers.join() && a.enemies.length === b.enemies.length && a.enemies.every((e, i) => b.enemies[i].x === e.x && b.enemies[i].chasing === e.chasing);
}
function pushToast(msg) {
	useGame.setState({ toast: msg });
	if (toastTimer) window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => {
		useGame.setState({ toast: "" });
		toastTimer = 0;
	}, 2400);
}
function beginLoad(n) {
	const token = ++loadToken;
	useGame.setState({ loadProgress: 0 });
	preloadChapter(n, (p) => {
		if (token === loadToken) useGame.setState({ loadProgress: p });
	}).then(() => {
		if (token !== loadToken) return;
		if (useGame.getState().phase === "loading") useGame.setState({
			phase: "play",
			overlay: null
		});
	});
}
function finishMission() {
	const s = useGame.getState();
	const w = world;
	if (!w) return;
	const ch = chapterOf(w.chapter);
	const time = Math.floor(w.timer);
	const bonus = Math.max(0, Math.round((ch.parTime - w.timer) * 2));
	const score = w.score + bonus;
	const medal = w.timer < ch.parTime * .6 && w.falls === 0 ? "oro" : w.timer < ch.parTime ? "plata" : "bronce";
	const rec = s.save.missions[w.chapter];
	const newBestTime = rec.bestTime === null || time < rec.bestTime;
	const newBestScore = score > rec.bestScore;
	const save = {
		...s.save,
		hero: w.hero,
		totalCoins: s.save.totalCoins + w.coins,
		totalKills: s.save.totalKills + w.kills,
		missions: {
			...s.save.missions,
			[w.chapter]: {
				done: true,
				bestTime: newBestTime ? time : rec.bestTime,
				bestScore: Math.max(rec.bestScore, score),
				plays: rec.plays + 1
			}
		}
	};
	saveSave(save);
	w.ended = true;
	sfx("win");
	useGame.setState({
		save,
		result: {
			chapter: w.chapter,
			time,
			score,
			base: w.score,
			bonus,
			coins: w.coins,
			kills: w.kills,
			falls: w.falls,
			medal,
			newBestTime,
			newBestScore
		},
		overlay: null,
		talkKey: null,
		phase: "cinema",
		clip: {
			src: ch.outro.src,
			title: ch.outro.title,
			line: ch.outro.line,
			next: "win"
		}
	});
}
var useGame = create((set, get) => ({
	booted: false,
	phase: "title",
	overlay: null,
	hero: null,
	chapter: 1,
	clip: null,
	talkKey: null,
	line: 0,
	toast: "",
	hud: emptyHud,
	settings: DEFAULT_SETTINGS,
	save: DEFAULT_SAVE,
	loadProgress: 0,
	result: null,
	fps: 0,
	boot: () => {
		if (get().booted) return;
		const settings = loadSettings();
		const save = loadSave();
		configureAudio(settings.sound, settings.volume);
		set({
			booted: true,
			settings,
			save,
			hero: save.hero
		});
	},
	play: () => {
		unlockAudio();
		sfx("ui");
		set({
			phase: "cinema",
			clip: {
				src: "/cinema/intro.mp4",
				title: "Team UPAP y Juan",
				line: "Marcos coordina. Gallaguer pregunta. El asado no se arma solo.",
				next: "select",
				sound: true
			}
		});
	},
	continueGame: () => {
		unlockAudio();
		sfx("ui");
		const hero = get().save.hero;
		set({
			hero,
			phase: hero ? "missions" : "select"
		});
	},
	choose: (id) => {
		sfx("ui");
		const save = {
			...get().save,
			hero: id
		};
		saveSave(save);
		set({
			hero: id,
			save,
			phase: "missions"
		});
	},
	pickMissions: () => {
		sfx("ui");
		world = null;
		set({
			phase: "missions",
			overlay: null,
			talkKey: null,
			toast: "",
			clip: null
		});
	},
	goTitle: () => {
		world = null;
		set({
			phase: "title",
			overlay: null,
			talkKey: null,
			toast: "",
			clip: null
		});
	},
	goSelect: () => {
		sfx("ui");
		set({
			phase: "select",
			overlay: null
		});
	},
	startMission: (n) => {
		unlockAudio();
		sfx("ui");
		const hero = get().hero ?? "rafa";
		const ch = chapterOf(n);
		world = createWorld(n, hero, get().settings.difficulty);
		beginLoad(n);
		set({
			phase: "cinema",
			overlay: null,
			hero,
			chapter: n,
			talkKey: null,
			line: 0,
			toast: "",
			result: null,
			hud: buildHud(world),
			clip: {
				src: ch.intro.src,
				title: ch.intro.title,
				line: ch.intro.line,
				next: "play"
			}
		});
	},
	skipCinema: () => {
		const { clip, chapter } = get();
		const next = clip?.next ?? "play";
		if (next === "play") {
			if (!world) return set({
				phase: "missions",
				clip: null
			});
			if (isChapterLoaded(chapter)) {
				set({
					phase: "play",
					overlay: null,
					clip: null
				});
				pushToast("Saltá (W) para esquivar. E para hablar.");
			} else set({
				phase: "loading",
				clip: null
			});
			return;
		}
		set({
			phase: next,
			clip: next === "win" ? clip : null
		});
	},
	openOverlay: (o) => {
		flushInput();
		set({ overlay: o });
	},
	closeOverlay: () => {
		flushInput();
		const s = get();
		if (s.overlay === "options" || s.overlay === "help") {
			set({ overlay: s.phase === "play" ? "pause" : null });
			return;
		}
		set({ overlay: null });
	},
	togglePause: () => {
		const s = get();
		if (s.phase !== "play") return;
		flushInput();
		if (s.overlay === null) {
			sfx("ui");
			set({ overlay: "pause" });
		} else if (s.overlay === "pause") set({ overlay: null });
	},
	restartMission: () => {
		const s = get();
		if (!world) return;
		sfx("ui");
		world = createWorld(s.chapter, s.hero ?? "rafa", s.settings.difficulty);
		flushInput();
		set({
			overlay: null,
			talkKey: null,
			toast: "",
			hud: buildHud(world),
			phase: "play"
		});
	},
	quitToMenu: () => {
		sfx("ui");
		world = null;
		set({
			phase: "missions",
			overlay: null,
			talkKey: null,
			toast: "",
			clip: null
		});
	},
	retry: () => {
		if (!world) return;
		const ev = [];
		respawn(world, ev);
		get().handleEvents(ev);
		flushInput();
		set({ overlay: null });
	},
	setSettings: (patch) => {
		const settings = {
			...get().settings,
			...patch
		};
		saveSettings(settings);
		configureAudio(settings.sound, settings.volume);
		if (patch.sound !== void 0 || patch.volume !== void 0) {
			unlockAudio();
			sfx("ui");
		}
		set({ settings });
	},
	setDifficulty: (d) => {
		get().setSettings({ difficulty: d });
		sfx("ui");
	},
	resetProgress: () => {
		const save = {
			...DEFAULT_SAVE,
			missions: { ...DEFAULT_SAVE.missions }
		};
		saveSave(save);
		set({
			save,
			hero: null
		});
	},
	startTalk: (key) => {
		if (!TALKS[key]) return;
		flushInput();
		sfx("blip");
		set({
			overlay: "talk",
			talkKey: key,
			line: 0
		});
	},
	advance: (choice) => {
		const s = get();
		const w = world;
		if (!s.talkKey || !w) return;
		const script = TALKS[s.talkKey];
		const line = script[s.line];
		sfx("blip");
		const close = () => {
			closeTalk(w);
			set({
				overlay: null,
				talkKey: null,
				line: 0
			});
			get().syncHud();
		};
		if (line.choices && choice !== void 0 && line.choices[choice]) {
			const ev = [];
			const res = applyChoice(w, s.talkKey, s.line, line.choices[choice], ev);
			get().handleEvents(ev);
			if (res.next === "close") close();
			else if (res.next === "line") set({ line: s.line + 1 });
			else if (res.next === "talk") set({
				talkKey: res.key,
				line: 0
			});
			else if (res.next === "win") finishMission();
			return;
		}
		if (s.line + 1 < script.length) set({ line: s.line + 1 });
		else close();
	},
	dismissTalk: () => {
		const w = world;
		if (!w || get().overlay !== "talk") return;
		closeTalk(w);
		flushInput();
		set({
			overlay: null,
			talkKey: null,
			line: 0
		});
		get().syncHud();
	},
	handleEvents: (ev) => {
		if (!ev.length) return;
		const s = get();
		let hud = false;
		for (const e of ev) switch (e.t) {
			case "toast":
				pushToast(e.msg);
				break;
			case "sfx":
				sfx(e.name);
				break;
			case "vibrate":
				if (s.settings.vibrate) vibrate(e.ms);
				break;
			case "hud":
				hud = true;
				break;
			case "talk":
				get().startTalk(e.key);
				hud = true;
				break;
			case "ko":
				sfx("ko");
				flushInput();
				set({ overlay: "ko" });
				hud = true;
				break;
			case "win": finishMission();
		}
		if (hud) get().syncHud();
		ev.length = 0;
	},
	syncHud: () => {
		if (!world) return;
		const next = buildHud(world);
		if (!hudEqual(get().hud, next)) set({ hud: next });
	},
	setFps: (n) => {
		if (get().fps !== n) set({ fps: n });
	}
}));
function Btn({ children, onClick, variant = "primary", className = "", icon, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled,
		onClick: () => {
			unlockAudio();
			onClick?.();
		},
		className: `press flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-bold disabled:opacity-40 ${variant === "primary" ? "bg-accent text-accent-fg shadow-soft" : variant === "danger" ? "bg-red-700 text-white" : "bg-surface text-paper ring-1 ring-line"} ${className}`,
		children: [icon, children]
	});
}
function Screen({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex min-h-dvh flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${className}`,
		children
	});
}
function Eyebrow({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
		children
	});
}
function Modal({ title, onClose, children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex items-end justify-center bg-black/70 p-3 backdrop-blur-[2px] sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `modal-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-line ${wide ? "max-w-xl" : "max-w-md"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-5 pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: title
				}), onClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Cerrar",
					onClick: onClose,
					className: "press grid size-10 place-items-center rounded-full bg-elevated text-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-y-auto px-5 pb-5 pt-3",
				children
			})]
		})
	});
}
function Toggle({ label, hint, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "switch",
		"aria-checked": value,
		onClick: () => onChange(!value),
		className: "flex w-full items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-semibold text-paper",
			children: label
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs text-muted",
			children: hint
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-accent" : "bg-black/50"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-1 size-5 rounded-full bg-paper transition-transform ${value ? "translate-x-6" : "translate-x-1"}` })
		})]
	});
}
function Chips({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-elevated px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-paper",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(o.v),
				className: `press rounded-full px-3 py-1.5 text-sm font-semibold ${value === o.v ? "bg-accent text-accent-fg" : "bg-black/40 text-paper ring-1 ring-line"}`,
				children: o.t
			}, o.v))
		})]
	});
}
function OptionsPanel({ onClose }) {
	const settings = useGame((s) => s.settings);
	const set = useGame((s) => s.setSettings);
	const reset = useGame((s) => s.resetProgress);
	const phase = useGame((s) => s.phase);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "Opciones",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					label: phase === "play" ? "Dificultad (aplica en la próxima misión)" : "Dificultad",
					value: settings.difficulty,
					options: [
						{
							v: "facil",
							t: "Fácil"
						},
						{
							v: "normal",
							t: "Normal"
						},
						{
							v: "dificil",
							t: "Difícil"
						}
					],
					onChange: (v) => set({ difficulty: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-1 text-xs text-muted",
					children: settings.difficulty === "facil" ? "Enemigos lentos, menos daño, más balas." : settings.difficulty === "normal" ? "La experiencia pensada. Saltá para esquivar." : "Enemigos rápidos, daño alto, pocas balas y vuelven antes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Sonido",
					hint: "Efectos generados en el momento",
					value: settings.sound,
					onChange: (v) => set({ sound: v })
				}),
				settings.sound ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-3 rounded-2xl bg-elevated px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-paper",
						children: "Volumen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: Math.round(settings.volume * 100),
						onChange: (e) => set({ volume: Number(e.target.value) / 100 }),
						className: "flex-1 accent-accent"
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Vibración",
					hint: "En celulares compatibles",
					value: settings.vibrate,
					onChange: (v) => set({ vibrate: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Sangre y pedazos",
					hint: "Apagalo si preferís algo más suave",
					value: settings.gore,
					onChange: (v) => set({ gore: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Sacudida de pantalla",
					value: settings.shake,
					onChange: (v) => set({ shake: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					label: "Calidad gráfica",
					value: settings.quality,
					options: [
						{
							v: "auto",
							t: "Auto"
						},
						{
							v: "baja",
							t: "Baja"
						},
						{
							v: "alta",
							t: "Alta"
						}
					],
					onChange: (v) => set({ quality: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					label: "Controles táctiles",
					value: settings.touchControls,
					options: [
						{
							v: "auto",
							t: "Auto"
						},
						{
							v: "on",
							t: "Mostrar"
						},
						{
							v: "off",
							t: "Ocultar"
						}
					],
					onChange: (v) => set({ touchControls: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Zurdo",
					hint: "Botones de acción a la izquierda",
					value: settings.leftHanded,
					onChange: (v) => set({ leftHanded: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Mostrar FPS",
					value: settings.showFps,
					onChange: (v) => set({ showFps: v })
				}),
				phase !== "play" ? confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "danger",
						className: "flex-1",
						onClick: () => {
							reset();
							setConfirmReset(false);
						},
						children: "Sí, borrar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "ghost",
						className: "flex-1",
						onClick: () => setConfirmReset(false),
						children: "No"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: () => setConfirmReset(true),
					children: "Borrar progreso guardado"
				}) : null
			]
		})
	});
}
function Key({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: "inline-block rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[11px] text-paper ring-1 ring-line",
		children
	});
}
function HelpPanel({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "Cómo jugar",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 text-sm text-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-elevated p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Objetivo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							"Seguí la flecha dorada. Hablá con la gente (",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "E" }),
							"), agarrá lo que brilla y cumplí la lista de la misión. Si te queda sin vida volvés al inicio de la zona."
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-elevated p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Teclado"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "grid gap-1.5 text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "A" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "D" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "←" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "→" }),
								" moverse"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "W" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "↑" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "Espacio" }),
								" saltar (esquiva libros y slime)"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "J" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "K" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "X" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "F" }),
								" atacar · mantené para disparar seguido"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "E" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "Enter" }),
								" hablar / agarrar"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "Q" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "Tab" }),
								" cambiar de arma"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "Esc" }),
								" o ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "P" }),
								" pausa"
							] })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-elevated p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Táctil"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "Flechas para moverte o arrastrá el dedo en la mitad izquierda. Tocá la mitad derecha para disparar. Botones de saltar, arma y hablar abajo a la derecha."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-elevated p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Mando"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "Stick o cruceta mueve · A salta · X / RT ataca · B habla · LB/RB cambia arma · Start pausa."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-elevated p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Consejos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "grid gap-1.5 text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Masivo aguanta 3 balas. El cuchillo hace el doble de daño que el puño." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Los enemigos vuelven a los pocos segundos. Aprovechá para avanzar." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· El tereré cura. Las balas se agarran solas al pasar." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Las Gs suman puntos y el tiempo también: terminá rápido para medalla de oro." })
						]
					})]
				})
			]
		})
	});
}
function Title() {
	const play = useGame((s) => s.play);
	const cont = useGame((s) => s.continueGame);
	const save = useGame((s) => s.save);
	const overlay = useGame((s) => s.overlay);
	const open = useGame((s) => s.openOverlay);
	const close = useGame((s) => s.closeOverlay);
	const done = [
		1,
		2,
		3
	].filter((n) => save.missions[n].done).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh w-full overflow-hidden bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/splash.jpg",
				alt: "Team UPAP y Juan",
				className: "absolute inset-0 h-full w-full object-cover object-center"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-20",
				children: [
					save.hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-paper/80",
						children: [
							HERO_BY_ID[save.hero].name,
							" · ",
							done,
							"/3 misiones · ",
							save.totalCoins,
							" Gs juntadas"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: save.hero ? cont : play,
						className: "w-full max-w-xs py-4 text-lg",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 20 }),
						children: save.hero ? "Continuar" : "Jugar"
					}),
					save.hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "ghost",
						onClick: play,
						className: "w-full max-w-xs",
						children: "Ver intro y elegir de nuevo"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full max-w-xs gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "ghost",
							className: "flex-1",
							onClick: () => open("options"),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 18 }),
							children: "Opciones"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "ghost",
							className: "flex-1",
							onClick: () => open("help"),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { size: 18 }),
							children: "Cómo jugar"
						})]
					})
				]
			}),
			overlay === "options" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionsPanel, { onClose: close }) : null,
			overlay === "help" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, { onClose: close }) : null
		]
	});
}
function Select() {
	const choose = useGame((s) => s.choose);
	const current = useGame((s) => s.hero);
	const [sel, setSel] = (0, import_react.useState)(current ?? "rafa");
	const hero = HERO_BY_ID[sel];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Team UPAP" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl",
			children: "¿Quién sos hoy?"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Cada uno juega distinto. Tres misiones. El asado es apenas el principio."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
			children: HEROES.map((h) => {
				const active = h.id === sel;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setSel(h.id),
					className: `press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-2 ${active ? "ring-accent" : "ring-line"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "select-stage relative h-40 overflow-hidden bg-black",
						children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: h.reel,
							className: "pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_18%]",
							autoPlay: true,
							muted: true,
							loop: true,
							playsInline: true,
							preload: "metadata",
							poster: h.portrait
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: h.portrait,
							alt: "",
							className: "absolute inset-0 h-full w-full object-cover object-[center_18%] opacity-80"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg",
							children: h.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: h.tagline
						})]
					})]
				}, h.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-2xl bg-surface p-4 ring-1 ring-line",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold uppercase tracking-widest text-accent",
				children: [
					hero.role,
					" · ",
					hero.perk.label
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-3 gap-2 text-center text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-elevated py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-bold text-paper",
							children: hero.perk.hp
						}), "vida"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-elevated py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-lg font-bold text-paper",
							children: [Math.round(hero.perk.speed * 100), "%"]
						}), "velocidad"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-elevated py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-bold text-paper",
							children: hero.perk.ammo
						}), "balas base"]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-auto pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				onClick: () => choose(sel),
				className: "w-full py-4 text-lg",
				children: ["Jugar con ", hero.name]
			})
		})
	] });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Team UPAP" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Elegí la historia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [hero ? `Jugás como ${HERO_BY_ID[hero].name}.` : "", " Onichan molesta en las tres."]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Opciones",
					onClick: () => open("options"),
					className: "press grid size-10 place-items-center rounded-full bg-surface ring-1 ring-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 18 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Cómo jugar",
					onClick: () => open("help"),
					className: "press grid size-10 place-items-center rounded-full bg-surface ring-1 ring-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { size: 18 })
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: "Dificultad"
			}), [
				"facil",
				"normal",
				"dificil"
			].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setDifficulty(d),
				className: `press rounded-full px-3 py-1 text-xs font-semibold ${settings.difficulty === d ? "bg-accent text-accent-fg" : "bg-surface text-paper ring-1 ring-line"}`,
				children: TUNING[d].label
			}, d))]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-start",
			children: MISSIONS.map((m) => {
				const rec = save.missions[m.ch];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => start(m.ch),
					className: "press flex flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-28 overflow-hidden sm:h-36",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 bg-cover bg-center",
									style: { backgroundImage: `url(${m.img})` }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "absolute bottom-2 left-3 font-display text-2xl text-paper",
									children: m.title
								}),
								rec.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute right-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { size: 12 }), " Completada"]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2.5 text-sm leading-snug text-muted",
							children: m.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-3 pb-3 text-xs text-paper/70",
							children: [
								rec.bestTime !== null ? `Mejor tiempo ${formatTime(rec.bestTime)} · ` : "",
								rec.bestScore ? `Récord ${rec.bestScore} pts · ` : "",
								rec.plays ? `${rec.plays} ${rec.plays === 1 ? "intento" : "intentos"}` : "Sin jugar",
								" · ",
								"meta ",
								formatTime(chapterOf(m.ch).parTime)
							]
						})
					]
				}, m.ch);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "ghost",
				className: "flex-1",
				onClick: goSelect,
				children: "Cambiar personaje"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "ghost",
				className: "flex-1",
				onClick: goTitle,
				children: "Inicio"
			})]
		}),
		overlay === "options" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionsPanel, { onClose: close }) : null,
		overlay === "help" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, { onClose: close }) : null
	] });
}
function Cinema() {
	const clip = useGame((s) => s.clip);
	const skip = useGame((s) => s.skipCinema);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.code === "Enter" || e.code === "Space" || e.code === "Escape") {
				e.preventDefault();
				skip();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [skip]);
	if (!clip) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: skip,
		className: "relative block min-h-dvh w-full overflow-hidden bg-black",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			src: clip.src,
			className: "absolute inset-0 h-full w-full object-cover",
			autoPlay: true,
			playsInline: true,
			preload: "auto",
			muted: !clip.sound,
			onEnded: skip,
			onError: skip
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16 text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: clip.title }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-xl text-paper",
					children: clip.line
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg",
					children: "Saltar"
				})
			]
		})]
	});
}
function Loading() {
	const p = useGame((s) => s.loadProgress);
	const ch = chapterOf(useGame((s) => s.chapter));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col items-center justify-center bg-bg px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-cover bg-center opacity-30",
			style: { backgroundImage: `url(${ch.zones[0].bg})` }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: ch.title }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Cargando…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 h-3 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-accent transition-[width] duration-150",
						style: { width: `${Math.round(p * 100)}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted",
					children: [Math.round(p * 100), "% · saltá (W) para esquivar libros y slime"]
				})
			]
		})]
	});
}
function Win() {
	const pick = useGame((s) => s.pickMissions);
	const start = useGame((s) => s.startMission);
	const result = useGame((s) => s.result);
	const medalColor = result?.medal === "oro" ? "text-yellow-300" : result?.medal === "plata" ? "text-slate-200" : "text-amber-600";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col items-center justify-end overflow-hidden bg-bg px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/splash.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 w-full max-w-sm",
				children: [result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-in mb-3 rounded-3xl bg-surface/95 p-4 ring-1 ring-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Misión cumplida" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `mt-1 flex items-center gap-2 font-display text-3xl ${medalColor}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { size: 26 }),
								" Medalla de ",
								result.medal
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-elevated p-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-widest text-muted",
										children: "Tiempo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold text-paper",
										children: formatTime(result.time)
									}),
									result.newBestTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-accent",
										children: "¡Nuevo récord!"
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-elevated p-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-widest text-muted",
										children: "Puntos"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold text-paper",
										children: result.score
									}),
									result.newBestScore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-accent",
										children: "¡Nuevo récord!"
									}) : null
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Base: ", result.base] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Bonus tiempo: +", result.bonus] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Gs: ", result.coins] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Bajas: ", result.kills] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Caídas: ", result.falls] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Meta: ", formatTime(chapterOf(result.chapter).parTime)] })
							]
						})
					]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: pick,
						className: "w-full py-4 text-lg",
						children: "Otra misión"
					}), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "ghost",
						onClick: () => start(result.chapter),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 18 }),
						children: "Repetir esta misión"
					}) : null]
				})]
			})
		]
	});
}
function Talk() {
	const talkKey = useGame((s) => s.talkKey);
	const idx = useGame((s) => s.line);
	const advance = useGame((s) => s.advance);
	const [shown, setShown] = (0, import_react.useState)(0);
	const line = talkKey ? TALKS[talkKey][idx] : null;
	const text = line?.text ?? "";
	(0, import_react.useEffect)(() => {
		setShown(0);
		if (!text) return;
		let i = 0;
		const id = window.setInterval(() => {
			i += 2;
			setShown(i);
			if (i >= text.length) window.clearInterval(id);
		}, 16);
		return () => window.clearInterval(id);
	}, [
		text,
		idx,
		talkKey
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
	}, [
		line,
		advance,
		shown,
		text.length
	]);
	if (!talkKey || !line) return null;
	const face = line.who === "narrator" ? null : HERO_BY_ID[line.who] ?? HAZARD_BY_ID[line.who] ?? null;
	const complete = shown >= text.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "modal-in mx-auto max-w-lg rounded-2xl bg-surface/95 p-3 ring-1 ring-line",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [face ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: face.portrait,
					alt: "",
					className: "size-14 rounded-xl object-cover"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-accent",
						children: face ? face.name : "Misión"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 min-h-[2.6em] text-sm leading-snug text-paper",
						onClick: () => setShown(text.length),
						children: [text.slice(0, shown), !complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-accent",
							children: "▌"
						}) : null]
					})]
				})]
			}), line.choices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: line.choices.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "press flex min-h-11 items-center gap-2 rounded-xl bg-accent px-3 text-left text-sm font-medium text-accent-fg",
					onClick: () => advance(i),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-6 shrink-0 place-items-center rounded-full bg-black/20 text-xs font-bold",
						children: i + 1
					}), c.label]
				}, c.label))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "press mt-3 h-12 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg",
				onClick: () => complete ? advance() : setShown(text.length),
				children: complete ? "Seguir" : "…"
			})]
		})
	});
}
function PadButton({ label, icon, onDown, onUp, size = "size-16", className = "" }) {
	const down = (e) => {
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture?.(e.pointerId);
		unlockAudio();
		onDown();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: `pad pointer-events-auto grid ${size} place-items-center rounded-full text-paper ${className}`,
		onPointerDown: down,
		onPointerUp: onUp,
		onPointerCancel: onUp,
		onLostPointerCapture: onUp,
		onContextMenu: (e) => e.preventDefault(),
		children: icon
	});
}
function TouchControls() {
	const prompt = useGame((s) => s.hud.prompt);
	const weapon = useGame((s) => s.hud.weapon);
	const ammo = useGame((s) => s.hud.ammo);
	const leftHanded = useGame((s) => s.settings.leftHanded);
	const move = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex items-end gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadButton, {
			label: "Izquierda",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 30 }),
			onDown: () => setPad("left", true),
			onUp: () => setPad("left", false),
			size: "size-[4.4rem]",
			className: "bg-black/55"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadButton, {
			label: "Derecha",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 30 }),
			onDown: () => setPad("right", true),
			onUp: () => setPad("right", false),
			size: "size-[4.4rem]",
			className: "bg-black/55"
		})]
	});
	const act = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex flex-col items-end gap-2",
		children: [prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "press pointer-events-auto flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-soft",
			onPointerDown: (e) => {
				e.stopPropagation();
				unlockAudio();
				press("interact");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { size: 16 }),
				" ",
				prompt
			]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadButton, {
					label: "Cambiar arma",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { size: 20 }),
					onDown: () => press("swap"),
					size: "size-12",
					className: "bg-black/55 text-xs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadButton, {
					label: "Saltar",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold",
						children: "Saltar"
					}),
					onDown: () => press("jump"),
					size: "size-16",
					className: "bg-black/60 ring-2 ring-paper/30"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadButton, {
				label: "Atacar",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex flex-col items-center leading-none",
					children: [weapon === "pistol" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { size: 26 }) : weapon === "knife" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { size: 26 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { size: 26 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-[11px] font-bold",
						children: weapon === "pistol" ? `${ammo}` : WEAPON_NAME[weapon]
					})]
				}),
				onDown: () => {
					pads.attack = true;
					press("attack");
				},
				onUp: () => {
					pads.attack = false;
				},
				size: "size-20",
				className: "bg-accent text-accent-fg shadow-soft"
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pointer-events-none absolute inset-x-0 bottom-[max(0.6rem,env(safe-area-inset-bottom))] z-20 flex items-end justify-between px-4 ${leftHanded ? "flex-row-reverse" : ""}`,
		children: [move, act]
	});
}
function MiniMap() {
	const x = useGame((s) => s.hud.x);
	const width = useGame((s) => s.hud.width);
	const objectiveX = useGame((s) => s.hud.objectiveX);
	const enemies = useGame((s) => s.hud.enemies);
	const markers = useGame((s) => s.hud.markers);
	const zones = chapterOf(useGame((s) => s.chapter)).zones;
	const pct = (v) => `${v / width * 100}%`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none relative mx-auto mt-1 h-2.5 w-full max-w-md rounded-full bg-black/60 ring-1 ring-line",
		children: [
			zones.map((z, i) => i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-0 h-full w-px bg-paper/25",
				style: { left: pct(i * 100) }
			}, z.id) : null),
			markers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/60",
				style: { left: pct(m) }
			}, m)),
			enemies.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${e.chasing ? "bg-red-500" : "bg-red-400/60"}`,
				style: { left: pct(e.x) }
			}, i)),
			objectiveX !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent",
				style: { left: pct(objectiveX) }
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper ring-2 ring-black/60",
				style: { left: pct(x) }
			})
		]
	});
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
	const hpColor = hpFrac > .5 ? "bg-emerald-400" : hpFrac > .25 ? "bg-amber-400" : "bg-red-500";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-10 px-2 pt-[max(0.4rem,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-[46%] rounded-xl bg-black/70 px-2.5 py-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-accent",
						children: [
							ch.title,
							" · ",
							zone
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "objective-pop font-display text-[14px] leading-tight text-paper",
						children: chasing.length ? `¡${chasing.join(" y ")} te persigue!` : objective
					}, objective),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 flex flex-wrap gap-x-2 gap-y-0.5",
						children: checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `text-[9px] ${c.ok ? "text-accent" : "text-paper/60"}`,
							children: [
								c.ok ? "✓" : "○",
								" ",
								c.t
							]
						}, c.t))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-end gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [TEAM.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: HERO_BY_ID[id].portrait,
							alt: "",
							draggable: false,
							className: id === hero || recruited.includes(id) ? "size-7 rounded-full object-cover ring-2 ring-accent" : "size-7 rounded-full object-cover opacity-30 grayscale"
						}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Pausa",
							onClick: togglePause,
							className: "pointer-events-auto ml-1 grid size-9 place-items-center rounded-full bg-black/70 text-paper ring-1 ring-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 text-[11px] font-semibold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-md bg-black/70 px-2 py-1 text-accent",
								children: [coins, " Gs"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-md bg-black/70 px-2 py-1 text-paper",
								children: formatTime(timer)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-md bg-black/70 px-2 py-1 text-paper",
								children: [
									score,
									" pts",
									combo > 1 ? ` x${combo}` : ""
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-paper",
								children: [weapon === "pistol" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { size: 13 }) : weapon === "knife" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { size: 13 }), weapon === "pistol" ? `${ammo} balas` : WEAPON_NAME[weapon]]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-5 w-28 overflow-hidden rounded-md bg-black/70 ring-1 ring-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full ${hpColor} transition-[width] duration-200`,
									style: { width: `${hpFrac * 100}%` }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute inset-0 grid place-items-center text-[10px] font-bold text-white drop-shadow",
									children: [
										hp,
										"/",
										maxHp
									]
								})]
							}),
							showFps ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-md bg-black/70 px-1.5 py-1 text-[10px] text-muted",
								children: [fps, " fps"]
							}) : null
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap, {})]
	});
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
	if (overlay === "options") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionsPanel, { onClose: close });
	if (overlay === "help") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, { onClose: close });
	if (overlay === "ko") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: "Te agarraron",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: ["Volvés al inicio de la zona con toda la vida. Perdés 5 Gs y 100 puntos.", falls >= 2 ? " Consejo: saltá (W) para esquivar libros y slime, y disparale a Masivo desde lejos." : ""]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: retry,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 18 }),
					children: "Reintentar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: restart,
					children: "Reiniciar misión"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: quit,
					children: "Salir al menú"
				})
			]
		})]
	});
	if (overlay !== "pause") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "Pausa",
		onClose: togglePause,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: togglePause,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 18 }),
					children: "Reanudar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: () => open("options"),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 18 }),
					children: "Opciones"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: () => open("help"),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { size: 18 }),
					children: "Cómo jugar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: restart,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 18 }),
					children: "Reiniciar misión"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "danger",
					onClick: quit,
					children: "Salir al menú"
				})
			]
		})
	});
}
function pickDpr(quality) {
	const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
	if (quality === "baja") return 1;
	if (quality === "alta") return Math.min(3, dpr);
	const cap = (typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4) <= 4 ? 1.5 : 2;
	return Math.min(cap, dpr);
}
function Play$1() {
	const canvasRef = (0, import_react.useRef)(null);
	const hostRef = (0, import_react.useRef)(null);
	const toast = useGame((s) => s.toast);
	const overlay = useGame((s) => s.overlay);
	const quality = useGame((s) => s.settings.quality);
	const touchPref = useGame((s) => s.settings.touchControls);
	const [touch, setTouch] = (0, import_react.useState)(false);
	const touchRef = (0, import_react.useRef)(false);
	const dprRef = (0, import_react.useRef)(1);
	const sizeRef = (0, import_react.useRef)({
		W: 1,
		H: 1
	});
	(0, import_react.useEffect)(() => {
		const on = touchPref === "on" || touchPref === "auto" && isTouchDevice();
		touchRef.current = on;
		setTouch(on);
	}, [touchPref]);
	(0, import_react.useEffect)(() => bindKeys(), []);
	(0, import_react.useEffect)(() => {
		window.__controlsTest = {
			getX: () => getWorld()?.player.x ?? 0,
			getYaw: () => getWorld()?.player.x ?? 0,
			getSpeed: () => pads.left || pads.right || Math.abs(axis()) > 0 ? getWorld()?.player.speed ?? 60 : 0,
			setKeys
		};
		return () => {
			delete window.__controlsTest;
		};
	}, []);
	const resize = (0, import_react.useCallback)(() => {
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
		sizeRef.current = {
			W,
			H
		};
	}, []);
	(0, import_react.useEffect)(() => {
		dprRef.current = pickDpr(quality);
		resize();
	}, [quality, resize]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		const ro = new ResizeObserver(() => resize());
		ro.observe(host);
		resize();
		return () => ro.disconnect();
	}, [resize]);
	(0, import_react.useEffect)(() => {
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
		const ev = [];
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min(.05, (now - last) / 1e3);
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
				prompts: !touchRef.current
			});
			frames++;
			const ft = performance.now() - now;
			if (s.settings.quality === "auto") {
				if (ft > 20) slowFrames++;
				else if (ft < 9) fastFrames++;
				if (slowFrames > 45 && dprRef.current > 1) {
					dprRef.current = Math.max(1, dprRef.current - .25);
					slowFrames = 0;
					fastFrames = 0;
					resize();
				} else if (fastFrames > 600 && dprRef.current < pickDpr("auto")) {
					dprRef.current = Math.min(pickDpr("auto"), dprRef.current + .25);
					fastFrames = 0;
					resize();
				}
			}
			if (now - fpsAt >= 1e3) {
				s.setFps(Math.round(frames * 1e3 / (now - fpsAt)));
				frames = 0;
				fpsAt = now;
			}
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [resize]);
	const dragRef = (0, import_react.useRef)(null);
	const onDown = (e) => {
		unlockAudio();
		if (e.pointerType === "mouse") return;
		e.preventDefault();
		const half = e.currentTarget.clientWidth / 2;
		if (useGame.getState().settings.leftHanded ? e.clientX > half : e.clientX < half) {
			dragRef.current = {
				id: e.pointerId,
				x: e.clientX
			};
			e.currentTarget.setPointerCapture?.(e.pointerId);
		} else {
			pads.attack = true;
			press("attack");
		}
	};
	const onMove = (e) => {
		const d = dragRef.current;
		if (!d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.x;
		swipe.dir = dx > 14 ? 1 : dx < -14 ? -1 : 0;
	};
	const onUp = (e) => {
		const d = dragRef.current;
		if (d && d.id === e.pointerId) {
			dragRef.current = null;
			swipe.dir = 0;
		} else pads.attack = false;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: hostRef,
		className: "game-root relative h-dvh w-full overflow-hidden bg-bg",
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 block touch-none select-none",
				onPointerDown: onDown,
				onPointerMove: onMove,
				onPointerUp: onUp,
				onPointerCancel: onUp
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-alert pointer-events-none absolute left-1/2 top-[7.5rem] z-20 w-max max-w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 px-4 py-2 text-center text-sm",
				children: toast
			}, toast) : null,
			touch && overlay !== "talk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}) : null,
			!touch && overlay === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pointer-events-none absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-paper/80",
				children: ["A/D mover · W saltar · J atacar · E hablar · Q arma · Esc pausa", hasGamepad() ? " · mando conectado" : ""]
			}) : null,
			overlay === "talk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Talk, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseMenu, {}),
			overlay === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, {
					size: 12,
					className: "mr-1 inline"
				}), " Pausa"]
			}) : null
		]
	});
}
function Game() {
	const booted = useGame((s) => s.booted);
	const boot = useGame((s) => s.boot);
	const phase = useGame((s) => s.phase);
	(0, import_react.useEffect)(() => {
		boot();
	}, [boot]);
	(0, import_react.useEffect)(() => {
		const unlock = () => unlockAudio();
		window.addEventListener("pointerdown", unlock);
		window.addEventListener("keydown", unlock);
		return () => {
			window.removeEventListener("pointerdown", unlock);
			window.removeEventListener("keydown", unlock);
		};
	}, []);
	if (!booted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (phase === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {});
	if (phase === "select") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {});
	if (phase === "missions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Missions, {});
	if (phase === "cinema") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cinema, {});
	if (phase === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (phase === "win") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Win, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play$1, {});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { Home as component };
