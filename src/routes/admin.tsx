import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  BarChart3,
  Eye,
  Gamepad2,
  LogOut,
  ShoppingBag,
  Trophy,
  Users,
  Gift,
  LoaderCircle,
  Save,
  Video,
  Zap,
  MessageCircle,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { EPISODES, FIGHTERS, fighter, type EpisodeId, type FighterId } from "@/battle/content";
import { SHOP_ITEMS, type ShopSku } from "@/battle/shop-catalog";
import "./admin.css";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Control Room · PY-STAR GAMES" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});
type Stats = {
  summary: {
    players: number;
    active_players: number;
    visits: number;
    plays: number;
    wins: number;
    points: number;
    purchases: number;
    revenue: string;
  };
  levels: { level: number; plays: number }[];
  heroes: { hero: string; plays: number }[];
  days: { day: string; visits: number; plays: number }[];
  leaders: { name: string; score: number; games: number }[];
  players: {
    id: number;
    name: string;
    contact_kind: string;
    score: number;
    games: number;
    benefits: ShopSku[];
  }[];
  grants: {
    id: number;
    player: string;
    sku: ShopSku;
    quantity: number;
    note: string | null;
    granted_at: string;
  }[];
  referrals?: {
    friends: number;
    referrers: number;
    packs: number;
    bought: number;
    granted: number;
    earned: number;
    spent: number;
  };
};
function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [granting, setGranting] = useState(false),
    [grantMessage, setGrantMessage] = useState(""),
    [chismeUrl, setChismeUrl] = useState(""),
    [chismeEnabled, setChismeEnabled] = useState(false),
    [chismeMessage, setChismeMessage] = useState(""),
    [quickEnabled, setQuickEnabled] = useState(false),
    [quickLevel, setQuickLevel] = useState<EpisodeId | 6>(1),
    [quickFighter, setQuickFighter] = useState(""),
    [quickMessage, setQuickMessage] = useState("");
  const load = async () => {
    setLoading(true);
    const [r, chisme, quick] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/weekly-chisme", { cache: "no-store" }),
      fetch("/api/quick-start", { cache: "no-store" }),
    ]);
    if (r.ok) setStats(await r.json());
    else setStats(null);
    if (chisme.ok) {
      const data = (await chisme.json()) as { url?: string; enabled?: boolean };
      setChismeUrl(data.url ?? "");
      setChismeEnabled(Boolean(data.enabled));
    }
    if (quick.ok) {
      const data = (await quick.json()) as { enabled?: boolean; level?: number; fighter?: string };
      setQuickEnabled(Boolean(data.enabled));
      setQuickLevel(
        ([1, 2, 3, 4, 5, 6].includes(Number(data.level)) ? data.level : 1) as EpisodeId | 6,
      );
      setQuickFighter(data.fighter ?? "");
    }
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
    });
    if (r.ok) void load();
    else setError("Correo o contraseña incorrectos.");
  };
  const grant = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    setGrantMessage("");
    setGranting(true);
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/admin/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          playerId: Number(form.get("playerId")),
          sku: form.get("sku"),
          quantity: Number(form.get("quantity") || 1),
          note: form.get("note"),
        }),
      });
      const result = (await response.json()) as {
        player?: string;
        sku?: ShopSku;
        statusMessage?: string;
      };
      if (!response.ok) throw new Error(result.statusMessage || "No se pudo entregar el premio");
      const item = SHOP_ITEMS.find((entry) => entry.sku === result.sku);
      setGrantMessage(`${item?.name ?? result.sku} asignado a ${result.player}.`);
      formElement.reset();
      await load();
    } catch (cause) {
      setGrantMessage(cause instanceof Error ? cause.message : "No se pudo entregar el premio");
    } finally {
      setGranting(false);
    }
  };
  const saveChisme = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChismeMessage("Guardando…");
    try {
      const response = await fetch("/api/admin/weekly-chisme", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: chismeUrl, enabled: chismeEnabled }),
      });
      const result = (await response.json()) as {
        statusMessage?: string;
        message?: string;
        url?: string;
      };
      if (!response.ok)
        throw new Error(result.message || result.statusMessage || "No se pudo guardar el video");
      if (result.url) setChismeUrl(result.url);
      setChismeMessage(
        chismeEnabled
          ? "Chisme activo: aparecerá 10 segundos antes de la intro."
          : "Chisme pausado.",
      );
    } catch (cause) {
      setChismeMessage(cause instanceof Error ? cause.message : "No se pudo guardar el video");
    }
  };
  const saveQuickStart = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuickMessage("Guardando…");
    try {
      const response = await fetch("/api/admin/quick-start", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level: quickLevel, fighter: quickFighter, enabled: quickEnabled }),
      });
      const result = (await response.json()) as { statusMessage?: string; message?: string };
      if (!response.ok)
        throw new Error(
          result.message || result.statusMessage || "No se pudo guardar el inicio directo",
        );
      const who = quickFighter ? fighter(quickFighter as FighterId).name : "el personaje guardado";
      setQuickMessage(
        quickEnabled && quickLevel === 6
          ? "Inicio directo activo: al entrar al link se juega Hernán Rivas ES ABOGADO, sin chisme, intro ni portada."
          : quickEnabled
            ? `Inicio directo activo: al entrar al link se juega ${EPISODES[quickLevel - 1].title} con ${who}, sin chisme ni intro.`
            : "Inicio directo apagado: el juego arranca con chisme, intro y portada.",
      );
    } catch (cause) {
      setQuickMessage(
        cause instanceof Error ? cause.message : "No se pudo guardar el inicio directo",
      );
    }
  };
  if (loading)
    return (
      <main className="admin-shell">
        <div className="admin-loading">CARGANDO CONTROL ROOM…</div>
      </main>
    );
  if (!stats)
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <img src="/brand/py-star-games.webp" alt="PY-STAR GAMES" />
          <span>ACCESO RESTRINGIDO</span>
          <h1>
            CONTROL
            <br />
            ROOM.
          </h1>
          <p>Métricas privadas de Influencers Battle.</p>
          <form onSubmit={login}>
            <input name="email" type="email" placeholder="Correo administrador" required />
            <input name="password" type="password" placeholder="Contraseña" required />
            <button>INGRESAR AL PANEL</button>
            {error && <strong>{error}</strong>}
          </form>
          <a href="/">← Volver al juego</a>
        </section>
      </main>
    );
  const cards = [
    ["JUGADORES", stats.summary.players, Users],
    ["VISITANTES", stats.summary.visits, Eye],
    ["PARTIDAS", stats.summary.plays, Gamepad2],
    ["VICTORIAS", stats.summary.wins, Trophy],
    ["PUNTOS", Number(stats.summary.points).toLocaleString("es-PY"), Activity],
    ["COMPRAS", stats.summary.purchases, ShoppingBag],
  ] as const;
  const maxLevel = Math.max(1, ...stats.levels.map((x) => x.plays)),
    maxHero = Math.max(1, ...stats.heroes.map((x) => x.plays));
  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div>
          <img src="/brand/py-star-games.webp" alt="" />
          <span>PY-STAR GAMES</span>
          <b>CONTROL ROOM</b>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setStats(null);
          }}
        >
          <LogOut /> Salir
        </button>
      </header>
      <section className="admin-dashboard">
        <div className="admin-title">
          <div>
            <span>DATOS EN VIVO · PARAGUAY</span>
            <h1>
              EL JUEGO
              <br />
              EN NÚMEROS.
            </h1>
          </div>
          <p>
            <b>USD {Number(stats.summary.revenue).toFixed(2)}</b>
            <small>INGRESOS CONFIRMADOS</small>
          </p>
        </div>
        <div className="admin-cards">
          {cards.map(([label, value, Icon]) => (
            <article key={label}>
              <Icon />
              <small>{label}</small>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <div className="admin-grids">
          <section>
            <h2>
              <BarChart3 /> Niveles más jugados
            </h2>
            {stats.levels.map((x) => (
              <div className="admin-bar" key={x.level}>
                <span>EP. 0{x.level}</span>
                <i style={{ width: `${(x.plays / maxLevel) * 100}%` }} />
                <b>{x.plays}</b>
              </div>
            ))}
          </section>
          <section>
            <h2>
              <Gamepad2 /> Personajes elegidos
            </h2>
            {stats.heroes.map((x) => (
              <div className="admin-bar pink" key={x.hero}>
                <span>{fighter(x.hero as never).name}</span>
                <i style={{ width: `${(x.plays / maxHero) * 100}%` }} />
                <b>{x.plays}</b>
              </div>
            ))}
          </section>
          <section className="admin-leaders">
            <h2>
              <Trophy /> Ranking acumulado
            </h2>
            {stats.leaders.map((x, i) => (
              <div key={x.name}>
                <b>#{i + 1}</b>
                <span>
                  <strong>{x.name}</strong>
                  <small>{x.games} partidas</small>
                </span>
                <em>{Number(x.score).toLocaleString("es-PY")}</em>
              </div>
            ))}
          </section>
          <section>
            <h2>
              <Activity /> Últimos 7 días
            </h2>
            {stats.days.length ? (
              stats.days.map((x) => (
                <div className="admin-day" key={x.day}>
                  <b>{x.day}</b>
                  <span>{x.visits} visitas</span>
                  <strong>{x.plays} partidas</strong>
                </div>
              ))
            ) : (
              <p className="admin-empty">Los datos aparecerán desde este despliegue.</p>
            )}
          </section>
        </div>
        <section className="admin-chisme">
          <div>
            <span>PORTADA CONTROLADA POR SUPERADMIN</span>
            <h2>
              <Video /> CHISME DE LA SEMANA
            </h2>
            <p>
              Pegá el enlace que copiás desde Compartir en TikTok, incluso si empieza con vm. o vt.
              Se reproduce al abrir el juego y desaparece automáticamente a los 10 segundos.
            </p>
          </div>
          <form onSubmit={saveChisme}>
            <label>
              LINK DE TIKTOK
              <input
                type="text"
                inputMode="url"
                value={chismeUrl}
                onChange={(event) => setChismeUrl(event.target.value)}
                placeholder="https://www.tiktok.com/@usuario/video/123…"
              />
            </label>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={chismeEnabled}
                onChange={(event) => setChismeEnabled(event.target.checked)}
              />
              MOSTRAR AL INICIAR
            </label>
            <button>
              <Save /> GUARDAR CHISME
            </button>
            {chismeMessage && <strong>{chismeMessage}</strong>}
          </form>
        </section>
        <section className="admin-chisme admin-quick-start">
          <div>
            <span>ENTRADA CONTROLADA POR SUPERADMIN</span>
            <h2>
              <Zap /> OMITIR INTROS Y SELECCIONAR JUEGO
            </h2>
            <p>
              Con esto activado, quien abra el link entra directo a jugar el episodio que elijas:
              sin chisme, sin intro y sin pasar por la portada ni los menús. Los links de desafío
              (?battle=) siguen funcionando igual y <code>?menu=1</code> muestra la portada.
            </p>
          </div>
          <form onSubmit={saveQuickStart}>
            <label>
              EPISODIO QUE SE JUEGA
              <select
                value={quickLevel}
                onChange={(event) => setQuickLevel(Number(event.target.value) as EpisodeId | 6)}
              >
                {EPISODES.map((item) => (
                  <option key={item.id} value={item.id}>
                    0{item.id} · {item.title} — {item.location}
                  </option>
                ))}
                <option value={6}>06 · Hernán Rivas ES ABOGADO — Ring del Abogado</option>
              </select>
            </label>
            <label>
              PERSONAJE
              <select
                value={quickFighter}
                disabled={quickLevel === 6}
                onChange={(event) => setQuickFighter(event.target.value)}
              >
                <option value="">El que tenga guardado el jugador</option>
                {FIGHTERS.filter((item) => !item.premium).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={quickEnabled}
                onChange={(event) => setQuickEnabled(event.target.checked)}
              />
              OMITIR INTROS E IR DIRECTO AL JUEGO
            </label>
            <button>
              <Save /> GUARDAR INICIO DIRECTO
            </button>
            {quickMessage && <strong>{quickMessage}</strong>}
          </form>
        </section>
        {stats.referrals && (
          <section className="admin-chisme admin-referrals">
            <div>
              <span>REFERIDOS Y SALDO DE GOLPES</span>
              <h2>
                <Gift /> INVITÁ Y GANÁ
              </h2>
              <p>
                Cada amigo que entra con un link arranca con {500} golpes; quien lo trajo recibe el
                30% de cada carga. Los números salen del libro mayor de saldo.
              </p>
            </div>
            <div className="admin-chat-cards">
              {(
                [
                  ["AMIGOS TRAÍDOS", stats.referrals.friends],
                  ["PERSONAS QUE INVITAN", stats.referrals.referrers],
                  ["PACKS VENDIDOS", stats.referrals.packs],
                  ["GOLPES COMPRADOS", stats.referrals.bought],
                  ["GOLPES DE BIENVENIDA", stats.referrals.granted],
                  ["GOLPES POR REFERIDOS", stats.referrals.earned],
                  ["GOLPES GASTADOS", stats.referrals.spent],
                ] as const
              ).map(([label, value]) => (
                <article key={label}>
                  <small>{label}</small>
                  <strong>{Number(value).toLocaleString("es-PY")}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
        <AdminChat />
        <section className="admin-grants">
          <div className="admin-grants-copy">
            <span>PREMIOS SIN LÍMITE</span>
            <h2>
              <Gift /> ASIGNAR BENEFICIOS
            </h2>
            <p>
              Entregá personajes premium, armamento o poderes a cualquier perfil registrado. Cada
              operación queda guardada en el historial.
            </p>
          </div>
          <form onSubmit={grant}>
            <label>
              USUARIO
              <select name="playerId" required defaultValue="">
                <option value="" disabled>
                  Seleccioná un jugador
                </option>
                {stats.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    #{player.id} · {player.name} · {player.games} partidas
                  </option>
                ))}
              </select>
            </label>
            <label>
              PREMIO
              <select name="sku" required defaultValue="marito">
                {SHOP_ITEMS.map((item) => (
                  <option key={item.sku} value={item.sku}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              CANTIDAD
              <input name="quantity" type="number" min="1" max="9999" defaultValue="1" required />
            </label>
            <label className="admin-grant-note">
              NOTA INTERNA
              <input name="note" maxLength={240} placeholder="Ej.: premio de torneo" />
            </label>
            <button disabled={granting || !stats.players.length}>
              {granting ? <LoaderCircle className="spin" /> : <Gift />}
              {granting ? "ASIGNANDO…" : "ENTREGAR PREMIO"}
            </button>
            {grantMessage && <strong>{grantMessage}</strong>}
          </form>
          <div className="admin-users">
            <h3>USUARIOS Y BENEFICIOS</h3>
            {stats.players.map((player) => (
              <article key={player.id}>
                <b>#{player.id}</b>
                <span>
                  <strong>{player.name}</strong>
                  <small>
                    {player.contact_kind === "email" ? "Correo" : "Teléfono"} · {player.games}{" "}
                    partidas
                  </small>
                </span>
                <em>{player.benefits.length ? player.benefits.join(" · ") : "Sin premios"}</em>
              </article>
            ))}
          </div>
          <div className="admin-grant-history">
            <h3>ÚLTIMAS ASIGNACIONES</h3>
            {stats.grants.length ? (
              stats.grants.map((entry) => (
                <article key={entry.id}>
                  <b>{entry.quantity}×</b>
                  <span>
                    <strong>{entry.player}</strong>
                    <small>{entry.granted_at}</small>
                  </span>
                  <em>{SHOP_ITEMS.find((item) => item.sku === entry.sku)?.name ?? entry.sku}</em>
                </article>
              ))
            ) : (
              <p className="admin-empty">Todavía no asignaste premios manuales.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

type ChatTelemetry = {
  enabled: boolean;
  summary: {
    total: number;
    visible: number;
    hidden: number;
    today: number;
    last_hour: number;
    people: number;
    people_today: number;
    people_live: number;
    avg_length: number;
  };
  days: { label: string; messages: number; people: number }[];
  hours: { label: string; messages: number }[];
  senders: { tag: string; messages: number; last: string }[];
  latest: { id: number; body: string; tag: string; hidden: boolean; at: string }[];
};
type ChatAction =
  | { action: "toggle"; enabled: boolean }
  | { action: "hide" | "restore"; id: number }
  | { action: "hide_all" };

/** Chismes en vivo: cantidades, ritmo y moderación del chat público anónimo. */
function AdminChat() {
  const [data, setData] = useState<ChatTelemetry | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const load = async () => {
    const response = await fetch("/api/admin/chat", { cache: "no-store" });
    if (response.ok) setData((await response.json()) as ChatTelemetry);
  };
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(timer);
  }, []);
  const act = async (action: ChatAction, done: string) => {
    setBusy(true);
    setMessage("Guardando…");
    try {
      const response = await fetch("/api/admin/chat", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action),
      });
      const result = (await response.json()) as { message?: string; statusMessage?: string };
      if (!response.ok) throw new Error(result.message || result.statusMessage || "No se pudo");
      setMessage(done);
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo");
    } finally {
      setBusy(false);
    }
  };
  if (!data) return null;
  const cards = [
    ["EN VIVO (5 MIN)", data.summary.people_live],
    ["CHISMES HOY", data.summary.today],
    ["ÚLTIMA HORA", data.summary.last_hour],
    ["PERSONAS HOY", data.summary.people_today],
    ["TOTAL", data.summary.total],
    ["PERSONAS TOTAL", data.summary.people],
    ["OCULTOS", data.summary.hidden],
    ["LARGO PROMEDIO", `${data.summary.avg_length} car.`],
  ] as const;
  const maxDay = Math.max(1, ...data.days.map((x) => x.messages)),
    maxHour = Math.max(1, ...data.hours.map((x) => x.messages));
  return (
    <section className="admin-chat">
      <div className="admin-chat-head">
        <div>
          <span>CHAT PÚBLICO ANÓNIMO</span>
          <h2>
            <MessageCircle /> CHISMES EN VIVO
          </h2>
          <p>
            Nadie se loguea ni ve nombres: cada navegador queda como un código anónimo. Acá ves
            cuánta gente escribe, a qué ritmo, y podés pausar el chat u ocultar mensajes.
          </p>
        </div>
        <div className="admin-chat-controls">
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={data.enabled}
              disabled={busy}
              onChange={(event) =>
                void act(
                  { action: "toggle", enabled: event.target.checked },
                  event.target.checked ? "Chat activo." : "Chat pausado: nadie puede escribir.",
                )
              }
            />
            CHAT ABIERTO
          </label>
          <button
            type="button"
            disabled={busy || !data.summary.visible}
            onClick={() => {
              if (
                window.confirm(
                  "¿Ocultar todos los chismes visibles? Se pueden restaurar uno por uno.",
                )
              )
                void act({ action: "hide_all" }, "Todos los chismes quedaron ocultos.");
            }}
          >
            <EyeOff /> OCULTAR TODO
          </button>
          {message && <strong>{message}</strong>}
        </div>
      </div>
      <div className="admin-chat-cards">
        {cards.map(([label, value]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-grids admin-chat-grids">
        <section>
          <h2>
            <BarChart3 /> Chismes por día (7 días)
          </h2>
          {data.days.length ? (
            data.days.map((x) => (
              <div className="admin-bar pink" key={x.label}>
                <span>{x.label}</span>
                <i style={{ width: `${(x.messages / maxDay) * 100}%` }} />
                <b>
                  {x.messages} <small>/ {x.people} pers.</small>
                </b>
              </div>
            ))
          ) : (
            <p className="admin-empty">Todavía no hay chismes.</p>
          )}
        </section>
        <section>
          <h2>
            <Activity /> Ritmo por hora (24 h)
          </h2>
          {data.hours.length ? (
            data.hours.map((x) => (
              <div className="admin-bar" key={x.label}>
                <span>{x.label}</span>
                <i style={{ width: `${(x.messages / maxHour) * 100}%` }} />
                <b>{x.messages}</b>
              </div>
            ))
          ) : (
            <p className="admin-empty">Sin actividad en las últimas 24 horas.</p>
          )}
        </section>
        <section>
          <h2>
            <Users /> Quiénes más escriben
          </h2>
          {data.senders.length ? (
            data.senders.map((x) => (
              <div className="admin-day" key={x.tag}>
                <code>#{x.tag}</code>
                <span>{x.messages} chismes</span>
                <b>{x.last}</b>
              </div>
            ))
          ) : (
            <p className="admin-empty">Nadie escribió todavía.</p>
          )}
        </section>
        <section className="admin-chat-latest">
          <h2>
            <Eye /> Últimos chismes
          </h2>
          {data.latest.length ? (
            data.latest.map((x) => (
              <div className={`admin-chat-row ${x.hidden ? "hidden" : ""}`} key={x.id}>
                <div>
                  <small>
                    #{x.tag} · {x.at}
                    {x.hidden ? " · OCULTO" : ""}
                  </small>
                  <p>{x.body}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void act(
                      { action: x.hidden ? "restore" : "hide", id: x.id },
                      x.hidden ? "Chisme restaurado." : "Chisme oculto.",
                    )
                  }
                >
                  {x.hidden ? <RotateCcw /> : <EyeOff />}
                  {x.hidden ? "Restaurar" : "Ocultar"}
                </button>
              </div>
            ))
          ) : (
            <p className="admin-empty">Todavía no hay chismes.</p>
          )}
        </section>
      </div>
    </section>
  );
}
