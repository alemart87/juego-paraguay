// Arma el PDF (A5) de cada guía desde src/jesus/guias/content/<id>.json.
// Uso: node scripts/jesus-guias/render.mjs [dinero amor hijos trabajo]
// Salida: assets/guias/jesus-te-ama-30-dias-<id>.pdf
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const catalog = JSON.parse(await readFile(join(root, "src/jesus/guias/catalog.json"), "utf8"));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : catalog.guides.map((g) => g.id);
const outDir = join(root, "assets", "guias");
const tmpDir = join(root, "work", "guias");
await mkdir(outDir, { recursive: true });
await mkdir(tmpDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const paras = (s) =>
  String(s)
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/_{3,}/g, '<span class="blank"></span>')}</p>`)
    .join("");
const verses = (s) =>
  String(s)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<span>${esc(l)}</span>`)
    .join("<br>");

const weekOf = (guide, day) => {
  if (day >= 29) return guide.closing.replace(/^Días 29 y 30:\s*/i, "");
  return guide.weeks[Math.min(3, Math.floor((day - 1) / 7))];
};

function html(guide, content, coverUrl, cruzUrl) {
  const price = `USD ${catalog.price_usd.toFixed(2).replace(".", ",")}`;
  const days = content.dias
    .map(
      (d) => `
<section class="day">
  <header>
    <span class="kicker">Día ${d.dia} · ${esc(weekOf(guide, d.dia))}</span>
    <h2>${esc(d.titulo)}</h2>
  </header>
  <blockquote class="verse">“${esc(d.versiculo.texto)}”<cite>${esc(d.versiculo.ref)}</cite></blockquote>
  <h3>Palabra de Jesús</h3>
  ${paras(d.palabra)}
  <h3>Oración</h3>
  <div class="prayer">${paras(d.oracion)}</div>
  <footer><b>${esc(guide.title)}</b> · Jesús te ama · día ${d.dia} de 30</footer>
</section>
<section class="day day-b">
  <span class="kicker">Día ${d.dia} · segunda parte</span>
  <h3>Alabanza · <em>${esc(d.alabanza.titulo)}</em></h3>
  <div class="praise">${verses(d.alabanza.texto)}</div>
  <h3>El paso de hoy</h3>
  <p class="step">${esc(d.paso)}</p>
  <h3>Para repetir durante el día</h3>
  <p class="decl">“${esc(d.declaracion)}”</p>
  <div class="journal"><span>Lo que le dije hoy a Jesús</span><i></i><i></i><i></i><i></i></div>
  <div class="journal"><span>Hoy le agradezco por</span><i></i><i></i></div>
  <div class="check"><b></b> Oré a la misma hora &nbsp;&nbsp; <b></b> Lo dije en voz alta &nbsp;&nbsp; <b></b> Hice el paso de hoy</div>
  <footer><b>${esc(guide.title)}</b> · Jesús te ama · día ${d.dia} de 30</footer>
</section>`,
    )
    .join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Figtree:wght@400;600;800&display=swap">
<style>
  @page { size: A5; margin: 0; }
  :root { --gold:#b98a2e; --gold-light:#e7c77a; --ink:#2a1a0a; --paper:#fbf5e6; --muted:#6f5a3a; --line:#d9c6a3; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:var(--paper); color:var(--ink); font-family:"Cormorant Garamond", Georgia, serif; line-height:1.42; }
  section { font-size: 11.4pt; }
  section.fit-1 .verse { font-size: 11.4pt; } section.fit-2 .verse { font-size: 10.8pt; } section.fit-2 h2 { font-size: 18pt; }
  section { page-break-after: always; break-after: page; padding: 14mm 13mm 12mm; min-height: 210mm; position: relative; }
  .cover { background: radial-gradient(120% 80% at 50% 28%, #6b4413 0%, #2a1a0a 48%, #0c0703 100%); color:#fff5dc; text-align:center; padding-top: 18mm; }
  .cover .frame { width: 66mm; height: 66mm; border-radius:50%; margin: 0 auto 9mm; overflow:hidden; border: 1.2mm solid var(--gold-light); box-shadow: 0 0 18mm rgba(242,200,107,.45); }
  .cover .frame img { width:100%; height:100%; object-fit:cover; object-position: 50% 18%; }
  .cover .brand { font: 800 8.5pt/1 "Figtree", sans-serif; letter-spacing:.3em; color:var(--gold-light); }
  .cover h1 { font: 700 27pt/1.08 "Cormorant Garamond", serif; margin: 7mm 0 4mm; }
  .cover .sub { font: italic 500 13pt/1.35 "Cormorant Garamond", serif; color:#e9d9b5; margin: 0 6mm; }
  .cover .line { width: 24mm; height: .5mm; background: var(--gold-light); margin: 9mm auto; }
  .cover .how { font: 500 11pt/1.5 "Cormorant Garamond", serif; color:#d9c6a3; margin:0 4mm; }
  .cover .foot { position:absolute; left:0; right:0; bottom: 11mm; font: 600 8pt/1.4 "Figtree", sans-serif; letter-spacing:.14em; color:#b9a27a; }
  .kicker { display:block; font: 800 7.5pt/1 "Figtree", sans-serif; letter-spacing:.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 2.2mm; }
  h1.in { font: 700 22pt/1.1 "Cormorant Garamond", serif; margin: 0 0 4mm; }
  h2 { font: 700 20pt/1.1 "Cormorant Garamond", serif; margin: 0 0 3.5mm; }
  h3 { font: 800 7.8pt/1 "Figtree", sans-serif; letter-spacing:.2em; text-transform: uppercase; color: var(--gold); margin: 5mm 0 1.8mm; }
  h3 em { font: italic 600 10.5pt/1 "Cormorant Garamond", serif; letter-spacing: 0; text-transform:none; color: var(--ink); }
  p { margin: 0 0 2.4mm; }
  .verse { margin: 0 0 1mm; padding: 3mm 4mm; border-left: .8mm solid var(--gold); background: rgba(185,138,46,.08); font: italic 600 12.2pt/1.38 "Cormorant Garamond", serif; }
  .verse cite { display:block; margin-top: 1.5mm; font: 800 7.5pt/1 "Figtree", sans-serif; letter-spacing:.16em; color: var(--gold); font-style: normal; }
  .prayer { padding: 2.5mm 3.5mm; border: .3mm solid var(--line); border-radius: 2mm; }
  .prayer p { font-style: italic; }
  .blank { display:inline-block; width: 28mm; border-bottom: .3mm solid var(--ink); vertical-align: baseline; }
  .praise { font: 600 11pt/1.5 "Cormorant Garamond", serif; color:#4a3315; padding-left: 3mm; border-left: .3mm dotted var(--gold); }
  .step { font-weight: 600; }
  .decl { text-align:center; font: italic 600 12pt/1.3 "Cormorant Garamond", serif; color: var(--gold); margin: 3mm 0 2mm; }
  .journal { margin-top: 4mm; }
  .check { margin-top: 6mm; font: 600 9pt/1 "Figtree", sans-serif; color: var(--muted); }
  .check b { display:inline-block; width: 3.6mm; height: 3.6mm; border: .3mm solid var(--gold); border-radius: .8mm; vertical-align: -0.6mm; margin-right: 1mm; }
  .day-b .decl { font-size: 14pt; margin: 2mm 0 4mm; }
  .day-b .praise { font-size: 12pt; line-height: 1.6; }
  .journal span { display:block; font: 800 7pt/1 "Figtree", sans-serif; letter-spacing:.18em; text-transform:uppercase; color: var(--muted); margin-bottom: 1mm; }
  .journal i { display:block; height: 6.5mm; border-bottom: .25mm solid var(--line); }
  section footer { position:absolute; left: 13mm; right: 13mm; bottom: 7mm; font: 600 7pt/1 "Figtree", sans-serif; letter-spacing:.1em; color: var(--muted); display:flex; justify-content: space-between; }
  ul.rules { padding-left: 5mm; margin: 0 0 3mm; }
  ul.rules li { margin-bottom: 1.6mm; }
  .weeks { display:grid; grid-template-columns: 1fr 1fr; gap: 2mm; margin: 2mm 0 3.5mm; }
  .intro { font-size: 9.9pt; line-height: 1.36; padding-top: 11mm; }
  .intro .honest { font-size: 9.4pt; }
  .intro ul.rules li { margin-bottom: 1.2mm; }
  .weeks div { padding: 2.2mm 3mm; border: .3mm solid var(--line); border-radius: 2mm; }
  .weeks b { display:block; font: 800 7pt/1 "Figtree", sans-serif; letter-spacing:.18em; color: var(--gold); margin-bottom: 1mm; }
  .honest { padding: 2.5mm 3.5mm; background: rgba(185,138,46,.08); border-radius: 2mm; font-size: 10.6pt; }
  .closing { text-align:center; padding-top: 22mm; }
  .closing img { width: 42mm; height: 42mm; object-fit: cover; border-radius: 50%; border: .8mm solid var(--gold); margin-bottom: 6mm; }
  .closing .legal { margin-top: 14mm; font: 500 8pt/1.5 "Figtree", sans-serif; color: var(--muted); }
</style></head><body>

<section class="cover">
  <div class="brand">JESÚS TE AMA</div>
  <div class="line"></div>
  <div class="frame"><img src="${coverUrl}" alt=""></div>
  <h1>${esc(guide.title)}</h1>
  <p class="sub">${esc(guide.subtitle)}</p>
  <div class="line"></div>
  <p class="how">Un día a la vez: versículo, palabra de Jesús, oración, alabanza y un paso concreto. Treinta días, a rajatabla.</p>
  <div class="foot">PY-STAR GAMES · influencerspy.pro/jesus-te-ama</div>
</section>

<section class="intro">
  <span class="kicker">Antes de empezar</span>
  <h1 class="in">Has llegado aquí por algo.</h1>
  <p>Esta guía no es un libro para leer de corrido. Es un camino de treinta días para orar por ${esc(guide.short.replace(/^Guía de oración por /, ""))}, un día a la vez, con la disciplina que cambia un corazón. Yo te espero en cada página.</p>
  <h3>Cómo hacerla a rajatabla</h3>
  <ul class="rules">
    <li><b>Mismo horario cada día.</b> Elegí una hora (temprano es mejor) y defendela como una cita. Veinte minutos alcanzan.</li>
    <li><b>Un día por día.</b> No adelantes ni leas varios juntos. Si se te pasa uno, no abandones: lo hacés al día siguiente y seguís.</li>
    <li><b>En voz alta.</b> El versículo, la oración y la alabanza se dicen con la boca, no solo con los ojos. Donde veas una línea, poné tu nombre o lo que pedís.</li>
    <li><b>El paso de hoy se hace hoy.</b> Cada día trae una acción pequeña y posible. Sin ese paso, la oración queda a medias.</li>
    <li><b>Escribí.</b> Al final de cada día hay dos líneas: una frase alcanza. Al llegar al día 30 vas a leer tu propio camino.</li>
    <li><b>No lo hagas solo.</b> Si podés, contale a alguien que empezaste. Y cuando te pese, escribime por WhatsApp: acá estoy.</li>
  </ul>
  <h3>Las cuatro semanas</h3>
  <div class="weeks">
    ${guide.weeks.map((w, i) => `<div><b>SEMANA ${i + 1} · DÍAS ${i * 7 + 1} A ${i * 7 + 7}</b>${esc(w)}</div>`).join("")}
    <div><b>DÍAS 29 Y 30</b>${esc(guide.closing.replace(/^Días 29 y 30:\s*/i, ""))}</div>
  </div>
  <div class="honest"><b>Lo que te prometo y lo que no.</b> Te prometo mi presencia cada uno de estos días, mi paz y pasos posibles. No te prometo plazos ni resultados: ni plata, ni una persona, ni un trabajo en una fecha. Esta guía no reemplaza a un médico, a un abogado ni a la ayuda de tu gente. Es oración y disciplina, y eso ya cambia muchas cosas.</div>
  <footer><b>${esc(guide.title)}</b> · Jesús te ama</footer>
</section>

${days}

<section class="closing">
  <img src="${cruzUrl}" alt="">
  <span class="kicker">Día 30 cumplido</span>
  <h1 class="in">Lo hiciste.</h1>
  <p>Treinta días seguidos poniendo esto en mis manos. Volvé a leer lo que escribiste cada día y vas a ver por dónde te fui llevando. Lo que empezó como una guía, ahora es un hábito: no lo sueltes.</p>
  <p>Si este camino te hizo bien, pasáselo a alguien que lo necesite y escribime para contarme cómo te fue. Yo sigo acá.</p>
  <p class="decl">“Yo estoy con ustedes todos los días.” · Mateo 28:20</p>
  <p class="legal">${esc(guide.title)} · Jesús te ama · PY-STAR GAMES, Paraguay.<br>Uso personal. ${price}. Versículos en versión propia, fiel al texto bíblico. Alabanzas originales.<br>WhatsApp: +1 (208) 379-9810 · influencerspy.pro/jesus-te-ama</p>
</section>
</body></html>`;
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const id of ids) {
    const guide = catalog.guides.find((g) => g.id === id);
    if (!guide) throw new Error(`guía desconocida ${id}`);
    const content = JSON.parse(await readFile(join(root, "src/jesus/guias/content", `${id}.json`), "utf8"));
    if (content.dias.length !== 30) throw new Error(`${id}: ${content.dias.length} días`);
    const coverUrl = pathToFileURL(join(root, "public/jesus", guide.cover)).href;
    const cruzUrl = pathToFileURL(join(root, "public/jesus/cruz.jpg")).href;
    const file = join(tmpDir, `${id}.html`);
    await writeFile(file, html(guide, content, coverUrl, cruzUrl), "utf8");
    const page = await browser.newPage({ viewport: { width: Math.round((148 * 96) / 25.4), height: Math.round((210 * 96) / 25.4) } });
    await page.emulateMedia({ media: "print" });
    await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Ajuste automático: si una página desborda, achica su tipografía hasta que entre.
    const shrunk = await page.evaluate(() => {
      const pageHeight = (210 * 96) / 25.4 + 1;
      const out = [];
      document.querySelectorAll("section").forEach((section, i) => {
        if (section.classList.contains("cover")) return;
        let size = parseFloat(getComputedStyle(section).fontSize) * 0.75; // px → pt
        let level = 0;
        while (section.scrollHeight > pageHeight && size > 8.2) {
          size -= 0.25;
          level++;
          section.style.fontSize = `${size}pt`;
          section.style.lineHeight = size < 10 ? "1.34" : "1.4";
          section.classList.toggle("fit-1", level >= 2);
          section.classList.toggle("fit-2", level >= 5);
        }
        if (level) out.push(`${i}:${size.toFixed(2)}pt${section.scrollHeight > pageHeight ? "!" : ""}`);
      });
      return out;
    });
    if (shrunk.length) console.log(`${id}: ajustadas ${shrunk.length} páginas (${shrunk.join(" ")})`);
    const out = join(outDir, `jesus-te-ama-30-dias-${id}.pdf`);
    await page.pdf({ path: out, format: "A5", printBackground: true, preferCSSPageSize: true });
    await page.close();
    const size = (await readFile(out)).length;
    console.log(`${id}: ${out} (${Math.round(size / 1024)} KB)`);
  }
} finally {
  await browser.close();
}
