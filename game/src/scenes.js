// The cafe scenes: everything the player sees is drawn here in code, no images.
// One clear job: draw the base cafe, then paint each difference in its left/right form.
// A difference is data: an id, a click spot (x, y, r) and a paint(ctx, side) function.
// Deterministic: a mulberry32 seeded random picks the blanket colour per ?seed=.

// --- seeded random ---------------------------------------------------------
export function createSeededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLANKETS = ['#e2725b', '#5b8c5a', '#7a6fb8', '#c98a3d'];

// --- small drawing helpers -------------------------------------------------
function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

// --- the eight differences -------------------------------------------------
// Each paints ONLY the differing element, left form vs right form.

function paintSun(ctx, side) {
  if (side === 'left') {
    circle(ctx, 112, 78, 20, '#ffd93b');
    ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 112 + Math.cos(a) * 26, 78 + Math.sin(a) * 26, 112 + Math.cos(a) * 33, 78 + Math.sin(a) * 33, '#f5a623', 3);
    }
  } else {
    ellipse(ctx, 100, 76, 22, 12, '#ffffff');
    ellipse(ctx, 122, 82, 20, 11, '#f2f2f2');
    ellipse(ctx, 112, 68, 16, 10, '#ffffff');
  }
}

function paintTail(ctx, side) {
  ctx.strokeStyle = '#e8862e'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  if (side === 'left') { ctx.moveTo(438, 322); ctx.quadraticCurveTo(468, 300, 460, 272); }
  else { ctx.moveTo(438, 322); ctx.quadraticCurveTo(466, 334, 470, 352); }
  ctx.stroke();
}

function paintCups(ctx, side) {
  const cups = side === 'left' ? [228, 262] : [218, 252, 286];
  for (const x of cups) {
    rect(ctx, x, 276, 24, 22, '#ffffff');
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2;
    ctx.strokeRect(x, 276, 24, 22);
    ctx.beginPath(); ctx.arc(x + 24, 287, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    line(ctx, x + 4, 272, x + 8, 264, '#cccccc', 2);
    line(ctx, x + 12, 270, x + 16, 262, '#cccccc', 2);
  }
}

function paintClockHands(ctx, side) {
  circle(ctx, 480, 70, 3, '#333333');
  if (side === 'left') { line(ctx, 480, 70, 480, 52, '#333333', 3); line(ctx, 480, 70, 462, 70, '#333333', 3); }
  else { line(ctx, 480, 70, 480, 52, '#333333', 3); line(ctx, 480, 70, 498, 70, '#333333', 3); }
}

function paintLeaves(ctx, side) {
  const leaves = side === 'left' ? [[58, 306], [70, 296], [82, 306]] : [[62, 306], [78, 306]];
  for (const [x, y] of leaves) ellipse(ctx, x, y, 7, 16, '#3f7d3a');
}

function paintPicture(ctx, side) {
  if (side === 'left') {
    ctx.fillStyle = '#e2725b';
    ctx.beginPath();
    ctx.moveTo(300, 92); ctx.bezierCurveTo(288, 78, 272, 88, 282, 100);
    ctx.bezierCurveTo(290, 108, 300, 112, 300, 112);
    ctx.bezierCurveTo(300, 112, 310, 108, 318, 100);
    ctx.bezierCurveTo(328, 88, 312, 78, 300, 92);
    ctx.fill();
  } else {
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      const x = 300 + Math.cos(a) * 14, y = 95 + Math.sin(a) * 14;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }
}

function paintLamp(ctx, side) {
  // The bulb hangs below the shade so its lit/unlit state is easy to see.
  line(ctx, 280, 60, 280, 66, '#333333', 2);
  if (side === 'left') {
    circle(ctx, 280, 74, 16, 'rgba(255, 217, 59, 0.35)');
    circle(ctx, 280, 72, 8, '#ffe9a8');
  } else {
    circle(ctx, 280, 72, 8, '#9a9a9a');
  }
}

function paintTeapot(ctx, side) {
  if (side === 'left') {
    ellipse(ctx, 452, 318, 20, 14, '#7a6fb8');
    circle(ctx, 452, 300, 7, '#7a6fb8');
    ctx.beginPath(); ctx.arc(432, 316, 8, Math.PI / 2, Math.PI * 1.5); ctx.strokeStyle = '#7a6fb8'; ctx.lineWidth = 4; ctx.stroke();
    line(ctx, 470, 310, 480, 304, '#7a6fb8', 4);
  } else {
    rect(ctx, 440, 300, 24, 20, '#c98a3d');
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2; ctx.strokeRect(440, 300, 24, 20);
    line(ctx, 446, 300, 446, 294, '#8a5a2b', 2);
    line(ctx, 458, 300, 458, 294, '#8a5a2b', 2);
  }
}

export const DIFFERENCES = [
  { id: 'sun', label: 'Sun in the window', x: 112, y: 78, r: 30, paint: paintSun },
  { id: 'tail', label: "The cat's tail", x: 452, y: 312, r: 30, paint: paintTail },
  { id: 'cups', label: 'Cups on the table', x: 252, y: 284, r: 30, paint: paintCups },
  { id: 'clock', label: 'Clock hands', x: 480, y: 70, r: 28, paint: paintClockHands },
  { id: 'plant', label: 'Plant leaves', x: 70, y: 306, r: 28, paint: paintLeaves },
  { id: 'picture', label: 'Picture on the wall', x: 300, y: 95, r: 26, paint: paintPicture },
  { id: 'lamp', label: 'Hanging lamp', x: 280, y: 50, r: 26, paint: paintLamp },
  { id: 'teapot', label: 'Teapot on the side table', x: 452, y: 312, r: 28, paint: paintTeapot },
];

const BY_ID = new Map(DIFFERENCES.map((d) => [d.id, d]));

// Which differences each round hides (ids into DIFFERENCES).
export const ROUND_DIFFS = [
  ['sun', 'tail', 'cups', 'clock', 'plant'],
  ['sun', 'cups', 'clock', 'picture', 'lamp', 'plant'],
  ['tail', 'cups', 'clock', 'plant', 'picture', 'lamp', 'teapot'],
];

export function roundDifferences(roundIndex) {
  return ROUND_DIFFS[roundIndex].map((id) => BY_ID.get(id));
}

// --- the base cafe (identical on both sides) -------------------------------
export function drawBaseScene(ctx, seed) {
  const rng = createSeededRandom(seed);
  const blanket = BLANKETS[Math.floor(rng() * BLANKETS.length)];

  // Wall, floor, rug.
  rect(ctx, 0, 0, 560, 300, '#f7e8c9');
  rect(ctx, 0, 300, 560, 120, '#b07a45');
  for (let i = 0; i < 6; i++) line(ctx, 0, 316 + i * 18, 560, 316 + i * 18, '#96683a', 1);
  ellipse(ctx, 280, 372, 190, 30, '#d94f4f');
  ellipse(ctx, 280, 372, 150, 22, '#e2725b');

  // Window with sky (sun/cloud painted by the difference).
  rect(ctx, 56, 36, 148, 128, '#8a5a2b');
  rect(ctx, 64, 44, 132, 112, '#bfe3ff');
  line(ctx, 130, 44, 130, 156, '#8a5a2b', 4);
  line(ctx, 64, 100, 196, 100, '#8a5a2b', 4);
  rect(ctx, 48, 30, 20, 140, '#d94f4f');
  rect(ctx, 192, 30, 20, 140, '#d94f4f');

  // Shelf with jars.
  rect(ctx, 340, 150, 180, 12, '#8a5a2b');
  rect(ctx, 360, 118, 26, 32, '#c98a3d');
  rect(ctx, 400, 112, 26, 38, '#5b8c5a');
  rect(ctx, 440, 120, 26, 30, '#7a6fb8');
  line(ctx, 360, 118, 386, 118, '#8a5a2b', 3);
  line(ctx, 400, 112, 426, 112, '#8a5a2b', 3);
  line(ctx, 440, 120, 466, 120, '#8a5a2b', 3);

  // Wall clock face (hands painted by the difference).
  circle(ctx, 480, 70, 26, '#ffffff');
  ctx.strokeStyle = '#333333'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(480, 70, 26, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, 480 + Math.cos(a) * 22, 70 + Math.sin(a) * 22, 480 + Math.cos(a) * 24, 70 + Math.sin(a) * 24, '#333333', 2);
  }

  // Picture frame (inside painted by the difference).
  rect(ctx, 266, 66, 68, 58, '#8a5a2b');
  rect(ctx, 272, 72, 56, 46, '#fdf6e3');

  // Hanging lamp cord + shade (bulb painted by the difference).
  line(ctx, 280, 0, 280, 36, '#333333', 3);
  ctx.fillStyle = '#3f7d3a';
  ctx.beginPath(); ctx.moveTo(258, 44); ctx.lineTo(302, 44); ctx.lineTo(292, 62); ctx.lineTo(268, 62); ctx.closePath(); ctx.fill();

  // Table (cups painted by the difference).
  rect(ctx, 180, 298, 220, 14, '#8a5a2b');
  rect(ctx, 196, 312, 12, 60, '#6e4520');
  rect(ctx, 372, 312, 12, 60, '#6e4520');

  // Side table (teapot/jar painted by the difference).
  rect(ctx, 410, 330, 130, 12, '#8a5a2b');
  rect(ctx, 424, 342, 10, 50, '#6e4520');
  rect(ctx, 516, 342, 10, 50, '#6e4520');

  // Sleeping cat on a cushion (tail painted by the difference).
  ellipse(ctx, 408, 340, 62, 26, blanket);
  ellipse(ctx, 408, 330, 52, 26, '#f2a541');
  circle(ctx, 362, 306, 22, '#f2a541');
  ctx.fillStyle = '#f2a541';
  ctx.beginPath(); ctx.moveTo(346, 292); ctx.lineTo(350, 268); ctx.lineTo(362, 286); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(372, 288); ctx.lineTo(382, 266); ctx.lineTo(384, 290); ctx.closePath(); ctx.fill();
  line(ctx, 352, 306, 362, 306, '#333333', 2);
  circle(ctx, 352, 318, 2, '#333333');

  // Plant pot (leaves painted by the difference).
  ctx.fillStyle = '#c96f4a';
  ctx.beginPath(); ctx.moveTo(48, 322); ctx.lineTo(92, 322); ctx.lineTo(86, 356); ctx.lineTo(54, 356); ctx.closePath(); ctx.fill();
}

// Draw one whole panel: base + that side's form of every difference.
export function drawScene(ctx, roundIndex, side, seed) {
  drawBaseScene(ctx, seed);
  for (const diff of roundDifferences(roundIndex)) diff.paint(ctx, side);
}
