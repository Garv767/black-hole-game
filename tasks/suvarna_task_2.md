# Suvarna's Tasks (Phase 2): Visualisation

**Your files:** `src/StatsPanel.jsx` (new), `src/StateTree.jsx` (new), `src/Board.jsx`, `src/AIvsAI.jsx`
**Your branch:** `feature-visualisation-v2`

> 📱 **Keep mobile in mind.** The state tree sidebar should collapse on small screens. The AI vs AI 3-column layout should switch to landscape-scroll on phones.

---

### Task 1: `StatsPanel.jsx` — Algorithm Stats Card *(Week 1)*

A single card component that displays live stats for one AI algorithm.

**Props:**
```jsx
<StatsPanel
  algo="minimax"          // 'greedy' | 'minimax' | 'alphabeta'
  nodesEvaluated={1024}   // from Garv's stats object
  timeTakenMs={47}
  currentScore={3}        // AI's current estimated score
  movesPlayed={5}
/>
```

**Design:**
- Small, tight card — no rounded corners, monospace font, player accent colour
- Show a small bar or progress pip for `nodesEvaluated` relative to some max
- Should be glanceable in 1 second at presentation speed

One `StatsPanel` per column in AI vs AI mode. Also show a **single** stats panel in 1vAI mode beneath the chip tray.

---

### Task 2: `StateTree.jsx` — SVG Decision Tree *(Week 1–2)*

Renders the JSON tree from Garv's `buildStateTree()` as an SVG.

**Props:**
```jsx
<StateTree
  tree={treeJson}           // from buildStateTree()
  chosenIndex={7}           // highlight this node's path
  playerColors={{ 1: 'var(--color-p1)', 2: 'var(--color-p2)', 3: 'var(--color-p3)' }}
/>
```

**Rendering rules:**
- Root node = current board state (draw as a small triangle icon or just a circle)
- Each child node = one possible move (show the circle index and chip value placed)
- Highlight the **chosen path** (the move the current player / AI actually took) in white/bright colour
- All other branches dimmed
- Score estimates shown as small text beneath each leaf node
- Auto-fit to container width; min height 200px

**SVG layout:**
```
         [root]
        /   |   \
     [3]   [7]  [12]   ← possible placements of chip value
    score  score score
```

Depth 2 means the root has children (depth 1) and those have children (depth 2). Cap visible nodes at ~20 total to keep it readable.

**Update:** Re-render every time `tree` prop changes (after each move). Animate node appearance with a quick fade-in.

---

### Task 3: Integrate `StateTree` into Board Sidebar *(Week 2)*

Add `StateTree` as a **collapsible right-side panel** inside `Board.jsx`.

```jsx
// Board.jsx receives 2 new optional props:
// treeData — the JSON from buildStateTree (null = don't show tree)
// chosenIndex — the move that was made
```

When `treeData` is present:
- Show a small **[🌳 TREE]** toggle button in the top-right of the board area
- Clicking it slides out a sidebar showing `<StateTree>`
- Default: **closed** on mobile, **open** on desktop (≥768px)

This works for ALL modes (PvP, PvE, 3p, AIvsAI) since Garv's `buildStateTree()` takes any board state.

---

### Task 4: AI vs AI 3-Column Layout *(Week 2)*

Work with Ketki's `AIvsAI.jsx` to implement the layout.

**Expected structure:**
```jsx
// AIvsAI.jsx renders:
<div className="aivai-grid">
  {['greedy', 'minimax', 'alphabeta'].map(algo => (
    <div className="aivai-col" key={algo}>
      <div className="aivai-col-header">{algo.toUpperCase()}</div>
      <Board board={boards[algo]} ... phase={colPhase[algo]} ... />
      <StatsPanel algo={algo} {...stats[algo]} />
    </div>
  ))}
</div>
```

**CSS for the grid:**
```css
.aivai-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px; /* hairline dividers */
  flex: 1;
  overflow: hidden;
}

/* On phones in portrait — horizontal scroll */
@media (max-width: 600px) {
  .aivai-grid {
    grid-template-columns: repeat(3, 85vw);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .aivai-col {
    scroll-snap-align: start;
  }
}
```

The board cells inside each column should scale down — use `7vmin` instead of `12vmin` for circle sizes in this mode. Add a CSS class `.board-cell--compact` that Ketki can pass as a prop to `Board`.

---

### Task 5: Integration & Polish *(Week 2–3)*

- Tree sidebar opens/closes smoothly with CSS transition
- Stats panel updates live every round in AIvsAI (not just at end)
- On game over per column, highlight that column's result
- Final visual pass: does the game still look premium at presentation size (1080p landscape)?
