import { useState, useEffect, useCallback } from "react";
import { useGameContext } from "./useGameState";
import { getTurnColor } from "../utils/fen";
const DEFAULT_TIME = 10 * 60; // 10 minutes in seconds

export const useGameTimer = (initialTime = DEFAULT_TIME) => {
  const { gameState, gameId } = useGameContext();
  const [times, setTimes] = useState({
    red: initialTime,
    black: initialTime,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [timeoutWinner, setTimeoutWinner] = useState(null);
  const [timeoutLoser, setTimeoutLoser] = useState(null);

  // Initialize or sync times with server
  useEffect(() => {
    const initTimes = async () => {
      if (!gameId) return;

      try {
        const response = await fetch(`/api/game/${gameId}/time`, {
          method: "GET",
        });
        const data = await response.json();
        if (data.times) {
          setTimes(data.times);
        } else {
          // Initialize times on server
          await fetch(`/api/game/${gameId}/time`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              times: {
                red: initialTime,
                black: initialTime,
              },
            }),
          });
        }
      } catch (error) {
        console.error("Failed to initialize/sync times:", error);
      }
    };

    initTimes();
  }, [gameId, initialTime]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleWinModalClose = useCallback(() => {
    setShowWinModal(false);
    setTimeoutWinner(null);
    setTimeoutLoser(null);
  }, []);

  // Update time locally every second, but sync with server less frequently
  useEffect(() => {
    let interval;
    let syncInterval;
    const SYNC_INTERVAL = 10; // Sync with server every 10 seconds
    let localTimes = { ...times };
    let secondsSinceSync = 0;

    if (isRunning) {
      interval = setInterval(() => {
        const currentTurn = getTurnColor(gameState?.fen);
        if (!currentTurn) return;

        // Update time locally
        localTimes = {
          ...localTimes,
          [currentTurn]: Math.max(0, localTimes[currentTurn] - 1),
        };
        setTimes(localTimes);
        secondsSinceSync++;

        // Check for time out
        if (localTimes[currentTurn] === 0) {
          stopTimer();
          setTimeoutWinner(currentTurn === "red" ? "Black" : "Red");
          setTimeoutLoser(currentTurn);
          setShowWinModal(true);
        }

        // Sync with server every SYNC_INTERVAL seconds or when time is low
        if (
          secondsSinceSync >= SYNC_INTERVAL ||
          localTimes[currentTurn] <= 30
        ) {
          syncWithServer(localTimes);
          secondsSinceSync = 0;
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      if (secondsSinceSync > 0) {
        syncWithServer(localTimes); // Sync one last time when cleaning up
      }
    };
  }, [isRunning, gameState?.fen]);

  // Function to sync time with server
  const syncWithServer = async (timesToSync) => {
    if (!gameId) return;

    try {
      const response = await fetch(`/api/game/${gameId}/time`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ times: timesToSync }),
      });
      const data = await response.json();

      // Handle any server-side game over conditions
      if (data.gameOver) {
        stopTimer();
        setTimeoutWinner(data.winner);
        setTimeoutLoser(data.winner === "Red" ? "black" : "red");
        setShowWinModal(true);
      }
    } catch (error) {
      console.error("Failed to sync time with server:", error);
    }
  };

  // Stop timer if game is completed
  useEffect(() => {
    if (gameState?.status === "completed") {
      stopTimer();
    }
  }, [gameState?.status, stopTimer]);

  return {
    times,
    isRunning,
    startTimer,
    stopTimer,
    showWinModal,
    timeoutWinner,
    timeoutLoser,
    onWinModalClose: handleWinModalClose,
  };
};
