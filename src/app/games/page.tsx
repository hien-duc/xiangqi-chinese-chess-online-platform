"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "@/styles/games.module.css";
import NewGameModal from "@/components/NewGameModal";
import { useGameStore } from "@/stores/gameStore";
import { joinGame, createGame, spectateGame } from "@/actions/gameActions";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const { games, isLoading, error, startPolling, stopPolling, handleDisconnect } = useGameStore();

  useEffect(() => {
    // Start polling when component mounts
    startPolling();

    // Stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      if (session?.user?.id) {
        // Find any games the user is part of
        const userGames = games.filter(
          game =>
            game.players.red.id === session.user.id ||
            game.players.black.id === session.user.id
        );

        // Handle disconnection for each game
        userGames.forEach(game => {
          handleDisconnect(game._id, session.user.id);
        });
      }
    };
  }, [session, games, handleDisconnect]);

  const handleJoinGame = async (gameId: string, side: "red" | "black") => {
    const result = await joinGame(gameId, side, session);
    if (result.success) {
        router.push(`/games/${gameId}`);
    }
  };

  const handleSpectate = (gameId: string) => {
    const spectateUrl = spectateGame(gameId);
    router.push(spectateUrl);
  };

  const handleCreateGame = async (side: "red" | "black") => {
    const result = await createGame(side, session);
    if (result.success && result.gameId) {
      router.push(`/games/${result.gameId}`);
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
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>
            Error:{" "}
            {typeof error === "string" ? error : (error as Error).message}
          </div>
        ) : (
          games.map((game) => (
            <div key={game._id as React.Key} className={styles.gameCard}>
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
                        onClick={() =>
                          handleJoinGame(game._id as string, "red")
                        }
                        className={`${styles.button} ${styles.redSide}`}
                      >
                        Join as Red
                      </button>
                    )}
                    {game.players.black.id == "waiting" && (
                      <button
                        onClick={() =>
                          handleJoinGame(game._id as string, "black")
                        }
                        className={`${styles.button} ${styles.blackSide}`}
                      >
                        Join as Black
                      </button>
                    )}
                  </>
                )}
                {game.status === "active" && (
                  <button
                    onClick={() => handleSpectate(game._id as string)}
                    className={`${styles.button} ${styles.spectate}`}
                  >
                    Spectate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
