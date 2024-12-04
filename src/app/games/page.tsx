"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "@/styles/games.module.css";
import NewGameModal from "@/components/NewGameModal";

interface Player {
  id: string;
  isGuest: boolean;
  name: string;
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
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const handleJoinGame = async (gameId: string, side: "red" | "black") => {
    try {
      const playerInfo = {
        id:
          session?.user?.id ||
          "guest-" + Math.random().toString(36).substr(2, 9),
        isGuest: !session?.user,
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

  const handleCreateGame = async (side: "red" | "black") => {
    try {
      const playerInfo = {
        id:
          session?.user?.id ||
          "guest-" + Math.random().toString(36).substr(2, 9),
        isGuest: !session?.user,
        name: session?.user?.name || "Guest Player",
      };

      const response = await fetch("/api/game/create", {
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

      if (response.ok && data.success && data.gameId) {
        router.push(`/games/${data.gameId}`);
      } else {
        console.error("Failed to create game:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Available Games</h1>
        <button
          className={styles.newGameButton}
          onClick={() => setIsModalOpen(true)}
        >
          New Game
        </button>
      </div>
      <NewGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSide={handleCreateGame}
      />
      <div className={styles.gamesList}>
        {games.map((game) => (
          <div key={game._id} className={styles.gameCard}>
            <div className={styles.gameInfo}>
              <div className={styles.players}>
                <div className={styles.player}>
                  <span className={styles.side}>Red:</span>
                  <span className={styles.name}>
                    {game.players.red.name || "Waiting..."}
                  </span>
                </div>
                <div className={styles.player}>
                  <span className={styles.side}>Black:</span>
                  <span className={styles.name}>
                    {game.players.black.name || "Waiting..."}
                  </span>
                </div>
              </div>
              <div className={styles.status}>
                Status:{" "}
                <span className={styles[game.status]}>{game.status}</span>
              </div>
              <div className={styles.created}>
                Created: {new Date(game.createdAt).toLocaleString()}
              </div>
            </div>
            <div className={styles.actions}>
              {game.status === "waiting" && (
                <>
                  {game.players.red.id == "waiting" && (
                    <button
                      onClick={() => handleJoinGame(game._id, "red")}
                      className={`${styles.button} ${styles.redSide}`}
                    >
                      Join as Red
                    </button>
                  )}
                  {game.players.black.id == "waiting" && (
                    <button
                      onClick={() => handleJoinGame(game._id, "black")}
                      className={`${styles.button} ${styles.blackSide}`}
                    >
                      Join as Black
                    </button>
                  )}
                </>
              )}
              {game.status === "active" && (
                <button
                  onClick={() => handleSpectate(game._id)}
                  className={`${styles.button} ${styles.spectate}`}
                >
                  Spectate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
