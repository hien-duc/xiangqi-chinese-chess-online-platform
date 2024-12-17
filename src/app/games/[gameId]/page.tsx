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
  const { setGameId, gameState, isLoading } = useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";

  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
    }
  }, [gameId, setGameId]);

  if (isLoading && !gameState) {
    return (
      <div className={styles.loading}>
        <p>Loading game...</p>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className={styles.error}>
        <p>Game not found</p>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className={styles.container}>
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
