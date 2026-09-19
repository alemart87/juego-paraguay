import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:8081/";
const errors = [];
const browser = await chromium.launch({ headless: true });

async function watch(page, label) {
  page.on("pageerror", (error) => errors.push(`${label}: ${error.stack ?? error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
}

async function enterBattle(page) {
  await page.goto(`${base}?qa=1`, { waitUntil: "networkidle" });
  const skipIntro = page.getByRole("button", { name: "Saltar intro" });
  if (await skipIntro.isVisible().catch(() => false)) await skipIntro.click();
  await page.getByRole("button", { name: "Entrar a la batalla", exact: true }).click();
  await page.getByRole("button", { name: "Elegir escenario", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "En vivo y sin filtro" }).click();
  await page.getByRole("button", { name: /Jugar con/ }).click();
  await page.waitForFunction(() => window.__battleWorld?.().t > 0.15, null, { timeout: 15000 });
}

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await watch(desktop, "desktop");
await enterBattle(desktop);
const startX = await desktop.evaluate(() => window.__battleControls.getX());
await desktop.keyboard.down("KeyD");
await desktop.waitForTimeout(350);
await desktop.keyboard.up("KeyD");
const movedX = await desktop.evaluate(() => window.__battleControls.getX());
if (movedX <= startX + 10) errors.push("desktop: D no movió al personaje");
await desktop.keyboard.press("Space");
await desktop.waitForTimeout(100);
if ((await desktop.evaluate(() => window.__battleControls.getY())) <= 0)
  errors.push("desktop: salto no despegó");
await desktop.keyboard.press("Escape");
await desktop.getByRole("dialog", { name: "Pausa" }).waitFor();
await desktop.getByRole("button", { name: /Seguir jugando/ }).click();

for (let section = 0; section < 5; section++) {
  const state = await desktop.evaluate(() => {
    const w = window.__battleWorld();
    for (let frame = 0; frame < 60 * 300 && !w.ended && !w.paused; frame++) {
      const target = w.enemies
        .filter((enemy) => enemy.hp > 0)
        .sort((a, b) => Math.abs(a.x - w.player.x) - Math.abs(b.x - w.player.x))[0];
      const actions = [];
      let move = 0;
      if (target) {
        const dx = target.x - w.player.x;
        if (Math.abs(dx) > 300) move = Math.sign(dx);
        else if (Math.abs(dx) < 130) move = -Math.sign(dx);
        else w.player.face = dx > 0 ? 1 : -1;
        if (frame % 65 === 0) actions.push("jump");
        if (frame % 190 === 0) actions.push("grenade");
        if (w.player.super >= 100 || Math.abs(dx) < 230) actions.push("power");
        if (target.windup > w.t && Math.abs(dx) < 100) actions.push("dash");
      } else {
        const goal = w.stage === 0 ? 1010 : 2180;
        move = Math.abs(w.player.x - goal) > 25 ? Math.sign(goal - w.player.x) : 0;
        actions.push("interact");
      }
      window.__battleStep(move, Boolean(target), actions);
    }
    return { ended: w.ended, paused: w.paused, hp: w.player.hp, stage: w.stage };
  });
  await desktop.waitForTimeout(150);
  if (state.ended) break;
  if (state.paused) {
    const talk = desktop.getByRole("dialog", { name: /Conversación con/ });
    await talk.waitFor();
    if (section === 0) {
      await talk.getByLabel("Mensaje al personaje").fill("¿Qué pasó con el directo?");
      await talk.getByRole("button", { name: "Enviar a la IA" }).click();
      await talk.getByRole("status").waitFor({ timeout: 10000 });
    }
    await talk.locator(".dialogue-choices button").first().click();
    await talk.getByRole("button", { name: /Volver a la batalla/ }).click();
    if (section === 1) {
      await desktop.getByText("PASTOR LUISON", { exact: true }).waitFor();
      await desktop.evaluate(() => {
        const w = window.__battleWorld();
        w.player.x = 2700;
        w.player.inv = w.t + 2;
      });
      await desktop.waitForTimeout(700);
      await desktop.screenshot({ path: "screenshots/battle-luison-prod.png" });
    }
  }
}
await desktop.getByText(/El feed es tuyo/i).waitFor({ timeout: 10000 });
await desktop.screenshot({ path: "screenshots/battle-result-prod.png", fullPage: true });
await desktop.getByRole("button", { name: /Compartir partida/ }).click();
await desktop.getByRole("dialog", { name: "Compartir partida" }).waitFor();
await desktop.locator(".share-preview").waitFor({ timeout: 10000 });
const challenge = await desktop.getByLabel("Enlace del desafío").inputValue();
if (!challenge.includes("fighter=") || !challenge.includes("seed="))
  errors.push("desktop: enlace de desafío incompleto");
await desktop.getByRole("button", { name: "Cerrar" }).click();
await desktop.getByRole("button", { name: "Ranking", exact: true }).last().click();
const ranking = desktop.getByRole("dialog", { name: "Ranking de jugadores" });
await ranking.waitFor();
const qaName = `QA${Date.now().toString().slice(-8)}`;
await ranking.getByLabel("Nombre público").fill(qaName);
await ranking.getByLabel("Correo privado").fill(`${qaName.toLowerCase()}@example.test`);
await ranking.getByLabel(/Acepto publicar/).check();
await ranking.getByRole("button", { name: "Entrar al ranking" }).click();
await ranking.getByText(qaName, { exact: true }).waitFor({ timeout: 10000 });

const mobileContext = await browser.newContext({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
});
const mobile = await mobileContext.newPage();
await watch(mobile, "mobile");
await enterBattle(mobile);
const beforeTouch = await mobile.evaluate(() => window.__battleControls.getX());
const joystick = await mobile.getByRole("group", { name: "Joystick de movimiento" }).boundingBox();
const attack = await mobile.getByRole("button", { name: "Atacar" }).boundingBox();
if (!joystick || !attack) throw new Error("No se encontraron los controles táctiles");
const cdp = await mobileContext.newCDPSession(mobile);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [
    { x: joystick.x + joystick.width * 0.85, y: joystick.y + joystick.height / 2, id: 1 },
    { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 2 },
  ],
});
await mobile.waitForTimeout(400);
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await mobile.waitForTimeout(100);
const afterTouch = await mobile.evaluate(() => window.__battleControls.getX());
if (afterTouch <= beforeTouch + 8)
  errors.push("mobile: joystick multitáctil no movió al personaje");
await mobile.screenshot({ path: "screenshots/battle-mobile-prod.png" });
if (
  await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
)
  errors.push("mobile: hay desbordamiento horizontal");

await browser.close();
if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      ok: true,
      desktop: "movimiento, salto, pausa, campaña, resultado, tarjeta, desafío y ranking",
      mobile: "joystick + ataque simultáneos, sin desbordamiento",
    },
    null,
    2,
  ),
);
