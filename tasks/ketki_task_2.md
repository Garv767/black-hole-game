# Ketki's Tasks (Phase 2): Game Flow & New Mode

**Your files:** `src/Game.jsx`, `src/Menu.jsx`, `src/AIvsAI.jsx` (new), `src/App.jsx`
**Your branch:** `feature-game-flow-v2`

---

### Task 1: Reset Button — all 3 existing modes *(Day 1)*

Add a **RESET** button to the top action bar in `Game.jsx`, next to the EXIT button.

```jsx
// In Game.jsx top bar:
<button onClick={handlePlayAgain} style={{ /* same style as EXIT */ }}>
  RESET
</button>
```

`handlePlayAgain()` already exists and resets all state correctly. This task is literally wiring it to a button. Confirm it works in pvp, pve, and 3p before moving on.

---

### Task 2: Algorithm Selector in 1vAI mode *(Week 1)*

Garv will export `selectedAlgo` state from `Game.jsx`. Your job is to add a small UI control that lets the player pick the algorithm **before the game starts** (on the menu, not mid-game).

Add a secondary screen after clicking **1 VS AI** in the menu:

```
┌─────────────────────────────┐
│  CHOOSE AI DIFFICULTY       │
│                             │
│  [GREEDY]  [MINIMAX]  [α-β] │
│                             │
│  → Greedy:   Fast, no       │
│              lookahead      │
│  → Minimax:  Looks 3 moves  │
│              ahead          │
│  → Alpha-β:  Same as        │
│              Minimax,       │
│              smarter        │
└─────────────────────────────┘
```

Pass the selected algo name to the `/play/pve` route via state or a query param: `navigate('/play/pve', { state: { algo: 'minimax' } })`.

In `Game.jsx`, read it: `const { algo } = location.state ?? { algo: 'greedy' }`.

---

### Task 3: `Menu.jsx` — Add AI vs AI Mode *(Week 1)*

Add a fourth button to the menu:

```jsx
<button className="menu-btn" onClick={() => onStart("aivai")}>
  AI VS AI
</button>
```

In `App.jsx` add the new route:
```jsx
<Route path="/play/aivai" element={<AIvsAI />} />
```

---

### Task 4: `AIvsAI.jsx` — New Game Mode *(Week 1–2)*

This is the main task. Three AI agents play the **same starting board** simultaneously, each using a different algorithm. All three advance one move per "round".

**State shape:**
```js
const [boards, setBoards] = useState({
  greedy:    Array(21).fill(null),
  minimax:   Array(21).fill(null),
  alphabeta: Array(21).fill(null),
});
const [nextValues, setNextValues] = useState({ 1: 1, 2: 1 }); // shared — both players same sequence
const [currentPlayer, setCurrentPlayer] = useState(1);
const [paused, setPaused] = useState(false);
const [results, setResults] = useState({ greedy: null, minimax: null, alphabeta: null });
const [running, setRunning] = useState(false);
```

**Turn loop:**
- Each round: call Garv's three move functions on each board simultaneously.
- Each returns `{ index, stats }` — pass `stats` to Suvarna's `StatsPanel`.
- After placing, check if each board has 1 null → trigger game over for that board independently.
- Continue until all 3 boards are done.

**Pause/Resume:**
- `paused` state blocks the `setTimeout` chain from firing next round.
- A single **PAUSE / RESUME** button in the top bar.

**Layout:**
```
┌──────────┬──────────┬──────────┐
│ GREEDY   │ MINIMAX  │ ALPHA-β  │
│          │          │          │
│ [board]  │ [board]  │ [board]  │
│          │          │          │
│ [stats]  │ [stats]  │ [stats]  │
└──────────┴──────────┴──────────┘
         [PAUSE]  [EXIT]
```

Reuse `<Board>` component for each column. Pass `phase` and `gameResult` when that column's board finishes.

---

### Task 5: Integration *(Week 2)*

- Confirm RESET works in all 3 original modes
- Confirm algo selector passes correctly from Menu → Game
- Confirm AIvsAI runs all 3 to completion without UI freeze
- Confirm Pause stops the loop and Resume restarts it cleanly
