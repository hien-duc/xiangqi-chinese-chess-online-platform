"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import XiangqiBoard from "@/components/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/game.module.css";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setGameId, gameState, isLoading, refetch } = useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";

  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
      refetch();
    }
  }, [gameId, setGameId, refetch]);

  if (isLoading) {
    return <div className={styles.loading}>Loading game...</div>;
  }

  if (!gameState) {
    return <div className={styles.error}>Game not found</div>;
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.playerInfo}>
          <h3>Red Player</h3>
          <p>{gameState.players.red.name || "Waiting..."}</p>
        </div>
      </div>

      <div className={styles.boardContainer}>
        <XiangqiBoard className={isSpectator ? styles.spectatorBoard : ""} />
        {isSpectator && (
          <div className={styles.spectatorBadge}>Spectator Mode</div>
        )}
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.playerInfo}>
          <h3>Black Player</h3>
          <p>{gameState.players.black.name || "Waiting..."}</p>
        </div>
      </div>
    </div>
  );
}
