import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AgentTurn = { role: "user" | "assistant"; text: string };

type ChatInput = {
  who: string;
  player?: string;
  history: AgentTurn[];
  message: string;
  context?: string;
};

export const pingVenice = createServerFn({ method: "POST" }).handler(async () => {
  const { veniceChat, veniceReady } = await import("@/lib/venice.server");
  if (!veniceReady()) return { ok: false as const, text: "Falta venice_api." };
  const text = await veniceChat([
    { role: "system", content: "Respondé en una sola oración, en español." },
    { role: "user", content: "Decí 'Influencers Battle listo' y nada más." },
  ]);
  return { ok: true as const, text };
});

export const chatWithNpc = createServerFn({ method: "POST" })
  .validator((d: ChatInput) =>
    z
      .object({
        who: z.enum(["masivo", "onichan", "anatomic", "comadre", "papu", "secre", "narrator"]),
        player: z.string().max(40).optional(),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(400) }))
          .max(10),
        message: z.string().trim().min(1).max(400),
        context: z.string().max(220).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const who = String(data?.who ?? "").slice(0, 24);
    const message = String(data?.message ?? "")
      .trim()
      .slice(0, 400);
    if (!who || !message) return { ok: false as const, text: "Falta el mensaje." };
    const { chatAsCharacter, veniceReady } = await import("@/lib/venice.server");
    if (!veniceReady())
      return {
        ok: false as const,
        text: "La conversación IA no está configurada en este equipo. Podés seguir con las opciones del guion.",
      };
    try {
      const text = await chatAsCharacter({
        who,
        player: data.player,
        history: Array.isArray(data.history) ? data.history.slice(-10) : [],
        message,
        context: data.context,
      });
      return { ok: true as const, text };
    } catch (err) {
      const timeout =
        err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      return {
        ok: false as const,
        text: timeout
          ? "La IA está tardando. Reintentá o seguí con el guion."
          : "No se pudo conectar con la IA. Podés reintentar o seguir jugando.",
      };
    }
  });
