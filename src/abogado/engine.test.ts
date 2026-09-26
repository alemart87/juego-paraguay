import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ROUNDS,
  ROUND_SECONDS,
  canJail,
  createWorld,
  hpForRound,
  layout,
  snapshot,
  step,
  throwPunch,
  type World,
} from "./engine";
import { SPECIAL_COST, SPECIAL_HIT_AT } from "./specials";

const play = () => createWorld({ weapon: "punos", goldTitle: false, owned: ["punos"] });

/** Un puñetazo a la cara que ya resolvió su impacto. */
function punchHead(w: World) {
  const L = layout(w);
  throwPunch(w, L.headCx, L.headCy, 1);
  for (let i = 0; i < 4; i++) step(w, 0.03);
}

/** Pega hasta noquearlo (o hasta que se agoten los intentos). */
function beatDown(w: World, max = 400) {
  for (let i = 0; i < max && w.mood !== "ko" && !w.ended; i++) punchHead(w);
}

test("te reta apenas entrás: se ríe y arranca el round 1", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  assert.equal(w.opened, true);
  assert.equal(w.mood, "laugh");
  assert.equal(w.laughs, 1);
  assert.ok(w.speech?.text);
  assert.ok(w.texts.some((t) => t.text === "ROUND 1"));
});

test("el round 1 tiene más vida y un K.O. pasa al round 2 con la campana", () => {
  const w = play();
  assert.equal(w.maxHp, hpForRound(1));
  assert.ok(w.maxHp >= 220);
  beatDown(w);
  assert.equal(w.mood, "ko");
  assert.equal(w.kos, 1);
  assert.equal(w.round, 1);
  for (let i = 0; i < 80; i++) step(w, 0.05);
  assert.equal(w.round, 2);
  assert.equal(w.maxHp, hpForRound(2));
  assert.equal(w.hp, w.maxHp);
  assert.ok(w.timeLeft > ROUND_SECONDS - 5);
  assert.equal(w.ended, false);
});

test("la campana sin K.O. pasa de round y no termina la partida", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  w.timeLeft = 0.01;
  step(w, 0.05);
  assert.equal(w.round, 2);
  assert.equal(w.ended, false);
  assert.equal(w.mood, "laugh");
});

test("A la cárcel solo en el round final", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  beatDown(w);
  assert.equal(w.kos, 1);
  assert.equal(canJail(w), false);
  w.round = ROUNDS - 1;
  w.roundKos = 1;
  assert.equal(canJail(w), false);
  w.round = ROUNDS;
  Object.assign(w, { mood: "idle" });
  assert.equal(canJail(w), true);
  w.roundKos = 0;
  w.timeLeft = ROUND_SECONDS;
  assert.equal(canJail(w), false);
  w.timeLeft = ROUND_SECONDS - 25;
  assert.equal(canJail(w), true);
  assert.equal(snapshot(w).finalRound, true);
});

test("en el round final el tiempo agotado termina la partida", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  w.round = ROUNDS;
  w.timeLeft = 0.01;
  step(w, 0.05);
  assert.equal(w.ended, true);
});

test("los puntos llenan el medidor y la carta especial golpea sola", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  Object.assign(w, { mood: "idle", moodUntil: 0 });
  let guard = 0;
  while (w.specialsFired === 0 && guard++ < 600 && !w.ended) {
    punchHead(w);
    if (w.mood === "ko") for (let i = 0; i < 80; i++) step(w, 0.05);
  }
  assert.equal(w.specialsFired, 1);
  assert.ok(w.score >= SPECIAL_COST);
  assert.ok(w.specialActive);
  assert.ok(w.texts.some((t) => t.text === "¡ARMA ESPECIAL!"));
  const before = w.hp;
  const round = w.round;
  for (let i = 0; i < 60 && !w.specialActive?.hit; i++) step(w, 0.02);
  assert.ok(w.t - w.specialActive!.t0 >= SPECIAL_HIT_AT);
  assert.ok(w.hp < before || w.round > round || w.mood === "ko");
  assert.equal(snapshot(w).specialName !== null, true);
});

test("a Hernán le llega un refuerzo: la carta Bachi lo cura mientras se ríe", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  Object.assign(w, { mood: "idle", moodUntil: 0, hp: 50, nextPowerAt: 0 });
  step(w, 0.05);
  assert.ok(w.powerActive);
  assert.equal(w.powersUsed, 1);
  assert.equal(w.mood, "laugh");
  assert.ok(w.speech?.text.includes("Bachi"));
  for (let i = 0; i < 40 && !w.powerActive?.hit; i++) step(w, 0.02);
  assert.ok(w.hp > 50);
  assert.ok(snapshot(w).powerName);
});

test("la foto oficial blinda y el tereré lo acelera", () => {
  const w = play();
  for (let i = 0; i < 20; i++) step(w, 0.05);
  Object.assign(w, { mood: "idle", moodUntil: 0, nextPowerAt: 0, powerIndex: 1 });
  step(w, 0.05);
  for (let i = 0; i < 40 && !w.powerActive?.hit; i++) step(w, 0.02);
  assert.ok(w.shieldUntil > w.t);
  assert.equal(snapshot(w).shield, true);
  Object.assign(w, { powerActive: null, mood: "idle", moodUntil: 0, nextPowerAt: 0, powerIndex: 2 });
  step(w, 0.05);
  for (let i = 0; i < 40 && !w.powerActive?.hit; i++) step(w, 0.02);
  assert.ok(w.hypeUntil > w.t);
  assert.ok(w.papers.length >= 2);
});
