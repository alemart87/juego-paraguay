import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createWorld,
  step,
  snapshot,
  activatePower,
  applyChoice,
  applyShopPowerup,
  drainEvents,
  type Action,
  type World,
} from "./engine";
import { FIGHTERS, rivalFor, type EpisodeId } from "./content";
import { defaultSave, loadSave, saveResult } from "./persistence";
import { claimScoreRewards, consumeReward, emptyRewardWallet } from "./rewards";

function tick(w: World, seconds: number, move = 0, attack = false, actions: Action[] = []) {
  for (let n = 0; n < Math.ceil(seconds * 60); n++)
    step(w, { move, attack, actions: new Set(n === 0 ? actions : []) }, 1 / 60);
}
test("score rewards are granted once per episode and can be consumed", () => {
  const first = claimScoreRewards(emptyRewardWallet(), 1, 1_900);
  assert.deepEqual(
    first.awarded.map((reward) => reward.sku),
    ["terere", "energia"],
  );
  assert.equal(first.wallet.stock.terere, 1);
  const repeated = claimScoreRewards(first.wallet, 1, 4_000);
  assert.deepEqual(
    repeated.awarded.map((reward) => reward.sku),
    ["arsenal"],
  );
  assert.equal(claimScoreRewards(repeated.wallet, 1, 9_000).awarded.length, 0);
  assert.equal(claimScoreRewards(repeated.wallet, 2, 700).wallet.stock.terere, 2);
  assert.equal(consumeReward(repeated.wallet, "arsenal")?.stock.arsenal, 0);
});
test("shop powerups alter the active battle immediately", () => {
  const w = createWorld("masivo", 1, "tranqui");
  w.player.hp = 10;
  assert.equal(applyShopPowerup(w, "terere").ok, true);
  assert.equal(w.player.hp, w.player.maxHp);
  const grenades = w.grenades;
  applyShopPowerup(w, "arsenal");
  assert(w.grenades > grenades);
  applyShopPowerup(w, "energia");
  assert.equal(w.player.super, 100);
  applyShopPowerup(w, "inmunidad");
  assert(w.player.inv > w.t);
});
test("A/left decreases x, D/right increases x; released movement stops", () => {
  const w = createWorld("onichan", 1, "tranqui");
  w.enemies = [];
  const initial = w.player.x;
  tick(w, 0.2, -1);
  assert(w.player.x < initial);
  const left = w.player.x;
  tick(w, 0.3, 1);
  assert(w.player.x > left);
  tick(w, 0.5);
  assert(Math.abs(w.player.vx) < 1);
});
test("jump lands and dash respects its cooldown", () => {
  const w = createWorld("masivo", 1, "tranqui");
  w.enemies = [];
  tick(w, 0.15, 0, false, ["jump"]);
  assert(w.player.y > 40);
  tick(w, 1);
  assert.equal(w.player.y, 0);
  tick(w, 0.1, 1, false, ["dash"]);
  const cooldown = w.player.dashReady;
  tick(w, 0.1, 1, false, ["dash"]);
  assert.equal(w.player.dashReady, cooldown);
});
test("pause freezes physics and timer; choices resume and have bounded consequences", () => {
  const w = createWorld("papu", 2, "tranqui");
  w.paused = true;
  tick(w, 1, 1, true);
  assert.equal(w.t, 0);
  assert.equal(w.player.x, 100);
  w.player.hp = 10;
  applyChoice(w, 2);
  assert.equal(w.player.hp, 75);
  assert.equal(w.paused, false);
  applyChoice(w, 1);
  assert.equal(w.player.super, 100);
});
test("every fighter has a cooldown and a distinct visible power; supers consume hype", () => {
  for (const f of FIGHTERS) {
    const w = createWorld(f.id, 1, "tranqui");
    w.player.x = 400;
    activatePower(w);
    assert(w.player.powerReady > 0, f.id);
    assert(w.effects.length > 0 || w.shots.length > 0, f.id);
    const ready = w.player.powerReady;
    activatePower(w);
    assert.equal(w.player.powerReady, ready);
    w.player.super = 100;
    activatePower(w);
    assert(w.player.super < 100, f.id);
  }
});
test("premium fighters have complete combat mechanics", () => {
  const marito = createWorld("marito", 1, "picante");
  assert.equal(marito.player.inv, Number.POSITIVE_INFINITY);
  const targetHp = marito.enemies[0]!.hp;
  marito.player.face = 1;
  tick(marito, 0.05, 0, true);
  assert(marito.shots.some((shot) => shot.kind === "missile"), "Marito fires missiles");
  tick(marito, 0.8);
  assert(marito.enemies[0]!.hp < targetHp, "Marito missile locks onto a target");
  marito.player.super = 100;
  const hpBeforeNuke = marito.enemies.reduce((total, enemy) => total + enemy.hp, 0);
  activatePower(marito);
  assert(marito.effects.some((effect) => effect.kind === "nuke"), "Marito has a nuclear ultimate");
  assert(
    marito.enemies.reduce((total, enemy) => total + enemy.hp, 0) < hpBeforeNuke,
    "The nuclear ultimate deals area damage",
  );

  const pablito = createWorld("pablito", 1, "picante");
  pablito.player.x = 400;
  activatePower(pablito);
  assert(
    pablito.enemies.some((enemy) => enemy.slow > pablito.t),
    "Pablito charms and slows nearby enemies",
  );
  assert(pablito.effects.length > 0, "Pablito power has visible effects");
});
test("empty gun swaps to an available weapon; melee remains usable", () => {
  const w = createWorld("masivo", 1, "tranqui");
  for (const id of ["ak", "pistol", "smg", "shotgun"] as const) w.ammo[id] = 0;
  tick(w, 0.1, 0, true);
  assert.equal(w.weapon, "bat");
  assert.equal(w.player.hp, w.player.maxHp);
});
test("checkpoint cannot advance before clearing its arena", () => {
  const w = createWorld("masivo", 1, "tranqui");
  w.player.x = 1320;
  tick(w, 0.1, 0, false, ["interact"]);
  assert.equal(w.stage, 0);
  w.enemies.forEach((e) => (e.hp = 0));
  tick(w, 0.1, 0, false, ["interact"]);
  assert.equal(w.stage, 1);
  assert(w.paused);
  assert(drainEvents(w).some((e) => e.type === "talk"));
});
test("selected hero is never assigned as their own rival", () => {
  for (const f of FIGHTERS)
    for (const level of [1, 2, 3, 4] as EpisodeId[]) assert.notEqual(rivalFor(level, f.id), f.id);
});
test("same seed and input produce the same battle", () => {
  const a = createWorld("comadre", 2, "tranqui", 345),
    b = createWorld("comadre", 2, "tranqui", 345);
  tick(a, 2, 1, true, ["power"]);
  tick(b, 2, 1, true, ["power"]);
  assert.deepEqual(snapshot(a), snapshot(b));
  assert.deepEqual(a.enemies, b.enemies);
});
test("save rejects corrupt records and retains independent best score/time/medals", () => {
  const s = saveResult(defaultSave(), 1, { score: 100, time: 120, medals: 1, hero: "masivo" });
  const next = saveResult(s, 1, { score: 80, time: 110, medals: 2, hero: "papu" });
  assert.equal(next.records[1]?.score, 100);
  assert.equal(next.records[1]?.time, 110);
  assert.equal(next.records[1]?.medals, 2);
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () =>
        JSON.stringify({ version: 1, hero: "missing", records: { 1: { score: "bad" } } }),
    },
  });
  assert.deepEqual(loadSave(), defaultSave());
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: original });
});
test("all episodes can be completed through real attacks and checkpoint interactions", () => {
  for (const hero of FIGHTERS)
    for (const level of [1, 2, 3, 4] as EpisodeId[]) {
      const w = createWorld(hero.id, level, "tranqui", 54321);
      for (let frame = 0; frame < 60 * 300 && !w.ended; frame++) {
        if (w.paused) {
          applyChoice(w, w.player.hp < 80 ? 2 : 1);
          continue;
        }
        const p = w.player;
        const target = w.enemies
          .filter((e) => e.hp > 0)
          .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
        const actions = new Set<Action>();
        let move = 0;
        if (target) {
          const dx = target.x - p.x;
          if (Math.abs(dx) > 300) move = Math.sign(dx);
          else if (Math.abs(dx) < 130) move = -Math.sign(dx);
          else p.face = dx > 0 ? 1 : -1;
          if (frame % 65 === 0) actions.add("jump");
          if (frame % 190 === 0) actions.add("grenade");
          if (p.super >= 100 || Math.abs(dx) < 230) actions.add("power");
          if (target.windup > w.t && Math.abs(dx) < 100) actions.add("dash");
        } else {
          const goal = w.stage === 0 ? 1320 : 2820;
          move = Math.abs(p.x - goal) > 25 ? Math.sign(goal - p.x) : 0;
          actions.add("interact");
        }
        step(w, { move, attack: !!target, actions }, 1 / 60);
        drainEvents(w);
      }
      assert(
        w.ended,
        `episode ${level} did not end: stage ${w.stage}, x ${w.player.x}, enemies ${w.enemies.filter((e) => e.hp > 0).length}`,
      );
      assert(w.player.hp > 0, `${hero.id} episode ${level} player died`);
    }
});
test("each episode spawns its named boss with a unique projectile language", () => {
  const expected = {
    1: { name: "PADRE APÓSTOL", shot: "lightning" },
    2: { name: "LATA PARARA", shot: "can" },
    3: { name: "LULAX", shot: "word" },
    4: { name: "EL DICTADOR", shot: "sling" },
  } as const;
  for (const level of [1, 2, 3, 4] as EpisodeId[]) {
    const w = createWorld("onichan", level, "tranqui", 99);
    for (const checkpoint of [1320, 2820]) {
      w.enemies.forEach((enemy) => (enemy.hp = 0));
      w.player.x = checkpoint;
      tick(w, 0.05, 0, false, ["interact"]);
      applyChoice(w, 0);
    }
    const finalBoss = w.enemies.find((enemy) => enemy.kind === "boss");
    assert(finalBoss, `episode ${level} has no boss`);
    assert.equal(snapshot(w).boss?.name, expected[level].name);
    w.enemies.forEach((enemy) => {
      if (enemy.kind === "minion") enemy.hp = 0;
    });
    w.player.x = 3900;
    w.player.inv = Infinity;
    let seen = false;
    for (let frame = 0; frame < 60 * 4 && !seen; frame++) {
      step(w, { move: 0, attack: false, actions: new Set() }, 1 / 60);
      seen = w.shots.some((shot) => shot.kind === expected[level].shot);
    }
    assert(seen, `${expected[level].name} did not use ${expected[level].shot}`);
  }
});

test("El Dictador consumes a full second life before the episode can end", () => {
  const w = createWorld("masivo", 4, "tranqui", 404);
  for (const checkpoint of [1320, 2820]) {
    w.enemies.forEach((enemy) => (enemy.hp = 0));
    w.player.x = checkpoint;
    tick(w, 0.05, 0, false, ["interact"]);
    applyChoice(w, 1);
  }
  const finalBoss = w.enemies.find((enemy) => enemy.kind === "boss");
  assert(finalBoss);
  w.enemies.forEach((enemy) => {
    if (enemy.kind === "minion") enemy.hp = 0;
  });
  w.player.x = finalBoss.x - 80;
  finalBoss.hp = 1;
  w.player.super = 100;
  activatePower(w);
  assert.equal(finalBoss.lives, 1);
  assert.equal(finalBoss.hp, finalBoss.maxHp);
  assert.equal(w.ended, false);
  finalBoss.hp = 1;
  w.player.x = finalBoss.x - 80;
  w.player.super = 100;
  activatePower(w);
  assert.equal(finalBoss.hp, 0);
  assert.equal(w.ended, true);
});
