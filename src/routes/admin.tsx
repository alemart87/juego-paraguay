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
} from "lucide-react";
import { fighter } from "@/battle/content";
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
};
function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/stats");
    if (r.ok) setStats(await r.json());
    else setStats(null);
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
      </section>
    </main>
  );
}
