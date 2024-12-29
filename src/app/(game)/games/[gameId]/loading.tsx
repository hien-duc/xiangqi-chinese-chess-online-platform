"use client";

import styles from "@/styles/Loading.module.css";

export default function GameLoading() {
  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameBoard}>
        <div className={styles.piece} />
        <div className={styles.piece} />
        <div className={styles.piece} />
      </div>

      <div className={styles.sidebar}>
        <div className={styles.chatLoading}>
          <div style={{ display: "flex", gap: "8px" }}>
            <div className={styles.messageDot} />
            <div className={styles.messageDot} />
            <div className={styles.messageDot} />
          </div>
        </div>
      </div>
    </div>
  );
}
