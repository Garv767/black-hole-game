# Garv's Tasks (Phase 2): Logic & Algorithms

**Your files:** `src/utils.js`, `src/Game.jsx`
**Your branch:** `feature-algorithms`

---

### Task 1: `utils.js` — Minimax *(Week 1)*

Implement a depth-limited Minimax to choose the AI's move.

```js
export function getMinimaxMove(board, totalCircles, valueToPlace, depth = 3) { ... }
// returns: { index, stats: { nodesEvaluated, timeTakenMs } }
```

**How it works:**
- The AI (Player 2) tries to **minimise its own score** (lowest score wins).
- The human (Player 1) is modelled as trying to **minimise their score** too.
- Terminal condition: board has 1 null left → call `calculateScores()` → return the AI's score as the evaluation.
- At each depth level, simulate placing the current player's next chip on each empty cell.
- Return the move with the best (lowest) score for the AI.

Because values are strictly sequential (you always place `nextValues[player]`), you don't need to decide *what* to place — only *where*. This dramatically prunes the tree.

**Depth guidance:** `depth = 3` means 3 plies (AI move → Human move → AI move). This is safe in-browser early in the game. Consider reducing to `depth = 2` when >10 empty cells remain to stay under 200ms.

---

### Task 2: `utils.js` — Alpha-Beta Pruning *(Week 1)*

Same as Minimax but skip branches that cannot improve on the best already found.

```js
export function getAlphaBetaMove(board, totalCircles, valueToPlace, depth = 3) { ... }
// returns: { index, stats: { nodesEvaluated, timeTakenMs } }
```

Add `alpha` (best score maximiser has found) and `beta` (best score minimiser has found). Prune when `beta <= alpha`. Expect **60–80% fewer nodes evaluated** vs plain Minimax.

---

### Task 3: `utils.js` — State Tree Builder *(Week 1–2)*

This generates the JSON data that Suvarna's `StateTree.jsx` will render.

```js
export function buildStateTree(board, totalCircles, nextValues, currentPlayer, depth = 2) { ... }
// returns: TreeNode
//
// TreeNode = {
//   boardSnapshot: Array,   // copy of board at this state
//   move: number | null,    // which index was placed (null = root)
//   value: number,          // chip that was placed
//   player: number,
//   estimatedScore: number, // greedy heuristic score estimate for the AI
//   children: TreeNode[]
// }
```

- Cap at `depth = 2` by default (2 levels of children).
- Only expand the **current player's** possible placements at each level.
- Prune immediately if `estimatedScore` is obviously worse than siblings (keeps tree readable).

---

### Task 4: Wire into `Game.jsx` *(Week 2)*

Add `selectedAlgo` state and pass it down. The AI move call in `triggerAIMove()` should switch on it:

```js
const [selectedAlgo, setSelectedAlgo] = useState('greedy'); // 'greedy' | 'minimax' | 'alphabeta'

// In triggerAIMove():
const { index } = selectedAlgo === 'minimax'
  ? getMinimaxMove(board, totalCircles, aiValue)
  : selectedAlgo === 'alphabeta'
    ? getAlphaBetaMove(board, totalCircles, aiValue)
    : { index: getAIMove(board, totalCircles, aiValue) };
```

Also export `selectedAlgo` as a prop or context so Ketki's UI can display it and Suvarna's stats panel can read the returned `stats` object.
