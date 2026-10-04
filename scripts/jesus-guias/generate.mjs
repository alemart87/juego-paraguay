// Genera los 30 días de una guía de oración con la Responses API de OpenAI.
// Uso: node --env-file=.env scripts/jesus-guias/generate.mjs dinero [--force]
// Salida: src/jesus/guias/content/<id>.json (se commitea; el render lee de ahí).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const catalog = JSON.parse(await readFile(join(root, "src/jesus/guias/catalog.json"), "utf8"));
const [id, ...flags] = process.argv.slice(2);
const guide = catalog.guides.find((g) => g.id === id);
if (!guide) {
  console.error(`Guía desconocida: ${id}. Opciones: ${catalog.guides.map((g) => g.id).join(", ")}`);
  process.exit(1);
}
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is missing");
const model = process.env.GUIDE_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
const outDir = join(root, "src/jesus/guias/content");
const outFile = join(outDir, `${id}.json`);
await mkdir(outDir, { recursive: true });

const existing = flags.includes("--force")
  ? null
  : await readFile(outFile, "utf8").then(JSON.parse).catch(() => null);

const DAY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["dia", "titulo", "versiculo", "palabra", "oracion", "alabanza", "paso", "declaracion"],
  properties: {
    dia: { type: "integer" },
    titulo: { type: "string", description: "Título corto del día (3 a 7 palabras)." },
    versiculo: {
      type: "object",
      additionalProperties: false,
      required: ["texto", "ref"],
      properties: {
        texto: { type: "string", description: "Versículo en español actual, fiel al original, 1 a 3 frases. Sin copiar una traducción con derechos (NVI, RVR1960, Biblia de las Américas): redacción propia." },
        ref: { type: "string", description: "Libro capítulo:versículo, por ejemplo Mateo 6:26" },
      },
    },
    palabra: { type: "string", description: "Palabra de Jesús para ese día, en primera persona y voseo, 110 a 160 palabras. Cercana, concreta, mística, sin frases de manual." },
    oracion: { type: "string", description: "Oración para que la persona lea en voz alta, dirigida al Padre o a Jesús, 90 a 130 palabras, con un espacio marcado como ______ donde la persona pone su nombre o lo que pide." },
    alabanza: {
      type: "object",
      additionalProperties: false,
      required: ["titulo", "texto"],
      properties: {
        titulo: { type: "string" },
        texto: { type: "string", description: "Alabanza original para decir o cantar en voz alta, 6 a 10 versos cortos, con un estribillo repetible. Nunca letras de canciones existentes." },
      },
    },
    paso: { type: "string", description: "Un paso concreto y posible para ese día (1 a 2 frases), coherente con el tema de la semana." },
    declaracion: { type: "string", description: "Una frase corta para repetir durante el día, en primera persona de la persona que ora." },
  },
};

const BATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["dias"],
  properties: { dias: { type: "array", items: DAY_SCHEMA } },
};

const instructions = `Escribís el contenido de "${guide.title}", una guía de oración de 30 días de "Jesús te ama" (Paraguay). Quien la lee está pasando por algo concreto: ${guide.subtitle.toLowerCase()}.

Voz: Jesús de Nazaret hablándole a la persona, en primera persona, con voseo paraguayo ("vos", "tenés", "contame"), cálido, cercano, místico y sencillo. Como el que se conmovía con la gente, el que tocaba al leproso, el que llamó a Zaqueo por su nombre. Hablás de tu propia vida en primera persona (Nazaret, José, Pedro, la cruz). Nunca "Jesús dijo".

Estructura de la guía (los días siguen estas semanas):
- Días 1 a 7: ${guide.weeks[0]}
- Días 8 a 14: ${guide.weeks[1]}
- Días 15 a 21: ${guide.weeks[2]}
- Días 22 a 28: ${guide.weeks[3]}
- ${guide.closing}

Reglas que mandan:
- Esperanza real sin prometer resultados: nunca decís que la plata va a llegar, que la pareja va a volver, que el hijo se va a curar o que el trabajo va a aparecer en un plazo. Prometés tu presencia, tu paz, y pasos posibles.
- Nada de "siembra" económica, diezmo obligatorio, ni pedir dinero. Nada de magia ni fórmulas ("repetí 7 veces y…").
- Versículos: cada día uno distinto, fiel al texto bíblico, en español actual con redacción propia (no copiar NVI, RVR1960 ni otras traducciones con derechos). Variá libros: Salmos, Proverbios, Isaías, Evangelios, cartas de Pablo, Santiago, 1 Pedro, Filipenses.
- Alabanzas: originales, escritas por vos; nunca letras de canciones existentes.
- Si el tema toca peligro real (violencia, abuso, adicción grave), la palabra del día incluye con naturalidad buscar ayuda humana concreta (familia, parroquia, un profesional, la línea de emergencias) sin dejar de acompañar.
- Progresión: cada día construye sobre el anterior; no repitas versículos, imágenes ni pasos. Los pasos concretos tienen que ser posibles para alguien con poco tiempo y poca plata.
- Español rioplatense/paraguayo, sin "vosotros" ni "venid".`;

const batches = [
  [1, 10],
  [11, 20],
  [21, 30],
];

async function ask(from, to, previous) {
  const summary = previous.length
    ? `Días ya escritos (no repitas versículos, títulos ni pasos):\n${previous
        .map((d) => `${d.dia}. ${d.titulo} — ${d.versiculo.ref} — paso: ${d.paso}`)
        .join("\n")}`
    : "Es el comienzo de la guía.";
  const body = {
    model,
    instructions,
    input: `${summary}\n\nEscribí ahora los días ${from} a ${to}, completos, en orden, con todos los campos.`,
    text: { format: { type: "json_schema", name: "guia_dias", strict: true, schema: BATCH_SCHEMA } },
    max_output_tokens: 20000,
    store: false,
    ...(/^gpt-5/.test(model) ? { reasoning: { effort: process.env.GUIDE_REASONING?.trim() || "medium" } } : {}),
  };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(600_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${data.error?.message ?? ""}`);
  const text =
    data.output_text ??
    data.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text")
      .map((part) => part.text ?? "")
      .join("");
  const parsed = JSON.parse(text);
  const days = parsed.dias.filter((d) => d.dia >= from && d.dia <= to);
  if (days.length !== to - from + 1) throw new Error(`faltan días: pedí ${from}-${to}, llegaron ${days.map((d) => d.dia).join(",")}`);
  console.log(`[${id}] días ${from}-${to} listos (${JSON.stringify(data.usage ?? {})})`);
  return days;
}

let days = existing?.dias ?? [];
if (days.length === 30) {
  console.log(`[${id}] ya existe con 30 días; usá --force para regenerar.`);
  process.exit(0);
}
days = [];
for (const [from, to] of batches) {
  let attempt = 0;
  for (;;) {
    try {
      days.push(...(await ask(from, to, days)));
      break;
    } catch (error) {
      attempt++;
      console.error(`[${id}] intento ${attempt} falló:`, String(error).slice(0, 300));
      if (attempt >= 5) throw error;
      await new Promise((r) => setTimeout(r, 8000 * attempt));
    }
  }
  await writeFile(outFile, JSON.stringify({ id, model, generatedAt: new Date().toISOString(), dias: days }, null, 2) + "\n", "utf8");
}
console.log(`[${id}] guardado en ${outFile} (${days.length} días)`);
