// The renderer: panels, markers, HUD and screens. One clear job: paint the state.
// Layout is computed from the canvas size so the game fits any desktop window.
import { SCENE_W, SCENE_H, ROUNDS } from './config.js';
import { drawScene, roundDifferences } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_ROUND_CLEAR = 'roundClear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const GAP = 16;
const HUD_H = 72;

export function computeLayout(canvas) {
  const w = canvas.width, h = canvas.height;
  const availW = (w - GAP * 3) / 2;
  const availH = h - HUD_H - GAP * 2;
  const scale = Math.min(availW / SCENE_W, availH / SCENE_H);
  const pw = SCENE_W * scale, ph = SCENE_H * scale;
  const y = HUD_H + (availH - ph) / 2;
  return {
    left: { x: GAP, y, w: pw, h: ph, scale },
    right: { x: GAP * 2 + pw, y, w: pw, h: ph, scale },
    hintBtn: { x: w - 220, y: 14, w: 96, h: 40 },
    restartBtn: { x: w - 112, y: 14, w: 96, h: 40 },
  };
}

function toPanel(panel, sx, sy) {
  return { x: panel.x + sx * panel.scale, y: panel.y + sy * panel.scale };
}

function drawPanel(ctx, panel, roundIndex, side, seed) {
  ctx.save();
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(panel.x - 4, panel.y - 4, panel.w + 8, panel.h + 8);
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  ctx.translate(panel.x, panel.y);
  ctx.scale(panel.scale, panel.scale);
  drawScene(ctx, roundIndex, side, seed);
  ctx.restore();
}

function drawMarker(ctx, panel, diff) {
  const p = toPanel(panel, diff.x, diff.y);
  const r = diff.r * panel.scale;
  ctx.strokeStyle = '#22a355'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(34, 163, 85, 0.5)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2); ctx.stroke();
}

function drawHud(ctx, canvas, layout, state, screen) {
  const round = ROUNDS[state.roundIndex];
  const diffs = roundDifferences(state.roundIndex);
  const remaining = diffs.length - state.found.size;
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, canvas.width, HUD_H);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Cat Cafe — Spot the Difference', 16, 26);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#ffd93b';
  ctx.fillText(`Round ${state.roundIndex + 1}/3 · ${round.name}`, 16, 52);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`Found ${state.found.size} / ${diffs.length}   ·   ${remaining} left`, canvas.width / 2, 24);
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`Score ${state.score}   ·   Best ${state.best}`, canvas.width / 2, 50);
  // Timer bar + seconds.
  const frac = Math.max(0, state.timeLeft / round.seconds);
  const barX = canvas.width / 2 - 130, barY = 60, barW = 260;
  ctx.fillStyle = '#5a4632'; ctx.fillRect(barX, barY, barW, 8);
  ctx.fillStyle = frac > 0.3 ? '#22a355' : '#d94f4f';
  ctx.fillRect(barX, barY, barW * frac, 8);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, canvas.width / 2 + 160, 64);
  // Buttons.
  for (const [rect, label] of [[layout.hintBtn, 'Hint (H)'], [layout.restartBtn, 'Restart (R)']]) {
    ctx.fillStyle = '#f7e8c9';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = '#2b2118'; ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }
  if (screen === SCREEN_PLAY && state.toast) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    const tw = ctx.measureText(state.toast).width + 32;
    ctx.fillRect(canvas.width / 2 - tw / 2, HUD_H + 8, tw, 30);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(state.toast, canvas.width / 2, HUD_H + 24);
  }
}

function overlay(ctx, canvas, lines, sub) {
  ctx.fillStyle = 'rgba(43, 33, 24, 0.82)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 44px Georgia, serif';
  let y = canvas.height / 2 - 90;
  for (const line of lines) { ctx.fillText(line, canvas.width / 2, y); y += 56; }
  ctx.fillStyle = '#f7e8c9';
  ctx.font = '20px Georgia, serif';
  for (const line of sub) { ctx.fillText(line, canvas.width / 2, y); y += 30; }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw(state, screen) {
    const layout = computeLayout(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, layout.left, state.roundIndex, 'left', state.seed);
    drawPanel(ctx, layout.right, state.roundIndex, 'right', state.seed);
    // Panel labels.
    ctx.fillStyle = '#f7e8c9'; ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('A — Original', layout.left.x + layout.left.w / 2, layout.left.y - 10);
    ctx.fillText('B — Find the differences', layout.right.x + layout.right.w / 2, layout.right.y - 10);
    // Markers on found differences, on both panels.
    for (const diff of roundDifferences(state.roundIndex)) {
      if (!state.found.has(diff.id)) continue;
      drawMarker(ctx, layout.left, diff);
      drawMarker(ctx, layout.right, diff);
    }
    // Hint flash: a pulsing ring on the hinted difference.
    if (state.hint && screen === SCREEN_PLAY) {
      const p = toPanel(layout.right, state.hint.x, state.hint.y);
      const r = state.hint.r * layout.right.scale * (1 + 0.12 * Math.sin(performance.now() / 150));
      ctx.strokeStyle = '#ffd93b'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    // Wrong-click cross.
    if (state.wrongAt) {
      const p = toPanel(state.wrongAt.panel === 'left' ? layout.left : layout.right, state.wrongAt.x, state.wrongAt.y);
      ctx.strokeStyle = '#d94f4f'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y - 10); ctx.lineTo(p.x + 10, p.y + 10);
      ctx.moveTo(p.x + 10, p.y - 10); ctx.lineTo(p.x - 10, p.y + 10);
      ctx.stroke();
    }
    drawHud(ctx, canvas, layout, state, screen);
    if (screen === SCREEN_TITLE) {
      overlay(ctx, canvas, ['Cat Cafe', 'Spot the Difference'], [
        'Two pictures of the same cafe. Only one is the original.',
        `Find all ${roundDifferences(0).length} differences in Round 1 before the timer ends.`,
        'Click a difference on either picture · H = hint (−50) · R = restart',
        'Click or press Space to start',
      ]);
    } else if (screen === SCREEN_ROUND_CLEAR) {
      overlay(ctx, canvas, ['Round Clear!'], [
        `Round ${state.roundIndex + 1} done — bonus +${state.lastBonus} points.`,
        'Click or press Space for the next round',
      ]);
    } else if (screen === SCREEN_OVER) {
      overlay(ctx, canvas, ["Time's Up!"], [
        `You found ${state.found.size} of ${roundDifferences(state.roundIndex).length} differences in Round ${state.roundIndex + 1}.`,
        `Score ${state.score} · Best ${state.best}`,
        'Click or press Space to try again',
      ]);
    } else if (screen === SCREEN_WIN) {
      overlay(ctx, canvas, ['You Found Them All!'], [
        `All 3 rounds cleared — ${state.totalFound} differences found.`,
        `Final score ${state.score} · Best ${state.best}`,
        'Click or press Space to play again',
      ]);
    }
    return layout;
  }
  return { draw, resize };
}
