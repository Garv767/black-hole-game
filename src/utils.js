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
export function calculateScores(board, totalCircles, gameMode) {
  // 1. Find the black hole — the one remaining null
  const blackHoleIndex = board.findIndex((cell) => cell === null);

  // 2. Get its neighbors
  const scoringIndices = getNeighbors(blackHoleIndex, totalCircles);

  // 3. Sum values per player across those neighbors
  const scores = { 1: 0, 2: 0 };
  if (gameMode === "3p") scores[3] = 0;

  for (const idx of scoringIndices) {
    const cell = board[idx];
    if (!cell) continue;
    scores[cell.player] += cell.value;
  }

  // 4. Player with the lowest score wins
  let winner = -1;
  let minScore = Infinity;
  let isTie = false;
  
  Object.entries(scores).forEach(([player, score]) => {
    if (score < minScore) {
      minScore = score;
      winner = Number(player);
      isTie = false;
    } else if (score === minScore) {
      isTie = true;
    }
  });

  // Handle tie breaker if necessary, currently we can just return a tie state or the tied players
  if (isTie) {
    winner = null; // Indicates a tie
  }

  // scoringIndices returned so Suvarna can animate the black hole reveal
  return { blackHoleIndex, scoringIndices, scores, winner, isTie };
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

// ─── Greedy Heuristic Score Estimator ────────
//
// Estimates the AI's (player 2) likely final score for a given board state.
// For every possible remaining null (potential black hole position), we sum
// the AI's chip values that are adjacent to it.  We return the average —
// lower is better (lowest score wins).
//
function greedyScoreEstimate(board, totalCircles) {
  const nullIndices = board
    .map((cell, i) => (cell === null ? i : -1))
    .filter((i) => i !== -1);

  if (nullIndices.length === 0) return 0;

  let totalAiScore = 0;
  for (const nullIdx of nullIndices) {
    const neighbors = getNeighbors(nullIdx, totalCircles);
    for (const n of neighbors) {
      const cell = board[n];
      if (cell && cell.player === 2) totalAiScore += cell.value;
    }
  }
  return totalAiScore / nullIndices.length;
}

// ─── Task 1: Minimax ─────────────────────────

/**
 * Depth-limited Minimax: both players try to minimise the AI's score.
 * Only for PvE (2-player boards, 21 circles).
 *
 * @param {Array}  board         - Current board state
 * @param {number} totalCircles  - 21 (PvE only)
 * @param {number} valueToPlace  - The chip value the AI (player 2) is placing now
 * @param {number} [depth=3]     - Look-ahead plies
 * @returns {{ index: number, stats: { nodesEvaluated: number, timeTakenMs: number } }}
 */
export function getMinimaxMove(board, totalCircles, valueToPlace, depth = 3) {
  const startTime = performance.now();
  let nodesEvaluated = 0;

  // nextValues simulation: at the start of minimax, AI (p2) is placing valueToPlace.
  // We track both players' next values throughout the tree.
  // p1Next = the value player 1 will place on their next turn.
  const p2Next = valueToPlace;
  const placedCount = board.filter((c) => c !== null).length;
  // Player 1 places odd-numbered turns (1st, 3rd…), player 2 even (2nd, 4th…)
  // At this point it's player 2's turn, so placedCount is even.
  // p1 has placed placedCount/2 chips so far → next value = placedCount/2 + 1
  const p1Next = Math.floor(placedCount / 2) + 1;

  function minimax(curBoard, curDepth, isAiTurn, p1Val, p2Val) {
    nodesEvaluated++;
    const nullCount = curBoard.filter((c) => c === null).length;

    // Terminal: 1 null left → compute real score
    if (nullCount === 1) {
      const { scores } = calculateScores(curBoard, totalCircles, 'pve');
      return scores[2]; // AI's score (lower = better for AI)
    }

    // Depth limit: use heuristic estimate
    if (curDepth === 0) {
      return greedyScoreEstimate(curBoard, totalCircles);
    }

    const emptyIndices = curBoard
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);

    const player = isAiTurn ? 2 : 1;
    const val = isAiTurn ? p2Val : p1Val;
    const nextP1Val = isAiTurn ? p1Val : p1Val + 1; // p1 advances on their turn
    const nextP2Val = isAiTurn ? p2Val + 1 : p2Val; // p2 advances on their turn

    let best = isAiTurn ? Infinity : Infinity; // both try to minimise AI score
    for (const idx of emptyIndices) {
      const newBoard = [...curBoard];
      newBoard[idx] = { player, value: val };
      const score = minimax(newBoard, curDepth - 1, !isAiTurn, nextP1Val, nextP2Val);
      if (score < best) best = score;
    }
    return best;
  }

  const emptyIndices = board
    .map((cell, i) => (cell === null ? i : -1))
    .filter((i) => i !== -1);

  let bestIndex = emptyIndices[0];
  let bestScore = Infinity;

  for (const idx of emptyIndices) {
    const newBoard = [...board];
    newBoard[idx] = { player: 2, value: p2Next };
    const score = minimax(newBoard, depth - 1, false, p1Next, p2Next + 1);
    if (score < bestScore) {
      bestScore = score;
      bestIndex = idx;
    }
  }

  return {
    index: bestIndex,
    stats: {
      nodesEvaluated,
      timeTakenMs: Math.round(performance.now() - startTime),
    },
  };
}

// ─── Task 2: Alpha-Beta Pruning ──────────────

/**
 * Same as Minimax but prunes branches that cannot improve on the current best.
 * Expects 60–80% fewer nodes evaluated than plain Minimax.
 *
 * @param {Array}  board         - Current board state
 * @param {number} totalCircles  - 21 (PvE only)
 * @param {number} valueToPlace  - The chip value the AI (player 2) is placing now
 * @param {number} [depth=3]     - Look-ahead plies
 * @returns {{ index: number, stats: { nodesEvaluated: number, timeTakenMs: number } }}
 */
export function getAlphaBetaMove(board, totalCircles, valueToPlace, depth = 3) {
  const startTime = performance.now();
  let nodesEvaluated = 0;

  const p2Next = valueToPlace;
  const placedCount = board.filter((c) => c !== null).length;
  const p1Next = Math.floor(placedCount / 2) + 1;

  // alpha = best (lowest) AI score found so far for AI's perspective
  // beta  = best (lowest) AI score that the "opponent" side will allow
  // Both sides minimise AI score, so both alpha and beta are upper-bound cutoffs.
  function alphaBeta(curBoard, curDepth, isAiTurn, p1Val, p2Val, alpha, beta) {
    nodesEvaluated++;
    const nullCount = curBoard.filter((c) => c === null).length;

    if (nullCount === 1) {
      const { scores } = calculateScores(curBoard, totalCircles, 'pve');
      return scores[2];
    }

    if (curDepth === 0) {
      return greedyScoreEstimate(curBoard, totalCircles);
    }

    const emptyIndices = curBoard
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);

    const player = isAiTurn ? 2 : 1;
    const val = isAiTurn ? p2Val : p1Val;
    const nextP1Val = isAiTurn ? p1Val : p1Val + 1;
    const nextP2Val = isAiTurn ? p2Val + 1 : p2Val;

    let best = Infinity;
    for (const idx of emptyIndices) {
      const newBoard = [...curBoard];
      newBoard[idx] = { player, value: val };
      const score = alphaBeta(newBoard, curDepth - 1, !isAiTurn, nextP1Val, nextP2Val, alpha, beta);
      if (score < best) best = score;
      // Both sides minimise, so both use alpha as the running best
      if (score < alpha) alpha = score;
      if (beta <= alpha) break; // prune
    }
    return best;
  }

  const emptyIndices = board
    .map((cell, i) => (cell === null ? i : -1))
    .filter((i) => i !== -1);

  let bestIndex = emptyIndices[0];
  let bestScore = Infinity;

  for (const idx of emptyIndices) {
    const newBoard = [...board];
    newBoard[idx] = { player: 2, value: p2Next };
    const score = alphaBeta(newBoard, depth - 1, false, p1Next, p2Next + 1, Infinity, Infinity);
    if (score < bestScore) {
      bestScore = score;
      bestIndex = idx;
    }
  }

  return {
    index: bestIndex,
    stats: {
      nodesEvaluated,
      timeTakenMs: Math.round(performance.now() - startTime),
    },
  };
}

// ─── Task 3: State Tree Builder ──────────────

/**
 * Builds the JSON decision tree for Suvarna's StateTree.jsx to render.
 * Only expands the current player's moves at each level.
 *
 * @param {Array}  board          - Current board state
 * @param {number} totalCircles   - 21 or 28
 * @param {{ [player: number]: number }} nextValues - Each player's next chip value
 * @param {number} currentPlayer  - Player whose turn it is now
 * @param {number} [depth=2]      - How many levels deep to expand
 * @returns {TreeNode}
 *
 * TreeNode = {
 *   boardSnapshot: Array,
 *   move: number | null,
 *   value: number | null,
 *   player: number | null,
 *   estimatedScore: number,
 *   children: TreeNode[]
 * }
 */
export function buildStateTree(board, totalCircles, nextValues, currentPlayer, depth = 2) {
  function buildNode(curBoard, curPlayer, curNextValues, moveIndex, chipValue, curDepth) {
    const estimatedScore = greedyScoreEstimate(curBoard, totalCircles);

    const node = {
      boardSnapshot: [...curBoard],
      move: moveIndex,        // which index was placed (null = root)
      value: chipValue,       // chip value placed (null = root)
      player: curPlayer,
      estimatedScore,
      children: [],
    };

    if (curDepth === 0) return node;

    const nullCount = curBoard.filter((c) => c === null).length;
    if (nullCount <= 1) return node; // terminal

    const emptyIndices = curBoard
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);

    const val = curNextValues[curPlayer];

    // Compute next player and their updated values
    const players = totalCircles === 21 ? [1, 2] : [1, 2, 3];
    const curIdx = players.indexOf(curPlayer);
    const nextPlayer = players[(curIdx + 1) % players.length];
    const updatedValues = { ...curNextValues, [curPlayer]: val + 1 };

    // Build children and prune obviously worse ones (keep top half by estimatedScore)
    const childNodes = emptyIndices.map((idx) => {
      const newBoard = [...curBoard];
      newBoard[idx] = { player: curPlayer, value: val };
      return buildNode(newBoard, nextPlayer, updatedValues, idx, val, curDepth - 1);
    });

    // Sort by estimatedScore ascending (lower = better for AI) and cap at ~20 total visible nodes
    childNodes.sort((a, b) => a.estimatedScore - b.estimatedScore);
    const keepCount = Math.min(childNodes.length, Math.max(3, Math.floor(20 / Math.max(1, emptyIndices.length))));
    node.children = childNodes.slice(0, keepCount);

    return node;
  }

  // Root has no move/value since it's the current board state
  return buildNode(board, currentPlayer, nextValues, null, null, depth);
}