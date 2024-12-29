"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "@/styles/Games.module.css";
import NewGameModal from "@/components/game/modals/NewGameModal";
import { useGameStore } from "@/stores/gameStore";
import { FaChessBoard, FaUserFriends, FaRobot, FaEye } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { IGameState } from "@/lib/db/models/gameState";
import { startGameCleanup, stopGameCleanup } from "@/lib/cleanup/gameCleanup";

export default function GamesPage() {
  const [games, setGames] = useState<IGameState[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Initialize game cleanup and fetch games
    startGameCleanup();
    fetchGames();

    // Cleanup when component unmounts
    return () => {
      stopGameCleanup();
    };
  }, []);

  const fetchGames = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/v1/games");
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await response.json();
      setGames(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
      throw new Error("Failed to fetch games");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJoinGame = async (gameId: string, side: "red" | "black") => {
    try {
      const playerInfo = {
        id:
          session?.user?.id ||
          "guest-" + Math.random().toString(36).substr(2, 9),
        name: session?.user?.name || "Guest Player",
      };

      const response = await fetch(`/api/v1/game/${gameId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerInfo,
          side,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        useGameStore.getState().updateGame(gameId, data.game);
        router.push(`/games/${gameId}`);
      } else {
        throw new Error(data.error || "Failed to join game");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      throw new Error("Failed to join game");
    }
  };

  const handleSpectate = (gameId: string) => {
    router.push(`/games/${gameId}?spectate=true`);
  };

  const handleCreateGame = async (
    side: "red" | "black",
    againstBot: boolean
  ) => {
    try {
      const playerInfo = {
        id:
          session?.user?.id ||
          "guest-" + Math.random().toString(36).substr(2, 9),
        name: session?.user?.name || "Guest",
        isBot: false,
      };

      const botInfo = {
        id: "bot-" + Math.random().toString(36).substr(2, 9),
        name: "XiangQi Bot",
        isBot: true,
      };

      const response = await fetch("/api/v1/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          players: {
            red:
              side === "red"
                ? playerInfo
                : againstBot
                ? botInfo
                : { ...playerInfo, id: "", name: "" },
            black:
              side === "black"
                ? playerInfo
                : againstBot
                ? botInfo
                : { ...playerInfo, id: "", name: "" },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const data = await response.json();
      router.push(`/games/${data.game._id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      throw new Error("Failed to create game");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <FaChessBoard className={styles.titleIcon} />
            Available Games
          </h1>
          <button
            onClick={fetchGames}
            className={`${styles.refreshButton} ${
              isRefreshing ? styles.spinning : ""
            }`}
            disabled={isRefreshing}
          >
            <MdRefresh />
          </button>
        </div>
        
        {games?.length > 0 && (
          <button
            className={styles.newGameButton}
            onClick={() => setIsModalOpen(true)}
          >
            New Game
          </button>
        )}
      </div>

      {games.length === 0 ? (
        <div className={styles.emptyState}>
          <FaChessBoard className={styles.emptyIcon} />
          <h2>No Games Available</h2>
          <p>Be the first to create a new game!</p>
          <button
            className={styles.createGameButton}
            onClick={() => setIsModalOpen(true)}
          >
            Create Game
          </button>
        </div>
      ) : (
        <div className={styles.gamesList}>
          {games.map((game) => (
            <div key={game._id} className={styles.gameCard}>
              <div className={styles.gameInfo}>
                <div className={styles.players}>
                  <div className={styles.player}>
                    <span className={`${styles.side} ${styles.redSide}`}>
                      Red:
                    </span>
                    <span className={styles.name}>
                      {game.players.red.name || "Waiting..."}
                      {game.players.red.isBot && (
                        <FaRobot className={styles.playerIcon} />
                      )}
                    </span>
                  </div>
                  <div className={styles.player}>
                    <span className={`${styles.side} ${styles.blackSide}`}>
                      Black:
                    </span>
                    <span className={styles.name}>
                      {game.players.black.name || "Waiting..."}
                      {game.players.black.isBot && (
                        <FaRobot className={styles.playerIcon} />
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.status}>
                  <span className={styles[game.status]}>
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                </div>
                <div className={styles.created}>
                  Created: {new Date(game.createdAt).toLocaleString()}
                </div>
              </div>
              <div className={styles.actions}>
                {game.status === "waiting" && (
                  <>
                    {(!game.players.red.id ||
                      game.players.red.name === "Waiting for player...") && (
                      <button
                        onClick={() => handleJoinGame(game._id, "red")}
                        className={`${styles.button} ${styles.redSide}`}
                      >
                        <FaUserFriends /> Join as Red
                      </button>
                    )}
                    {(!game.players.black.id ||
                      game.players.black.name === "Waiting for player...") && (
                      <button
                        onClick={() => handleJoinGame(game._id, "black")}
                        className={`${styles.button} ${styles.blackSide}`}
                      >
                        <FaUserFriends /> Join as Black
                      </button>
                    )}
                  </>
                )}
                {game.status !== "completed" && (
                  <button
                    onClick={() => handleSpectate(game._id)}
                    className={`${styles.button} ${styles.spectate}`}
                  >
                    <FaEye /> Spectate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSide={handleCreateGame}
      />
    </div>
  );
}
