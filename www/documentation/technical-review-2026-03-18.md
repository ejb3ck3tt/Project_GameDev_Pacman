# Pac-Man Technical Code Review

Date: 2026-03-18
Project: `Project_GameDev_Pacman`
Tech stack observed in repository: JavaScript, p5.js, p5.sound, Express static server

## Executive Summary

This project is a functional browser game prototype with a clear gameplay goal and a reasonable separation of concerns at the file level for a student project. The code shows an attempt at object-oriented design through entity classes such as `Pacman`, `Ghost`, `Tile`, `Fruit`, and `Level`.

However, the current implementation is not actually MVC in a strong architectural sense. Most game state is stored in globals, rendering and gameplay rules are tightly coupled, and several behaviors depend on side effects inside the main draw cycle. The game works best as a small single-level prototype; it would become difficult to maintain, test, or extend into a larger game without restructuring.

## Implementation Status Update

The findings below were written as an initial review snapshot. Since then, several runtime issues have been fixed in the codebase.

### Fixed Since Review

- Ghost respawn now preserves the eaten ghost reference before removal, avoiding invalid array access.
- Game-over flow now uses an explicit end-game screen instead of continuing to mutate state in normal gameplay.
- High scores now save once per game-over flow and are persisted locally with browser storage.
- The end-game button flow has been corrected and the game-over screen now includes a route back to the main menu.
- High-score and game-over screen UI have been improved for readability.
- Audio handling has been partially improved so the Pac-Man intro theme plays on entering the play state instead of behaving like generic looping menu audio.

### Still Open

- Map/grid structure inconsistency
- Heavy global state coupling
- MVC boundary mixing
- Recursive ghost movement
- Duplicate score-rendering ownership
- Naming consistency issues
- Performance concerns around repeated per-frame scans and frame-rate control inside entity loops

## Review Findings

### High Severity

1. Ghost respawn logic can use an invalid or wrong ghost reference after removal. `Status: Fixed`

Location:
- `www/sketch.js:435`
- `www/sketch.js:443`

Issue:
- The code removes `ghosts[i]` with `ghosts.splice(i,1)` and then immediately reads `ghosts[i].img` to recreate the ghost.
- After the splice, `ghosts[i]` no longer refers to the removed ghost. If the removed ghost was the last element, `ghosts[i]` becomes `undefined`, which can break respawn logic.

Impact:
- Wrong ghost sprite may respawn.
- Runtime errors are possible when the last ghost is eaten.

Recommendation:
- Store the ghost instance or its image before `splice`.
- Prefer `const eatenGhost = ghosts[i];` before removal, then respawn using `eatenGhost.img`.

2. Game-over handling continues mutating state inside the render loop. `Status: Fixed`

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

3. Background music is started and paused every frame. `Status: Partially Fixed`

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
- The implementation now restores the Pac-Man intro theme on entering `PLAY` and pauses gameplay until the theme finishes, but the broader audio model is still centralized in `sketch.js` rather than a dedicated audio/state system.

### Medium Severity

4. The map definition is structurally inconsistent with the declared grid dimensions.

Location:
- `www/field.js:4`
- `www/field.js:5`
- `www/field.js:31`
- `www/sketch.js:152`

Issue:
- `rows` is declared as `25` and `column` as `30`, but the last row only contains 8 cells.
- The setup loop assumes a rectangular matrix and iterates `j < field.column` for every row.

Impact:
- This works only because most comparisons against `undefined` silently fail.
- It makes the map format fragile and harder to validate or scale.

Recommendation:
- Use a rectangular map for all rows, or split HUD data from the gameplay grid.
- Add a map validator to assert row widths and allowed tile symbols.

5. Architecture is heavily global and tightly coupled.

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

6. The project claims MVC style, but rendering and model logic are mixed together.

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

7. The end-game button handler is misused. `Status: Fixed`

Location:
- `www/sketch.js:145`
- `www/sketch.js:146`

Issue:
- `playButton4.mouseClicked(window.location.reload());` calls `reload()` immediately and passes its return value instead of a callback.

Impact:
- The button behavior is fragile and hard to read.

Recommendation:
- Use `playButton4.mouseClicked(() => window.location.reload());`

8. Ghost movement can recurse unpredictably.

Location:
- `www/ghost.js:24`
- `www/ghost.js:48`

Issue:
- `ghostMove()` recursively calls itself when colliding with a wall.

Impact:
- Small maps may tolerate this, but the behavior is difficult to debug and can spiral if the movement rules become more complex.

Recommendation:
- Replace recursion with bounded iterative retry logic or a path-selection strategy.

### Low Severity

9. Duplicate or conflicting definitions reduce clarity.

Location:
- `www/sketch.js:325`
- `www/field.js:88`

Issue:
- `drawHighScore()` is defined in both `sketch.js` and `field.js`.

Impact:
- This makes ownership unclear and increases the chance of accidental overrides.

Recommendation:
- Keep one score-rendering module and one source of truth for score UI functions.

10. Naming consistency and typo issues make the codebase harder to maintain.

Examples:
- `Pelette` should likely be `Pellet`
- `colission` should be `collision`
- `Fields` vs `Field`

Impact:
- These issues do not break functionality, but they increase friction for future contributors.

Recommendation:
- Standardize names and keep class/function naming aligned with domain concepts.

## Architecture Quality

### What is good

- The codebase is small and understandable.
- Core entities are separated into files by domain role.
- The game loop is centralized through p5.js `draw()`, which internally uses `requestAnimationFrame`.
- The level grid gives the project a deterministic map-driven structure.
- Asset handling is centralized in `preload()`, which is the correct p5 pattern.

### What is weak

- The project is file-separated, but not architecturally isolated.
- `sketch.js` acts as bootstrapper, screen manager, world builder, renderer, audio manager, collision system, score manager, and game-over flow controller.
- There is no explicit domain model for game state transitions.
- There is no persistence layer, service layer, or reusable scene abstraction.

### Overall assessment

- Prototype quality: solid
- Architecture quality for maintainability: moderate to weak
- Architecture quality for extension into a multi-level polished game: weak without refactor

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

- `package.json`: Node package metadata and dependencies.
- `package-lock.json`: locked dependency tree.
- `server.js`: Express server that serves the static `www/` directory.
- `README.md`: project overview and run instructions.

### Web app level

- `www/index.html`: browser entry point; loads p5.js and all game scripts.
- `www/sketch.js`: main application entry, asset loading, scene switching, world setup, draw loop, collision handling, score flow.
- `www/field.js`: map data and tile-like classes.
- `www/pacman.js`: Pac-Man entity behavior.
- `www/ghost.js`: ghost entity behavior.
- `www/control.js`: keyboard input.
- `www/level.js`: fruit and level icon classes.
- `www/effects.js`: sound helper functions.

### Assets

- `www/images/`: sprites and icons.
- `www/sounds/`: audio assets.
- `www/lib/`: third-party p5 libraries vendored into the project.
- `www/documentation/`: original project documentation PDF and this review.

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

## Missing Components

The current project is missing several components that would be expected in a production-quality or scalable game project.

### Gameplay and domain

- Persistent high score storage `Status: Fixed via local browser storage`
- Level progression system
- Pause/resume system
- Restart without full page reload
- Proper ghost frightened timer and recovery logic
- Victory screen state
- Deterministic respawn and spawn management

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
- Scores live entirely in browser memory and are trivially editable.

Risk:
- Any future leaderboard would be easy to tamper with unless validated server-side.

Recommendation:
- Treat all browser score data as untrusted if persistence is added later.

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

## Code Organization Best Practices

### Module boundaries

- Keep one primary responsibility per file.
- Avoid sharing mutable globals across files.
- Export/import explicit interfaces if moving to ES modules.

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

## Game Loop Assessment

The user request referenced `requestAnimationFram`, which appears to mean `requestAnimationFrame`.

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

### Better loop model

```javascript
function draw() {
  const dt = deltaTime / 1000;
  currentScene.update(dt);
  currentScene.render();
}
```

This keeps timing concerns cleaner and makes later complexity easier to manage.

## Suggested Refactor Roadmap

### Phase 1: Stabilize

- Fix ghost respawn bug
- Introduce `GAME_OVER` and `WIN` states
- Stop repeated score mutation after death
- Move audio control out of `draw()`
- Fix callback misuse for the end-game button

### Phase 2: Restructure

- Introduce a single `gameState` object
- Move scene logic out of `sketch.js`
- Extract constants and map metadata
- Separate update logic from rendering

### Phase 3: Scale

- Add level loader and level progression
- Add persistent local high scores
- Add tests and linting
- Consider ES modules or a small bundler workflow

## Final Assessment

This is a good prototype and a credible student game project, but it is not yet a strong MVC implementation. The biggest architectural issue is not lack of functionality, but lack of boundaries: game state, UI, rendering, input, audio, and progression are all intertwined. That makes the project fragile under change.

If the goal is learning and demonstrating software engineering principles, the next most valuable step is not adding more gameplay features first. It is extracting a clean state model, scene system, and rendering boundary so the code can support those features safely.

## Notes About Existing Documentation

- The repository includes an original project PDF at `www/documentation/Milestone2_Ebeckett_s5125717.pdf`.
- I was able to confirm the file exists, but I could not cleanly extract readable text from it with the tools available in this environment.
- This review therefore uses the repository code, README, and observed runtime structure as the primary source of truth.
