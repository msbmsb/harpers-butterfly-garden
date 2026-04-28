/* ============================================================
   Harper's Butterfly Garden — Game Logic
   ============================================================ */

'use strict';

// ── Canvas & Context ────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ── DOM refs ────────────────────────────────────────────────
const welcomeOverlay     = document.getElementById('welcome-overlay');
const winOverlay         = document.getElementById('win-overlay');
const instructionOverlay = document.getElementById('instruction-overlay');
const startBtn           = document.getElementById('start-btn');
const playAgainBtn       = document.getElementById('play-again-btn');
const muteBtn            = document.getElementById('mute-btn');
const restartBtn         = document.getElementById('restart-btn');
const toast              = document.getElementById('toast');
const trackerLetters     = document.querySelectorAll('.tracker-letter');

// ── State machine ───────────────────────────────────────────
// states: 'welcome' | 'playing' | 'won'
let gameState = 'welcome';

// ── Mute ────────────────────────────────────────────────────
let muted = false;

// ── Butterfly (player-controlled) ───────────────────────────
const butterfly = {
  x: 0, y: 0,
  targetX: 0, targetY: 0,
  vx: 0, vy: 0,      // velocity in px/s
  bobPhase: 0,
  wingPhase: 0,
  rotation: 0,
};

// FIX 1 — spring constants for frame-rate-independent physics
const SPRING_K    = 60;    // px/s² per px of distance
const DAMP_PER_S  = 0.001; // fraction of velocity remaining after 1 full second

// ── Demo butterfly (welcome screen animation) ────────────────
// FIX 2 — butterfly drifts on welcome screen instead of sitting still
const demo = {
  phase: 0,
  wingPhase: Math.random() * Math.PI * 2,
  trailTimer: 0,
};

// ── Letters ─────────────────────────────────────────────────
// Positions are fractional (0–1), resolved to canvas px each frame
const LETTER_DEFS = [
  { char: 'H', fx: 0.15, fy: 0.70 },
  { char: 'A', fx: 0.30, fy: 0.40 },
  { char: 'R', fx: 0.55, fy: 0.60 },
  { char: 'P', fx: 0.70, fy: 0.35 },
  { char: 'E', fx: 0.45, fy: 0.75 },
  { char: 'R', fx: 0.82, fy: 0.65 },
];

let letters = [];

function initLetters() {
  letters = LETTER_DEFS.map((def, i) => ({
    char:      def.char,
    index:     i,
    fx:        def.fx,
    fy:        def.fy,
    collected: false,
    glowPhase: Math.random() * Math.PI * 2,
  }));
}

function letterX(l) { return l.fx * canvas.width;  }
function letterY(l) { return l.fy * canvas.height; }

const COLLECT_RADIUS = 55;  // forgiving for small fingers

// ── FIX 3 — localStorage progress persistence ────────────────
const SAVE_KEY = 'harpers-garden-v1';

function saveProgress() {
  try {
    const collected = letters.map(l => l.collected);
    localStorage.setItem(SAVE_KEY, JSON.stringify(collected));
  } catch (_) { /* storage blocked — ignore */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length !== LETTER_DEFS.length) return;
    saved.forEach((collected, i) => {
      if (collected) {
        letters[i].collected = true;
        trackerLetters[i].classList.add('collected');
      }
    });
    // If the previous session was a completed game, wipe it and start fresh —
    // showing the win screen immediately on Start would be confusing for a child
    if (letters.every(l => l.collected)) {
      clearProgress();
      initLetters();
      trackerLetters.forEach(el => el.classList.remove('collected'));
    }
  } catch (_) { /* corrupted save — ignore */ }
}

function clearProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

// ── Particles ───────────────────────────────────────────────
let particles = [];

function spawnBurst(x, y, count = 20) {
  const colors = ['#ff80d5','#c77dff','#ffdb58','#80ffea','#ff9a3c','#ffffff'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 200; // px/s
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 1,
      maxLife: 0.6 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
    });
  }
}

function spawnTrail(x, y) {
  if (Math.random() > 0.4) return;
  particles.push({
    x: x + (Math.random() - 0.5) * 14,
    y: y + (Math.random() - 0.5) * 14,
    vx: (Math.random() - 0.5) * 30,
    vy: -30 - Math.random() * 60,
    life: 1,
    maxLife: 0.25 + Math.random() * 0.25,
    color: Math.random() > 0.5 ? '#e0b0ff' : '#ffd6f0',
    size: 2 + Math.random() * 2,
  });
}

function spawnPetalBurst() {
  const colors = ['#ffb3de','#c3b1e1','#ffd700','#b5ead7','#ff9eb5'];
  for (let i = 0; i < 60; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;
    particles.push({
      x: canvas.width  * (0.2 + Math.random() * 0.6),
      y: -20,
      vx: (Math.random() - 0.5) * 60 + side * 20,
      vy: 60 + Math.random() * 150,
      life: 1,
      maxLife: 1.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      petal: true,
    });
  }
}

function updateParticles(dt) {
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    if (!p.petal) p.vy += 120 * dt; // gravity px/s²
    p.life -= dt / p.maxLife;
  }
}

// ── Ambient Sparkles ─────────────────────────────────────────
let ambientSparkles = [];

function initAmbientSparkles() {
  ambientSparkles = [];
  const count = Math.floor((canvas.width * canvas.height) / 14000);
  for (let i = 0; i < count; i++) {
    ambientSparkles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      size:  1 + Math.random() * 2,
    });
  }
}

// ── Input Handling ───────────────────────────────────────────
let pointerDown = false;
let instructionDismissed = false;

function getCanvasPos(e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const src    = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

function dismissInstruction() {
  if (!instructionDismissed) {
    instructionDismissed = true;
    instructionOverlay.classList.add('hidden');
  }
}

canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (gameState !== 'playing') return;
  pointerDown = true;
  const pos = getCanvasPos(e);
  butterfly.targetX = pos.x;
  butterfly.targetY = pos.y;
  dismissInstruction();
}, { passive: false });

canvas.addEventListener('pointermove', e => {
  e.preventDefault();
  if (gameState !== 'playing' || !pointerDown) return;
  const pos = getCanvasPos(e);
  butterfly.targetX = pos.x;
  butterfly.targetY = pos.y;
}, { passive: false });

canvas.addEventListener('pointerup',     e => { e.preventDefault(); pointerDown = false; }, { passive: false });
canvas.addEventListener('pointercancel', e => { e.preventDefault(); pointerDown = false; }, { passive: false });

// ── Toast ───────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    toastTimer = null;
  }, 2000);
}

// ── Win Handling ─────────────────────────────────────────────
function triggerWin() {
  gameState = 'won';
  butterfly.targetX = canvas.width  * 0.5;
  butterfly.targetY = canvas.height * 0.5;
  spawnPetalBurst();
  setTimeout(() => winOverlay.classList.remove('hidden'), 1000);
}

// ── Reset ────────────────────────────────────────────────────
function resetGame(keepProgress = false) {
  initLetters();
  if (keepProgress) {
    loadProgress();
  } else {
    clearProgress();
  }
  particles = [];
  butterfly.x       = canvas.width  * 0.5;
  butterfly.y       = canvas.height * 0.5;
  butterfly.targetX = butterfly.x;
  butterfly.targetY = butterfly.y;
  butterfly.vx = 0;
  butterfly.vy = 0;
  butterfly.rotation = 0;
  trackerLetters.forEach(el => el.classList.remove('collected'));
  // Re-apply collected state from loaded letters
  letters.forEach((l, i) => { if (l.collected) trackerLetters[i].classList.add('collected'); });
  winOverlay.classList.add('hidden');
  toast.classList.remove('visible');
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  if (!letters.every(l => l.collected)) {
    gameState = 'playing';
    instructionDismissed = false;
    instructionOverlay.classList.remove('hidden');
  }
}

// ── Start / Play Again / Restart ─────────────────────────────
startBtn.addEventListener('click', () => {
  welcomeOverlay.classList.add('hidden');
  resetGame(true); // FIX 3 — resume saved progress on Start
});

playAgainBtn.addEventListener('click', () => {
  resetGame(false); // explicit replay = fresh start, clears save
});

restartBtn.addEventListener('click', () => {
  if (gameState === 'welcome') return;
  resetGame(false);
});

muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
});

// ── Collection ───────────────────────────────────────────────
const COLLECTION_MESSAGES = [
  c => `You found ${c}! ✨`,
  c => `${c} is yours! 🌸`,
  c => `Woohoo! ${c}! 🦋`,
  c => `${c}! Keep going! 🌟`,
];

function tryCollect() {
  let anyNew = false;
  for (const l of letters) {
    if (l.collected) continue;
    const lx = letterX(l);
    const ly = letterY(l);
    const dx = butterfly.x - lx;
    const dy = butterfly.y - ly;
    if (dx * dx + dy * dy < COLLECT_RADIUS * COLLECT_RADIUS) {
      l.collected = true;
      anyNew = true;
      trackerLetters[l.index].classList.add('collected');
      spawnBurst(lx, ly, 22);
      showToast(COLLECTION_MESSAGES[Math.floor(Math.random() * COLLECTION_MESSAGES.length)](l.char));
    }
  }
  if (anyNew) {
    saveProgress(); // FIX 3
    if (letters.every(l => l.collected)) triggerWin();
  }
}

// ── Drawing: Butterfly ───────────────────────────────────────
function drawButterfly(x, y, rotation, wingScale, wingPhase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const ws = 0.7 + Math.sin(wingPhase) * 0.3; // wing open/close

  // Upper wings
  ctx.save();
  ctx.scale(ws * wingScale, 1);
  ctx.beginPath();
  ctx.ellipse( 18, -10, 20, 14,  0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220, 100, 240, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(150, 50, 200, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-18, -10, 20, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Lower wings
  ctx.save();
  ctx.scale(ws * wingScale, 1);
  ctx.beginPath();
  ctx.ellipse( 15, 8, 14, 10,  0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 70, 230, 0.75)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(130, 40, 180, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-15, 8, 14, 10, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Wing spots
  ctx.save();
  ctx.scale(ws * wingScale, 1);
  ctx.fillStyle = 'rgba(255, 200, 240, 0.6)';
  ctx.beginPath(); ctx.arc( 14, -10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 3, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#6a0dad';
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, -15, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#4a0080';
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#4a0080';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo(-6, -25, -4, -31);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo( 6, -25,  4, -31);
  ctx.stroke();
  ctx.fillStyle = '#9b30ff';
  ctx.beginPath(); ctx.arc(-4, -31, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 4, -31, 2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ── Drawing: Letters ─────────────────────────────────────────
function drawLetters() {
  for (const l of letters) {
    if (l.collected) continue;
    l.glowPhase += 0.04;
    const x    = letterX(l);
    const y    = letterY(l) + Math.sin(l.glowPhase) * 5;
    const glow = 30 + Math.sin(l.glowPhase * 1.3) * 8;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, glow + 10);
    grad.addColorStop(0,   'rgba(255, 220, 80, 0.55)');
    grad.addColorStop(0.5, 'rgba(255, 180, 60, 0.2)');
    grad.addColorStop(1,   'rgba(255, 180, 60, 0)');
    ctx.beginPath();
    ctx.arc(x, y, glow + 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff8c0';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 14;
    ctx.fillText(l.char, x, y);
    ctx.restore();
  }
}

// ── Drawing: Particles ───────────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    const alpha = Math.max(0, p.life);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.petal) {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Drawing: Ambient Sparkles ────────────────────────────────
function drawAmbientSparkles(dt) {
  for (const s of ambientSparkles) {
    s.phase += s.speed * dt;
    const alpha = (Math.sin(s.phase) + 1) * 0.5 * 0.7;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#e0d0ff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Game Loop ────────────────────────────────────────────────
let lastTime = null;

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAmbientSparkles(dt);

  // ── FIX 2: Welcome screen — butterfly drifts in background ──
  if (gameState === 'welcome') {
    demo.phase    += dt * 0.6;
    demo.wingPhase += dt * 7;
    const demoX = canvas.width  * 0.5 + Math.sin(demo.phase * 0.9) * canvas.width  * 0.22;
    const demoY = canvas.height * 0.5 + Math.sin(demo.phase * 0.7) * canvas.height * 0.18
                + Math.sin(demo.phase * 1.6) * canvas.height * 0.05;
    const demoRot = Math.sin(demo.phase * 0.9) * 0.25;

    demo.trailTimer += dt;
    if (demo.trailTimer > 0.04) {
      spawnTrail(demoX, demoY);
      demo.trailTimer = 0;
    }
    updateParticles(dt);
    drawParticles();
    drawButterfly(demoX, demoY, demoRot, 0.85, demo.wingPhase);
    return;
  }

  // ── FIX 1: Frame-rate-independent spring physics ─────────────
  butterfly.bobPhase  += 2.5 * dt;
  butterfly.wingPhase += 8   * dt;

  const ax = (butterfly.targetX - butterfly.x) * SPRING_K;
  const ay = (butterfly.targetY - butterfly.y) * SPRING_K;
  butterfly.vx += ax * dt;
  butterfly.vy += ay * dt;

  const dampFactor = Math.pow(DAMP_PER_S, dt);
  butterfly.vx *= dampFactor;
  butterfly.vy *= dampFactor;

  butterfly.x += butterfly.vx * dt;
  butterfly.y += butterfly.vy * dt + Math.sin(butterfly.bobPhase) * 0.6;

  const speed = Math.sqrt(butterfly.vx * butterfly.vx + butterfly.vy * butterfly.vy);
  if (speed > 10) {
    const targetRot = Math.atan2(butterfly.vy, butterfly.vx) + Math.PI / 2;
    // Shortest-path rotation lerp
    let diff = targetRot - butterfly.rotation;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    butterfly.rotation += diff * Math.min(1, 8 * dt);
  } else {
    butterfly.rotation *= Math.pow(0.001, dt);
  }

  if (speed > 20) spawnTrail(butterfly.x, butterfly.y);

  updateParticles(dt);

  drawLetters();
  drawParticles();
  drawButterfly(butterfly.x, butterfly.y, butterfly.rotation, 1, butterfly.wingPhase);

  if (gameState === 'playing') tryCollect();
}

// ── FIX 4: Resize — preserve butterfly position as fraction ───
function resizeCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Save fractional butterfly position before canvas size wipes state
  let bfx = 0.5, bfy = 0.5, btfx = 0.5, btfy = 0.5;
  if (canvas.width > 0 && canvas.height > 0 && gameState !== 'welcome') {
    bfx  = butterfly.x       / canvas.width;
    bfy  = butterfly.y       / canvas.height;
    btfx = butterfly.targetX / canvas.width;
    btfy = butterfly.targetY / canvas.height;
  }

  canvas.width  = w;
  canvas.height = h;
  initAmbientSparkles();

  if (gameState === 'welcome') {
    // demo butterfly just drifts from its phase — no position to restore
  } else {
    butterfly.x       = bfx  * w;
    butterfly.y       = bfy  * h;
    butterfly.targetX = btfx * w;
    butterfly.targetY = btfy * h;
    // Velocity scales proportionally so feel is preserved
    butterfly.vx *= (w / (canvas.width  || w));
    butterfly.vy *= (h / (canvas.height || h));
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Boot ─────────────────────────────────────────────────────
initLetters();
butterfly.x = butterfly.targetX = canvas.width  * 0.5;
butterfly.y = butterfly.targetY = canvas.height * 0.5;

requestAnimationFrame(gameLoop);
