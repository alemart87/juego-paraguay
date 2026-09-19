import { fighter, episode, type FighterId, type EpisodeId } from "./content";
export interface ShareResult {
  hero: FighterId;
  level: EpisodeId;
  score: number;
  time: number;
  combo: number;
  seed: number;
  playerName?: string;
}
export function challengeUrl(result: ShareResult) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("battle", String(result.level));
  url.searchParams.set("fighter", result.hero);
  url.searchParams.set("seed", String(result.seed));
  return url.toString();
}
export async function resultCard(result: ShareResult): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1920;
  const g = c.getContext("2d")!;
  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = src;
    });
  const bg = await load("/media/characters/cover-v2.webp");
  g.drawImage(bg, 0, 0, 1080, 1620);
  const shade = g.createLinearGradient(0, 700, 0, 1920);
  shade.addColorStop(0, "#11101800");
  shade.addColorStop(0.48, "#111018ed");
  shade.addColorStop(1, "#111018");
  g.fillStyle = shade;
  g.fillRect(0, 700, 1080, 1220);
  g.textAlign = "left";
  g.fillStyle = "#f6e75a";
  g.font = "bold 34px sans-serif";
  g.fillText("INFLUENCERS BATTLE · PARAGUAY", 70, 1170);
  if (result.playerName) {
    g.fillStyle = "#ff5b9f";
    g.font = "900 42px sans-serif";
    g.fillText(result.playerName.toUpperCase(), 70, 1228, 940);
  }
  g.fillStyle = "#fff3dc";
  g.font = "900 72px sans-serif";
  g.fillText(fighter(result.hero).name, 70, result.playerName ? 1310 : 1270, 940);
  g.font = "38px sans-serif";
  g.fillText(episode(result.level).location, 70, result.playerName ? 1370 : 1330, 940);
  g.fillStyle = "#f6e75a";
  g.font = "900 125px sans-serif";
  g.fillText(Math.round(result.score).toLocaleString("es-PY"), 70, 1490);
  g.fillStyle = "#fff3dc";
  g.font = "30px sans-serif";
  g.fillText(
    `PUNTOS  /  ${Math.floor(result.time / 60)}:${String(Math.floor(result.time % 60)).padStart(2, "0")} MIN  /  COMBO ×${result.combo}`,
    70,
    1550,
  );
  g.font = "bold 50px sans-serif";
  g.fillText("¿SUPERÁS MI PARTIDA?", 70, 1690);
  g.font = "25px sans-serif";
  g.fillStyle = "#beb8c7";
  g.fillText("Ficción satírica · Sin afiliación con las personas representadas", 70, 1790, 940);
  g.font = "24px sans-serif";
  g.fillText("Compartí el enlace del desafío junto a esta tarjeta.", 70, 1840, 940);
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo crear la tarjeta."))),
      "image/png",
    ),
  );
}
export function downloadCard(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "influencers-battle-mi-partida.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
