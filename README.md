# Project_GameDev_Pacman

University project — Software Engineering game development
Author: Ethel Beckett (s5125717)

## About

A browser-based Pac-Man game built with vanilla JavaScript and [p5.js](https://p5js.org/). The project recreates the core Pac-Man gameplay loop: navigate a maze, collect pellets, use energizers to frighten ghosts, and survive as long as possible.

Built as a practical application of object-oriented design and game development principles using a canvas-based rendering model.

## Play Online

[Play in the p5.js editor](https://editor.p5js.org/ethelbeckett/full/p4yGE2uS2)

## Tech Stack

- **Language:** JavaScript (ES5/ES6, no bundler)
- **Rendering:** [p5.js](https://p5js.org/) — canvas rendering, animation, input
- **Audio:** p5.sound
- **Server:** Express.js (optional local dev server)

## How to Run Locally

### Option 1 — VS Code Live Server (fastest)

1. Clone the repository
2. Open the project in VS Code
3. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension if needed
4. Right-click `www/index.html` and select **Open with Live Server**

### Option 2 — Express server (if you hit CORS issues)

```bash
npm install
node server.js
```

Then open [http://localhost:3000/](http://localhost:3000/) in your browser.

## How to Play

- **Arrow keys** — move Pac-Man
- Collect all pellets to win
- Eat an energizer to frighten ghosts — then eat them for bonus points
- Avoid non-frightened ghosts or lose a life
- Collect the fruit bonus item during frightened mode

## Scoring

| Action | Points |
|--------|--------|
| Pellet | 10 |
| Energizer | 50 |
| Eat a ghost | 200 |
| Fruit | 700 |

Top 4 scores are saved in your browser's local storage.

## Project Structure

```text
Project_GameDev_Pacman/
├── server.js           — Express static server
├── package.json
└── www/
    ├── index.html      — Browser entry point
    ├── sketch.js       — Main game loop, screen flow, collision, scoring
    ├── field.js        — Map layout and entity classes
    ├── pacman.js       — Pac-Man entity
    ├── ghost.js        — Ghost entity and AI
    ├── control.js      — Keyboard input
    ├── level.js        — Fruit and level display objects
    ├── effects.js      — Audio helper stubs
    ├── images/         — Sprites and icons
    ├── sounds/         — Sound effects and music
    ├── lib/            — Vendored p5.js libraries
    └── documentation/  — Project overview and technical review
```

## Documentation

- [Project overview](www/documentation/project-overview.md) — architecture, file guide, map legend, screen flow
- [Technical review](www/documentation/technical-review-2026-03-18.md) — detailed code review with findings, bugs, and refactor roadmap
- [Original project documentation](www/documentation/Milestone2_Ebeckett_s5125717.pdf) — milestone submission

## License

[MIT](https://opensource.org/licenses/MIT)
