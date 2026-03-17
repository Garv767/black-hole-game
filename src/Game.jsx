import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { calculateScores, getAIMove } from "./utils";
import Board from "./Board";
import GameOver from "./GameOver";

export default function Game() {
  const { mode: gameMode } = useParams();
  const navigate = useNavigate();

  // Validate mode, fallback to pvp if invalid
  const isValidMode = ["pvp", "pve", "3p"].includes(gameMode);
  const activeMode = isValidMode ? gameMode : "pvp";

  const totalCircles = activeMode === "3p" ? 28 : 21;
  const maxValue     = activeMode === "3p" ? 9 : 10;

  const [phase, setPhase]                 = useState("playing");
  const [board, setBoard]                 = useState(Array(totalCircles).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [nextValues, setNextValues]       = useState({ 1: 1, 2: 1, 3: 1 });
  const [gameResult, setGameResult]       = useState(null);

  // Note: we don't need selectedNumber anymore if we enforce sequential play.
  // The player MUST play their nextValues[currentPlayer]. So it's auto-selected.
  const currentChip = nextValues[currentPlayer];

  function handleExit() {
    navigate("/");
  }

  function playPlacementSound(player) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Different frequencies for different players
      const baseFreq = player === 1 ? 300 : player === 2 ? 400 : 500;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio context might be blocked by browser policy without interaction, ignore
    }
  }

  function advanceTurn(player, values) {
    const nextPlayer =
      activeMode === "3p"
        ? (player % 3) + 1          // 1→2→3→1
        : player === 1 ? 2 : 1;     // 1→2→1

    const newValues = {
      ...values,
      [player]: values[player] + 1,
    };

    setCurrentPlayer(nextPlayer);
    setNextValues(newValues);

    return { nextPlayer, newValues };
  }

  function placeNumber(index) {
    if (board[index] !== null) return;

    playPlacementSound(currentPlayer);

    // Player MUST place currentChip (auto-selected).
    const newBoard = [...board];
    newBoard[index] = { player: currentPlayer, value: currentChip };
    setBoard(newBoard);

    const nullCount = newBoard.filter((c) => c === null).length;

    if (nullCount === 1) {
      const result = calculateScores(newBoard, totalCircles, activeMode);
      setGameResult(result);
      setPhase("gameover");
      return;
    }

    const { nextPlayer, newValues } = advanceTurn(currentPlayer, nextValues);

    if (activeMode === "pve" && nextPlayer === 2) {
      triggerAIMove(newBoard, newValues, nextPlayer);
    }
  }

  function triggerAIMove(currentBoard, values, aiPlayer) {
    const aiValue = values[aiPlayer];

    setTimeout(() => {
      const aiIndex = getAIMove(currentBoard, totalCircles, aiValue);

      playPlacementSound(aiPlayer);

      const newBoard = [...currentBoard];
      newBoard[aiIndex] = { player: aiPlayer, value: aiValue };
      setBoard(newBoard);

      const nullCount = newBoard.filter((c) => c === null).length;

      if (nullCount === 1) {
        const result = calculateScores(newBoard, totalCircles, activeMode);
        setGameResult(result);
        setPhase("gameover");
        return;
      }

      advanceTurn(aiPlayer, values);
    }, 500);
  }

  function handlePlayAgain() {
    setBoard(Array(totalCircles).fill(null));
    setCurrentPlayer(1);
    setNextValues({ 1: 1, 2: 1, 3: 1 });
    setGameResult(null);
    setPhase("playing");
  }

  // Redirect invalid URLs
  useEffect(() => {
    if (!isValidMode) navigate("/", { replace: true });
  }, [isValidMode, navigate]);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      
      {/* Top action bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid var(--border-color)",
        position: "relative",
        zIndex: 5
      }}>
        <div style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          MODE: {activeMode === "pve" ? "1 VS AI" : activeMode === "pvp" ? "1 VS 1" : "3 PLAYERS"}
        </div>
        <button 
          onClick={handleExit}
          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}
        >
          EXIT
        </button>
      </div>

      {(phase === "playing" || phase === "gameover") && (
        <Board
          board={board}
          totalCircles={totalCircles}
          currentPlayer={currentPlayer}
          selectedNumber={currentChip} 
          onSelectNumber={() => {}} // dummy to avoid breaking prop types, now read-only
          onCircleClick={placeNumber}
          nextValues={nextValues}
          maxValue={maxValue}
          gameMode={activeMode}
          phase={phase}
          gameResult={gameResult}
        />
      )}

      {phase === "gameover" && gameResult && (
        <GameOver
          scores={gameResult.scores}
          winner={gameResult.winner}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}

    </div>
  );
}
