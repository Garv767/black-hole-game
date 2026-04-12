import React, { useState, useEffect } from "react";
import "./Board.css";
import StateTree from "./StateTree";

export default function Board({
  board,
  totalCircles,
  currentPlayer,
  selectedNumber,
  onSelectNumber,
  onCircleClick,
  nextValues,
  maxValue,
  gameMode,
  phase,
  gameResult,
  treeData,
  chosenIndex,
  compact = false
}) {
  const isGameOver = phase === "gameover";
  
  const [treeOpen, setTreeOpen] = useState(false);
  
  useEffect(() => {
    setTreeOpen(window.innerWidth >= 768);
  }, []);

  const rows = [];
  let index = 0;
  for (let row = 1; index < totalCircles; row++) {
    const currentRow = [];
    for (let col = 0; col < row && index < totalCircles; col++) {
      currentRow.push(index);
      index++;
    }
    rows.push(currentRow);
  }

  const nextVal = nextValues[currentPlayer];
  const availableChips = [];
  for (let i = nextVal; i <= maxValue; i++) {
    availableChips.push(i);
  }

  return (
    <div className={`board-layout-wrapper player-theme-${currentPlayer} ${isGameOver ? 'gameover' : ''}`}>
      <div className="board-main-area board-container">
        {treeData && (
          <button 
            className="tree-toggle-btn"
            onClick={() => setTreeOpen(!treeOpen)}
          >
            [🌳 TREE]
          </button>
        )}

        <div className="turn-indicator heading-oswald" style={{ opacity: isGameOver ? 0 : 1 }}>
          Player {currentPlayer}<span>TURN</span>
        </div>

        <div className="board-wrapper">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((circleIndex) => {
                const cell = board[circleIndex];
                const isEmpty = !cell;
                let classes = "board-cell";
                if (compact) classes += " board-cell--compact";
                
                if (isEmpty) {
                  classes += " empty";
                } else {
                  classes += ` p${cell.player}`;
                }

                if (isGameOver && gameResult) {
                  if (circleIndex === gameResult.blackHoleIndex) {
                    classes += " black-hole";
                  } else if (gameResult.scoringIndices.includes(circleIndex)) {
                    classes += " scoring-adjacent";
                  }
                }

                return (
                  <div
                    key={circleIndex}
                    className={classes}
                    onClick={() => !isGameOver && onCircleClick(circleIndex)}
                  >
                    {cell?.value}
                    <span className="circle-index-label">{circleIndex}</span>
                  </div>
                );

              })}
            </div>
          ))}
        </div>

        <div className={`chip-tray-container ${isGameOver ? 'hidden' : ''}`}>
          <div className="chip-tray-header">
            Player {currentPlayer} — Next Chip
          </div>
          <div className="chip-list">
            {availableChips.map((num, idx) => {
              const isNext = idx === 0;
              return (
                <div
                  key={num}
                  className={`chip ${isNext ? "selected" : ""}`}
                  style={{
                    opacity: isNext ? 1 : 0.3,
                    cursor: isNext ? "default" : "not-allowed"
                  }}
                >
                  {num}
                </div>
              );
            })}
            {availableChips.length === 0 && (
              <div className="chip" style={{ opacity: 0.5, pointerEvents: 'none' }}>WAIT</div>
            )}
          </div>
        </div>
      </div>

      {treeData && (
        <div className={`tree-sidebar ${!treeOpen ? 'closed' : ''}`}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Decision Tree
          </div>
          <StateTree tree={treeData} chosenIndex={chosenIndex} playerColors={{ 1: 'var(--color-p1)', 2: 'var(--color-p2)', 3: 'var(--color-p3)' }} />
        </div>
      )}
    </div>
  );
}