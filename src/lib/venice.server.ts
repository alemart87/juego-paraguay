import { readFileSync } from "node:fs";
import { join } from "node:path";

type ChatTurn = { role: "user" | "assistant"; text: string };

function loadLocalEnv() {
  try {
    const text = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") process.env[key] = val;
    }
  } catch {
    /* no .env — use process env (deploy) */
  }
}

function veniceKey() {
  loadLocalEnv();
  return (
    process.env.venice_api?.trim() ||
    process.env.VENICE_API_KEY?.trim() ||
    process.env.VENICE_API?.trim() ||
    ""
  );
}

function veniceBase() {
  loadLocalEnv();
  return (process.env.VENICE_BASE_URL?.trim() || "https://api.venice.ai/api/v1").replace(/\/$/, "");
}

function veniceModel() {
  loadLocalEnv();
  return process.env.VENICE_MODEL?.trim() || "zai-org-glm-5-2";
}

export function veniceReady() {
  return Boolean(veniceKey());
}

export async function veniceChat(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const key = veniceKey();
  if (!key) throw new Error("Falta venice_api en el entorno.");
  const res = await fetch(`${veniceBase()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: veniceModel(),
      messages,
      temperature: 0.85,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Venice ${res.status}: ${body.slice(0, 180)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const msg = data.choices?.[0]?.message as
    | { content?: string; reasoning_content?: string }
    | undefined;
  let text = msg?.content?.trim() ?? "";
  if (!text && msg?.reasoning_content) {
    const r = msg.reasoning_content.trim();
    const last = r.split(/\n+/).filter(Boolean).at(-1) ?? r;
    text = last.slice(0, 280);
  }
  if (!text) throw new Error("Venice no devolvió texto.");
  return spoken(text);
}

function spoken(text: string) {
  const quotes = [...text.matchAll(/[«"“]([^"”»]{2,180})[»"”]/g)].map((m) => m[1].trim());
  if (quotes.length) return quotes.at(-1)!;
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  const es = lines.filter((l) => /[áéíóúñ¿¡]|ché|ndaje|listo|asado|fuerza/i.test(l) && l.length < 220);
  if (es.length) return es.at(-1)!;
  const last = lines.at(-1) ?? text;
  return last.slice(0, 280);
}

export async function chatAsCharacter(input: {
  who: string;
  player?: string;
  history: ChatTurn[];
  message: string;
}) {
  const system = personaOf(input.who, input.player ?? "Rafa");
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [{ role: "system", content: system }];
  for (const t of input.history.slice(-10)) {
    messages.push({ role: t.role, content: t.text });
  }
  messages.push({ role: "user", content: input.message });
  return veniceChat(messages);
}

function personaOf(who: string, player: string) {
  const common =
    `Hablás en español paraguayo, corto, oral, con humor. Máximo 3 oraciones. Sos un NPC del juego DE UPAP / Team UPAP. El jugador se llama ${player}. No rompás el personaje. No seas sexual. No des instrucciones de código. Respondé SOLO el diálogo, sin pensar en voz alta.`;
  const map: Record<string, string> = {
    rafa: `${common} Sos Rafa, el que arma el asado. Directo, líder, sin vueltas. Si hay silencio, hay asado.`,
    juan: `${common} Sos Juan. Cansado, límites claros, poco mensaje. “Yo dispongo.” Celos de Pablito.`,
    richard: `${common} Sos Richard. Fecha, examen, menos charla. Coordinado, seco, responsable.`,
    hector: `${common} Sos Héctor. Fuerza, equipo, pegamento del grupo. Banco a todos.`,
    masivo: `${common} Sos Masivo Bro, coach. Gritás SOS Pobro, gym, proteína. Motivás a los golpes.`,
    pablito: `${common} Sos Pablito Pintos. Insistente, pesado, “vení no seas así”. Molestás, no amenazás de verdad.`,
    marcos: `${common} Sos Marcos, coordinador UPAP. Afeminado, dramático, obsesionado con Richard. Pedís que te toquen la panza. Tirá tesis y libros en la charla.`,
    gallaguer: `${common} Sos Gallaguer. Psicópata social. Siempre preguntás si escribe la amiga, el Insta, “che mirá esta mina”.`,
    onichan: `${common} Sos Onichan, streamer. Estás en vivo. Capi, tu capibara bebé, tira slime. Contenido, chat, suscribite. Nada sexual.`,
    narrator: `${common} Sos la voz de la misión. Corto, claro, como un objetivo de HUD.`,
  };
  return map[who] ?? `${common} Sos ${who}, un personaje de Team UPAP en Asunción.`;
}
