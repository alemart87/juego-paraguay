import { useEffect, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Mail, Phone, Trophy } from "lucide-react";
import { fighter } from "./content";
import { getLeaderboard, submitLeaderboardScore, type LeaderboardEntry } from "./leaderboard";
import type { ShareResult } from "./share";
import { BrandLogo } from "./BrandLogo";

export function Leaderboard({
  result,
  canSubmit,
  onRegistered,
}: {
  result: ShareResult;
  canSubmit: boolean;
  onRegistered: (name: string) => void;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const refresh = async () => {
    setLoading(true);
    try {
      const response = await getLeaderboard();
      setEntries(response.entries);
    } catch {
      setError("No pudimos cargar el ranking. Probá otra vez.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || sending) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const response = await submitLeaderboardScore({
        data: {
          name,
          contactKind: kind,
          contact,
          consent,
          score: Math.round(result.score),
          level: result.level,
          hero: result.hero,
          time: Math.max(1, Math.round(result.time)),
          combo: Math.round(result.combo),
        },
      });
      if (!response.ok) setError(response.message);
      else {
        setSuccess(`#${response.rank} · ${response.message}`);
        onRegistered(response.name);
        setContact("");
        await refresh();
      }
    } catch {
      setError("No pudimos guardar tu partida. Revisá los datos y reintentá.");
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="ranking-layout">
      <div className="ranking-head">
        <BrandLogo animated className="ranking-publisher" />
        <span className="eyebrow">CLASIFICACIÓN NACIONAL</span>
        <h2>El feed tiene ranking.</h2>
        <p>Tu contacto nunca se muestra. Guardamos un hash para reconocer tu mejor partida.</p>
      </div>
      <div className="ranking-board" aria-live="polite">
        <div className="ranking-labels">
          <span># / JUGADOR</span>
          <span>PUNTOS</span>
        </div>
        {loading ? (
          <div className="ranking-loading">
            <LoaderCircle /> Cargando posiciones…
          </div>
        ) : entries.length ? (
          <ol>
            {entries.map((entry) => (
              <li key={`${entry.rank}-${entry.name}`}>
                <b>{String(entry.rank).padStart(2, "0")}</b>
                <img src={fighter(entry.hero).portrait} alt="" />
                <span>
                  <strong>{entry.name}</strong>
                  <small>
                    {fighter(entry.hero).name} · EP. {entry.level} · {Math.floor(entry.time / 60)}:
                    {String(entry.time % 60).padStart(2, "0")}
                  </small>
                </span>
                <em>{entry.score.toLocaleString("es-PY")}</em>
              </li>
            ))}
          </ol>
        ) : (
          <div className="ranking-empty">
            <Trophy />
            <strong>El primer puesto está libre.</strong>
            <span>Terminá una partida y hacelo tuyo.</span>
          </div>
        )}
      </div>
      <form className="ranking-form" onSubmit={submit}>
        <h3>{canSubmit ? "Publicá esta partida" : "Ganate un lugar"}</h3>
        {!canSubmit ? (
          <p>Completá un episodio. Después vas a poder registrar tu mejor puntaje.</p>
        ) : (
          <>
            <label>
              Nombre público
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                placeholder="Ej. TereréMaster"
                autoComplete="nickname"
                required
              />
            </label>
            <div className="contact-switch" role="group" aria-label="Tipo de contacto">
              <button
                type="button"
                className={kind === "email" ? "active" : ""}
                onClick={() => {
                  setKind("email");
                  setContact("");
                }}
              >
                <Mail /> Correo
              </button>
              <button
                type="button"
                className={kind === "phone" ? "active" : ""}
                onClick={() => {
                  setKind("phone");
                  setContact("");
                }}
              >
                <Phone /> Teléfono
              </button>
            </div>
            <label>
              {kind === "email" ? "Correo privado" : "Número privado"}
              <input
                type={kind === "email" ? "email" : "tel"}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder={kind === "email" ? "vos@correo.com" : "+595 981 000 000"}
                autoComplete={kind === "email" ? "email" : "tel"}
                required
              />
            </label>
            <label className="ranking-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
              />
              <span>Acepto publicar mi apodo, personaje y puntaje. Mi contacto queda privado.</span>
            </label>
            <button className="primary" disabled={sending || !consent}>
              {sending ? (
                <>
                  <LoaderCircle className="spin" /> Guardando…
                </>
              ) : (
                <>
                  <Trophy /> Entrar al ranking
                </>
              )}
            </button>
          </>
        )}
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="ranking-success" role="status">
            <Check /> {success}
          </p>
        )}
      </form>
    </div>
  );
}
