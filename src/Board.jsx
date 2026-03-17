import React from "react";
import "./Board.css";
export default function Board({ board, onCircleClick, selectedNumber, totalCircles }) {

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

  return (
    <div className="board">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">

          {row.map((circleIndex) => {

            const cell = board[circleIndex];

            let color = "#ddd";

            if (cell?.player === 1) color = "blue";
            if (cell?.player === 2) color = "red";
            if (cell?.player === 3) color = "green";

            return (
              <div
                key={circleIndex}
                className="circle"
                style={{ backgroundColor: color }}
                onClick={() => onCircleClick(circleIndex)}
              >
                {cell?.value}
              </div>
            );
          })}

        </div>
      ))}
    </div>
  );
}