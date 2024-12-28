"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import XiangqiBoard from "@/components/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/Page.module.css";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@/styles/XiangqiGround.css";
import "@/app/globals.css";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setGameId, gameState, isLoading, refetch, togglePolling } =
    useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";

  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
      refetch(true);
      togglePolling(true); // Start polling when component mounts
    }

    return () => {
      togglePolling(false);
      setGameId("");
    };
  }, [gameId, setGameId, refetch, togglePolling]);

  if (isLoading && !gameState) {
    return <LoadingSpinner />;
  }

  if (!gameState) {
    return <LoadingSpinner />;
  }

  return (
    <main className="p-0">
      <div className={styles.container}>
        <div className={styles["game-container"]}>
          <LeftPanel />
          <div className={styles.boardContainer}>
            <XiangqiBoard
              className={isSpectator ? styles.spectatorBoard : ""}
              isSpectator={isSpectator}
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
