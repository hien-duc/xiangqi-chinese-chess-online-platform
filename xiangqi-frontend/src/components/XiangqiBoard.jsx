import React from "react";
import styles from "../styles/ChineseChess.module.css";

const BOARD_CONFIG = {
  SQUARE_SIZE: 64,
  BORDER_SIZE: 4,
  COLUMNS: 9,
  ROWS: 10,
};
const XiangqiBoard = ({
  gameState,
  selectedPiece,
  validMoves,
  handleClick,
  resetGame,
  bgRef,
}) => {
  const BOARD_MARKERS = [
    [2, 1],
    [2, 7],
    [3, 0],
    [3, 2],
    [3, 4],
    [3, 6],
    [3, 8],
    [6, 0],
    [6, 2],
    [6, 4],
    [6, 6],
    [6, 8],
    [7, 1],
    [7, 7],
  ];
  const en = (n) => n * BOARD_CONFIG.SQUARE_SIZE + BOARD_CONFIG.BORDER_SIZE / 2;

  return (
    <div >
      <div className={styles["board-container"]}>
        <div className={styles["board-wrapper"]}>
          <div className={styles["chess-pieces"]}>
            {gameState.pieces.map((chess, i) => (
              <span
                key={i}
                className={`
                ${styles["chess-piece"]}
                ${chess.side > 0 ? styles.red : styles.green}
                ${selectedPiece === i ? styles.active : ""}
              `}
                style={{
                  top: en(chess.y),
                  left: en(chess.x),
                  display: chess.dead ? "none" : "block",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (chess.side === gameState.side && !gameState.winner) {
                    handleClick(e);
                  }
                }}
              >
                {chess.name}
              </span>
            ))}
          </div>
          <div className={styles.board} ref={bgRef} onClick={handleClick}>
            {Array(9)
              .fill(null)
              .map((_, y) => (
                <div
                  key={y}
                  className={`${styles.row} ${y === 4 ? styles.middle : ""}`}
                >
                  {Array(9)
                    .fill(null)
                    .map((_, x) => (
                      <div
                        key={x}
                        className={`
                        ${styles.square}
                        ${
                          (y === 1 && x === 4) || (y === 8 && x === 4)
                            ? styles.cross
                            : ""
                        }
                      `}
                      >
                        {validMoves.some(
                          ([mx, my]) => mx === x && my === y
                        ) && <div className={styles["valid-move-indicator"]} />}
                      </div>
                    ))}
                </div>
              ))}
            {BOARD_MARKERS.map(([y, x], i) => (
              <div
                key={i}
                className={styles.marker}
                style={{
                  top: en(y),
                  left: en(x),
                }}
              />
            ))}
          </div>
        </div>
        <button onClick={resetGame} className={styles["reset-button"]}>
          Reset
        </button>
      </div>{" "}
    </div>
  );
};

export default XiangqiBoard;
