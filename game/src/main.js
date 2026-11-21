// Boot and the game loop: state, timer, score and demo presets.
// Screens: title -> play -> roundClear / over / win. ?demo=start|mid|win stages a
// fixed state instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, ROUNDS, SCORE_FIND, SCORE_WRONG, SCORE_HINT, SCORE_ROUND_BONUS_PER_SECOND } from './config.js';
import { roundDifferences } from './scenes.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_ROUND_CLEAR, SCREEN_OVER, SCREEN_WIN } from './render.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_RESTART, createInput } from './input.js';
import { createAudio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const demo = params.get('demo');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261121;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* storage can be off */ }
}

function freshState() {
  return {
    roundIndex: 0,
    found: new Set(),
    score: 0,
    best: readBest(),
    timeLeft: ROUNDS[0].seconds,
    seed,
    toast: '',
    hint: null,
    wrongAt: null,
    lastBonus: 0,
    totalFound: 0,
    lowTicked: false,
  };
}

const state = freshState();
let screen = SCREEN_TITLE;

function announce(message) { status.textContent = message; }

function startRound(index) {
  state.roundIndex = index;
  state.found = new Set();
  state.timeLeft = ROUNDS[index].seconds;
  state.toast = '';
  state.hint = null;
  state.wrongAt = null;
  state.lowTicked = false;
  screen = SCREEN_PLAY;
  announce(`Round ${index + 1}: ${ROUNDS[index].name}. Find ${roundDifferences(index).length} differences.`);
}

function startGame() {
  state.score = 0;
  state.totalFound = 0;
  state.best = readBest();
  startRound(0);
}

function clearRound() {
  const bonus = Math.ceil(state.timeLeft) * SCORE_ROUND_BONUS_PER_SECOND;
  state.lastBonus = bonus;
  state.score += bonus;
  state.totalFound += state.found.size;
  if (state.score > state.best) { state.best = state.score; saveBest(state.best); }
  audio.roundClear();
  if (state.roundIndex + 1 >= ROUNDS.length) {
    screen = SCREEN_WIN;
    audio.win();
    announce(`You found them all! Final score ${state.score}.`);
  } else {
    screen = SCREEN_ROUND_CLEAR;
    announce(`Round clear! Bonus ${bonus}. Score ${state.score}.`);
  }
}

function useHint() {
  if (screen !== SCREEN_PLAY) return;
  const remaining = roundDifferences(state.roundIndex).filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(remaining.length / 2)];
  state.hint = pick;
  state.score = Math.max(0, state.score + SCORE_HINT);
  state.toast = `Hint: look near the ${pick.label.toLowerCase()} (−50)`;
  audio.hint();
  announce(state.toast);
}

function handleClick(click) {
  if (screen !== SCREEN_PLAY) return;
  const p = { x: click.x, y: click.y };
  const diffs = roundDifferences(state.roundIndex);
  const hit = diffs.find((d) => !state.found.has(d.id) && Math.hypot(p.x - d.x, p.y - d.y) <= d.r + 6);
  if (hit) {
    state.found.add(hit.id);
    state.score += SCORE_FIND;
    state.hint = null;
    state.wrongAt = null;
    state.toast = `Found: ${hit.label}! +${SCORE_FIND}`;
    audio.found();
    announce(state.toast);
    if (state.found.size === diffs.length) clearRound();
  } else {
    state.score = Math.max(0, state.score + SCORE_WRONG);
    state.wrongAt = { panel: click.panel, x: p.x, y: p.y };
    state.toast = 'Not a difference — try again (−10)';
    audio.wrong();
    announce(state.toast);
    setTimeout(() => { state.wrongAt = null; }, 600);
  }
}

function runShot(name) {
  // Stage a fixed, deterministic state for screenshots.
  startGame();
  screen = SCREEN_PLAY;
  const diffs = roundDifferences(0);
  if (name === 'mid') {
    diffs.slice(0, 3).forEach((d) => state.found.add(d.id));
    state.score = 300;
    state.timeLeft = 87;
    state.toast = `Found: ${diffs[2].label}! +100`;
  } else if (name === 'win') {
    diffs.forEach((d) => state.found.add(d.id));
    // Stage the true win state: all 3 rounds cleared (5+6+7 = 18 differences).
    state.score = 2180;
    state.timeLeft = 48;
    state.totalFound = 18;
    screen = SCREEN_WIN;
  } else {
    state.timeLeft = 120;
  }
  // Paint synchronously (not via rAF) so a headless screenshot sees the frame.
  renderer.draw(state, screen);
  renderer.draw(state, screen);
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas);
  let last = performance.now();

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_HINT) useHint();
    if (actions & ACTION_RESTART) { audio.unlock(); startRound(state.roundIndex); return; }
    if (actions & ACTION_CONFIRM) {
      audio.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_ROUND_CLEAR) startRound(state.roundIndex + 1);
    }
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_PLAY) handleClick(click);
      else if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_ROUND_CLEAR) startRound(state.roundIndex + 1);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions();
    if (screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 10 && !state.lowTicked) { state.lowTicked = true; audio.tick(); }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        screen = SCREEN_OVER;
        if (state.score > state.best) { state.best = state.score; saveBest(state.best); }
        announce(`Time's up. Score ${state.score}.`);
      }
    }
    renderer.draw(state, screen);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      // Pause the clock while the tab is hidden: redraws keep running, time does not.
      last = performance.now();
    }
  });

  announce('Cat Cafe Spot the Difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (demo) runShot(demo);
else runGame();
