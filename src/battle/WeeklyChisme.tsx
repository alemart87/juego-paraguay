import { useEffect, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";

type Chisme = { ok: boolean; enabled: boolean; embedUrl: string; url: string };

export function WeeklyChisme({ onDone }: { onDone: () => void }) {
  const [item, setItem] = useState<Chisme | null>(null);
  const [seconds, setSeconds] = useState(10);
  const iframe = useRef<HTMLIFrameElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const deadline = window.setTimeout(() => controller.abort(), 3000);
    fetch("/api/weekly-chisme", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Chisme | null) => {
        if (!active) return;
        if (!data?.enabled || !data.embedUrl) done.current();
        else setItem(data);
      })
      .catch(() => active && done.current());
    return () => {
      active = false;
      window.clearTimeout(deadline);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!item) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, 10 - Math.floor((Date.now() - started) / 1000));
      setSeconds(remaining);
      if (!remaining) {
        window.clearInterval(timer);
        done.current();
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [item]);

  const command = (type: "unMute" | "play") =>
    iframe.current?.contentWindow?.postMessage(
      { type, value: null, "x-tiktok-player": true },
      "https://www.tiktok.com",
    );

  if (!item) return <div className="weekly-chisme-loading" aria-label="Preparando inicio" />;
  return (
    <section className="weekly-chisme" aria-label="Chisme de la semana">
      <div className="weekly-chisme-head">
        <span>EXCLUSIVO · SOLO 10 SEGUNDOS</span>
        <strong>CHISME DE LA SEMANA</strong>
      </div>
      <div className="weekly-chisme-player">
        <iframe
          ref={iframe}
          src={item.embedUrl}
          title="Chisme de la semana en TikTok"
          allow="autoplay; encrypted-media; fullscreen"
          onLoad={() => command("play")}
        />
      </div>
      <div className="weekly-chisme-actions">
        <button onClick={() => command("unMute")}>
          <Volume2 size={17} /> ACTIVAR SONIDO
        </button>
        <button onClick={() => done.current()}>
          <X size={17} /> SALTAR · {seconds}s
        </button>
      </div>
      <i style={{ width: `${seconds * 10}%` }} />
    </section>
  );
}
