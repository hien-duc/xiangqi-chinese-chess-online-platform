"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";

import XiangqiBoard from "@/components/ui/board/XiangqiBoard";
import { useGameContext } from "@/hooks/useGameState";
import styles from "@/styles/Page.module.css";
import LeftPanel from "@/components/game/panels/LeftPanel";
import RightPanel from "@/components/game/panels/RightPanel";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const { setGameId, gameState, refetch, togglePolling } = useGameContext();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get("spectate") === "true";

  if (!params?.gameId) {
    notFound();
  }

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/v1/game/${params.gameId}`);
        if (!response.ok) {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching game:", error);
        notFound();
      }
    };
    fetchGame();
  }, [params.gameId]);

  useEffect(() => {
    setGameId(gameId);
    refetch(true);
    togglePolling(true);

    return () => {
      togglePolling(false);
      setGameId("");
    };
  }, [gameId, setGameId, refetch, togglePolling]);

  if (!gameState) {
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
