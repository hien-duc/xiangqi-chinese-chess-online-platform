"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import XiangqiBoard from "@/components/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/page.module.css";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import "@/styles/xiangqiground.css";
import "@/app/globals.css";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setGameId, gameState, isLoading, error, hasInitialLoad } = useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";

  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
    }
  }, [gameId, setGameId]);

  // Show initial loading state
  if (!hasInitialLoad) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading game...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show game not found state
  if (!gameState) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          <h2>Game Not Found</h2>
          <p>The game you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className={styles.container}>
        {/* Show loading overlay during subsequent loads */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}
        <div className={styles["game-container"]}>
          <LeftPanel />
          <div className={styles.boardContainer}>
            <XiangqiBoard
              className={isSpectator ? styles.spectatorBoard : ""}
            />
            {isSpectator && (
              <div className={styles.spectatorBadge}>Spectator Mode</div>
            )}
          </div>
          <RightPanel />
        </div>
      </div>
    </main>
  );
}
