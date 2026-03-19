# Pac-Man Technical Code Review

Date: 2026-03-18
Cross-check review and update: 2026-03-19
Project: `Project_GameDev_Pacman`
Tech stack observed in repository: JavaScript, p5.js, p5.sound, Express static server

## Executive Summary

This project is a functional browser game prototype with a clear gameplay goal and a reasonable separation of concerns at the file level for a student project. The code shows an attempt at object-oriented design through entity classes such as `Pacman`, `Ghost`, `Tile`, `Fruit`, and `Level`.

However, the current implementation is not actually MVC in a strong architectural sense. Most game state is stored in globals, rendering and gameplay rules are tightly coupled, and several behaviors depend on side effects inside the main draw cycle. The game works best as a small single-level prototype; it would become difficult to maintain, test, or extend into a larger game without restructuring.

## Implementation Status Update

The findings below were written as an initial review snapshot. Since then, several runtime issues have been fixed in the codebase. A second cross-check pass on 2026-03-19 identified additional issues not caught in the original review.

### Fixed Since Initial Review

- Ghost respawn now preserves the eaten ghost reference before removal, avoiding invalid array access.
- Game-over flow now uses an explicit end-game screen instead of continuing to mutate state in normal gameplay.
- High scores now save once per game-over flow and are persisted locally with browser storage.
- The end-game button flow has been corrected and the game-over screen now includes a route back to the main menu.
- High-score and game-over screen UI have been improved for readability.
- Audio handling has been partially improved so the Pac-Man intro theme plays on entering the play state instead of behaving like generic looping menu audio.

### Still Open

- Map/grid structure inconsistency (row 24 has 8 cells, not 30)
- Heavy global state coupling
- MVC boundary mixing
- Recursive ghost movement
- Duplicate score-rendering ownership
- Naming consistency issues
- Performance concerns around repeated per-frame scans and frame-rate control inside entity loops
- Ghost respawn uses a fixed hardcoded position after eating, not the original per-ghost spawn position (partially addressed)

## Review Findings

### Critical (found in cross-check review 2026-03-19)

**C1. `reset()` is defined in the wrong scope and will throw a ReferenceError when PLAY is clicked.** `Status: Fixed`

Location:
- `www/sketch.js:514` — definition of `reset()` (inside `drawPlayScreen`)
- `www/sketch.js:126` — call to `reset()` (inside `playButtonGame` inside `setup`)

Issue:
- `reset()` is declared as a nested function inside `drawPlayScreen()`, which is a global function.
- `playButtonGame()` is a nested function inside `setup()` and is not in `drawPlayScreen()`'s scope.
- Calling `reset()` from `playButtonGame()` throws `ReferenceError: reset is not defined` at runtime.
- The error halts `playButtonGame()` mid-execution, so `playIntroActive = true` and `begSound.play()` on the lines after `reset()` never execute.
- This means clicking PLAY switches `currentScreen` to `PLAY` but skips intro music and the intro screen.

Impact:
- Silent runtime error on every PLAY button click.
- Intro music and READY screen do not play correctly.
- Audio cleanup from the previous session is skipped.

Recommendation:
- Move `reset()` to the top-level scope of `sketch.js` so it is accessible from both `playButtonGame` and `drawPlayScreen`.

---

**C2. Ghost collision inner loop runs on the wrong ghost after splice.** `Status: Fixed`

Location:
- `www/sketch.js:435–466`

Issue:
- When a scared ghost is eaten, `ghosts.splice(i,1)` removes it and `ghosts.push(...)` adds the respawned ghost.
- Execution then falls through to the inner `for(var j...)` loop at line 445, which checks `pacman.colission(ghosts[i])`.
- After the splice, `ghosts[i]` is now the next ghost in the array (the array shifted), not the ghost that was just processed.
- There is no `else` or `continue` between the scared-ghost branch and the life-loss branch.
- If the shifted `ghosts[i]` happens to be near Pac-Man, it can incorrectly trigger a life loss in the same frame a ghost was eaten.

Impact:
- Eating a ghost can simultaneously remove a life in certain configurations.
- Logic is difficult to reason about and the behavior is frame-order dependent.

Recommendation:
- Add `else` or `continue` after the scared-ghost block so the life-loss path is mutually exclusive with the ghost-eating path.
- Avoid modifying the array while iterating over it; prefer marking entities as removed and splicing afterwards.

---

### High Severity

**H1. Ghost respawn logic can use an invalid or wrong ghost reference after removal.** `Status: Partially Fixed`

Location:
- `www/sketch.js:438–443`

Issue:
- The code now correctly stores `var eatenGhost = ghosts[i]` before splicing, which fixes the image reference issue from the original review.
- However, the respawn position is hardcoded: `ghosts.push(new Ghost(32*12, 32*10, eatenGhost.img))`.
- All eaten ghosts respawn to coordinate `(384, 320)` regardless of their original spawn point defined in the field map.
- The per-ghost spawn positions (`b`, `n`, `i`, `c` in the map) are discarded.

Impact:
- Ghost spread across the board collapses to a single origin after any ghost is eaten.
- Each subsequent respawn is less accurate to arcade Pac-Man behavior.

Recommendation:
- Store each ghost's original spawn position when it is created.
- Use those stored coordinates in respawn rather than a hardcoded pair.

---

**H2. Game-over handling continues mutating state inside the render loop.** `Status: Fixed`

Location:
- `www/sketch.js:453`
- `www/sketch.js:460`
- `www/sketch.js:490`
- `www/sketch.js:511`

Issue:
- When lives reach zero, `saveScore()` is called from the gameplay loop, but the loop is not stopped.
- `saveScore()` appends to `newHighScore` inside a loop and can run repeatedly across frames.

Impact:
- High scores can be duplicated or grow incorrectly.
- The game continues to process collisions and rendering while supposedly in a terminal state.
- The result is unstable and difficult to reason about.

Recommendation:
- Introduce an explicit game state such as `GAME_OVER`.
- Stop gameplay updates once the game is over.
- Run score persistence exactly once, not on every frame.

---

**H3. Background music is started and paused every frame.** `Status: Partially Fixed`

Location:
- `www/sketch.js:122`
- `www/sketch.js:223`
- `www/sketch.js:276`
- `www/sketch.js:309`

Issue:
- `begSound.play()` is called on every draw cycle, and the code then alternates between `play()` and `pause()` depending on current state.

Impact:
- Audio behavior becomes inconsistent and browser-dependent.
- This creates unnecessary work every frame and can produce sound glitches.

Recommendation:
- Move menu/game music transitions into state-entry handlers.
- Only call `play()`, `pause()`, or `stop()` when the state changes.

Current note:
- The implementation now restores the Pac-Man intro theme on entering `PLAY` and pauses gameplay until the theme finishes, but the broader audio model is still centralized in `sketch.js` rather than a dedicated audio or state system.
- The `reset()` scoping bug (C1) means intro playback may not trigger correctly in practice.

---

### Medium Severity

**M1. Win condition uses a blocking `alert()` instead of a proper screen transition.** `Status: Fixed`

Location:
- `www/sketch.js:397–399`

Issue:
- When all pellets are consumed, the game calls `alert("Y O U  W I N")` followed by `window.location.reload()`.
- This blocks the browser thread.
- The win path has no score display, no high-score update, no transition screen, and no return to the menu.
- The game-over screen handles all of those correctly; the win condition does not.

Impact:
- Inconsistent player experience between winning and losing.
- Winning is treated as a worse outcome than losing from a UX perspective.

Recommendation:
- Introduce a `WIN` screen state equivalent to `END_GAME`.
- Call `saveScore()` and transition to the win screen the same way game-over does.

---

**M2. The map definition is structurally inconsistent with the declared grid dimensions.**

Location:
- `www/field.js:4`
- `www/field.js:5`
- `www/field.js:31`
- `www/sketch.js:152`

Issue:
- `rows` is declared as `25` and `column` as `30`, but the last row (index 24) only contains 8 cells.
- The setup loop assumes a rectangular matrix and iterates `j < field.column` for every row.

Impact:
- This works only because most comparisons against `undefined` silently fail.
- It makes the map format fragile and harder to validate or scale.

Recommendation:
- Use a rectangular map for all rows, or split HUD data from the gameplay grid.
- Add a map validator to assert row widths and allowed tile symbols.

---

**M3. Architecture is heavily global and tightly coupled.**

Location:
- `www/sketch.js:6`
- `www/sketch.js:47`
- `www/sketch.js:80`
- `www/control.js:4`

Issue:
- Core state such as score, entities, assets, buttons, screens, and audio handles are global.
- Input, rendering, collision rules, UI state, and resource management all depend on shared mutable globals.

Impact:
- Behavior is hard to test.
- Any feature change risks unrelated regressions.
- Reusing the gameplay logic in a new screen or level is difficult.

Recommendation:
- Introduce a `Game` or `GameState` object that owns the full runtime state.
- Pass dependencies into modules instead of reading globals directly.

---

**M4. The project claims MVC style, but rendering and model logic are mixed together.**

Location:
- `www/sketch.js:276`
- `www/field.js:42`
- `www/pacman.js:12`
- `www/ghost.js:14`

Issue:
- Entities both store data and directly render themselves using global image assets.
- The game loop also contains UI rendering, collision handling, score updates, level logic, and game-over behavior.

Impact:
- This is closer to a script-driven object model than MVC.
- View changes require touching model classes.

Recommendation:
- Split responsibilities:
  - Model: positions, state, rules
  - View/Renderer: drawing entities and UI
  - Controller/Input: keyboard and menu actions

---

**M5. The end-game button handler is misused.** `Status: Fixed`

Location:
- `www/sketch.js:145`
- `www/sketch.js:146`

Issue:
- `playButton4.mouseClicked(window.location.reload());` calls `reload()` immediately and passes its return value instead of a callback.

Impact:
- The button behavior is fragile and hard to read.

Recommendation:
- Use `playButton4.mouseClicked(() => window.location.reload());`

---

**M6. Ghost movement can recurse unpredictably.**

Location:
- `www/ghost.js:24`
- `www/ghost.js:48`

Issue:
- `ghostMove()` recursively calls itself when colliding with a wall.

Impact:
- Small maps may tolerate this, but the behavior is difficult to debug and can spiral if the movement rules become more complex.

Recommendation:
- Replace recursion with bounded iterative retry logic or a path-selection strategy.

---

**M7. Fruit display logic is nested inside the ghost loop.**

Location:
- `www/sketch.js:411–422`

Issue:
- Fruit `show()` and `eatFruit()` checks are inside `for(var i=0; i < ghosts.length; i++)`.
- With N ghosts all scared, the fruit renders N times per frame and the eat-check runs N times per fruit.
- `fruits.splice(h, 1)` inside the outer ghost loop creates array index drift.

Impact:
- Redundant rendering and potential double-remove bugs when multiple ghosts are scared simultaneously.

Recommendation:
- Move fruit display and collection to its own loop, separate from ghost iteration.

---

### Low Severity

**L1. `reset()` scoping also causes the `ghostScared()` and `chasePacman()` helpers to be inaccessible.**

Location:
- `www/sketch.js:479`
- `www/sketch.js:484`

Issue:
- `ghostScared()` and `chasePacman()` are also nested inside `drawPlayScreen()`.
- They are currently only called within `drawPlayScreen()`, so they work.
- If ghost-scare behavior ever needs to be triggered from another handler (such as a timer or a menu action), these helpers will not be accessible.

Recommendation:
- Extract these helpers to module scope.

---

**L2. `clydeImg` is declared twice in the same statement.**

Location:
- `www/sketch.js:13`

Issue:
- `var clydeImg, pinkyImg, inkyImg, clydeImg;` — `clydeImg` appears twice.
- Harmless at runtime with `var` semantics, but a clear typo and a linting error.

Recommendation:
- Fix the declaration to: `var blinkyImg, pinkyImg, inkyImg, clydeImg;`

---

**L3. `pachead` is used without being declared.**

Location:
- `www/sketch.js:59`

Issue:
- `pachead = loadImage('./images/pacmanhead.png');` assigns to `pachead` without a preceding `var`, `let`, or `const`.
- This creates an implicit global in sloppy mode and would throw a `ReferenceError` in strict mode.

Recommendation:
- Add `var pachead;` alongside the other image variable declarations at the top of the file.

---

**L4. `activeGhosts` array is declared and never used.**

Location:
- `www/sketch.js:33`

Issue:
- `var activeGhosts = [];` is initialized but never populated or read.

Recommendation:
- Remove the dead variable, or use it to replace the `ghosts` array with a cleaner active/inactive model.

---

**L5. `effects.js` is entirely dead code.**

Location:
- `www/effects.js`

Issue:
- `playSound()` and `stopSound()` are never called from anywhere in the codebase.
- All audio management is handled directly in `sketch.js`.

Recommendation:
- Either remove `effects.js` or consolidate all audio helpers into it and call them from `sketch.js`.

---

**L6. `soundFormats('mp3', 'ogg')` declares an unavailable format.**

Location:
- `www/sketch.js:51`

Issue:
- `soundFormats('mp3', 'ogg')` is declared but the `sounds/` folder contains only `.mp3` and `.wav` files. No `.ogg` files exist.

Recommendation:
- Change to `soundFormats('mp3', 'wav')` to match actual assets, or add `.ogg` versions.

---

**L7. `Level` class uses `fruitImg` — no dedicated level sprite.**

Location:
- `www/level.js:20`

Issue:
- `image(fruitImg, this.vX, this.vY)` — the `Level` indicator renders the grape image instead of a distinct level sprite.
- The class is structurally present but semantically a placeholder.

Recommendation:
- Add a level-specific sprite or remove the class if level progression is not implemented.

---

**L8. Duplicate or conflicting definitions reduce clarity.**

Location:
- `www/sketch.js:325`
- `www/field.js:88`

Issue:
- `drawHighScore()` is defined in both `sketch.js` (inside `draw()`) and `field.js`.
- The `field.js` version displays the current `score` variable (not high score), uses incorrect label text, and is never called.

Recommendation:
- Remove the `drawHighScore()` definition from `field.js`.
- Keep score display in `field.js` through `drawScore()` only.

---

**L9. Naming consistency and typo issues make the codebase harder to maintain.**

Examples:
- `Pelette` should likely be `Pellet`
- `colission` should be `collision`
- `Fields` vs `Field`

Impact:
- These issues do not break functionality, but they increase friction for future contributors.

Recommendation:
- Standardize names and keep class/function naming aligned with domain concepts.

---

**L10. `index.html` page title is "Test".**

Location:
- `www/index.html:5`

Issue:
- `<title>Test</title>` — the page title is a development placeholder.

Recommendation:
- Change to `<title>Pac-Man</title>` or equivalent.

---

**L11. `package.json` contains placeholder values.**

Location:
- `package.json`

Issue:
- `"name": "test"`, `"description": ""`, `"author": ""` are all placeholder values from the initial `npm init`.

Recommendation:
- Update to reflect the actual project name, description, and author.

---

**L12. `console.log()` left in ghost constructor.**

Location:
- `www/ghost.js:5`

Issue:
- `console.log(this.gX, this.gY);` logs every ghost's position each time a ghost is constructed or respawned.
- With 4 ghosts and repeated respawns, this produces continuous console noise.

Recommendation:
- Remove all debug `console.log()` calls before considering the code release-ready.

---

## Architecture Quality

### What is good

- The codebase is small and understandable.
- Core entities are separated into files by domain role.
- The game loop is centralized through p5.js `draw()`, which internally uses `requestAnimationFrame`.
- The level grid gives the project a deterministic map-driven structure.
- Asset handling is centralized in `preload()`, which is the correct p5 pattern.
- High scores are persisted with `localStorage` using try/catch guards.
- The `saveScore()` guard (`gameOverSaved`) prevents duplicate score writes per session.

### What is weak

- The project is file-separated, but not architecturally isolated.
- `sketch.js` acts as bootstrapper, screen manager, world builder, renderer, audio manager, collision system, score manager, and game-over flow controller.
- There is no explicit domain model for game state transitions.
- There is no persistence layer, service layer, or reusable scene abstraction.
- Nested helper functions (`reset`, `saveScore`, `ghostScared`) inside render functions cause scoping bugs.

### Overall assessment

- Prototype quality: solid
- Architecture quality for maintainability: moderate to weak
- Architecture quality for extension into a multi-level polished game: weak without refactor

---

## Folder Structure Explanation

Observed structure:

```text
Project_GameDev_Pacman/
├── package.json
├── package-lock.json
├── README.md
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
    ├── images/
    ├── sounds/
    └── lib/
```

### Root level

- `package.json`: Node package metadata and dependencies. Currently contains placeholder name, description, and author.
- `package-lock.json`: locked dependency tree.
- `server.js`: Express server that serves the static `www/` directory.
- `README.md`: project overview and run instructions.

### Web app level

- `www/index.html`: browser entry point; loads p5.js and all game scripts. Page title is currently "Test" (placeholder).
- `www/sketch.js`: main application entry, asset loading, scene switching, world setup, draw loop, collision handling, score flow.
- `www/field.js`: map data and tile-like classes.
- `www/pacman.js`: Pac-Man entity behavior.
- `www/ghost.js`: ghost entity behavior.
- `www/control.js`: keyboard input.
- `www/level.js`: fruit and level icon classes.
- `www/effects.js`: sound helper functions (currently dead code — not called anywhere).

### Assets

- `www/images/`: sprites and icons.
- `www/sounds/`: audio assets (`.mp3` and `.wav`; no `.ogg` despite `soundFormats` declaration).
- `www/lib/`: third-party p5 libraries vendored into the project.
- `www/documentation/`: original project documentation PDF and this review.

---

## Possible Design Improvements

### 1. Introduce a real game state container

Create a top-level `Game` object:

```text
Game
├── state
│   ├── screen
│   ├── score
│   ├── lives
│   ├── level
│   └── status flags
├── world
│   ├── map
│   ├── pacman
│   ├── ghosts
│   ├── pellets
│   └── items
├── assets
├── audio
└── systems
```

This immediately reduces reliance on globals and improves testability.

### 2. Split the game into scenes

Recommended scenes:
- `MainMenuScene`
- `PlayScene`
- `HighScoreScene`
- `GameOverScene`
- `WinScene`

Each scene should have:
- `enter()`
- `update(dt)`
- `render(renderer)`
- `exit()`

This is a better fit than handling all screens in one large `draw()` function.

### 3. Separate systems from entities

Recommended modules:
- `entities/`: Pacman, Ghost, Pellet, Fruit
- `systems/`: collision, movement, scoring, audio, spawn, win/loss
- `renderers/`: board renderer, HUD renderer, entity renderer
- `data/`: map layout, constants, config

This keeps entities small and makes behavior easier to compose.

### 4. Use configuration and constants files

Move magic numbers such as `32`, `960`, `820`, score values, and spawn positions into constants:

- `TILE_SIZE`
- `CANVAS_WIDTH`
- `CANVAS_HEIGHT`
- `SCORES`
- `SPAWN_POINTS`
- `GHOST_STATES`

### 5. Replace collision-by-distance for grid objects with tile-based logic

For a Pac-Man style game, most movement is grid-aligned. Tile occupancy checks are simpler and less error-prone than sprite-radius distance checks for pellets and walls.

### 6. Replace ad hoc ghost AI with a strategy module

Start with:
- random movement strategy
- chase strategy
- frightened strategy
- respawn/home strategy

Then assign a strategy to each ghost.

---

## Missing Components

The current project is missing several components that would be expected in a production-quality or scalable game project.

### Gameplay and domain

- Level progression system
- Pause/resume system
- Restart without full page reload (currently requires `window.location.reload()`)
- Proper ghost frightened timer and recovery logic (`chasePacman()` is defined but never called)
- Proper win screen state (currently uses `alert()`)
- Deterministic respawn and spawn management per ghost
- Mobile/touch input support

### Architecture and engineering

- Automated tests
- Linting/formatting workflow
- Configuration module
- Asset manifest
- Error handling strategy
- Logging strategy
- Save/load abstraction
- State machine for screens and game phases

### Documentation

- A current architecture diagram
- Entity lifecycle documentation
- Map/tile legend specification
- Event/state transition documentation
- Dependency/version support policy

---

## Security Risks

This project has a low direct security surface because it is primarily a static browser game, but there are still some concerns.

### 1. Outdated server dependency chain

Location:
- `package.json`
- `package-lock.json`

Observation:
- The project depends on older Express 4.x packages and related transitive dependencies.

Risk:
- Older dependency trees may include known vulnerabilities over time.

Recommendation:
- Upgrade Express to the latest supported 4.x or 5.x path appropriate for the project.
- Run dependency audits regularly.

### 2. No security headers on the static server

Location:
- `server.js`

Observation:
- The Express server serves static files without headers such as CSP, `X-Content-Type-Options`, or cache policy.

Risk:
- Low for local development, but weak for public deployment.

Recommendation:
- Add Helmet or equivalent basic headers if the project is ever deployed.

### 3. Client-side score handling is fully trust-based

Location:
- `www/sketch.js:19`
- `www/sketch.js:490`

Observation:
- Scores live entirely in browser memory and `localStorage`, which are trivially editable.

Risk:
- Any future leaderboard would be easy to tamper with unless validated server-side.

Recommendation:
- Treat all browser score data as untrusted if persistence is added later.

---

## Performance Concerns

### 1. Repeated full-array scans every frame

Location:
- `www/sketch.js:368`
- `www/sketch.js:385`
- `www/sketch.js:402`
- `www/sketch.js:411`
- `www/sketch.js:424`
- `www/sketch.js:432`

Issue:
- The game iterates through tiles, pellets, energizers, ghosts, fruits, lives, and levels in separate loops every frame.

Impact:
- Fine for a tiny board, but inefficient as content grows.

Recommendation:
- Separate static rendering from dynamic updates.
- Pre-render the board background once to an offscreen canvas.

### 2. `frameRate(8)` is called inside the ghost loop

Location:
- `www/sketch.js:426`

Issue:
- Frame rate should not be set repeatedly inside entity iteration.

Impact:
- Confusing performance behavior and unnecessary repeated calls.

Recommendation:
- Set frame rate once during setup if you truly need to override it.
- Better still, use delta time for movement control.

### 3. Audio state checks happen continuously in `draw()`

Location:
- `www/sketch.js:223`
- `www/sketch.js:278`

Impact:
- Unnecessary work each frame and unstable audio behavior.

Recommendation:
- Update audio only when entering or leaving a scene/state.

### 4. Recursion in ghost movement

Location:
- `www/ghost.js:48`

Impact:
- Avoidable overhead and debugging complexity.

Recommendation:
- Use bounded retry logic.

### 5. Fruit render runs N times per ghost per frame

Location:
- `www/sketch.js:411–422`

Impact:
- Fruit is shown and collision-checked once per ghost, not once per fruit.

Recommendation:
- Move fruit iteration to a dedicated loop.

---

## Scalability Issues

The current structure will struggle as soon as the project adds:
- multiple levels
- more ghosts or enemy variants
- animations beyond simple sprite swaps
- save/load or online leaderboard features
- mobile input
- more menus and overlays

### Why it does not scale well

- Global mutable state grows non-linearly with features.
- Script tag load order becomes a hidden dependency.
- There is no module boundary enforcement.
- The map format is not validated.
- Game state transitions are implicit rather than modeled.
- Nested helper functions tied to render-scope create inaccessible APIs.

### Recommended scalable target structure

```text
src/
├── core/
│   ├── game.js
│   ├── gameLoop.js
│   ├── stateMachine.js
│   └── config.js
├── scenes/
│   ├── mainMenuScene.js
│   ├── playScene.js
│   ├── winScene.js
│   ├── highScoreScene.js
│   └── gameOverScene.js
├── entities/
│   ├── pacman.js
│   ├── ghost.js
│   ├── pellet.js
│   └── fruit.js
├── systems/
│   ├── movementSystem.js
│   ├── collisionSystem.js
│   ├── scoreSystem.js
│   ├── audioSystem.js
│   └── spawnSystem.js
├── render/
│   ├── boardRenderer.js
│   ├── entityRenderer.js
│   └── hudRenderer.js
├── data/
│   ├── maps.js
│   └── assets.js
└── input/
    └── keyboardController.js
```

---

## Code Organization Best Practices

### Module boundaries

- Keep one primary responsibility per file.
- Avoid sharing mutable globals across files.
- Export/import explicit interfaces if moving to ES modules.
- Do not define functions inside render functions if they need to be called from outside.

### Naming

- Use consistent domain names: `Pellet`, `collision`, `Field`, `HUD`.
- Keep file names aligned with class names.

### Constants

- Centralize dimensions, tile symbols, and score values.

### Rendering

- Keep render code separate from rules and state mutation.

### State transitions

- Use explicit enums or a state machine for menu, play, pause, win, and game over.

### Testing

- Unit test movement rules, collision logic, score updates, and map parsing.
- Add at least smoke tests for scene transitions.

---

## Game Loop Assessment

### Current behavior

- The project uses p5.js `draw()`.
- p5 internally schedules `draw()` using `requestAnimationFrame`, so the game already uses that model indirectly.

### What is good

- Centralized update/render loop
- Simple mental model for a small game

### What should improve

- Avoid mutating frame-rate behavior inside game logic.
- Split `update()` and `render()` responsibilities conceptually even if p5 drives both.
- Use explicit delta time if movement speed should become frame-independent.
- Do not define side-effect helpers inside the render function.

### Better loop model

```javascript
function draw() {
  const dt = deltaTime / 1000;
  currentScene.update(dt);
  currentScene.render();
}
```

This keeps timing concerns cleaner and makes later complexity easier to manage.

---

## Suggested Refactor Roadmap

### Phase 1: Stabilize (immediate fixes)

- ~~Move `reset()` to module scope so it is callable from `playButtonGame` and `saveScore`~~ `Done`
- ~~Fix ghost collision inner loop: add `else` or `continue` after eating a scared ghost~~ `Done`
- ~~Replace win-condition `alert()` with a proper `WIN` screen state~~ `Done`
- Remove `console.log()` from ghost constructor
- Fix `clydeImg` duplicate declaration
- Declare `pachead` at the top of the file
- Remove dead `activeGhosts` variable
- Fix `soundFormats` to match actual assets
- Rename `effects.js` functions or delete if not used
- Fix `drawHighScore()` duplicate in `field.js`
- Fix `index.html` title
- Update `package.json` placeholders

### Phase 2: Restructure

- Introduce a single `gameState` object
- Move scene logic out of `sketch.js`
- Extract constants and map metadata
- Separate update logic from rendering
- Move all ghost helpers to module scope

### Phase 3: Scale

- Add level loader and level progression
- Add proper ghost AI per-ghost (scatter, chase, frightened, respawn)
- Add pause/resume system
- Add tests and linting
- Consider ES modules or a small bundler workflow

---

## Final Assessment

This is a good prototype and a credible student game project, but it is not yet a strong MVC implementation. The biggest architectural issue is not lack of functionality, but lack of boundaries: game state, UI, rendering, input, audio, and progression are all intertwined. That makes the project fragile under change.

The cross-check review (2026-03-19) found additional runtime bugs that were not caught in the original pass, most critically that `reset()` is defined in the wrong scope and will throw a silent error on every PLAY button click, and that the ghost collision loop has a structural logic error after eating a scared ghost.

If the goal is learning and demonstrating software engineering principles, the next most valuable step is not adding more gameplay features first. It is fixing the scope bugs, extracting a clean state model, adding a win screen, and establishing a rendering boundary so the code can support those features safely.

---

## Notes About Existing Documentation

- The repository includes an original project PDF at `www/documentation/Milestone2_Ebeckett_s5125717.pdf`.
- This review uses the repository code, README, and observed runtime structure as the primary source of truth.
- A second cross-check review was performed on 2026-03-19 against all source files to verify claims made in the original review and add newly identified issues.
