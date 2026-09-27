import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDelivery, parseInbound } from "./kapso";
import { DEFLECT_REPLY, parseReply } from "./jesus-agent";

const conversation = { phone_number: "595981123456", contact_name: "Ana", phone_number_id: "111" };
const wrap = (message: Record<string, unknown>) => ({ message, conversation, phone_number_id: "111" });

test("texto simple", () => {
  const m = parseInbound(wrap({ id: "wamid.1", timestamp: "10", type: "text", from: "595981123456", text: { body: " Hola " } }));
  assert.equal(m?.text, "Hola");
  assert.equal(m?.type, "text");
  assert.equal(m?.contactName, "Ana");
  assert.equal(parseInbound({ message: { type: "text" } }), null);
});

test("audio con transcripción de Kapso y URL del adjunto", () => {
  const m = parseInbound(
    wrap({
      id: "wamid.a",
      timestamp: "11",
      type: "audio",
      from: "595981123456",
      audio: { id: "media1", mime_type: "audio/ogg; codecs=opus" },
      kapso: { transcript: { text: "hoy estoy muy cansado" }, media_url: "https://files.kapso/voice.ogg" },
    }),
  );
  assert.equal(m?.transcript, "hoy estoy muy cansado");
  assert.equal(m?.mediaUrl, "https://files.kapso/voice.ogg");
  assert.match(m?.mimeType ?? "", /ogg/);
});

test("foto con epígrafe y media_data", () => {
  const m = parseInbound(
    wrap({
      id: "wamid.i",
      timestamp: "12",
      type: "image",
      from: "595981123456",
      image: { id: "media2", caption: "mi mamá" },
      kapso: { media_data: { url: "https://files.kapso/foto.jpg", content_type: "image/jpeg" } },
    }),
  );
  assert.equal(m?.caption, "mi mamá");
  assert.equal(m?.mediaUrl, "https://files.kapso/foto.jpg");
  assert.equal(m?.mimeType, "image/jpeg");
});

test("reacción de la persona", () => {
  const m = parseInbound(
    wrap({ id: "wamid.r", timestamp: "13", type: "reaction", from: "595981123456", reaction: { message_id: "wamid.out", emoji: "🙏" } }),
  );
  assert.deepEqual(m?.reaction, { messageId: "wamid.out", emoji: "🙏" });
});

test("lote con buffering: ordena la ráfaga por tiempo", () => {
  const batch = {
    type: "whatsapp.message.received",
    batch: true,
    data: [
      wrap({ id: "wamid.3", timestamp: "30", type: "text", from: "595981123456", text: { body: "tercero" } }),
      wrap({ id: "wamid.1", timestamp: "10", type: "text", from: "595981123456", text: { body: "primero" } }),
      wrap({ id: "wamid.2", timestamp: "20", type: "text", from: "595981123456", text: { body: "segundo" } }),
    ],
    batch_info: { size: 3 },
  };
  assert.deepEqual(parseDelivery(batch).map((m) => m.text), ["primero", "segundo", "tercero"]);
  const single = wrap({ id: "wamid.9", timestamp: "1", type: "text", from: "595981123456", text: { body: "uno" } });
  assert.equal(parseDelivery(single).length, 1);
  assert.equal(parseDelivery({ batch: true, data: [] }).length, 0);
});

test("salida estructurada: burbujas, reacción válida y barrera de voz", () => {
  const ok = parseReply(
    JSON.stringify({ messages: ["Estoy acá.", "Contame más."], reaction_to: 2, reaction_emoji: "🙏" }),
    2,
  );
  assert.deepEqual(ok, { messages: ["Estoy acá.", "Contame más."], reaction: { index: 1, emoji: "🙏" } });
  const noReact = parseReply(JSON.stringify({ messages: ["Hola."], reaction_to: 0, reaction_emoji: "none" }), 1);
  assert.equal(noReact.reaction, null);
  const outOfRange = parseReply(JSON.stringify({ messages: ["Hola."], reaction_to: 5, reaction_emoji: "❤️" }), 1);
  assert.equal(outOfRange.reaction, null);
  const leak = parseReply(JSON.stringify({ messages: ["Como modelo de OpenAI…", "otra"], reaction_to: 0, reaction_emoji: "none" }), 1);
  assert.deepEqual(leak.messages, [DEFLECT_REPLY]);
  const four = parseReply(JSON.stringify({ messages: ["a.", "b.", "c.", "d."], reaction_to: 0, reaction_emoji: "none" }), 1);
  assert.equal(four.messages.length, 3);
  assert.deepEqual(parseReply("texto suelto", 1).messages, ["texto suelto"]);
});
