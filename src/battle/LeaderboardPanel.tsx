import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  Crown,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { fighter } from "./content";
import {
  getLeaderboard,
  registerLeaderboardPlayer,
  submitLeaderboardScore,
  type LeaderboardEntry,
} from "./leaderboard";
import type { ShareResult } from "./share";
import { BrandLogo } from "./BrandLogo";

type StoredProfile = {
  name: string;
  kind: "email" | "phone";
  contact: string;
  purchaseEmail?: string;
  benefitToken?: string;
};
const PROFILE_KEY = "influencers-battle-profile-v1";

function loadProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") as StoredProfile | null;
  } catch {
    return null;
  }
}

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
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [registered, setRegistered] = useState(false);
  const registeredCallback = useRef(onRegistered);
  registeredCallback.current = onRegistered;

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
    const saved = loadProfile();
    if (saved) {
      setName(saved.name);
      setKind(saved.kind);
      setContact(saved.contact);
      setPurchaseEmail(saved.purchaseEmail ?? "");
      setConsent(true);
      setRegistered(true);
      registeredCallback.current(saved.name);
    }
    void refresh();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const data = { name, contactKind: kind, contact, consent, purchaseEmail } as const;
      const response = canSubmit
        ? await submitLeaderboardScore({
            data: {
              ...data,
              score: Math.round(result.score),
              level: result.level,
              hero: result.hero,
              time: Math.max(1, Math.round(result.time)),
              combo: Math.round(result.combo),
            },
          })
        : await registerLeaderboardPlayer({ data });
      if (!response.ok) setError(response.message);
      else {
        const saved: StoredProfile = {
          name: response.name,
          kind,
          contact,
          purchaseEmail,
          benefitToken: response.benefitToken,
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
        setRegistered(true);
        setSuccess(
          "rank" in response ? `#${response.rank} · ${response.message}` : response.message,
        );
        onRegistered(response.name);
        await refresh();
      }
    } catch {
      setError("No pudimos guardar tu perfil. Revisá los datos y reintentá.");
    } finally {
      setSending(false);
    }
  };

  const podium = entries.slice(0, 3);
  return (
    <div className="ranking-layout">
      <header className="ranking-head">
        <div>
          <span className="eyebrow">CLASIFICACIÓN NACIONAL · EN VIVO</span>
          <h2>El feed se gana.</h2>
          <p>Creá tu perfil ahora. Tu mejor victoria sube automáticamente.</p>
        </div>
        <BrandLogo animated className="ranking-publisher" />
      </header>

      <section className="ranking-main">
        {podium.length > 0 && (
          <div className="ranking-podium" aria-label="Podio nacional">
            {podium.map((entry) => (
              <article key={entry.rank} className={`podium-${entry.rank}`}>
                {entry.rank === 1 ? <Crown /> : <b>#{entry.rank}</b>}
                <img src={fighter(entry.hero).portrait} alt="" />
                <strong>{entry.name}</strong>
                <span>{entry.score.toLocaleString("es-PY")} pts</span>
              </article>
            ))}
          </div>
        )}
        <div className="ranking-board" aria-live="polite">
          <div className="ranking-labels">
            <span># / JUGADOR</span>
            <span>PUNTOS</span>
          </div>
          {loading ? (
            <div className="ranking-loading">
              <LoaderCircle className="spin" /> Cargando posiciones…
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
                      {fighter(entry.hero).name} · EP. {entry.level} · {Math.floor(entry.time / 60)}
                      :{String(entry.time % 60).padStart(2, "0")}
                    </small>
                  </span>
                  <em>{entry.score.toLocaleString("es-PY")}</em>
                </li>
              ))}
            </ol>
          ) : (
            <div className="ranking-empty">
              <span className="ranking-empty-icon">
                <Trophy />
              </span>
              <strong>La cima está vacía.</strong>
              <span>Registrate ahora y convertí tu primera victoria en récord nacional.</span>
            </div>
          )}
        </div>
      </section>

      <form className="ranking-form" onSubmit={submit}>
        <div className="ranking-form-title">
          <span>
            <UserRound />
          </span>
          <div>
            <small>PERFIL DE JUGADOR</small>
            <h3>{registered ? "Tu pase está listo" : "Entrá al ranking"}</h3>
          </div>
        </div>
        <p>
          {canSubmit
            ? "Guardá esta partida y peleá por el primer puesto."
            : "Registrate sin esperar a terminar un episodio."}
        </p>
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
        {kind === "phone" && (
          <label>
            Correo para compras
            <input
              type="email"
              value={purchaseEmail}
              onChange={(event) => setPurchaseEmail(event.target.value)}
              placeholder="El que usarás en Whop"
              autoComplete="email"
            />
          </label>
        )}
        {kind === "email" && (
          <p className="purchase-link-note">
            <ShieldCheck /> Usá este correo en Whop para recibir tus armas y poderes.
          </p>
        )}
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
              <Trophy />{" "}
              {canSubmit
                ? "Publicar mi puntaje"
                : registered
                  ? "Actualizar perfil"
                  : "Crear mi perfil"}
            </>
          )}
        </button>
        <p className="ranking-privacy">
          <LockKeyhole /> El correo o teléfono nunca aparece públicamente.
        </p>
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
