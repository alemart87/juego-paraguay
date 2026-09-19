import { createServerFn } from "@tanstack/react-start";

export type AgentTurn = { role: "user" | "assistant"; text: string };

type ChatInput = {
  who: string;
  player?: string;
  history: AgentTurn[];
  message: string;
};

export const pingVenice = createServerFn({ method: "POST" }).handler(async () => {
  const { veniceChat, veniceReady } = await import("@/lib/venice.server");
  if (!veniceReady()) return { ok: false as const, text: "Falta venice_api." };
  const text = await veniceChat([
    { role: "system", content: "Respondé en una sola oración, en español." },
    { role: "user", content: "Decí 'Team UPAP listo' y nada más." },
  ]);
  return { ok: true as const, text };
});

export const chatWithNpc = createServerFn({ method: "POST" })
  .validator((d: ChatInput) => d)
  .handler(async ({ data }) => {
    const who = String(data?.who ?? "").slice(0, 24);
    const message = String(data?.message ?? "").trim().slice(0, 400);
    if (!who || !message) return { ok: false as const, text: "Falta el mensaje." };
    const { chatAsCharacter, veniceReady } = await import("@/lib/venice.server");
    if (!veniceReady()) return { ok: false as const, text: "El agente no tiene clave." };
    try {
      const text = await chatAsCharacter({
        who,
        player: data.player,
        history: Array.isArray(data.history) ? data.history.slice(-10) : [],
        message,
      });
      return { ok: true as const, text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error del agente.";
      return { ok: false as const, text: msg.slice(0, 180) };
    }
  });
