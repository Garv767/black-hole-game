import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { calculateScores, getAIMove, getMinimaxMove, getAlphaBetaMove } from "./utils";
import Board from "./Board";

export default function AIvsAI() {
  const navigate = useNavigate();
  const totalCircles = 21;
  const maxValue = 10;
  
  const [boards, setBoards] = useState({
    greedy:    Array(21).fill(null),
    minimax:   Array(21).fill(null),
    alphabeta: Array(21).fill(null),
  });
  const [nextValues, setNextValues] = useState({ 1: 1, 2: 1 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [paused, setPaused] = useState(true);
  const [results, setResults] = useState({ greedy: null, minimax: null, alphabeta: null });
  const [stats, setStats] = useState({
    greedy: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
    minimax: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
    alphabeta: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
  });
  const [colPhase, setColPhase] = useState({ greedy: 'playing', minimax: 'playing', alphabeta: 'playing' });

  const turnLoopRef = useRef(null);
  
  const step = () => {
    const newBoards = { ...boards };
    const newStats = { ...stats };
    const newResults = { ...results };
    const newPhase = { ...colPhase };
    
    let activeAny = false;
    const valueToPlace = nextValues[currentPlayer];
    
    if (newPhase.greedy === 'playing') {
      activeAny = true;
      const index = getAIMove(newBoards.greedy, totalCircles, valueToPlace);
      newBoards.greedy[index] = { player: currentPlayer, value: valueToPlace };
      newStats.greedy.movesPlayed += 1;
      
      const nullCount = newBoards.greedy.filter(c => c === null).length;
      if (nullCount === 1) {
        newResults.greedy = calculateScores(newBoards.greedy, totalCircles, "pve");
        newPhase.greedy = 'gameover';
      }
    }
    
    if (newPhase.minimax === 'playing') {
      activeAny = true;
      const move = getMinimaxMove(newBoards.minimax, totalCircles, valueToPlace);
      newBoards.minimax[move.index] = { player: currentPlayer, value: valueToPlace };
      // stats might be undefined if getMinimaxMove isn't fully returning stats yet, handle gracefully
      newStats.minimax.nodesEvaluated += move.stats?.nodesEvaluated || 0;
      newStats.minimax.timeTakenMs += move.stats?.timeTakenMs || 0;
      newStats.minimax.movesPlayed += 1;
      
      const nullCount = newBoards.minimax.filter(c => c === null).length;
      if (nullCount === 1) {
        newResults.minimax = calculateScores(newBoards.minimax, totalCircles, "pve");
        newPhase.minimax = 'gameover';
      }
    }
    
    if (newPhase.alphabeta === 'playing') {
      activeAny = true;
      const move = getAlphaBetaMove(newBoards.alphabeta, totalCircles, valueToPlace);
      newBoards.alphabeta[move.index] = { player: currentPlayer, value: valueToPlace };
      newStats.alphabeta.nodesEvaluated += move.stats?.nodesEvaluated || 0;
      newStats.alphabeta.timeTakenMs += move.stats?.timeTakenMs || 0;
      newStats.alphabeta.movesPlayed += 1;
      
      const nullCount = newBoards.alphabeta.filter(c => c === null).length;
      if (nullCount === 1) {
        newResults.alphabeta = calculateScores(newBoards.alphabeta, totalCircles, "pve");
        newPhase.alphabeta = 'gameover';
      }
    }
    
    setBoards(newBoards);
    setStats(newStats);
    setResults(newResults);
    setColPhase(newPhase);

    if (activeAny) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setNextValues({
        ...nextValues,
        [currentPlayer]: nextValues[currentPlayer] + 1
      });
    } else {
      setPaused(true);
    }
  };

  useEffect(() => {
    if (!paused) {
      const speed = 700;
      turnLoopRef.current = setTimeout(step, speed);
    }
    return () => clearTimeout(turnLoopRef.current);
  }, [paused, boards, currentPlayer, nextValues]);

  const handleReset = () => {
    setBoards({
      greedy: Array(21).fill(null),
      minimax: Array(21).fill(null),
      alphabeta: Array(21).fill(null),
    });
    setNextValues({ 1: 1, 2: 1 });
    setCurrentPlayer(1);
    setPaused(true);
    setResults({ greedy: null, minimax: null, alphabeta: null });
    setStats({
      greedy: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
      minimax: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
      alphabeta: { nodesEvaluated: 0, timeTakenMs: 0, currentScore: 0, movesPlayed: 0 },
    });
    setColPhase({ greedy: 'playing', minimax: 'playing', alphabeta: 'playing' });
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem", borderBottom: "1px solid var(--border-color)", zIndex: 5
      }}>
        <div style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          MODE: AI VS AI
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => setPaused(!paused)} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>
            {paused ? 'RESUME' : 'PAUSE'}
          </button>
          <button onClick={handleReset} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>
            RESET
          </button>
          <button onClick={() => navigate("/")} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>
            EXIT
          </button>
        </div>
      </div>

      <div className="aivai-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", flex: 1, overflow: "hidden", pointerEvents: "none"
      }}>
        {['greedy', 'minimax', 'alphabeta'].map(algo => (
          <div className="aivai-col" key={algo} style={{ display: "flex", flexDirection: "column" }}>
            <div className="aivai-col-header" style={{ padding: "0.5rem", textAlign: "center", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid var(--border-color)" }}>
              {algo === 'alphabeta' ? 'ALPHA-β' : algo}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <Board
                board={boards[algo]}
                totalCircles={totalCircles}
                currentPlayer={currentPlayer}
                selectedNumber={nextValues[currentPlayer]}
                onSelectNumber={() => {}}
                onCircleClick={() => {}}
                nextValues={nextValues}
                maxValue={maxValue}
                gameMode="pve"
                phase={colPhase[algo]}
                gameResult={results[algo]}
                selectedAlgo={algo}
                lastAiStats={stats[algo]}
              />
            </div>
            <div id={`stats-${algo}`} style={{ padding: "0.5rem", minHeight: "80px", borderTop: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                <div>Nodes: {stats[algo].nodesEvaluated}</div>
                <div>Time: {stats[algo].timeTakenMs}ms</div>
                <div>Moves: {stats[algo].movesPlayed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
