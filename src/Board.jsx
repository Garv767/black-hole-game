import React from "react";
import "./Board.css";

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
  gameResult
}) {
  const isGameOver = phase === "gameover";

  // Generate rows for the pyramid (6 rows for 21, 7 rows for 28)
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

  // Calculate available numbers for the current player
  const nextVal = nextValues[currentPlayer];
  const availableChips = [];
  for (let i = nextVal; i <= maxValue; i++) {
    availableChips.push(i);
  }

  return (
    <div className={`board-container player-theme-${currentPlayer} ${isGameOver ? 'gameover' : ''}`}>
      <div className="turn-indicator heading-oswald" style={{ opacity: isGameOver ? 0 : 1 }}>
        Player {currentPlayer}<span>TURN</span>
      </div>

      <div className="board-wrapper">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((circleIndex) => {
              const cell = board[circleIndex];
              const isEmpty = !cell;
              let classes = "board-cell ";
              
              if (isEmpty) {
                classes += "empty";
              } else {
                classes += `p${cell.player}`;
              }

              // Apply gameover highlight classes
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
  );
}