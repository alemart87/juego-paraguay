import { useEffect, useRef, useState, type FormEvent } from "react";
import { PRIZE } from "@/promo/prize";
import { readStoredRef } from "./credits-config";
import {
  Check,
  Camera,
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
import {
  loadLeaderboardProfile,
  storeLeaderboardProfile,
  type StoredProfile,
} from "./leaderboard-profile";

async function prepareAvatar(file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error("La foto debe pesar menos de 10 MB.");
  let source: ImageBitmap | HTMLImageElement;
  let temporaryUrl = "";
  if (typeof createImageBitmap === "function") source = await createImageBitmap(file);
  else {
    temporaryUrl = URL.createObjectURL(file);
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("El formato de la foto no es compatible."));
      image.src = temporaryUrl;
    });
  }
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No pudimos preparar la foto.");
  const widthSource = source.width;
  const heightSource = source.height;
  const scale = Math.max(size / widthSource, size / heightSource);
  const width = widthSource * scale;
  const height = heightSource * scale;
  context.drawImage(source, (size - width) / 2, (size - height) / 2, width, height);
  if ("close" in source) source.close();
  if (temporaryUrl) URL.revokeObjectURL(temporaryUrl);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.86),
  );
  if (!blob) throw new Error("No pudimos preparar la foto.");
  return new File([blob], "perfil.jpg", { type: "image/jpeg" });
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
    const saved = loadLeaderboardProfile();
    if (saved) {
      setName(saved.name);
      setKind(saved.kind);
      setContact(saved.contact);
      setPurchaseEmail(saved.purchaseEmail ?? "");
      setConsent(true);
      setRegistered(true);
      setAvatarUrl(saved.avatarUrl ?? "");
      registeredCallback.current(saved.name);
    }
    void refresh();
  }, []);

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const data = {
        name,
        contactKind: kind,
        contact,
        consent,
        purchaseEmail,
        ref: readStoredRef(),
      } as const;
      const response = canSubmit
        ? await submitLeaderboardScore({
            data: {
              ...data,
              score: Math.round(result.score),
              level: result.level,
              hero: result.hero,
              time: Math.max(1, Math.round(result.time)),
              combo: Math.round(result.combo),
              runId: result.runId || crypto.randomUUID(),
            },
          })
        : await registerLeaderboardPlayer({ data });
      if (!response.ok) setError(response.message);
      else {
        let uploadedAvatar = avatarUrl;
        let photoError = "";
        if (photo) {
          try {
            const prepared = await prepareAvatar(photo);
            const form = new FormData();
            form.set("contactKind", kind);
            form.set("contact", contact);
            form.set("benefitToken", response.benefitToken);
            form.set("avatar", prepared);
            const uploadResponse = await fetch("/api/player/avatar", {
              method: "POST",
              body: form,
            });
            const upload = (await uploadResponse.json()) as {
              ok?: boolean;
              avatarUrl?: string;
              message?: string;
            };
            if (!uploadResponse.ok || !upload.ok || !upload.avatarUrl)
              throw new Error(upload.message || "No pudimos subir la foto.");
            uploadedAvatar = upload.avatarUrl;
            setAvatarUrl(uploadedAvatar);
            setPhoto(null);
          } catch (uploadError) {
            photoError =
              uploadError instanceof Error ? uploadError.message : "No pudimos subir la foto.";
          }
        }
        const saved: StoredProfile = {
          name: response.name,
          kind,
          contact,
          purchaseEmail,
          benefitToken: response.benefitToken,
          avatarUrl: uploadedAvatar || undefined,
        };
        storeLeaderboardProfile(saved);
        setRegistered(true);
        setSuccess(
          photoError
            ? ""
            : `${"rank" in response ? `#${response.rank} · ${response.message}` : response.message}${photo ? " Foto publicada." : ""}`,
        );
        if (photoError) setError(`El perfil quedó guardado. ${photoError}`);
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
          <p>Creá tu perfil ahora. Cada victoria suma a tu puntaje total automáticamente.</p>
        </div>
        <BrandLogo animated className="ranking-publisher" />
        <div className="ranking-prize" role="note">
          <span className="ranking-prize-badge">
            <Trophy />
          </span>
          <div>
            <small>{PRIZE.kicker}</small>
            <strong>{PRIZE.headline}</strong>
            <span>{PRIZE.sub} Cargá tu usuario para participar.</span>
          </div>
        </div>
      </header>

      <section className="ranking-main">
        {podium.length > 0 && (
          <div className="ranking-podium" aria-label="Podio nacional">
            {podium.map((entry) => (
              <article key={entry.rank} className={`podium-${entry.rank}`}>
                {entry.rank === 1 ? <Crown /> : <b>#{entry.rank}</b>}
                <img src={entry.avatarUrl || fighter(entry.hero).portrait} alt={entry.name} />
                <strong>{entry.name}</strong>
                <span>{entry.score.toLocaleString("es-PY")} pts</span>
              </article>
            ))}
          </div>
        )}
        <div className="ranking-board" aria-live="polite">
          <div className="ranking-labels">
            <span># / JUGADOR</span>
            <span>PUNTOS TOTALES</span>
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
                  <img src={entry.avatarUrl || fighter(entry.hero).portrait} alt={entry.name} />
                  <span>
                    <strong>{entry.name}</strong>
                    <small>
                      {fighter(entry.hero).name} · {entry.gamesPlayed} partida
                      {entry.gamesPlayed === 1 ? "" : "s"} · récord{" "}
                      {entry.bestScore.toLocaleString("es-PY")}
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
            <h3>{registered ? "Tu pase está listo" : "Entrá y jugá por el bono"}</h3>
          </div>
        </div>
        <p>
          {canSubmit
            ? "Guardá esta partida y peleá por el primer puesto."
            : "Registrate sin esperar a terminar un episodio."}
        </p>
        <label className="ranking-photo">
          <span className="ranking-photo-preview">
            {photoPreview || avatarUrl ? (
              <img src={photoPreview || avatarUrl} alt="Vista previa de tu foto" />
            ) : (
              <UserRound />
            )}
          </span>
          <span>
            <strong>
              <Camera /> {photo || avatarUrl ? "Cambiar foto" : "Subir mi foto"}
            </strong>
            <small>JPG, PNG o foto del celular. Se recorta automáticamente.</small>
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setPhoto(selected);
              if (photoPreview) URL.revokeObjectURL(photoPreview);
              setPhotoPreview(selected ? URL.createObjectURL(selected) : "");
            }}
          />
        </label>
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
        <p className="ranking-terms">{PRIZE.terms}</p>
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
