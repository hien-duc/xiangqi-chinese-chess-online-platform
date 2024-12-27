"use client";

import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import XiangqiBoard from "@/components/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/Page.module.css";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import GameNotFoundModal from "@/components/GameNotFoundModal";
import "@/styles/XiangqiGround.css";
import "@/app/globals.css";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const {
    setGameId,
    gameState,
    isLoading,
    refetch,
    togglePolling,
    forfeitGame,
  } = useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";
  const unmountingRef = useRef(false);

  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
      refetch(true);
      togglePolling(true); // Start polling when component mounts
    }

    return () => {
      unmountingRef.current = true;
      if (
        unmountingRef.current &&
        gameState?.status === "active" &&
        gameState.moves &&
        gameState.moves.length > 0 &&
        !isSpectator &&
        session?.user?.id &&
        (gameState.players.red.id === session.user.id ||
          gameState.players.black.id === session.user.id)
      ) {
        forfeitGame(session.user.id);
      }
      togglePolling(false);
      setGameId("");
    };
  }, [
    gameId,
    setGameId,
    refetch,
    togglePolling,
    forfeitGame,
    gameState,
    isSpectator,
    session,
  ]);

  if (isLoading && !gameState) {
    return <LoadingSpinner />;
  }

  if (!gameState) {
    return <GameNotFoundModal isOpen={true} />;
  }

  return (
    <main className="p-0">
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
