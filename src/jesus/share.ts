/** Tarjeta de luz para compartir (1080×1350): sin datos privados, solo el tema. */
const FONT = '"Cormorant Garamond", Georgia, serif';

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(c: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && c.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function lightCard(opts: {
  name: string;
  shareLabel: string;
  verse: { text: string; ref: string };
  thanks?: string;
}) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  await document.fonts?.load(`600 60px ${FONT}`).catch(() => undefined);
  const bg = c.createRadialGradient(W / 2, H * 0.32, 60, W / 2, H * 0.5, H * 0.8);
  bg.addColorStop(0, "#f2c86b");
  bg.addColorStop(0.35, "#8a5a1c");
  bg.addColorStop(1, "#1a1008");
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  const img = await loadImage("/jesus/sagrado-corazon.jpg");
  if (img) {
    const r = 250;
    c.save();
    c.beginPath();
    c.arc(W / 2, 360, r, 0, Math.PI * 2);
    c.closePath();
    c.clip();
    const s = (r * 2) / Math.min(img.width, img.height);
    c.drawImage(img, W / 2 - (img.width * s) / 2, 360 - (img.height * s) / 2 - 20, img.width * s, img.height * s);
    c.restore();
    c.strokeStyle = "#ffe9b0";
    c.lineWidth = 8;
    c.beginPath();
    c.arc(W / 2, 360, r + 4, 0, Math.PI * 2);
    c.stroke();
  }
  c.textAlign = "center";
  c.fillStyle = "#fff5dc";
  c.font = `italic 600 44px ${FONT}`;
  c.fillText("Hoy pedí por", W / 2, 700);
  c.font = `700 84px ${FONT}`;
  c.fillText(opts.shareLabel, W / 2, 790);
  if (opts.name) {
    c.font = `600 40px ${FONT}`;
    c.fillStyle = "#f2c86b";
    c.fillText(opts.name, W / 2, 850);
  }
  c.fillStyle = "#fff5dc";
  c.font = `italic 500 40px ${FONT}`;
  const lines = wrap(c, `“${opts.verse.text}”`, W - 200);
  lines.forEach((line, i) => c.fillText(line, W / 2, 950 + i * 52));
  c.font = `600 34px ${FONT}`;
  c.fillStyle = "#f2c86b";
  c.fillText(opts.verse.ref, W / 2, 960 + lines.length * 52 + 10);
  if (opts.thanks) {
    c.font = `700 40px ${FONT}`;
    c.fillStyle = "#fff5dc";
    c.fillText(opts.thanks, W / 2, H - 200);
  }
  c.font = `600 30px ${FONT}`;
  c.fillStyle = "#ffe9b0";
  c.fillText("Jesús te ama · influencerspy.pro/jesus-te-ama", W / 2, H - 90);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("card"))), "image/png"),
  );
}
