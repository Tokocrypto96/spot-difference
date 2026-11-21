// Round setup, scoring and layout constants for Cat Cafe Spot the Difference.
// One clear job: every number the game balances on lives here, nothing else.

// The scene is drawn in a fixed 560x420 box, then scaled to fit each panel.
export const SCENE_W = 560;
export const SCENE_H = 420;

// Three rounds, harder as you go: more differences, less time.
export const ROUNDS = [
  { name: 'Morning Brew', differences: 5, seconds: 120 },
  { name: 'Afternoon Nap', differences: 6, seconds: 100 },
  { name: 'Evening Rush', differences: 7, seconds: 90 },
];

export const SCORE_FIND = 100;
export const SCORE_WRONG = -10;
export const SCORE_HINT = -50;
export const SCORE_ROUND_BONUS_PER_SECOND = 5;

export const BEST_KEY = 'cat-cafe-spot-best';

// Demo presets (?demo=start|mid|win) stage a fixed state for screenshots.
export const DEMO_PRESETS = ['start', 'mid', 'win'];
