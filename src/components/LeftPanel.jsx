import React from "react";
import { useGameContext } from "@/hooks/useGameState";
import styles from "../styles/LeftPanel.module.css";

const LeftPanel = () => {
  const { gameState } = useGameContext();

  const renderMoveHistory = () => (
    <div className={styles.moveHistory}>
      <h3>Move History</h3>
      <div className={styles.movesList}>
        {gameState?.moves
          .reduce((pairs, move, index) => {
            if (index % 2 === 0) {
              pairs.push({
                number: Math.floor(index / 2) + 1,
                red: move,
                black: gameState.moves[index + 1] || "",
              });
            }
            return pairs;
          }, [])
          .map((pair, index) => (
            <div key={index} className={styles.movePair}>
              <span className={styles.moveNumber}>{pair.number}.</span>
              <div className={styles.moveItem}>
                <span className={`${styles.moveText} ${styles.redMove}`}>
                  {pair.red}
                </span>
                <span className={`${styles.moveText} ${styles.blackMove}`}>
                  {pair.black}
                </span>
              </div>
            </div>
          ))}
        {(!gameState?.moves || gameState.moves.length === 0) && (
          <div className={styles.noMoves}>No moves yet</div>
        )}
      </div>
    </div>
  );

  const renderPanel = () => {
    return renderMoveHistory();
  };

  return (
    <div className={styles.leftPanel}>
      <div className={styles.turnIndicator} data-turn={gameState.turn}>
        {gameState.turn}'s Turn
      </div>
      <div className={styles.contentPanel}>{renderPanel()}</div>
    </div>
  );
};

export default LeftPanel;
