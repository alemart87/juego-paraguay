import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { downloadBlob, SHARE_URL } from "./share";

type Net = {
  id: string;
  label: string;
  color: string;
  href: (text: string, url: string) => string;
};

const NETWORKS: Net[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25d366",
    href: (text, url) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877f2",
    href: (_text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    color: "#111111",
    href: (text, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#229ed9",
    href: (text, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

function canShareFiles(file: File) {
  const nav = navigator as Partial<Navigator>;
  return typeof nav.share === "function" && Boolean(nav.canShare?.({ files: [file] }));
}

/** Photo share sheet: native share with the image (Instagram, TikTok, WhatsApp…) plus web links. */
export function ShareSheet({
  blob,
  filename,
  message,
  title = "Compartí tu foto",
  onClose,
}: {
  blob: Blob;
  filename: string;
  message: string;
  title?: string;
  onClose: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  const file = useMemo(
    () => new File([blob], filename, { type: blob.type || "image/png" }),
    [blob, filename],
  );
  const [native, setNative] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setNative(canShareFiles(file));
    return () => URL.revokeObjectURL(url);
  }, [file, url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shareNative = async () => {
    try {
      await navigator.share({
        files: [file],
        text: `${message} ${SHARE_URL}`,
        title: "Hernán Rivas ES ABOGADO",
      });
      setStatus("¡Compartida!");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        downloadBlob(blob, filename);
        setStatus("Guardamos la foto: subila desde tu galería.");
      }
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${message} ${SHARE_URL}`);
      setStatus("Link copiado");
    } catch {
      setStatus(SHARE_URL);
    }
  };

  return (
    <div
      className="ab-share"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ab-share-card">
        <button className="ab-close" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>
        <h3>{title}</h3>
        <div className="ab-share-preview">
          <img src={url} alt="Tu foto del ring" />
        </div>
        {native && (
          <button
            className="ab-btn ab-btn-primary ab-share-main"
            onClick={() => void shareNative()}
          >
            <Share2 size={20} /> COMPARTIR FOTO
          </button>
        )}
        <p className="ab-share-hint">
          {native
            ? "Elegí Instagram, TikTok, WhatsApp o Facebook y la foto sale adjunta."
            : "Guardá la foto y subila a tu historia de Instagram o TikTok."}
        </p>
        <div className="ab-share-nets">
          {NETWORKS.map((n) => (
            <a
              key={n.id}
              className={`ab-net ab-net-${n.id}`}
              style={{ background: n.color }}
              href={n.href(message, SHARE_URL)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {n.label}
            </a>
          ))}
        </div>
        <div className="ab-share-row">
          <button
            className="ab-btn"
            onClick={() => {
              downloadBlob(blob, filename);
              setStatus("Foto guardada");
            }}
          >
            <Download size={18} /> GUARDAR FOTO
          </button>
          <button className="ab-btn" onClick={() => void copy()}>
            {status === "Link copiado" ? <Check size={18} /> : <Copy size={18} />} COPIAR LINK
          </button>
        </div>
        {status && <p className="ab-share-status">{status}</p>}
      </div>
    </div>
  );
}
