"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";

import XiangqiBoard from "@/components/ui/board/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/Page.module.css";
import LeftPanel from "@/components/game/panels/LeftPanel";
import RightPanel from "@/components/game/panels/RightPanel";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const {
    gameState,
    isLoading,
    setGameId,
    refetch,
    togglePolling,
    forfeitGame,
  } = useGameContext();
  const isSpectator = searchParams.get("spectate") === "true";

  useEffect(() => {
    if (!params?.gameId) {
      notFound();
    }

    // Start polling immediately
    togglePolling(true);

    const initializeGame = async () => {
      setGameId(params.gameId as string);
      try {
        await refetch(true);
      } catch (error) {
        console.error("Error initializing game:", error);
        notFound();
      }
    };

    initializeGame();

    // Handle page unload/navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!gameState || gameState.status !== "active" || isSpectator) return;

      const isPlayer =
        gameState.players.red.id === session?.user?.id ||
        gameState.players.black.id === session?.user?.id;

      if (isPlayer) {
        e.preventDefault();
        e.returnValue =
          "Are you sure you want to leave? You will forfeit the game.";
        return e.returnValue;
      }
    };

    // Handle browser back button
    const handleBackButton = (e: PopStateEvent) => {
      if (!gameState || gameState.status !== "active" || isSpectator) return;

      const isPlayer =
        gameState.players.red.id === session?.user?.id ||
        gameState.players.black.id === session?.user?.id;

      if (isPlayer) {
        const confirmLeave = window.confirm(
          "Are you sure you want to leave? You will forfeit the game."
        );

        if (confirmLeave && session?.user?.id) {
          forfeitGame(session.user.id).then(() => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handleBackButton);
            router.back();
          });
        }

        // Prevent default navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleBackButton);

    // Push a new history state to handle the back button
    window.history.pushState(null, "", window.location.href);

    return () => {
      togglePolling(false);
      setGameId("");
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [
    params?.gameId,
    setGameId,
    refetch,
    togglePolling,
    gameState,
    isSpectator,
    session?.user?.id,
    forfeitGame,
    router,
  ]);

  // Show loading state while fetching initial game data
  if (isLoading && !gameState) {
    return <div>Loading game...</div>;
  }

  // If game state is null after loading, the game doesn't exist
  if (!gameState && !isLoading) {
    notFound();
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
          </div>
          <RightPanel />
        </div>
      </div>
    </main>
  );
}
