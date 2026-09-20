import { episode, fighter } from "./content";
import { CHECKPOINTS, STAGE_WIDTH, type World, type Enemy } from "./engine";

export interface Art {
  background: HTMLImageElement;
  frames: HTMLCanvasElement[][];
  poses: HTMLCanvasElement[][];
  bosses: HTMLImageElement;
  minions: HTMLImageElement;
  asuncionCombatants: HTMLImageElement;
  apostolCombatants: HTMLImageElement;
  premium: HTMLImageElement[];
}
const images = new Map<string, Promise<HTMLImageElement>>();
function load(src: string): Promise<HTMLImageElement> {
  let promise = images.get(src);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => {
        images.delete(src);
        reject(new Error(`No se pudo cargar ${src}`));
      };
      i.src = src;
    });
    images.set(src, promise);
  }
  return promise;
}
let framesPromise: Promise<HTMLCanvasElement[][]> | undefined;
let posesPromise: Promise<HTMLCanvasElement[][]> | undefined;
function atlas(src: string, cuts: number[]) {
  return load(src).then((sheet) => {
    const cw = sheet.width / 4;
    // Authored atlas row boundaries. Chroma extraction is part of the game's
    // asset loader, performed once, never during the animation loop.
    const rows = cuts.map((y) => Math.round((y * sheet.height) / 1536));
    const list: HTMLCanvasElement[][] = [];
    for (let row = 0; row < 6; row++) {
      const run: HTMLCanvasElement[] = [];
      for (let col = 0; col < 4; col++) {
        const ch = rows[row + 1] - rows[row];
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(sheet, col * cw, rows[row], cw, ch, 0, 0, cw, ch);
        const pixels = ctx.getImageData(0, 0, cw, ch);
        let bottom = 0;
        for (let i = 0; i < pixels.data.length; i += 4) {
          const r = pixels.data[i],
            green = pixels.data[i + 1],
            b = pixels.data[i + 2];
          const excess = green - Math.max(r, b);
          if (excess > 35) {
            pixels.data[i + 3] = Math.round(255 * Math.max(0, 1 - (excess - 35) / 65));
            pixels.data[i + 1] = Math.min(green, Math.max(r, b) + 20);
          }
          if (pixels.data[i + 3] > 80) bottom = Math.max(bottom, Math.floor(i / 4 / cw));
        }
        ctx.putImageData(pixels, 0, 0);
        const aligned = document.createElement("canvas");
        aligned.width = 256;
        aligned.height = 256;
        const scale = Math.min(1, 246 / ch);
        aligned
          .getContext("2d")!
          .drawImage(canvas, (256 - cw * scale) / 2, 250 - bottom * scale, cw * scale, ch * scale);
        run.push(aligned);
      }
      list.push(run);
    }
    return list;
  });
}
function frames() {
  if (!framesPromise)
    framesPromise = atlas("/battle/fighters.webp", [0, 255, 509, 763, 1010, 1258, 1536]).catch(
      (e) => {
        framesPromise = undefined;
        throw e;
      },
    );
  return framesPromise;
}
function poses() {
  if (!posesPromise)
    posesPromise = atlas("/battle/poses.webp", [0, 256, 512, 768, 1024, 1280, 1536]).catch((e) => {
      posesPromise = undefined;
      throw e;
    });
  return posesPromise;
}
export async function loadArt(level: World["level"]): Promise<Art> {
  const [
    background,
    items,
    actionPoses,
    bosses,
    minions,
    asuncionCombatants,
    apostolCombatants,
    pablito,
    marito,
  ] = await Promise.all([
    load(episode(level).bg),
    frames(),
    poses(),
    load("/battle/bosses.webp"),
    load("/battle/minions.webp"),
    load("/battle/asuncion-combatants.webp"),
    load("/battle/apostol-combatants.webp"),
    load("/battle/premium/pablito-atlas.webp"),
    load("/battle/premium/marito-atlas.webp"),
  ]);
  return {
    background,
    frames: items,
    poses: actionPoses,
    bosses,
    minions,
    asuncionCombatants,
    apostolCombatants,
    premium: [pablito, marito],
  };
}
function rect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  r = 0,
) {
  g.fillStyle = color;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}
function label(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 14,
  color = "#fff3dc",
) {
  g.fillStyle = color;
  g.font = `800 ${size}px "Barlow Condensed", Impact, sans-serif`;
  g.textAlign = "center";
  g.fillText(text, x, y);
}
function ellipse(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}
function drawFighter(
  g: CanvasRenderingContext2D,
  art: Art,
  row: number,
  x: number,
  y: number,
  face: number,
  t: number,
  moving: boolean,
  scale = 1,
  hit = false,
  attack = false,
  airborne = false,
  power = false,
  dashing = false,
) {
  const frame = moving ? Math.floor(t * 11) % 4 : 1;
  const pose = hit ? 3 : airborne ? 2 : attack ? 1 : 0;
  const image =
    moving && !hit && !attack && !airborne ? art.frames[row]?.[frame] : art.poses[row]?.[pose];
  if (row >= 6) {
    const premium = art.premium[row - 6];
    if (!premium) return;
    const premiumFrame = hit
      ? 7
      : power
        ? 6
        : attack
          ? 4
          : dashing
            ? 5
            : airborne
              ? 3
              : moving
                ? 1 + (Math.floor(t * 10) % 2)
                : 0;
    g.save();
    g.translate(x, y);
    g.scale(face * scale, scale);
    if (hit) g.globalAlpha = 0.48;
    const bob = airborne ? -8 : moving ? Math.sin(t * 14) * 2 : Math.sin(t * 3) * 1.5;
    g.drawImage(
      premium,
      (premiumFrame % 4) * 256,
      Math.floor(premiumFrame / 4) * 256,
      256,
      256,
      -80,
      -162 + bob,
      160,
      160,
    );
    g.restore();
    return;
  }
  if (!image) return;
  g.save();
  g.translate(x, y);
  g.scale(face * scale, scale);
  if (hit) g.globalAlpha = 0.55;
  const bob = moving ? 0 : Math.sin(t * 3) * 1.4;
  if (attack) g.rotate(0.055);
  g.drawImage(image, -69, -135 + bob, 138, 138);
  g.restore();
}
function drawMinion(
  g: CanvasRenderingContext2D,
  art: Art,
  e: Enemy,
  x: number,
  y: number,
  t: number,
  level: World["level"],
) {
  const bob = Math.sin(t * 7 + e.id) * 3;
  g.save();
  g.translate(x, y + bob);
  g.scale(e.face, 1);
  const col = e.hit > t ? 3 : e.windup > 0 ? 2 : Math.floor(t * 7 + e.id) % 2;
  const sheet =
    level === 1 ? art.apostolCombatants : level === 4 ? art.asuncionCombatants : art.minions;
  const cw = sheet.width / 4,
    ch = sheet.height / (level === 1 || level === 4 ? 2 : 3);
  if (e.hit > t) g.globalAlpha = 0.55;
  g.drawImage(
    sheet,
    col * cw,
    level === 1 || level === 4 ? 0 : (level - 1) * ch,
    cw,
    ch,
    -66,
    -124,
    132,
    124,
  );
  g.restore();
}
function drawBoss(
  g: CanvasRenderingContext2D,
  art: Art,
  e: Enemy,
  x: number,
  y: number,
  t: number,
  level: World["level"],
) {
  g.save();
  g.translate(x, y);
  ellipse(g, 0, 0, 105, 16, "#10121dcc");
  g.scale(e.face, 1);
  const col = e.hit > t ? 3 : e.windup > 0 ? (e.pattern % 3 === 2 ? 2 : 1) : 0;
  const sheet =
    level === 1 ? art.apostolCombatants : level === 4 ? art.asuncionCombatants : art.bosses;
  const cw = sheet.width / 4,
    ch = sheet.height / (level === 1 || level === 4 ? 2 : 3);
  if (e.hit > t) g.globalAlpha = 0.65;
  const bossScale = level === 4 ? 276 : level === 1 ? 244 : 224;
  g.drawImage(
    sheet,
    col * cw,
    level === 1 || level === 4 ? ch : (level - 1) * ch,
    cw,
    ch,
    -bossScale / 2,
    -bossScale,
    bossScale,
    bossScale,
  );
  g.restore();
}
export function render(
  g: CanvasRenderingContext2D,
  w: World,
  art: Art,
  width: number,
  height: number,
  shake: boolean,
) {
  const portrait = width / height < 1;
  const logicalHeight = portrait ? 790 : 540;
  const scale = height / logicalHeight;
  const view = width / scale;
  w.viewWidth = view;
  const floor = portrait ? 525 : 410;
  g.save();
  g.scale(scale, scale);
  const bg = art.background;
  // Slight oversized background gives a slow camera drift without a repeated seam.
  const bh = floor / 0.78,
    bw = Math.max(view + 180, (bh * bg.width) / bg.height);
  const bx = -(bw - view) / 2 - Math.sin((w.camera / 3600) * Math.PI) * 55;
  g.drawImage(bg, bx, 0, bw, bh);
  const floorColor =
    w.level === 1 ? "#33202a" : w.level === 2 ? "#29241e" : w.level === 3 ? "#26383a" : "#241d2d";
  rect(g, 0, bh - 1, view, Math.max(1, logicalHeight - bh + 1), floorColor);
  const shade = g.createLinearGradient(0, 0, 0, logicalHeight);
  shade.addColorStop(0, "#11101880");
  shade.addColorStop(0.3, "#11101800");
  shade.addColorStop(0.8, "#11101810");
  shade.addColorStop(1, "#111018d0");
  g.fillStyle = shade;
  g.fillRect(0, 0, view, logicalHeight);
  if (shake && w.shake > 0)
    g.translate(Math.sin(w.t * 91) * w.shake * 15, Math.cos(w.t * 83) * w.shake * 10);
  const sx = (x: number) => x - w.camera;
  for (const platform of w.platforms) {
    const x = sx(platform.x);
    if (x + platform.w < -10 || x > view + 10) continue;
    rect(g, x, floor - platform.y, platform.w, 13, "#171520", 3);
    rect(g, x, floor - platform.y, platform.w, 4, episode(w.level).color, 2);
    rect(g, x + 10, floor - platform.y + 13, 9, platform.y - 13, "#262432");
    rect(g, x + platform.w - 19, floor - platform.y + 13, 9, platform.y - 13, "#262432");
  }
  // Checkpoint installations are real interactive objects, not background decoration.
  if (w.stage < 2) {
    const x = sx(w.stage === 0 ? CHECKPOINTS[0] : CHECKPOINTS[1]);
    const clear = w.enemies.every((e) => e.hp <= 0);
    rect(g, x - 25, floor - 65, 50, 61, "#242433", 5);
    rect(g, x - 21, floor - 60, 42, 27, clear ? "#f6e75a" : "#705965", 3);
    label(
      g,
      w.level === 1 ? "ALTAR" : w.level === 2 ? "USB" : w.level === 3 ? "IPS" : "PALACIO",
      x,
      floor - 42,
      17,
      clear ? "#111018" : "#fff3dc",
    );
    g.strokeStyle = clear ? "#f6e75a" : "#907080";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(x, floor - 65);
    g.lineTo(x, floor - 125);
    g.stroke();
    ellipse(g, x, floor - 126, 5, 5, clear ? "#f6e75a" : "#907080");
    if (clear) {
      label(g, "RECUPERÁ", x, floor - 161 + Math.sin(w.t * 3) * 3, 18, "#f6e75a");
      g.strokeStyle = "#f6e75a";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x - 7, floor - 150);
      g.lineTo(x, floor - 142);
      g.lineTo(x + 7, floor - 150);
      g.stroke();
    }
    const gate = sx((w.stage + 1) * STAGE_WIDTH - 25);
    for (let i = 0; i < 3; i++) rect(g, gate, floor - 155 + i * 48, 7, 31, "#ff725faa", 2);
  }
  for (const drop of w.drops) {
    if (drop.taken) continue;
    const x = sx(drop.x),
      y = floor - drop.y - 22 + Math.sin(w.t * 4 + drop.x) * 4;
    const color = drop.kind === "health" ? "#83caa8" : "#f6e75a";
    ellipse(g, x, y + 19, 17, 4, "#11101850");
    rect(g, x - 13, y - 14, 26, 26, "#171922", 5);
    g.strokeStyle = color;
    g.lineWidth = 2;
    g.strokeRect(x - 13, y - 14, 26, 26);
    if (drop.kind === "health") {
      rect(g, x - 3, y - 9, 6, 17, color);
      rect(g, x - 8, y - 3, 16, 6, color);
    } else {
      for (let i = 0; i < 3; i++) rect(g, x - 8 + i * 6, y - 8, 4, 15, color, 1);
    }
  }
  for (const mark of w.telegraphs) {
    const x = sx(mark.x);
    g.fillStyle = mark.fired ? "#ff725f88" : "#ff725f33";
    g.fillRect(x - mark.w, floor - 180, mark.w * 2, 180);
    g.strokeStyle = "#ff725f";
    g.lineWidth = 3;
    g.strokeRect(x - mark.w, floor - 180, mark.w * 2, 180);
    label(g, mark.fired ? "!" : "↓", x, floor - 190, 28, "#ff725f");
  }
  for (const fx of w.effects) {
    if (fx.kind !== "trail") continue;
    g.globalAlpha = (fx.life / fx.max) * 0.16;
    drawFighter(g, art, fighter(w.hero).row, sx(fx.x), floor - fx.y, w.player.face, w.t, true);
    g.globalAlpha = 1;
  }
  for (const e of w.enemies) {
    if (e.hp <= 0 || sx(e.x) < -170 || sx(e.x) > view + 170) continue;
    const x = sx(e.x),
      y = floor - e.y;
    ellipse(g, x, floor + 4, 35, 7, "#11101855");
    if (e.kind === "boss") drawBoss(g, art, e, x, y, w.t, w.level);
    else drawMinion(g, art, e, x, y, w.t, w.level);
    if (e.kind === "minion") {
      rect(g, x - 22, y - 113, 44, 4, "#111018");
      rect(g, x - 22, y - 113, 44 * Math.max(0, e.hp / e.maxHp), 4, "#ff725f");
    }
    if (e.windup > 0) {
      label(g, "!", x, y - (e.kind === "boss" ? 265 : 150), 30, "#f6e75a");
      const radius = e.kind === "minion" ? 43 : 85;
      g.strokeStyle = "#ff725f";
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(x, floor + 3, radius, 10, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  const p = w.player,
    px = sx(p.x),
    py = floor - p.y;
  if (w.airSupport) {
    const air = w.airSupport;
    const heliX = sx(air.x);
    const heliY = floor - air.y;
    const target = w.enemies.find((enemy) => enemy.id === air.targetId && enemy.hp > 0);
    if (target) {
      const tx = sx(target.x),
        ty = floor - target.y - 52;
      g.save();
      g.globalAlpha = 0.34 + Math.sin(w.t * 16) * 0.08;
      g.strokeStyle = "#ff4b2b";
      g.lineWidth = 1.5;
      g.setLineDash([8, 9]);
      g.beginPath();
      g.moveTo(heliX + air.face * 54, heliY + 26);
      g.lineTo(tx, ty);
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = "#f6e75a";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(tx, ty, 17 + Math.sin(w.t * 10) * 3, 0, Math.PI * 2);
      g.moveTo(tx - 25, ty);
      g.lineTo(tx - 8, ty);
      g.moveTo(tx + 8, ty);
      g.lineTo(tx + 25, ty);
      g.stroke();
      g.restore();
    }
    g.save();
    g.translate(heliX, heliY);
    g.rotate(air.bank);
    g.scale(air.face, 1);
    g.shadowColor = "#05070a";
    g.shadowBlur = 19;
    g.globalAlpha = 0.18;
    ellipse(g, -7, 65, 108, 17, "#050408");
    g.globalAlpha = 1;

    const rotor = w.t * 42;
    g.strokeStyle = "#d7e2df";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(Math.cos(rotor) * -126, -50);
    g.lineTo(Math.cos(rotor) * 126, -50);
    g.moveTo(Math.sin(rotor) * -126, -50);
    g.lineTo(Math.sin(rotor) * 126, -50);
    g.stroke();
    rect(g, -5, -49, 10, 20, "#4c565d", 3);

    g.fillStyle = "#222c31";
    g.beginPath();
    g.moveTo(-77, 9);
    g.quadraticCurveTo(-69, -31, -23, -34);
    g.lineTo(45, -29);
    g.quadraticCurveTo(77, -21, 82, 8);
    g.quadraticCurveTo(65, 32, 18, 34);
    g.lineTo(-47, 31);
    g.quadraticCurveTo(-73, 28, -77, 9);
    g.closePath();
    g.fill();
    rect(g, 66, -13, 92, 14, "#222c31", 5);
    g.fillStyle = "#222c31";
    g.beginPath();
    g.moveTo(133, -11);
    g.lineTo(152, -35);
    g.lineTo(159, -34);
    g.lineTo(157, 13);
    g.closePath();
    g.fill();
    g.strokeStyle = "#a9b5b6";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(156, -11, 22, 0, Math.PI * 2);
    g.moveTo(140, -27);
    g.lineTo(172, 5);
    g.moveTo(172, -27);
    g.lineTo(140, 5);
    g.stroke();

    g.fillStyle = "#74cfe5";
    g.beginPath();
    g.moveTo(-66, 3);
    g.quadraticCurveTo(-56, -24, -25, -25);
    g.lineTo(-13, 3);
    g.closePath();
    g.fill();
    rect(g, -7, -23, 23, 27, "#14252e", 4);
    rect(g, 21, -22, 22, 26, "#14252e", 4);

    g.fillStyle = "#303a40";
    g.beginPath();
    g.moveTo(-18, 8);
    g.lineTo(70, 19);
    g.lineTo(62, 28);
    g.lineTo(-28, 21);
    g.closePath();
    g.fill();
    rect(g, -50, 25, 38, 11, "#811f20", 5);
    rect(g, 26, 25, 38, 11, "#811f20", 5);
    for (const podX of [-43, 33]) {
      for (let missile = 0; missile < 3; missile++)
        ellipse(g, podX + missile * 11, 39, 4, 7, missile === 2 ? "#f6e75a" : "#c4c9c9");
    }
    if (air.fireFlash > w.t) {
      const pulse = 1 - (air.fireFlash - w.t) / 0.2;
      g.globalAlpha = 0.9 - pulse * 0.4;
      ellipse(g, 78 + pulse * 18, 36, 18 + pulse * 22, 9 + pulse * 10, "#fff3a0");
      ellipse(g, 88 + pulse * 30, 36, 12 + pulse * 18, 6 + pulse * 8, "#ff5728");
      g.globalAlpha = 1;
    }
    rect(g, -55, 31, 5, 23, "#687278", 2);
    rect(g, 48, 31, 5, 23, "#687278", 2);
    g.strokeStyle = "#687278";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-65, 55);
    g.lineTo(-35, 55);
    g.moveTo(38, 55);
    g.lineTo(67, 55);
    g.stroke();
    label(g, "TOMAHAWK", 22, 17, 11, "#f6e75a");
    label(g, "PY-01", 112, -1, 8, "#f6e75a");
    g.restore();
  }
  ellipse(g, px, floor + 5, 35, 7, "#11101860");
  if (p.shield > w.t) {
    g.strokeStyle = "#83caa8";
    g.fillStyle = "#83caa81a";
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(px, py - 65, 62, 79, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  drawFighter(
    g,
    art,
    fighter(w.hero).row,
    px,
    py,
    p.face,
    w.t,
    Math.abs(p.vx) > 20,
    1,
    Number.isFinite(p.inv) && p.inv > w.t && Math.floor(w.t * 14) % 2 === 0,
    p.attackPose > w.t,
    p.y > 4,
    p.powerPose > w.t,
    p.dash > w.t,
  );
  if (!["pablito", "marito"].includes(w.hero) && !["fist", "knife", "bat"].includes(w.weapon)) {
    g.save();
    g.translate(px + p.face * 22, py - 60);
    g.scale(p.face, 1);
    rect(g, 0, -4, w.weapon === "pistol" ? 27 : 43, 8, "#191c24", 2);
    rect(g, 7, 3, 7, 10, "#232633", 1);
    rect(g, 3, -5, 8, 2, "#8996a0");
    g.restore();
  } else if (
    !["pablito", "marito"].includes(w.hero) &&
    (w.weapon === "bat" || w.weapon === "knife")
  ) {
    g.save();
    g.translate(px + p.face * 30, py - 70);
    g.rotate(p.face * (p.attackPose > w.t ? 1.3 : 0.3));
    rect(
      g,
      -3,
      w.weapon === "bat" ? -35 : -15,
      7,
      w.weapon === "bat" ? 48 : 25,
      w.weapon === "bat" ? "#c29d68" : "#c9d6de",
      3,
    );
    g.restore();
  }
  for (const s of w.shots) {
    const x = sx(s.x),
      y = floor - s.y;
    g.fillStyle = s.color;
    if (s.kind === "bullet") {
      g.strokeStyle = s.color;
      g.lineWidth = s.enemy ? 5 : 3;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - Math.sign(s.vx) * 18, y + s.vy * 0.01);
      g.stroke();
    } else if (s.kind === "missile") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(-s.vy, s.vx));
      g.scale(s.vx >= 0 ? 1 : -1, 1);
      for (let smoke = 1; smoke <= 5; smoke++) {
        g.globalAlpha = 0.2 - smoke * 0.025;
        ellipse(
          g,
          -24 - smoke * 12,
          Math.sin(s.age * 24 + smoke) * 4,
          10 + smoke * 3,
          6 + smoke * 2,
          smoke % 2 ? "#d7d1c7" : "#756f6d",
        );
      }
      g.globalAlpha = 1;
      g.shadowColor = "#ff6b2c";
      g.shadowBlur = 20;
      g.fillStyle = "#ff6b2c";
      g.beginPath();
      g.moveTo(-21, 0);
      g.lineTo(-37 - Math.sin(s.age * 45) * 8, -8);
      g.lineTo(-31, 0);
      g.lineTo(-37 - Math.cos(s.age * 39) * 7, 8);
      g.closePath();
      g.fill();
      rect(g, -21, -7, 36, 14, "#31363b", 6);
      g.fillStyle = "#f6e75a";
      g.beginPath();
      g.moveTo(15, -7);
      g.lineTo(29, 0);
      g.lineTo(15, 7);
      g.closePath();
      g.fill();
      rect(g, -6, -8, 7, 16, "#b72c2c", 2);
      g.restore();
    } else if (s.kind === "can") {
      g.save();
      g.translate(x, y);
      g.rotate(s.age * 11 * Math.sign(s.vx));
      rect(g, -9, -14, 18, 28, "#c78a32", 5);
      rect(g, -9, -14, 18, 5, "#e8e1cd", 3);
      rect(g, -9, 9, 18, 5, "#77746e", 3);
      rect(g, -5, -2, 10, 4, "#fff3dc", 2);
      g.restore();
    } else if (s.kind === "word") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.sin(s.age * 12) * 0.12);
      rect(g, -21, -12, 42, 24, "#301442dd", 7);
      label(g, "#!%", 0, 6, 16, "#f1c7ff");
      g.restore();
    } else if (s.kind === "lightning") {
      g.save();
      g.strokeStyle = "#fff7a8";
      g.shadowColor = "#f6e75a";
      g.shadowBlur = 16;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(x - Math.sign(s.vx) * 28, y - 4);
      g.lineTo(x - Math.sign(s.vx) * 12, y + 9);
      g.lineTo(x, y - 8);
      g.lineTo(x + Math.sign(s.vx) * 16, y + 7);
      g.lineTo(x + Math.sign(s.vx) * 30, y - 5);
      g.stroke();
      g.restore();
    } else if (s.kind === "trumpet") {
      g.save();
      g.translate(x, y);
      g.scale(Math.sign(s.vx), 1);
      g.strokeStyle = "#f6e75a";
      g.lineWidth = 4;
      for (let ring = 0; ring < 3; ring++) {
        g.beginPath();
        g.arc(-ring * 13, 0, 9 + ring * 7, -0.8, 0.8);
        g.stroke();
      }
      g.fillStyle = "#ffd84a";
      g.beginPath();
      g.moveTo(15, -8);
      g.lineTo(34, -15);
      g.lineTo(34, 15);
      g.lineTo(15, 8);
      g.closePath();
      g.fill();
      rect(g, 4, -4, 14, 8, "#c98d16", 2);
      g.restore();
    } else if (s.kind === "holy") {
      g.save();
      g.translate(x, y);
      g.globalAlpha = 0.85;
      ellipse(g, 0, 0, s.radius + 6, s.radius + 6, "#fff3a8");
      rect(g, -2, -11, 4, 22, "#b98320", 2);
      rect(g, -8, -4, 16, 4, "#b98320", 2);
      g.restore();
    } else if (s.kind === "cane") {
      g.save();
      g.translate(x, y);
      g.rotate(s.age * 10 * Math.sign(s.vx));
      rect(g, -6, -16, 12, 32, "#6c321f", 4);
      rect(g, -5, -13, 10, 19, "#d28a3b", 3);
      rect(g, -4, -19, 8, 5, "#e8d1a8", 2);
      g.restore();
    } else if (s.kind === "cigarette") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(s.vy, s.vx));
      rect(g, -13, -2, 22, 4, "#fff3dc", 2);
      rect(g, 8, -2, 5, 4, "#ff725f", 2);
      g.restore();
    } else if (s.kind === "sling") {
      g.save();
      g.translate(x, y);
      g.rotate(s.age * 16);
      ellipse(g, 0, 0, 9, 9, "#56515b");
      g.strokeStyle = "#f6e75a";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 0, 14, 0, Math.PI * 1.4);
      g.stroke();
      g.restore();
    } else if (s.kind === "paper" || s.kind === "usb") {
      g.save();
      g.translate(x, y);
      g.rotate(s.age * 9);
      rect(g, -s.radius, -s.radius, s.radius * 2, s.radius * 1.4, s.color, 2);
      rect(g, -s.radius / 2, -s.radius / 2, s.radius, 2, "#111018");
      g.restore();
    } else if (s.kind === "wave") {
      g.globalAlpha = 0.6;
      g.beginPath();
      g.arc(x, y, s.radius, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.lineWidth = 3;
      g.strokeStyle = s.color;
      g.stroke();
    } else ellipse(g, x, y, 7, 9, s.color);
  }
  for (const fx of w.effects) {
    if (fx.kind === "trail") continue;
    const x = sx(fx.x),
      y = floor - fx.y;
    g.globalAlpha = Math.max(0, fx.life / fx.max);
    if (fx.kind === "nuke") {
      const phase = 1 - fx.life / fx.max;
      const flash = Math.max(0, 1 - phase * 3.6);
      g.save();
      g.globalAlpha = Math.max(0.08, fx.life / fx.max);
      const glow = g.createRadialGradient(x, y, 10, x, y, Math.min(view, fx.size) * 0.72);
      glow.addColorStop(0, `rgba(255,255,240,${0.94 * (1 - phase * 0.6)})`);
      glow.addColorStop(0.18, "rgba(255,232,80,.82)");
      glow.addColorStop(0.52, "rgba(255,91,30,.42)");
      glow.addColorStop(1, "rgba(255,40,10,0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(x, y, 70 + phase * fx.size * 0.7, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = Math.max(0, 0.95 - phase * 0.75);
      for (let cloud = 0; cloud < 9; cloud++) {
        const angle = (cloud / 9) * Math.PI * 2;
        const spread = 28 + phase * 120;
        ellipse(
          g,
          x + Math.cos(angle) * spread,
          y - 70 - phase * 145 + Math.sin(angle) * spread * 0.35,
          54 + phase * 55,
          42 + phase * 38,
          cloud % 2 ? "#ff792f" : "#ffe96e",
        );
      }
      rect(
        g,
        x - 28 - phase * 22,
        y - 65 - phase * 90,
        56 + phase * 44,
        190 + phase * 130,
        "#ff9c35aa",
        30,
      );
      g.globalAlpha = Math.max(0, 1 - phase * 1.25);
      g.fillStyle = `rgba(255,255,255,${flash})`;
      g.fillRect(0, 0, view, logicalHeight);
      g.globalAlpha = Math.max(0, 1 - phase);
      label(g, fx.text ?? "PROTOCOLO NUCLEAR", x, Math.max(64, y - 235), 34, "#fff3dc");
      g.restore();
    } else if (fx.kind === "ring") {
      g.strokeStyle = fx.color;
      g.lineWidth = 5;
      g.beginPath();
      g.arc(x, y, fx.size * (1 - fx.life / fx.max) + 10, 0, Math.PI * 2);
      g.stroke();
    } else if (fx.kind === "text") {
      g.strokeStyle = "#111018";
      g.lineWidth = 4;
      g.font = `800 ${fx.size}px "Barlow Condensed",sans-serif`;
      g.textAlign = "center";
      g.strokeText(fx.text ?? "", x, y);
      label(g, fx.text ?? "", x, y, fx.size, fx.color);
    } else rect(g, x, y, fx.size, fx.size, fx.color, 1);
  }
  g.globalAlpha = 1;
  g.restore();
}
