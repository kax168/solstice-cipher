import { LEVEL, TILE, levelMeta, parseLevel } from "./gameData.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const startBtn = document.querySelector("#startBtn");
const muteBtn = document.querySelector("#muteBtn");
const balanceEl = document.querySelector("#balance");
const cipherEl = document.querySelector("#cipher");
const timerEl = document.querySelector("#timer");
const statusEl = document.querySelector("#status");

const keys = new Set();
let muted = false;
let audioCtx;
let state;
let lastTick = performance.now();

function createState(running = false) {
  const parsed = parseLevel();
  return {
    player: { x: parsed.player.x * TILE + TILE / 2, y: parsed.player.y * TILE + TILE / 2 },
    gate: parsed.gate,
    sparks: parsed.sparks.map((spark) => ({ ...spark, collected: false })),
    walls: new Set(parsed.walls.map((wall) => `${wall.x},${wall.y}`)),
    balance: levelMeta.startBalance,
    cipher: 0,
    time: levelMeta.seconds,
    running,
    won: false,
  };
}

function reset() {
  state = createState(true);
  statusEl.textContent = "Find four cipher sparks, then reach the gate.";
  lastTick = performance.now();
}

function setupPreview() {
  state = createState(false);
  statusEl.textContent = "Press Start to begin.";
}

function beep(freq = 440, duration = 0.08) {
  if (muted) return;
  audioCtx ||= new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function tileAt(px, py) {
  return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) };
}

function canMove(px, py) {
  const checks = [
    tileAt(px - 13, py - 13),
    tileAt(px + 13, py - 13),
    tileAt(px - 13, py + 13),
    tileAt(px + 13, py + 13),
  ];
  return checks.every((tile) => !state.walls.has(`${tile.x},${tile.y}`));
}

function update(dt) {
  if (!state?.running) return;
  const speed = 150;
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
  if (dx || dy) {
    const mag = Math.hypot(dx, dy);
    const nx = state.player.x + (dx / mag) * speed * dt;
    const ny = state.player.y + (dy / mag) * speed * dt;
    if (canMove(nx, state.player.y)) state.player.x = nx;
    if (canMove(state.player.x, ny)) state.player.y = ny;
    state.balance += dx * dt * 7 - dy * dt * 2;
  }

  state.time -= dt;
  state.balance += Math.sin(performance.now() / 900) * dt * 2;
  state.balance = Math.max(0, Math.min(100, state.balance));

  for (const spark of state.sparks) {
    if (spark.collected) continue;
    const sx = spark.x * TILE + TILE / 2;
    const sy = spark.y * TILE + TILE / 2;
    if (Math.hypot(state.player.x - sx, state.player.y - sy) < 24) {
      spark.collected = true;
      state.cipher += 1;
      state.balance += spark.kind === "light" ? 9 : -9;
      beep(spark.kind === "light" ? 680 : 260);
    }
  }

  const current = tileAt(state.player.x, state.player.y);
  if (current.x === state.gate.x && current.y === state.gate.y) {
    if (state.cipher >= levelMeta.requiredCipher && inIdealBand()) {
      state.running = false;
      state.won = true;
      statusEl.textContent = "Gate opened. You balanced the solstice cipher.";
      beep(880, 0.2);
    } else {
      statusEl.textContent = "The gate needs four sparks and a balanced light meter.";
    }
  }

  if (state.balance < levelMeta.dangerLow || state.balance > levelMeta.dangerHigh) {
    state.time -= dt * 1.5;
    statusEl.textContent = "The route destabilizes when light and shadow drift too far.";
  }

  if (state.time <= 0) {
    state.running = false;
    statusEl.textContent = "The solstice passed. Restart and try a steadier balance.";
  }
}

function inIdealBand() {
  return state.balance >= levelMeta.idealLow && state.balance <= levelMeta.idealHigh;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0b1b2a");
  gradient.addColorStop(0.5, "#17343a");
  gradient.addColorStop(1, "#0d1725");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < LEVEL.length; y += 1) {
    for (let x = 0; x < LEVEL[y].length; x += 1) {
      if (LEVEL[y][x] === "#") {
        ctx.fillStyle = "#14243a";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.strokeStyle = "rgba(142,246,213,.08)";
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  drawGate();
  drawSparks();
  drawPlayer();
  drawHud();
}

function drawGate() {
  const gx = state.gate.x * TILE;
  const gy = state.gate.y * TILE;
  ctx.fillStyle = inIdealBand() && state.cipher >= levelMeta.requiredCipher ? "#8ef6d5" : "#4d5b70";
  ctx.fillRect(gx + 6, gy + 6, TILE - 12, TILE - 12);
  ctx.fillStyle = "#071522";
  ctx.font = "bold 16px Avenir Next";
  ctx.fillText("G", gx + 13, gy + 26);
}

function drawSparks() {
  for (const spark of state.sparks) {
    if (spark.collected) continue;
    const sx = spark.x * TILE + TILE / 2;
    const sy = spark.y * TILE + TILE / 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 11 + Math.sin(performance.now() / 190) * 2, 0, Math.PI * 2);
    ctx.fillStyle = spark.kind === "light" ? "#ffcf5a" : "#5ea2ff";
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#fff4b8";
  ctx.fill();
  ctx.strokeStyle = "#ff6b8a";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawHud() {
  balanceEl.textContent = Math.round(state.balance);
  cipherEl.textContent = state.cipher;
  timerEl.textContent = Math.max(0, Math.ceil(state.time));
  ctx.fillStyle = "rgba(7,21,34,.72)";
  ctx.fillRect(18, 18, 310, 64);
  ctx.fillStyle = "#d6eee8";
  ctx.font = "bold 18px Avenir Next";
  ctx.fillText(`Cipher ${state.cipher}/${levelMeta.requiredCipher}`, 34, 43);
  ctx.fillText(`Balance ${Math.round(state.balance)}%`, 34, 68);
}

function loop(now) {
  const dt = Math.min(0.04, (now - lastTick) / 1000);
  lastTick = now;
  update(dt);
  if (state) draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key));

startBtn.addEventListener("click", reset);
muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = `Sound: ${muted ? "off" : "on"}`;
  muteBtn.setAttribute("aria-pressed", String(muted));
});

setupPreview();
requestAnimationFrame(loop);
