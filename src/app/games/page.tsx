"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "@/styles/Games.module.css";
import NewGameModal from "@/components/NewGameModal";
import { useGameStore } from "@/stores/gameStore";
import { FaChessBoard, FaUserFriends, FaRobot, FaEye } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

interface Player {
  id: string;
  isGuest: boolean;
  name: string;
  isBot?: boolean;
}

interface Game {
  _id: string;
  players: {
    red: Player;
    black: Player;
  };
  status: "waiting" | "active" | "completed";
  createdAt: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
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

      const response = await fetch(`/api/game/${gameId}/join`, {
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
        console.error("Failed to join game:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error joining game:", error);
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

      const response = await fetch("/api/games", {
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

      const data = await response.json();
      if (data.game) {
        router.push(`/games/${data.game._id}`);
      }
    } catch (error) {
      console.error("Error creating game:", error);
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
          <button onClick={fetchGames} className={styles.refreshButton}>
            <MdRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
        {!isLoading && games?.length > 0 && (
          <button
            className={styles.newGameButton}
            onClick={() => setIsModalOpen(true)}
          >
            New Game
          </button>
        )}
      </div>

      <NewGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSide={handleCreateGame}
      />

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loader}></div>
          <p>Loading games...</p>
        </div>
      ) : games.length === 0 ? (
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
    </div>
  );
}
