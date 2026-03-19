# Pac-Man Project Overview

Date: 2026-03-18
Updated: 2026-03-19
Project: `Project_GameDev_Pacman`

## Table of Contents

- [Overview of the Project](#overview-of-the-project)
- [What Is It About](#what-is-it-about)
- [Features](#features)
- [Known Limitations](#known-limitations)
- [How to Run the Project](#how-to-run-the-project)
- [Folder Structure](#folder-structure)
- [Architecture Overview](#architecture-overview)
- [File-by-File Reference](#file-by-file-reference)
- [Map Tile Legend](#map-tile-legend)
- [Screen Flow](#screen-flow)
- [Scoring Reference](#scoring-reference)
- [Related Documentation](#related-documentation)

---

## Overview of the Project

This project is a browser-based Pac-Man game created as a software engineering and game development project. It is built with JavaScript and runs in the browser using p5.js for rendering, animation, input handling, and audio playback.

The repository also includes a lightweight Express server so the game can be served locally when browser security rules make direct file opening less reliable.

---

## What Is It About

The project recreates the core Pac-Man gameplay loop:

- The player controls Pac-Man using the keyboard arrow keys.
- Pac-Man moves through a maze collecting pellets and energizers.
- Ghosts (Blinky, Pinky, Inky, Clyde) move around the board as enemies.
- The player gains points by collecting items and eating ghosts in their frightened state.
- The game tracks score, lives, and a high-score list persisted in browser storage.

From a software engineering perspective, the project demonstrates object-oriented thinking and separates game concerns across files:

- map and field setup
- player behavior
- ghost behavior
- controls
- effects and assets

---

## Features

### Working features

- Main menu screen with player name and instructions
- READY intro screen with Pac-Man theme music
- Playable Pac-Man character controlled with arrow keys
- Maze-based board layout driven by a grid map
- Pellets (10 points each)
- Energizers (50 points each, make ghosts frightened)
- Four ghosts that move randomly through the maze
- Frightened ghost mode (eat a ghost for 200 points)
- Life system displayed as icons on the HUD
- Score tracking displayed during play
- Fruit bonus item displayed during frightened mode (700 points)
- Sound effects: chomp, death, eat ghost, eat fruit, game start
- Game over screen with final score and high-score status
- High score screen showing top 4 scores
- High scores persisted with `localStorage`
- Volume slider for audio control
- Optional Express server for local hosting

### Partially implemented features

- Ghost frightened timer: ghosts enter frightened mode on energizer collection but there is no automatic recovery timer. `chasePacman()` is defined in the code but never called. Ghosts remain frightened until eaten or the session ends.
- Level icons: a `Level` class exists but uses the fruit sprite and has no functional level progression logic.

### Known missing features

- Pause/resume
- Level progression beyond one map
- Mobile or touch input
- Restart without full page reload during gameplay

---

## Recent Fixes (2026-03-19)

The following bugs were identified in a cross-check review and fixed in code:

| Issue | What Was Fixed |
|-------|----------------|
| `reset()` scope bug | Moved from inside `drawPlayScreen()` to module scope — PLAY button now correctly triggers the intro music and READY screen |
| Ghost collision after splice | Added `else` branch so eating a scared ghost and losing a life are mutually exclusive — no more false life loss when eating a ghost |
| Win condition `alert()` | Replaced with `saveScore()` + transition to High Score screen — winning now updates scores and navigates correctly |
| Ghost respawn position | Added `spawnX`/`spawnY` to `Ghost` constructor — each ghost returns to its own map spawn point after being eaten, not a shared hardcoded coordinate |
| `console.log()` in ghost constructor | Removed — no more continuous console output on ghost creation and respawn |

## Known Limitations

The following issues remain in the current code and are documented in detail in the technical review:

- **`effects.js` is dead code:** `playSound()` and `stopSound()` in `effects.js` are never called.
- **`clydeImg` declared twice:** minor typo in the variable declaration in `sketch.js`.
- **`pachead` is an undeclared implicit global:** the main menu image is loaded without a `var` declaration.
- **`activeGhosts` array is unused:** declared but never populated or read.
- **Ghost frightened mode has no timer:** ghosts stay frightened indefinitely once an energizer is eaten. `chasePacman()` is defined but never called.
- **Fruit display runs inside ghost loop:** shown and collision-checked once per ghost per frame rather than once per fruit.
- **`soundFormats` declares `.ogg`:** no `.ogg` files exist in the sounds folder.

---

## How to Run the Project

There are two practical ways to run the game.

### Option 1: Run with VS Code Live Server

1. Clone the repository.
2. Open the project in VS Code.
3. Install the `Live Server` extension if needed.
4. Open `www/index.html`.
5. Right-click the file and choose `Open with Live Server`.

This is the fastest way to preview the game in a browser.

### Option 2: Run with Express

Use this option if you encounter local browser restrictions such as CORS or asset-loading issues.

1. Open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Start the local server:

```bash
node server.js
```

4. Open the game in your browser at:

```text
http://localhost:3000/
```

---

## Folder Structure

The project uses a simple folder layout with the game code and assets placed under `www/`.

```text
Project_GameDev_Pacman/
├── README.md
├── package.json
├── package-lock.json
├── server.js
└── www/
    ├── index.html
    ├── sketch.js
    ├── field.js
    ├── pacman.js
    ├── ghost.js
    ├── control.js
    ├── level.js
    ├── effects.js
    ├── documentation/
    │   ├── project-overview.md
    │   ├── technical-review-2026-03-18.md
    │   └── Milestone2_Ebeckett_s5125717.pdf
    ├── images/
    │   ├── blinky.png
    │   ├── clyde.png
    │   ├── energizer.png
    │   ├── ghost.png
    │   ├── grape.png
    │   ├── inky.png
    │   ├── pac.png
    │   ├── paclife.png
    │   ├── pacmanhead.png
    │   ├── pelettes.png
    │   ├── pinky.png
    │   ├── sprites.png
    │   ├── tile.png
    │   └── weak.png
    ├── sounds/
    │   ├── pacman_beginning.mp3
    │   ├── pacman_beginning.wav
    │   ├── pacman_chomp.mp3
    │   ├── pacman_chomp.wav
    │   ├── pacman_death.mp3
    │   ├── pacman_death.wav
    │   ├── pacman_eatfruit.mp3
    │   ├── pacman_eatfruit.wav
    │   ├── pacman_eatghost.mp3
    │   ├── pacman_eatghost.wav
    │   ├── pacman_intermission.mp3
    │   └── pacman_intermission.wav
    └── lib/
        ├── p5.js
        ├── p5.sound.js
        └── p5.play.js
```

### Root Files

- `README.md`: main project readme and links to documentation
- `package.json`: dependency and package configuration (contains placeholder name/description)
- `package-lock.json`: locked dependency versions
- `server.js`: local Express server for serving the game

### `www/` Folder

- `index.html`: browser entry point that loads the game scripts (page title currently "Test")
- `sketch.js`: main game setup, asset loading, screen flow, draw loop, and gameplay orchestration
- `field.js`: game board layout and field-related entities
- `pacman.js`: Pac-Man movement and interaction logic
- `ghost.js`: ghost behavior and movement logic
- `control.js`: keyboard input handling
- `level.js`: fruit and level-related display objects
- `effects.js`: audio helper functions (currently unused — not called anywhere in the game)

### Asset Folders

- `www/images/`: sprite sheets, icons, and game images
- `www/sounds/`: music and sound effects (`.mp3` and `.wav` format)
- `www/lib/`: third-party libraries vendored into the project
- `www/documentation/`: project documentation, original report, and technical review

---

## Architecture Overview

The project follows a simple browser-game architecture built around p5.js. It is organized into separate files by responsibility, but in its current form it behaves more like a lightweight object-oriented game script than a strict MVC implementation.

### Runtime Flow

1. The browser opens `www/index.html`.
2. p5.js and p5.sound are loaded first.
3. The game scripts are loaded through `<script>` tags in order.
4. p5 calls `preload()`, `setup()`, and then continuously runs `draw()`.
5. The draw loop updates the game and renders the canvas each frame.

The project also includes `server.js`, which serves the `www/` folder as a static website for local development.

### Main Architectural Parts

| File | Role |
|------|------|
| `index.html` | Bootstraps the game in the browser |
| `sketch.js` | Main coordinator: asset loading, screen flow, world building, game loop, collision, scoring |
| `field.js` | Board layout (25×30 grid), tile, pellet, energizer, life classes |
| `pacman.js` | Pac-Man entity: position, animation, movement, collision methods |
| `ghost.js` | Ghost entity: random movement AI, collision, frightened state |
| `control.js` | Keyboard input: maps arrow keys to Pac-Man movement |
| `level.js` | Fruit and Level display classes |
| `effects.js` | Audio helper stubs (currently dead code) |

### Current MVC-Style Interpretation

The code shows an MVC-style intention, but the boundaries are not yet strict.

**Model-like parts:**
- Entity state: Pac-Man, ghosts, pellets, energizers, lives, score
- Board data defined in the field array in `field.js`

**View-like parts:**
- Canvas rendering through p5.js `image()` and `text()` calls
- Menu buttons and score display

**Controller-like parts:**
- Keyboard input in `control.js`
- Button actions created in `sketch.js`

In practice, these responsibilities are still mixed together. `sketch.js` manages screen state, rendering, collision handling, audio behavior, and score updates in the same place. Entities (`Pacman`, `Ghost`, `Tile`) also directly render themselves using global image variables, blending model and view concerns.

### Game Loop

The project uses p5.js `draw()` as the game loop. Internally, p5 uses `requestAnimationFrame`, so the game is already running on the standard browser animation model.

The current draw loop:

```javascript
function draw() {
  background(0);
  updateBackgroundAudio();
  syncButtonsForScreen();

  switch(currentScreen) {
    case MAIN_MENU:   drawMainMenuScreen(); break;
    case PLAY:        drawPlayScreen(); break;
    case HIGH_SCORE:  drawHighScore(); break;
    case END_GAME:    drawEndGameScreen(); break;
  }
}
```

At a high level, `drawPlayScreen()` handles:

- Drawing the board and entities
- Detecting item collection (pellets, energizers, fruit)
- Moving ghosts
- Checking collisions between Pac-Man and ghosts
- Updating score and lives
- Triggering game-over flow

### Strengths of the Current Architecture

- Easy to understand for a small project
- File-based separation of key gameplay concerns
- Centralized game startup through p5 lifecycle functions
- Asset loading handled in `preload()`
- Game rendering and interaction remain entirely browser-based
- High-score persistence with `localStorage` and guard against duplicate saves

### Current Limitations

- Heavy reliance on global variables (50+)
- Rendering and game rules are tightly coupled in the same functions
- Screen management is embedded inside the main game script
- Helper functions (`reset`, `saveScore`, `ghostScared`) are defined inside render functions and are inaccessible from other contexts
- Limited scalability for adding more levels, states, or enemy behaviors
- Difficult to test individual systems in isolation
- No type checking, linting, or test suite

### Suggested Direction

If the project continues to grow, the next architecture step should be to:

1. Move all helper functions to module scope
2. Introduce a `gameState` object to own screen, score, lives, and entity arrays
3. Add a proper `WIN` screen state
4. Separate scene logic into distinct functions with `enter`/`update`/`render`/`exit` structure
5. Extract constants for tile size, canvas size, score values, and spawn positions
6. Move audio management to a dedicated module called on state transitions only

---

## File-by-File Reference

### `sketch.js` — Main Orchestrator (523 lines)

**Purpose:** Game entry point, asset loading, screen transitions, gameplay loop, collision detection, scoring.

**Key constants:**
- `MAIN_MENU = 0`, `PLAY = 1`, `HIGH_SCORE = 2`, `END_GAME = 3`
- `HIGH_SCORE_STORAGE_KEY = "pacmanHighScores"`

**Key globals:**
- `tiles`, `pelettes`, `energizers`, `lives`, `ghosts`, `fruits`, `levels` — entity arrays
- `score`, `newHighScore`, `highScore`, `gameOverSaved`, `gameOverMessage` — scoring state
- `currentScreen`, `playIntroActive`, `lastAudioScreen` — screen/audio state
- `tileImg`, `pacmanImg`, `blinkyImg`, etc. — image assets
- `begSound`, `chompSound`, `deathSound`, `eatGhostSound`, `eatFruitSound` — audio assets
- `playButton1`, `playButton2`, `playButton3`, `playButton4` — UI buttons
- `slider` — volume slider

**Key functions:**
- `preload()`: loads all images and sounds
- `setup()`: creates canvas, builds world from map, creates UI buttons
- `draw()`: main game loop via p5.js `requestAnimationFrame`
- `loadHighScores()`: loads and validates scores from `localStorage`
- `saveHighScores()`: persists the top 4 scores to `localStorage`
- `updateBackgroundAudio()`: manages audio transitions on screen change
- `syncButtonsForScreen()`: shows/hides buttons based on `currentScreen`
- `drawPlayScreen()`: renders gameplay, moves ghosts, handles all collisions and scoring

**Known issues:** `reset()` and `saveScore()` are defined inside `drawPlayScreen()` but `reset()` is also called from `playButtonGame()` in `setup()`, which is out of scope.

---

### `field.js` — Board Layout and Entity Classes (102 lines)

**Purpose:** Defines the game map and all static entity classes.

**Classes:** `Fields`, `Tile`, `Pelette`, `Energizer`, `Life`

**Map:** 25 rows × 30 columns grid. Row 24 (last row) contains only 8 cells and is used for HUD positioning — this breaks the rectangular assumption.

**Note:** Contains a duplicate `drawHighScore()` function that is never called and displays `score`, not the high score list.

---

### `pacman.js` — Player Entity (91 lines)

**Purpose:** Pac-Man position, sprite animation, movement, and all collision detection methods.

**Properties:** `x`, `y`, `frame` (0–5), `direction` (0–3), `radius = 5`, `xspeed`, `yspeed`

**Sprite directions:** 0 = right, 1 = down, 2 = left, 3 = up

**Starting position:** built from map `'p'` symbol (column 14, row 18 → pixel 448, 576)

**Respawn position:** hardcoded to `(448, 576)` in `this.respawn()`

**Collision methods:** `eat(pelette)`, `energize(energizer)`, `colission(ghost)`, `eatFruit(fruit)` — all use distance-radius checks with p5.js `dist()`.

**Known issues:** Method name `colission` is a typo of `collision`.

---

### `ghost.js` — Ghost Entity (73 lines)

**Purpose:** Ghost position, sprite, frightened state, random movement AI.

**Constructor syntax:** Uses `function Ghost(x, y, img, theField)` (not `class`). The `theField` parameter is declared but not used.

**AI:** Random direction chosen when `movement === false`. Moves 32px per frame. On wall collision, reverts position, sets `movement = false`, and recursively calls `ghostMove()` to retry. This is an unbounded recursion risk.

**Frightened state:** When `isScared === true`, renders `weakImg` instead of the ghost sprite.

**Respawn:** `ghostRespawn()` uses the constructor's `x` and `y` closure variables — correctly returns each ghost to its original spawn. However, when a ghost is eaten and a new `Ghost` is pushed with a hardcoded position `(32*12, 32*10)`, the new ghost will always respawn to that fixed point.

**Known issues:**
- `console.log(this.gX, this.gY)` on line 5 runs on every ghost creation and respawn.
- Recursive `ghostMove()` can overflow the call stack in edge cases.
- `theField` parameter unused.

---

### `control.js` — Keyboard Input (27 lines)

**Purpose:** Maps arrow key presses to Pac-Man movement, with wall collision prevention.

**Behavior:** Before calling `pacman.move(direction)`, checks the target cell in `field.theField` against `'*'` (wall). If the cell is a wall, movement is blocked.

**Known issue:** Pac-Man's `move()` does not allow queued input — the player must press at the exact moment a turn is possible.

---

### `level.js` — Fruit and Level Classes (24 lines)

**Purpose:** Defines `Fruit` and `Level` display objects.

**Known issue:** `Level.show()` renders `fruitImg` instead of a dedicated level sprite. The class is a placeholder.

---

### `effects.js` — Audio Helpers (16 lines)

**Purpose:** Intended to provide reusable audio control functions.

**Current state:** `playSound()` and `stopSound()` are defined but never called anywhere in the project. All audio is managed directly in `sketch.js`. This file is dead code in its current form.

---

## Map Tile Legend

The game board is defined in `field.js` as a 2D array of single-character symbols.

| Symbol | Meaning |
|--------|---------|
| `*` | Wall tile |
| `-` | Pellet (collectible, 10 points) |
| `o` | Energizer (power-up, 50 points, makes ghosts frightened) |
| `z` | Empty space / open tunnel area |
| `p` | Pac-Man starting position |
| `b` | Blinky (red ghost) spawn |
| `n` | Pinky (pink ghost) spawn |
| `i` | Inky (cyan ghost) spawn |
| `c` | Clyde (orange ghost) spawn |
| `l` | Life icon display position |
| `f` | Fruit display position |
| `v` | Level icon display position |

The last row (index 24) uses only 8 symbols and positions HUD elements (`l`, `l`, `l`, `v`). It does not conform to the 30-column grid format.

---

## Screen Flow

```text
MAIN_MENU
    ↓ (PLAY button)
PLAY (intro: READY! screen while begSound plays)
    ↓ (intro ends)
PLAY (active gameplay)
    ↓ (all lives lost)
END_GAME
    ↓ (MAIN MENU button → page reload)
MAIN_MENU

MAIN_MENU
    ↓ (HIGHSCORE button)
HIGH_SCORE
    ↓ (MAIN MENU button)
MAIN_MENU

PLAY (active gameplay)
    ↓ (all pellets eaten → alert() + reload)
[Page reloads — no WIN screen]
```

---

## Scoring Reference

| Event | Points |
|-------|--------|
| Collect pellet | 10 |
| Collect energizer | 50 |
| Eat scared ghost | 200 |
| Collect fruit | 700 |

High scores are stored in `localStorage` under the key `"pacmanHighScores"`. The top 4 scores are kept. Scores are validated as finite numbers on load.

---

## Related Documentation

- Original project document: [Milestone2_Ebeckett_s5125717.pdf](Milestone2_Ebeckett_s5125717.pdf)
- Technical review (with cross-check): [technical-review-2026-03-18.md](technical-review-2026-03-18.md)
