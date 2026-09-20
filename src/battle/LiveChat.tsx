import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { sessionId } from "./analytics";

export type ChatMessage = { id: number; body: string; at: string; tag: string; mine: boolean };
type Feed = { ok: boolean; enabled: boolean; messages: ChatMessage[]; people: number; total: number };

const POLL_MS = 2500;
const MAX_LENGTH = 240;
const KEEP = 150;

/** Color estable por sesión anónima: permite seguir una charla sin identificar a nadie. */
const tagColor = (tag: string) => `hsl(${parseInt(tag.slice(0, 4), 16) % 360} 85% 68%)`;
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit", hour12: false });

/** Chat público anónimo "Chismes en vivo": sin login, sin nombres, polling liviano. */
export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [people, setPeople] = useState(0);
  const [total, setTotal] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lastId = useRef(0);
  const stickToBottom = useRef(true);

  const merge = (incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((current) => {
      const known = new Set(current.map((m) => m.id));
      const next = [...current, ...incoming.filter((m) => !known.has(m.id))];
      return next.slice(-KEEP);
    });
    lastId.current = Math.max(lastId.current, ...incoming.map((m) => m.id));
  };

  useEffect(() => {
    let active = true;
    let timer = 0;
    const poll = async () => {
      if (document.visibilityState === "hidden") {
        timer = window.setTimeout(poll, POLL_MS);
        return;
      }
      try {
        const query = new URLSearchParams({ session: sessionId() });
        if (lastId.current) query.set("after", String(lastId.current));
        const response = await fetch(`/api/chat?${query}`, { cache: "no-store" });
        const data = (await response.json()) as Feed;
        if (!active) return;
        setEnabled(data.enabled);
        setPeople(data.people);
        setTotal(data.total);
        merge(data.messages);
      } catch {
        /* sin red: reintenta en el próximo ciclo */
      } finally {
        if (active) {
          setLoaded(true);
          timer = window.setTimeout(poll, POLL_MS);
        }
      }
    };
    void poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const node = list.current;
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = text.trim();
    if (body.length < 2 || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId(), body }),
      });
      const result = (await response.json()) as {
        message?: ChatMessage;
        statusMessage?: string;
        message_text?: string;
      };
      if (!response.ok) {
        const reason =
          (result as { message?: string }).message || result.statusMessage || "No se pudo enviar.";
        throw new Error(typeof reason === "string" ? reason : "No se pudo enviar.");
      }
      if (result.message) {
        stickToBottom.current = true;
        merge([result.message]);
      }
      setText("");
      input.current?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="live-chat" aria-live="polite">
      <header className="live-chat-head">
        <div>
          <span className="eyebrow">
            <i className="live-dot" /> EN VIVO · ANÓNIMO
          </span>
          <h2>Chismes en vivo</h2>
          <p>Contá el chisme sin nombre ni cuenta. Todo el mundo lo ve al instante.</p>
        </div>
        <dl className="live-chat-stats">
          <div>
            <dt>Ahora</dt>
            <dd>{people}</dd>
          </div>
          <div>
            <dt>Chismes</dt>
            <dd>{total}</dd>
          </div>
        </dl>
      </header>
      <div
        className="live-chat-list"
        ref={list}
        onScroll={(event) => {
          const node = event.currentTarget;
          stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 40;
        }}
      >
        {!loaded && <p className="live-chat-empty">Cargando chismes…</p>}
        {loaded && !messages.length && (
          <p className="live-chat-empty">
            <MessageCircle size={22} /> Todavía nadie tiró el primer chisme. Dale, sé vos.
          </p>
        )}
        {messages.map((message) => (
          <article
            key={message.id}
            className={`live-chat-message ${message.mine ? "mine" : ""}`}
            style={{ "--tag": tagColor(message.tag) } as React.CSSProperties}
          >
            <span>
              <i /> {message.mine ? "Vos" : "Anónimo"} · {time(message.at)}
            </span>
            <p>{message.body}</p>
          </article>
        ))}
      </div>
      <form className="live-chat-form" onSubmit={send}>
        <input
          ref={input}
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          placeholder={enabled ? "Escribí tu chisme…" : "El chat está pausado por ahora"}
          disabled={!enabled || sending}
          autoComplete="off"
          enterKeyHint="send"
          onChange={(event) => setText(event.target.value)}
        />
        <button className="primary" disabled={!enabled || sending || text.trim().length < 2}>
          <Send size={18} /> Enviar
        </button>
        <small>
          {error ? <b>{error}</b> : `${text.length}/${MAX_LENGTH} · sin links ni nombres`}
        </small>
      </form>
    </div>
  );
}
