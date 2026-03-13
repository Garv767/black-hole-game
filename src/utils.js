// ─────────────────────────────────────────────
//  BLACK HOLE — utils.js
// ─────────────────────────────────────────────

// Triangle layout (2-player = 6 rows = 21 circles):
//
//   Row 0:  0
//   Row 1:  1  2
//   Row 2:  3  4  5
//   Row 3:  6  7  8  9
//   Row 4: 10 11 12 13 14
//   Row 5: 15 16 17 18 19 20
//
// 3-player adds Row 6: 21 22 23 24 25 26 27  (28 circles total)
//
// Each row r starts at index r*(r+1)/2
// Each circle touches up to 6 neighbors:
//   same row (left, right)
//   row above (up-left, up-right)
//   row below (down-left, down-right)

// ─── Internal helpers ────────────────────────

function getRow(index) {
  let r = 0;
  while ((r + 1) * (r + 2) / 2 <= index) r++;
  return r;
}

function getCol(index, row) {
  return index - (row * (row + 1)) / 2;
}

function toIndex(r, c) {
  return (r * (r + 1)) / 2 + c;
}

// ─── Task 2: Adjacency Map ───────────────────

/**
 * Returns the indices of all neighbors of a given circle.
 * @param {number} index - Circle index (0-based)
 * @param {number} totalCircles - 21 (2-player) or 28 (3-player)
 * @returns {number[]}
 */
export function getNeighbors(index, totalCircles) {
  const totalRows = totalCircles === 21 ? 6 : 7;
  const r = getRow(index);
  const c = getCol(index, r);
  const neighbors = [];

  // Same row
  if (c > 0) neighbors.push(toIndex(r, c - 1));       // left
  if (c < r) neighbors.push(toIndex(r, c + 1));       // right

  // Row above
  if (r > 0) {
    if (c > 0) neighbors.push(toIndex(r - 1, c - 1)); // up-left
    if (c < r) neighbors.push(toIndex(r - 1, c));     // up-right
  }

  // Row below
  if (r < totalRows - 1) {
    neighbors.push(toIndex(r + 1, c));                 // down-left
    neighbors.push(toIndex(r + 1, c + 1));             // down-right
  }

  return neighbors;
}

// ─── Task 3: Scoring ─────────────────────────

/**
 * Calculates final scores once the board is full (one null remains = black hole).
 * Each player's score = sum of their circle values adjacent to the black hole.
 * Lowest score wins.
 *
 * @param {Array} board - Array of null | { player: 1|2|3, value: number }
 * @param {number} totalCircles - 21 or 28
 * @returns {{
 *   blackHoleIndex: number,
 *   scoringIndices: number[],
 *   scores: { [player: number]: number },
 *   winner: number
 * }}
 */
export function calculateScores(board, totalCircles) {
  // 1. Find the black hole — the one remaining null
  const blackHoleIndex = board.findIndex((cell) => cell === null);

  // 2. Get its neighbors
  const scoringIndices = getNeighbors(blackHoleIndex, totalCircles);

  // 3. Sum values per player across those neighbors
  const scores = {};
  for (const idx of scoringIndices) {
    const cell = board[idx];
    if (!cell) continue;
    scores[cell.player] = (scores[cell.player] || 0) + cell.value;
  }

  // 4. Player with the lowest score wins
  const winner = Object.entries(scores).reduce(
    (best, [player, score]) =>
      score < best.score ? { player: Number(player), score } : best,
    { player: -1, score: Infinity }
  ).player;

  // scoringIndices returned so Suvarna can animate the black hole reveal
  return { blackHoleIndex, scoringIndices, scores, winner };
}

// ─── Task 4: AI Opponent ─────────────────────

/**
 * Returns the board index the AI will place its number on.
 *
 * Heuristic: circles with fewer neighbors are "riskier" — they are more
 * likely to border the black hole at the end. So:
 *   High value → place on a high-neighbor (safe) circle
 *   Low value  → place on a low-neighbor (risky) circle, to minimise
 *                the damage if that circle ends up adjacent to the black hole
 *
 * To use Phase 1 (random) instead during early testing,
 * comment out the heuristic block and uncomment the random line.
 *
 * @param {Array}  board         - Current board state
 * @param {number} totalCircles  - 21 or 28
 * @param {number} valueToPlace  - The number the AI is placing this turn
 * @returns {number} index
 */
export function getAIMove(board, totalCircles, valueToPlace) {
  const emptyIndices = board
    .map((cell, i) => (cell === null ? i : -1))
    .filter((i) => i !== -1);

  // ── Phase 1: random — uncomment to test game flow quickly ──
  // return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

  // ── Phase 2: heuristic ──────────────────────────────────────
  const maxValue = totalCircles === 21 ? 10 : 9;
  const midpoint = Math.ceil(maxValue / 2); // 5 for both modes

  // Score each empty circle by its neighbor count
  const ranked = emptyIndices
    .map((idx) => ({
      idx,
      neighborCount: getNeighbors(idx, totalCircles).length,
    }))
    .sort((a, b) => b.neighborCount - a.neighborCount); // most connected first

  const poolSize = Math.max(1, Math.floor(ranked.length / 3));

  if (valueToPlace >= midpoint) {
    // High value: pick from the top third (most connected = safest spots)
    const safePool = ranked.slice(0, poolSize);
    return safePool[Math.floor(Math.random() * safePool.length)].idx;
  } else {
    // Low value: pick from the bottom third (least connected = riskiest spots)
    const riskyPool = ranked.slice(ranked.length - poolSize);
    return riskyPool[Math.floor(Math.random() * riskyPool.length)].idx;
  }
}