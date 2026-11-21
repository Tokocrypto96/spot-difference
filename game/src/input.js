// Mouse + keyboard input. One clear job: turn clicks and keys into game actions.
// A click on a panel becomes { kind: 'scene', panel, x, y } in scene coordinates;
// a click on a HUD button becomes { kind: 'hint' } or { kind: 'restart' }.
import { SCENE_W, SCENE_H } from './config.js';
import { computeLayout } from './render.js';

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_RESTART = 4;

function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function panelHit(layout, px, py) {
  for (const name of ['left', 'right']) {
    const panel = layout[name];
    if (px >= panel.x && px <= panel.x + panel.w && py >= panel.y && py <= panel.y + panel.h) {
      return { kind: 'scene', panel: name, x: (px - panel.x) / panel.scale, y: (py - panel.y) / panel.scale };
    }
  }
  return null;
}

export function createInput(canvas, onAction) {
  const queue = [];
  let actions = 0;

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / Math.max(1, rect.width);
    return { x: (event.clientX - rect.left) * dpr, y: (event.clientY - rect.top) * dpr };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const p = canvasPoint(event);
    const layout = computeLayout(canvas);
    if (inside(layout.hintBtn, p.x, p.y)) { actions |= ACTION_HINT; return; }
    if (inside(layout.restartBtn, p.x, p.y)) { actions |= ACTION_RESTART; return; }
    const hit = panelHit(layout, p.x, p.y);
    if (hit) queue.push(hit);
    else actions |= ACTION_CONFIRM;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') { actions |= ACTION_CONFIRM; event.preventDefault(); }
    else if (key === 'h') actions |= ACTION_HINT;
    else if (key === 'r') actions |= ACTION_RESTART;
  });

  function takeActions() {
    const out = actions;
    actions = 0;
    return out;
  }

  function takeClicks() {
    return queue.splice(0, queue.length);
  }

  // Keep scene coordinates inside the drawn picture.
  function clampScene(x, y) {
    return { x: Math.max(0, Math.min(SCENE_W, x)), y: Math.max(0, Math.min(SCENE_H, y)) };
  }

  return { takeActions, takeClicks, clampScene };
}
