/* ============================================================
   Harper's Butterfly Garden — Game Logic
   ============================================================ */

'use strict';

// ── Canvas & Context ────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ── Virtual Game Size (fixed world) ─────────────────────────
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 700;

let scale = 1;

// ── DOM refs ────────────────────────────────────────────────
const welcomeOverlay     = document.getElementById('welcome-overlay');
const winOverlay         = document.getElementById('win-overlay');
const instructionOverlay = document.getElementById('instruction-overlay');
const startBtn           = document.getElementById('start-btn');
const playAgainBtn       = document.getElementById('play-again-btn');
const muteBtn            = document.getElementById('mute-btn');
const restartBtn         = document.getElementById('restart-btn');
const toast              = document.getElementById('toast');
//const trackerLetters     = document.querySelectorAll('.tracker-letter');
let trackerLetters = document.querySelectorAll('.tracker-letter');

function refreshTrackerRefs() {
  trackerLetters = document.querySelectorAll('.tracker-letter');
}

const tutorialBtn = document.getElementById('tutorial-btn');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const closeTutorialBtn = document.getElementById('close-tutorial-btn');


// ── Backgrounds ─────────────────────────────────────────────
const backgroundLayer = document.getElementById('background-layer');

const BACKGROUNDS = [
  'images/bg-garden-animals.png',
  'images/bg-garden-gate.png',
  'images/bg-garden-meadow.png',
  'images/bg-garden-ocean.png',
  'images/bg-garden-stream.png'
];

function setRandomBackground() {
  const bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  backgroundLayer.style.backgroundImage = `url('${bg}')`;
}

// ── Word System ────────────────────────────────────────────
const FIRST_WORD = 'HARPER';

const WORDS = [
  'FLOWER',
  'GARDEN',
  'MEADOW',
  'BUTTERFLY',
  'SUNSHINE',
  'RAINBOW',
  'BLOSSOM',
  'SPRING',
   'LADYBUG',
  'HARPER'
];

let currentWord = FIRST_WORD;
let hasPlayedOnce = false;

function pickNextWord() {
  if (!hasPlayedOnce) {
    hasPlayedOnce = true;
    return FIRST_WORD;
  }

  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const progressTracker = document.getElementById('progress-tracker');

function buildTracker(word) {
  progressTracker.innerHTML = '';

  word.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'tracker-letter';
    span.dataset.index = i;
    span.textContent = char;
    progressTracker.appendChild(span);
  });
    
  refreshTrackerRefs();
}

tutorialBtn.addEventListener('click', () => {
  tutorialOverlay.classList.remove('hidden');
});

closeTutorialBtn.addEventListener('click', () => {
  tutorialOverlay.classList.add('hidden');
});

// ── State machine ───────────────────────────────────────────
// states: 'welcome' | 'playing' | 'won'
let gameState = 'welcome';

// ── Power Ups ──────────────────────────────────────────────
let powerUp = null;
let activePowerUp = null;
let powerUpTimer = null;
let activePowerUpEndsAt = 0;
const SURPRISE_DURATION_MS = 8000;

const POWER_UP_TYPES = [
  'GIANT',
  'FLOCK',
  'RAINBOW_TRAIL',
  'FLOWER_BLOOM',
  'SPARKLE_STORM',
  'NIGHT_MODE_WITH_FIREFLIES'
];

let powerUpBag = [];

// ── Mute ────────────────────────────────────────────────────
let muted = false;
const MUTE_SAVE_KEY = 'harpers-garden-muted-v1';

// ── Audio ───────────────────────────────────────────────────
let audioCtx = null;
let masterGain = null;
let bgMusic = null;
let successSound = null;
const BG_MUSIC_TRACKS = [
  'sounds/bg-music-1.mp3',
  'sounds/bg-music-2.mp3',
  'sounds/bg-music-3.mp3'
];
let currentBgMusicIndex = Math.floor(Math.random() * BG_MUSIC_TRACKS.length);

function pickNextBgMusicIndex() {
  if (BG_MUSIC_TRACKS.length <= 1) return 0;

  let nextIndex = currentBgMusicIndex;
  while (nextIndex === currentBgMusicIndex) {
    nextIndex = Math.floor(Math.random() * BG_MUSIC_TRACKS.length);
  }
  return nextIndex;
}

function setBackgroundMusicTrack(index) {
  ensureMediaAudio();
  if (!bgMusic) return;

  currentBgMusicIndex = index;
  bgMusic.src = BG_MUSIC_TRACKS[currentBgMusicIndex];
  bgMusic.load();
  bgMusic.volume = muted ? 0 : 0.192;
}

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = muted ? 0 : 0.9;
    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

function ensureMediaAudio() {
  if (!bgMusic) {
    bgMusic = new Audio();
    bgMusic.preload = 'auto';
    bgMusic.addEventListener('ended', () => {
      const nextIndex = pickNextBgMusicIndex();
      setBackgroundMusicTrack(nextIndex);

      if (!muted && gameState !== 'welcome') {
        bgMusic.play().catch(() => {});
      }
    });
    setBackgroundMusicTrack(currentBgMusicIndex);
  }

  if (!successSound) {
    successSound = new Audio('sounds/success.mp3');
    successSound.preload = 'auto';
    successSound.volume = muted ? 0 : 0.125;
    successSound.addEventListener('ended', () => {
      if (!muted && bgMusic && gameState !== 'welcome') {
        bgMusic.play().catch(() => {});
      }
    });
  }
}

function syncAudioMute() {
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.9;
  if (bgMusic) bgMusic.volume = muted ? 0 : 0.192;
  if (successSound) successSound.volume = muted ? 0 : 0.325;
}

function saveMuteState() {
  try {
    localStorage.setItem(MUTE_SAVE_KEY, JSON.stringify(muted));
  } catch (_) {}
}

function loadMuteState() {
  try {
    const raw = localStorage.getItem(MUTE_SAVE_KEY);
    if (raw === null) return;
    muted = JSON.parse(raw) === true;
  } catch (_) {}
}

function syncMuteButton() {
  muteBtn.textContent = muted ? '🔇' : '🔊';
}

function primeAudio() {
  ensureAudioContext();
  ensureMediaAudio();

  if (!muted && bgMusic?.paused) {
    bgMusic.play().catch(() => {});
  }
}

function playSuccessSound() {
  if (muted) return;
  ensureMediaAudio();
  if (!successSound) return;

  bgMusic?.pause();
  successSound.currentTime = 0;
  successSound.play().catch(() => {});
}

function playLetterPopSound() {
  if (muted) return;
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520 + Math.random() * 120, now);
  osc.frequency.exponentialRampToValueAtTime(780 + Math.random() * 100, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1500, now);
  filter.Q.value = 0.8;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.18);
}

function playSurpriseSound() {
  if (muted) return;
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, index) => {
    const start = now + index * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.04, start + 0.16);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(start);
    osc.stop(start + 0.28);
  });
}

// ── Idle Hint ───────────────────────────────────────────────
const IDLE_HINT_MS = 8000;

let idleHintTimer = null;
let hintedLetterIndex = null;

function clearIdleHint() {
  if (idleHintTimer) {
    clearTimeout(idleHintTimer);
    idleHintTimer = null;
  }

  hintedLetterIndex = null;
  trackerLetters.forEach(el => el.classList.remove('hint'));
}

function scheduleIdleHint() {
  clearIdleHint();

  if (gameState !== 'playing') return;

  idleHintTimer = setTimeout(() => {
    const uncollected = letters.filter(l => !l.collected);
    if (uncollected.length === 0 || gameState !== 'playing') return;

    const letter = uncollected[Math.floor(Math.random() * uncollected.length)];
    hintedLetterIndex = letter.index;

    trackerLetters[letter.index]?.classList.add('hint');
  }, IDLE_HINT_MS);
}

function resetIdleHintTimer() {
  clearIdleHint();
  scheduleIdleHint();
}

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
/*
const LETTER_DEFS = [
  { char: 'H', fx: 0.15, fy: 0.70 },
  { char: 'A', fx: 0.30, fy: 0.40 },
  { char: 'R', fx: 0.55, fy: 0.60 },
  { char: 'P', fx: 0.70, fy: 0.35 },
  { char: 'E', fx: 0.45, fy: 0.75 },
  { char: 'R', fx: 0.82, fy: 0.65 },
];
 */

// ── Letters ─────────────────────────────────────────────────
// Zones are fractional screen ranges: 0–1 across width/height.
// Tune these so letters stay in good garden/background areas.
const LETTER_DEFS = [
  { char: 'H', zone: { minX: 0.10, maxX: 0.25, minY: 0.58, maxY: 0.78 } },
  { char: 'A', zone: { minX: 0.24, maxX: 0.40, minY: 0.32, maxY: 0.52 } },
  { char: 'R', zone: { minX: 0.45, maxX: 0.62, minY: 0.50, maxY: 0.68 } },
  { char: 'P', zone: { minX: 0.62, maxX: 0.78, minY: 0.28, maxY: 0.48 } },
  { char: 'E', zone: { minX: 0.34, maxX: 0.54, minY: 0.66, maxY: 0.82 } },
  { char: 'R', zone: { minX: 0.74, maxX: 0.90, minY: 0.54, maxY: 0.74 } },
];

let letters = [];

function pickZoneForIndex(i, total) {
  // Spread letters across screen horizontally
  const slice = 1 / total;

  return {
    minX: slice * i + 0.05,
    maxX: slice * (i + 1) - 0.05,
    minY: 0.3,
    maxY: 0.8
  };
}

function generateLetterDefs(word) {
  return word.split('').map((char, i) => ({
    char,
    index: i,
    zone: pickZoneForIndex(i, word.length)
  }));
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function initLetters(word) {
  const defs = generateLetterDefs(word);

  letters = defs.map((def, i) => ({
    char: def.char,
    index: i,
    fx: randomInRange(def.zone.minX, def.zone.maxX),
    fy: randomInRange(def.zone.minY, def.zone.maxY),
    collected: false,
    glowPhase: Math.random() * Math.PI * 2,
  }));

  // rebuild tracker DOM + cache references again
  buildTracker(word);
  refreshTrackerRefs();
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
    if (!Array.isArray(saved) || saved.length !== currentWord.length) return;
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
      currentWord = pickNextWord();
      initLetters(currentWord);
      trackerLetters.forEach(el => el.classList.remove('collected'));
    }
  } catch (_) { /* corrupted save — ignore */ }
}

function clearProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

// ── Particles ───────────────────────────────────────────────
let particles = [];
let rainbowTrail = [];
let flowerBlooms = [];
let sparkleStorm = [];
let fireflies = [];
let spiralDash = null;

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
      maxLife: 0.9 + Math.random() * 0.9,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
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
  const colors = ['#ffb3de','#c3b1e1','#ffd700','#b5ead7','#ff9eb5','#ffffff'];

  for (let i = 0; i < 140; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;

    particles.push({
      x: canvas.width * (0.1 + Math.random() * 0.8),
      y: -30 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 90 + side * 25,
      vy: 50 + Math.random() * 170,
      life: 1,
      maxLife: 3.0 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 7 + Math.random() * 11,
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

function spawnRainbowTrailBurst(x, y) {
  const colors = ['#ff4d6d', '#ff9f1c', '#ffe45e', '#4cd964', '#3fa7ff', '#9b5cff'];

  for (let i = 0; i < 7; i++) {
    const angle = Math.random() * Math.PI * 2;
    const drift = 20 + Math.random() * 35;

    rainbowTrail.push({
      x: x + (Math.random() - 0.5) * 24,
      y: y + (Math.random() - 0.5) * 24,
      vx: Math.cos(angle) * drift,
      vy: Math.sin(angle) * drift - 12,
      life: 1,
      maxLife: 0.55 + Math.random() * 0.45,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
    });
  }
}

function updateRainbowTrail(dt) {
  rainbowTrail = rainbowTrail.filter(p => p.life > 0);

  for (const p of rainbowTrail) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.2, dt);
    p.vy *= Math.pow(0.2, dt);
    p.life -= dt / p.maxLife;
  }
}

function drawRainbowTrail() {
  for (const p of rainbowTrail) {
    const alpha = Math.max(0, p.life);

    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initFlowerBloom() {
  flowerBlooms = [];
  const petalColors = ['#ff77b7', '#ffb347', '#ffd93d', '#8be28b', '#8ec5ff', '#d5a6ff'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    flowerBlooms.push({
      x: canvas.width * (0.08 + Math.random() * 0.84),
      y: canvas.height * (0.18 + Math.random() * 0.68),
      size: 24 + Math.random() * 26,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      centerColor: Math.random() > 0.5 ? '#fff3a6' : '#ffe066',
      rotation: Math.random() * Math.PI * 2,
      petals: 5 + Math.floor(Math.random() * 3),
      drift: (Math.random() - 0.5) * 16,
      twirl: (Math.random() - 0.5) * 0.8,
      delay: Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: 5.2 + Math.random() * 1.2,
    });
  }
}

function updateFlowerBloom(dt) {
  flowerBlooms = flowerBlooms.filter(f => f.life < f.maxLife + f.delay);

  for (const f of flowerBlooms) {
    f.life += dt;
    f.phase += dt * 2.2;
    f.rotation += f.twirl * dt;
    f.y += Math.sin(f.phase) * 1.8 * dt;
    f.x += f.drift * dt;
  }
}

function drawFlowerBloom() {
  for (const f of flowerBlooms) {
    const age = f.life - f.delay;
    if (age <= 0) continue;

    const appear = Math.min(1, age / 0.45);
    const disappear = Math.min(1, Math.max(0, (f.maxLife - age) / 0.8));
    const alpha = Math.min(appear, disappear);
    if (alpha <= 0) continue;

    const scale = 0.35 + Math.sin(Math.min(1, appear) * Math.PI * 0.5) * 0.75;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha * 0.95;

    for (let i = 0; i < f.petals; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / f.petals);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, -f.size * 0.42, f.size * 0.24, f.size * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = f.centerColor;
    ctx.shadowColor = 'rgba(255, 240, 120, 0.9)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, f.size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initSparkleStorm() {
  sparkleStorm = [];

  for (let i = 0; i < 150; i++) {
    sparkleStorm.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 20,
      vy: -6 + Math.random() * 12,
      size: 5 + Math.random() * 9,
      life: Math.random() * 0.5,
      maxLife: 2.2 + Math.random() * 1.6,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#ffffff' : '#fff4b0',
    });
  }
}

function updateSparkleStorm(dt) {
  sparkleStorm = sparkleStorm.filter(s => s.life < s.maxLife);

  if (activePowerUp === 'SPARKLE_STORM' && sparkleStorm.length < 110) {
    for (let i = 0; i < 8; i++) {
      sparkleStorm.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 20,
        vy: -6 + Math.random() * 12,
        size: 5 + Math.random() * 9,
        life: 0,
        maxLife: 1.4 + Math.random() * 1.8,
        twinkle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#ffffff' : '#fff4b0',
      });
    }
  }

  for (const s of sparkleStorm) {
    s.life += dt;
    s.twinkle += dt * (6 + Math.random() * 2);
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  }
}

function drawSparkleStorm() {
  for (const s of sparkleStorm) {
    const appear = Math.min(1, s.life / 0.35);
    const disappear = Math.min(1, Math.max(0, (s.maxLife - s.life) / 0.7));
    const alpha = Math.min(appear, disappear) * (0.5 + (Math.sin(s.twinkle) + 1) * 0.25);
    if (alpha <= 0) continue;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-s.size, 0);
    ctx.lineTo(s.size, 0);
    ctx.moveTo(0, -s.size);
    ctx.lineTo(0, s.size);
    ctx.moveTo(-s.size * 0.6, -s.size * 0.6);
    ctx.lineTo(s.size * 0.6, s.size * 0.6);
    ctx.moveTo(s.size * 0.6, -s.size * 0.6);
    ctx.lineTo(-s.size * 0.6, s.size * 0.6);
    ctx.stroke();
    ctx.restore();
  }
}

function initFireflies() {
  fireflies = [];

  for (let i = 0; i < 34; i++) {
    fireflies.push({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.15 + Math.random() * 0.75),
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 10,
      phase: Math.random() * Math.PI * 2,
      pulse: 1.5 + Math.random() * 2,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateFireflies(dt) {
  for (const f of fireflies) {
    f.phase += dt * f.pulse;
    f.x += f.vx * dt + Math.sin(f.phase * 1.7) * 10 * dt;
    f.y += f.vy * dt + Math.cos(f.phase * 1.1) * 6 * dt;

    if (f.x < -20) f.x = canvas.width + 20;
    if (f.x > canvas.width + 20) f.x = -20;
    if (f.y < canvas.height * 0.08) f.y = canvas.height * 0.08;
    if (f.y > canvas.height * 0.95) f.y = canvas.height * 0.95;
  }
}

function drawFireflies(alpha) {
  for (const f of fireflies) {
    const glow = (Math.sin(f.phase * 2.2) + 1) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha * (0.3 + glow * 0.7);
    ctx.fillStyle = '#ffe96b';
    ctx.shadowColor = '#fff7b3';
    ctx.shadowBlur = 14 + glow * 12;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size + glow * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initSpiralDash() {
  spiralDash = {
    centerX: butterfly.x,
    centerY: butterfly.y,
    resumeTargetX: butterfly.targetX,
    resumeTargetY: butterfly.targetY,
    angle: Math.atan2(butterfly.targetY - butterfly.y, butterfly.targetX - butterfly.x),
    radius: Math.min(canvas.width, canvas.height) * 0.14,
    turns: Math.PI * 5,
    duration: 1.1,
    elapsed: 0,
  };
}

function updateSpiralDash(dt) {
  if (!spiralDash) return;

  spiralDash.elapsed += dt;
  const progress = Math.min(1, spiralDash.elapsed / spiralDash.duration);
  const eased = 1 - Math.pow(1 - progress, 3);
  const radius = spiralDash.radius * (1 - eased);
  const angle = spiralDash.angle + spiralDash.turns * eased;

  butterfly.targetX = spiralDash.centerX + Math.cos(angle) * radius;
  butterfly.targetY = spiralDash.centerY + Math.sin(angle) * radius;

  if (progress >= 1) {
    butterfly.targetX = spiralDash.resumeTargetX;
    butterfly.targetY = spiralDash.resumeTargetY;
    spiralDash = null;
  }
}

function surpriseOverlayAlpha() {
  if (activePowerUp !== 'NIGHT_MODE_WITH_FIREFLIES') return 0;

  const remaining = activePowerUpEndsAt - performance.now();
  const duration = SURPRISE_DURATION_MS;
  const elapsed = Math.max(0, duration - remaining);
  const fadeIn = Math.min(1, elapsed / 700);
  const fadeOut = Math.min(1, Math.max(0, remaining / 900));
  return 0.5 * Math.min(fadeIn, fadeOut);
}

function clearSurpriseEffects() {
  flock = [];
  rainbowTrail = [];
  flowerBlooms = [];
  sparkleStorm = [];
  fireflies = [];
  spiralDash = null;
  butterfly.scale = 1;
  butterfly.trailBoost = false;
  backgroundLayer.style.filter = '';
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
  primeAudio();
  resetIdleHintTimer();
  pointerDown = true;
  const pos = getCanvasPos(e);
  butterfly.targetX = pos.x;
  butterfly.targetY = pos.y;
  dismissInstruction();
}, { passive: false });

canvas.addEventListener('pointermove', e => {
  e.preventDefault();
  if (gameState !== 'playing' || !pointerDown) return;
  primeAudio();
  resetIdleHintTimer();
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

function spawnPowerUp() {
  const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
  const startFx = 0.5;
  const startFy = 0.5;
  let fx = 0.2 + Math.random() * 0.6;
  let fy = 0.3 + Math.random() * 0.5;
  let attempts = 0;

  while (attempts < 20) {
    const dx = fx - startFx;
    const dy = fy - startFy;
    if (dx * dx + dy * dy > 0.035) break;

    fx = 0.2 + Math.random() * 0.6;
    fy = 0.3 + Math.random() * 0.5;
    attempts += 1;
  }

  powerUp = {
    type,
    fx,
    fy,
    collected: false,
    phase: Math.random() * Math.PI * 2
  };
}

// ── Win Handling ─────────────────────────────────────────────
function triggerWin() {
  gameState = 'won';
  updateWinTitle(currentWord);
  butterfly.targetX = canvas.width  * 0.5;
  butterfly.targetY = canvas.height * 0.5;
  spawnPetalBurst();
  playSuccessSound();
  setTimeout(() => winOverlay.classList.remove('hidden'), 1000);
}

const winTitle = document.getElementById('win-title');

function updateWinTitle(word) {
  winTitle.textContent = `🦋 ${word.split('').join(' ')} 🦋`;
}

// ── Reset ────────────────────────────────────────────────────
function resetGame(keepProgress = false) {
  updateWinTitle(currentWord);
  setRandomBackground();
  currentWord = pickNextWord();
  initLetters(currentWord);
  if (keepProgress) {
    loadProgress();
  } else {
    clearProgress();
  }
  spawnPowerUp();
  particles = [];
  clearSurpriseEffects();
  if (powerUpTimer) {
    clearTimeout(powerUpTimer);
    powerUpTimer = null;
  }
  activePowerUpEndsAt = 0;
  activePowerUp = null;
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
    scheduleIdleHint();
    instructionDismissed = false;
    instructionOverlay.classList.remove('hidden');
  }
}

// ── Start / Play Again / Restart ─────────────────────────────
startBtn.addEventListener('click', () => {
  primeAudio();
  welcomeOverlay.classList.add('hidden');
  resetGame(true); // FIX 3 — resume saved progress on Start
});

playAgainBtn.addEventListener('click', () => {
  primeAudio();
  resetGame(false); // explicit replay = fresh start, clears save
});

restartBtn.addEventListener('click', () => {
  if (gameState === 'welcome') return;
  primeAudio();
  resetGame(false);
});

muteBtn.addEventListener('click', () => {
  muted = !muted;
  syncMuteButton();
  saveMuteState();

  ensureMediaAudio();
  syncAudioMute();

  if (muted) {
    bgMusic?.pause();
  } else {
    primeAudio();
  }
});

function checkPowerUpCollect() {
  if (!powerUp || powerUp.collected) return;

  const x = powerUp.fx * canvas.width;
  const y = powerUp.fy * canvas.height;

  const dx = butterfly.x - x;
  const dy = butterfly.y - y;

  if (dx * dx + dy * dy < 60 * 60) {
    powerUp.collected = true;

    activatePowerUp(powerUp.type);

    spawnBurst(x, y, 60);
    playSurpriseSound();
    showToast('✨ Surprise! ✨');
  }
}

function deactivatePowerUp() {
  clearSurpriseEffects();
  activePowerUp = null;
  powerUpTimer = null;
  activePowerUpEndsAt = 0;
}

function activatePowerUp(type) {
  activePowerUp = type;

  if (powerUpTimer) clearTimeout(powerUpTimer);
  clearSurpriseEffects();

  switch (type) {
    case 'GIANT':
      butterfly.scale = 2.2;
      break;

    case 'FLOCK':
      spawnFlock();
      break;

    case 'TRAIL':
      butterfly.trailBoost = true;
      break;

    case 'RAINBOW_TRAIL':
      break;

    case 'FLOWER_BLOOM':
      initFlowerBloom();
      break;

    case 'SPIRAL_DASH':
      initSpiralDash();
      break;

    case 'SPARKLE_STORM':
      initSparkleStorm();
      break;

    case 'NIGHT_MODE_WITH_FIREFLIES':
      initFireflies();
      break;
  }

  powerUpTimer = setTimeout(() => {
    deactivatePowerUp();
  }, SURPRISE_DURATION_MS);
  activePowerUpEndsAt = performance.now() + SURPRISE_DURATION_MS;
}

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
      playLetterPopSound();
      trackerLetters[l.index].classList.add('collected');
      if (hintedLetterIndex === l.index) {
        clearIdleHint();
        scheduleIdleHint();
      }
      spawnBurst(lx, ly, 45);
      spawnBurst(butterfly.x, butterfly.y, 18);
      showToast(COLLECTION_MESSAGES[Math.floor(Math.random() * COLLECTION_MESSAGES.length)](l.char));
    }
  }
  if (anyNew) {
    saveProgress(); // FIX 3
    if (letters.every(l => l.collected)) triggerWin();
  }
  checkPowerUpCollect();
}

// ── Drawing: Butterfly ───────────────────────────────────────
function drawButterfly(x, y, rotation, wingScale, wingPhase, renderScale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(renderScale, renderScale);
    
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

function drawPowerUp() {
  if (!powerUp || powerUp.collected) return;

  powerUp.phase += 0.05;

  const x = powerUp.fx * canvas.width;
  const y = powerUp.fy * canvas.height + Math.sin(powerUp.phase) * 6;

  const glow = 28 + Math.sin(powerUp.phase * 1.5) * 6;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, glow);
  grad.addColorStop(0, 'rgba(120,255,255,0.6)');
  grad.addColorStop(1, 'rgba(120,255,255,0)');

  ctx.beginPath();
  ctx.arc(x, y, glow, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // icon (simple star)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

let flock = [];

function spawnFlock() {
  flock = [];

  for (let i = 0; i < 10; i++) {
    flock.push({
      x: -50 - i * 40,
      y: canvas.height * (0.3 + Math.random() * 0.4),
      vx: 120 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function updateFlock(dt) {
  flock.forEach(b => {
    b.x += b.vx * dt;
    b.y += Math.sin(b.phase) * 10 * dt;
    b.phase += dt * 6;
  });

  flock = flock.filter(b => b.x < canvas.width + 50);

  if (activePowerUp === 'FLOCK' && flock.length < 6) {
    flock.push({
      x: -70,
      y: canvas.height * (0.28 + Math.random() * 0.44),
      vx: 140 + Math.random() * 70,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawFlock() {
  flock.forEach(b => {
    drawButterfly(b.x, b.y, Math.PI / 2, 0.6, b.phase);
  });
}

// ── Game Loop ────────────────────────────────────────────────
let lastTime = null;

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAmbientSparkles(dt);
  backgroundLayer.style.filter = '';

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
    drawButterfly(demoX, demoY, demoRot, 0.85, demo.wingPhase, 1);
    return;
  }

  // ── FIX 1: Frame-rate-independent spring physics ─────────────
  butterfly.bobPhase  += 2.5 * dt;
  butterfly.wingPhase += 8   * dt;
  updateSpiralDash(dt);

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

  if (speed > 20 || butterfly.trailBoost) {
    spawnTrail(butterfly.x, butterfly.y);
  }

  if (activePowerUp === 'RAINBOW_TRAIL') {
    spawnRainbowTrailBurst(butterfly.x, butterfly.y);
  }

  updateParticles(dt);
  updateRainbowTrail(dt);
  updateFlowerBloom(dt);
  updateSparkleStorm(dt);
  updateFireflies(dt);

  const nightAlpha = surpriseOverlayAlpha();
  if (nightAlpha > 0) {
    backgroundLayer.style.filter = `brightness(${1 - nightAlpha * 0.9}) saturate(${1 - nightAlpha * 0.35})`;
  }

  drawFlowerBloom();
  drawLetters();
  drawParticles();
  drawRainbowTrail();
  drawSparkleStorm();

  if (nightAlpha > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(13, 16, 46, ${nightAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    drawFireflies(0.55 + nightAlpha);
  }

  drawButterfly(
    butterfly.x,
    butterfly.y,
    butterfly.rotation,
    1,
    butterfly.wingPhase,
    butterfly.scale || 1
  );
  drawPowerUp();
    
  updateFlock(dt);
  drawFlock();

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
loadMuteState();
syncMuteButton();
currentWord = pickNextWord();
initLetters(currentWord);
butterfly.x = butterfly.targetX = canvas.width  * 0.5;
butterfly.y = butterfly.targetY = canvas.height * 0.5;

requestAnimationFrame(gameLoop);
