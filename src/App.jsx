import { useState, useEffect } from "react";
import { calculateScores, getAIMove } from "./utils";
import Board from "./Board";
import Menu from "./Menu";
import GameOver from "./GameOver";

// ─────────────────────────────────────────────
//  SHARED STATE SHAPE (read before touching props)
//
//  board:          Array(21 or 28).fill(null)
//                  each cell: null | { player: 1|2|3, value: number }
//  currentPlayer:  1 | 2 | 3
//  gameMode:       'pvp' | 'pve' | '3p'
//  selectedNumber: number | null  ← which chip the player tapped in the tray
//  phase:          'menu' | 'playing' | 'gameover'
//  nextValues:     { 1: number, 2: number, 3: number }
//                  tracks which number each player places next (1 → 2 → ... → 10)
//  gameResult:     null | { blackHoleIndex, scoringIndices, scores, winner }
// ─────────────────────────────────────────────

export default function App() {
  const [gameMode, setGameMode]           = useState("pvp");
  const [phase, setPhase]                 = useState("menu");
  const [board, setBoard]                 = useState(Array(21).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [nextValues, setNextValues]       = useState({ 1: 1, 2: 1, 3: 1 });
  const [gameResult, setGameResult]       = useState(null);

  // Derived — 3-player uses 28 circles and values 1-9, others use 21 and 1-10
  const totalCircles = gameMode === "3p" ? 28 : 21;
  const maxValue     = gameMode === "3p" ? 9 : 10;

  // ─── Menu: start a new game ───────────────

  function handleStart(mode) {
    setGameMode(mode);
    setBoard(Array(mode === "3p" ? 28 : 21).fill(null));
    setCurrentPlayer(1);
    setSelectedNumber(null);
    setNextValues({ 1: 1, 2: 1, 3: 1 });
    setGameResult(null);
    setPhase("playing");
  }

  // ─── Turn cycling (Ketki's logic lives here) ──

  function advanceTurn(player, values) {
    const nextPlayer =
      gameMode === "3p"
        ? (player % 3) + 1          // 1→2→3→1
        : player === 1 ? 2 : 1;     // 1→2→1

    const newValues = {
      ...values,
      [player]: values[player] + 1,
    };

    setCurrentPlayer(nextPlayer);
    setNextValues(newValues);
    setSelectedNumber(null);

    return { nextPlayer, newValues };
  }

  // ─── Place a number ───────────────────────

  function placeNumber(index) {
    // Guard: must have selected a number, cell must be empty
    if (selectedNumber === null || board[index] !== null) return;

    const newBoard = [...board];
    newBoard[index] = { player: currentPlayer, value: selectedNumber };
    setBoard(newBoard);

    // Check if board is full (one null remaining = black hole)
    const nullCount = newBoard.filter((c) => c === null).length;

    if (nullCount === 1) {
      // ── Game over ──
      const result = calculateScores(newBoard, totalCircles);
      setGameResult(result);
      setPhase("gameover");
      return;
    }

    // ── Advance turn ──
    const { nextPlayer, newValues } = advanceTurn(currentPlayer, nextValues);

    // ── If PvE and it's now the AI's turn, trigger AI move ──
    if (gameMode === "pve" && nextPlayer === 2) {
      triggerAIMove(newBoard, newValues, nextPlayer);
    }
  }

  // ─── AI move ─────────────────────────────

  function triggerAIMove(currentBoard, values, aiPlayer) {
    const aiValue = values[aiPlayer];

    // Small delay so the AI doesn't feel instant — improves UX on demo
    setTimeout(() => {
      const aiIndex = getAIMove(currentBoard, totalCircles, aiValue);

      const newBoard = [...currentBoard];
      newBoard[aiIndex] = { player: aiPlayer, value: aiValue };
      setBoard(newBoard);

      const nullCount = newBoard.filter((c) => c === null).length;

      if (nullCount === 1) {
        const result = calculateScores(newBoard, totalCircles);
        setGameResult(result);
        setPhase("gameover");
        return;
      }

      advanceTurn(aiPlayer, values);
    }, 500);
  }

  // ─── Play Again ───────────────────────────

  function handlePlayAgain() {
    setBoard(Array(totalCircles).fill(null));
    setCurrentPlayer(1);
    setSelectedNumber(null);
    setNextValues({ 1: 1, 2: 1, 3: 1 });
    setGameResult(null);
    setPhase("playing");
  }

  // ─── Render ───────────────────────────────

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>

      {phase === "menu" && (
        <Menu onStart={handleStart} />
      )}

      {phase === "playing" && (
        <Board
          board={board}
          totalCircles={totalCircles}
          currentPlayer={currentPlayer}
          selectedNumber={selectedNumber}
          onSelectNumber={setSelectedNumber}
          onCircleClick={placeNumber}
          nextValues={nextValues}
          maxValue={maxValue}
          gameMode={gameMode}
        />
      )}

      {phase === "gameover" && gameResult && (
        <GameOver
          scores={gameResult.scores}
          winner={gameResult.winner}
          onPlayAgain={handlePlayAgain}
        />
      )}

    </div>
  );
}