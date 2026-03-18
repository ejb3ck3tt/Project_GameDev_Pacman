# Pac-Man Project Overview

Date: 2026-03-18
Project: `Project_GameDev_Pacman`

## Table of Contents

- [Overview of the Project](#overview-of-the-project)
- [What Is It About](#what-is-it-about)
- [Features](#features)
- [How to Run the Project](#how-to-run-the-project)
- [Folder Structure](#folder-structure)
- [Architecture Overview](#architecture-overview)
- [Main Project Files](#main-project-files)
- [Related Documentation](#related-documentation)

## Overview of the Project

This project is a browser-based Pac-Man game created as a software engineering and game development project. It is built with JavaScript and runs in the browser using p5.js for rendering, animation, input handling, and audio playback.

The repository also includes a lightweight Express server so the game can be served locally when browser security rules make direct file opening less reliable.

## What Is It About

The project recreates the core Pac-Man gameplay loop:

- The player controls Pac-Man using the keyboard.
- Pac-Man moves through a maze collecting pellets and energizers.
- Ghosts move around the board as enemies.
- The player gains points by collecting items and avoiding or defeating ghosts in frightened mode.
- The game tracks score, lives, and a simple high-score list.

From a software engineering perspective, the project is also about applying object-oriented thinking and separating game concerns across files such as:

- map and field setup
- player behavior
- ghost behavior
- controls
- effects and assets

## Features

The current project includes the following gameplay and interface features:

- main menu screen
- playable Pac-Man character controlled with arrow keys
- maze-based board layout
- pellets and energizers
- ghosts that act as moving enemies
- score tracking
- life tracking
- simple high-score display
- fruit bonus item
- sound effects and background audio

The project also includes technical features that support local development:

- browser-based rendering with p5.js
- local audio handling with p5.sound
- static asset loading for images and sounds
- optional Express server for local hosting

## How to Run the Project

There are two practical ways to run the game.

### Option 1: Run with VS Code Live Server

1. Clone the repository.
2. Open the project in VS Code.
3. Install the `Live Server` extension if needed.
4. Open [index.html](/Users/joybeckett/Project_GameDev_Pacman/www/index.html).
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
    ├── images/
    ├── sounds/
    └── lib/
```

### Root Files

- [README.md](/Users/joybeckett/Project_GameDev_Pacman/README.md): main project readme and links to documentation
- [package.json](/Users/joybeckett/Project_GameDev_Pacman/package.json): dependency and package configuration
- [package-lock.json](/Users/joybeckett/Project_GameDev_Pacman/package-lock.json): locked dependency versions
- [server.js](/Users/joybeckett/Project_GameDev_Pacman/server.js): local Express server for serving the game

### `www/` Folder

- [index.html](/Users/joybeckett/Project_GameDev_Pacman/www/index.html): browser entry point that loads the game scripts
- [sketch.js](/Users/joybeckett/Project_GameDev_Pacman/www/sketch.js): main game setup, asset loading, screen flow, draw loop, and gameplay orchestration
- [field.js](/Users/joybeckett/Project_GameDev_Pacman/www/field.js): game board layout and field-related entities
- [pacman.js](/Users/joybeckett/Project_GameDev_Pacman/www/pacman.js): Pac-Man movement and interaction logic
- [ghost.js](/Users/joybeckett/Project_GameDev_Pacman/www/ghost.js): ghost behavior and movement logic
- [control.js](/Users/joybeckett/Project_GameDev_Pacman/www/control.js): keyboard input handling
- [level.js](/Users/joybeckett/Project_GameDev_Pacman/www/level.js): fruit and level-related display objects
- [effects.js](/Users/joybeckett/Project_GameDev_Pacman/www/effects.js): audio helper functions

### Asset Folders

- `www/images/`: sprite sheets, icons, and game images
- `www/sounds/`: music and sound effects
- `www/lib/`: third-party libraries used by the game
- `www/documentation/`: project documentation, original report, and technical review

## Architecture Overview

The project follows a simple browser-game architecture built around p5.js. It is organized into separate files by responsibility, but in its current form it behaves more like a lightweight object-oriented game script than a strict MVC implementation.

### Runtime Flow

The runtime flow is:

1. The browser opens [index.html](/Users/joybeckett/Project_GameDev_Pacman/www/index.html).
2. p5.js and p5.sound are loaded first.
3. The game scripts are loaded through script tags.
4. p5 calls `preload()`, `setup()`, and then continuously runs `draw()`.
5. The draw loop updates the game and renders the canvas each frame.

The project also includes [server.js](/Users/joybeckett/Project_GameDev_Pacman/server.js), which serves the `www/` folder as a static website for local development.

### Main Architectural Parts

- `index.html`: bootstraps the game in the browser
- `sketch.js`: acts as the main application coordinator
- `field.js`: defines the board layout and field-related classes
- `pacman.js`: contains player behavior and interactions
- `ghost.js`: contains enemy movement and state behavior
- `control.js`: handles keyboard input
- `level.js`: defines bonus and level display objects
- `effects.js`: contains sound helper logic

### Current MVC-Style Interpretation

The code shows an MVC-style intention, but the boundaries are not yet strict.

- Model-like parts:
  - entity state such as Pac-Man, ghosts, pellets, energizers, lives, and score
  - board data defined in the field array
- View-like parts:
  - canvas rendering through p5.js image and text drawing
  - menu buttons and score display
- Controller-like parts:
  - keyboard input in [control.js](/Users/joybeckett/Project_GameDev_Pacman/www/control.js)
  - button actions created in [sketch.js](/Users/joybeckett/Project_GameDev_Pacman/www/sketch.js)

In practice, these responsibilities are still mixed together. For example, `sketch.js` manages screen state, rendering, collision handling, audio behavior, and score updates in the same place.

### Game Loop

The project uses p5.js `draw()` as the game loop. Internally, p5 uses `requestAnimationFrame`, so the game is already running on the standard browser animation model.

At a high level, the game loop currently handles:

- drawing the board and entities
- detecting item collection
- moving ghosts
- checking collisions
- updating score and lives
- switching between menu, play, and high-score views

### Strengths of the Current Architecture

- easy to understand for a small project
- file-based separation of key gameplay concerns
- centralized game startup through p5 lifecycle functions
- asset loading handled in `preload()`
- game rendering and interaction remain entirely browser-based

### Current Limitations

- heavy reliance on global variables
- rendering and game rules are tightly coupled
- screen management is embedded inside the main game script
- limited scalability for adding more levels, states, or enemy behaviors
- difficult to test individual systems in isolation

### Suggested Direction

If the project continues to grow, the next architecture step should be to separate:

- game state
- rendering
- input
- audio
- collision and scoring systems
- screen or scene management

This would move the project closer to a cleaner MVC or scene-based game architecture while keeping the current gameplay structure intact.

## Main Project Files

- [server.js](/Users/joybeckett/Project_GameDev_Pacman/server.js): serves the game locally with Express
- [index.html](/Users/joybeckett/Project_GameDev_Pacman/www/index.html): browser entry point
- [sketch.js](/Users/joybeckett/Project_GameDev_Pacman/www/sketch.js): main game loop and screen flow
- [field.js](/Users/joybeckett/Project_GameDev_Pacman/www/field.js): map and board entities
- [pacman.js](/Users/joybeckett/Project_GameDev_Pacman/www/pacman.js): Pac-Man entity behavior
- [ghost.js](/Users/joybeckett/Project_GameDev_Pacman/www/ghost.js): ghost behavior
- [control.js](/Users/joybeckett/Project_GameDev_Pacman/www/control.js): keyboard controls
- [effects.js](/Users/joybeckett/Project_GameDev_Pacman/www/effects.js): sound helpers

## Related Documentation

- Original project document: [Milestone2_Ebeckett_s5125717.pdf](/Users/joybeckett/Project_GameDev_Pacman/www/documentation/Milestone2_Ebeckett_s5125717.pdf)
- Technical review: [technical-review-2026-03-18.md](/Users/joybeckett/Project_GameDev_Pacman/www/documentation/technical-review-2026-03-18.md)
