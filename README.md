# ⚫ Black Hole

A strategic number-placement game for 1–3 players, built with React + Vite. The twist? **Lowest score wins.**

---

## How to Play

Players take turns placing numbers onto a triangular board. When all but one circle has been filled, the empty circle becomes the **Black Hole**. Every number touching the Black Hole scores points for that player. The player with the **lowest total score** adjacent to the Black Hole wins.

### Placement Rules
- Each player places numbers **in strict ascending order** (1, 2, 3… up to 9 or 10).
- You cannot skip or reorder your numbers.
- In **1 vs AI** mode, the AI uses a heuristic: high numbers go to safe spots (many neighbors), low numbers go to risky spots near likely Black Hole positions.

### Game Modes
| Mode | Players | Board Size | Max Number |
|------|---------|------------|------------|
| 1 vs 1 | 2 humans | 21 circles (6 rows) | 10 |
| 1 vs AI | Human vs computer | 21 circles (6 rows) | 10 |
| 3 Players | 3 humans | 28 circles (7 rows) | 9 |

### Board Layout (2-player)
```
        ○           ← index 0
       ○ ○          ← index 1–2
      ○ ○ ○         ← index 3–5
     ○ ○ ○ ○        ← index 6–9
    ○ ○ ○ ○ ○       ← index 10–14
   ○ ○ ○ ○ ○ ○      ← index 15–20
```

---

## Player Colors
- **Player 1** — 🔴 Red
- **Player 2** — 🟢 Green
- **Player 3** — 🟡 Amber

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech Stack
- **React 19** + **Vite 7**
- **React Router** for game mode routing (`/play/pvp`, `/play/pve`, `/play/3p`)
- **Web Audio API** for procedural chip placement sounds
- **Pure CSS** — no UI frameworks, no Tailwind

---

## Project Structure

```
src/
├── main.jsx        # App entrypoint with BrowserRouter
├── App.jsx         # Top-level routes
├── Game.jsx        # Core game state and logic
├── Board.jsx       # Triangle board + chip tray
├── Menu.jsx        # Start screen
├── GameOver.jsx    # Result screen with Black Hole reveal
├── utils.js        # getNeighbors, calculateScores, getAIMove
├── Board.css       # Board-specific styles and animations
└── index.css       # Global design system (fonts, colors, layout)
```

---

## Team

| Member | Responsibility |
|--------|---------------|
| **Garv** | State, game logic (`utils.js`), AI opponent, `App.jsx` wiring |
| **Ketki** | Menu, turn logic, Game Over screen |
| **Suvarna** | Board layout, chip tray, mobile UI, Black Hole reveal |
