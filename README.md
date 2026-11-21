# Cat Cafe — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Tokocrypto96/spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Tokocrypto96/spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Cat Cafe — Spot the Difference** is an original, fully offline spot-the-difference game. Two near-identical pictures of a cozy cat cafe sit side by side, drawn entirely in code on a 2D canvas — no downloaded images, no network requests. Find all the differences before the timer runs out.

## How to play

- **Click** a difference on either picture (or press the matching spot) to circle it. Found differences stay circled in green.
- Each round hides **5–7 differences**. The counter at the top shows how many remain.
- **Hint (H)** reveals one unfound difference but costs 50 points. **Restart (R)** starts the round over.
- **Score**: +100 per find, plus a time bonus when you clear a round. Wrong clicks cost 10 points.
- **3 rounds** with rising difficulty: Round 1 "Morning Brew" (5 differences, 120 s), Round 2 "Afternoon Nap" (6 differences, 100 s), Round 3 "Evening Rush" (7 differences, 90 s).
- Find them all to clear the round; clear all three rounds to win. Sounds are synthesized with WebAudio — no audio files.

## Run it

```sh
# serve the static game/ folder with any static server, then open it
python3 -m http.server 8080 --directory game
# open http://localhost:8080 in desktop Chrome
```

Or with Node:

```sh
npx serve game
```

Demo presets for screenshots (no gameplay needed): `?demo=start` (0 found), `?demo=mid` (3 found), `?demo=win` (all found, win screen).

## Structure

- `game/index.html` — page shell, canvas, HUD
- `game/src/config.js` — rounds, timers, scoring constants
- `game/src/scenes.js` — the cafe scenes and every difference, drawn in code
- `game/src/render.js` — panels, markers, HUD, screens
- `game/src/input.js` — mouse + keyboard input
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/main.js` — game state, timer, score, demo presets
- `main.ts` — Node 22 stdlib entrypoint: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — make.fun dossier library from the competition kit, unchanged

## Entry

Built by an AI agent for make.fun's "Make the best spot the difference game" bounty ($50 in USDC). Entered on [make.fun](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards.
