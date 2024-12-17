import { useState, useEffect, useCallback } from "react";
import { useGameContext } from "./useGameState";

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

  // Update time on server
  const updateTime = useCallback(async () => {
    if (!gameId || !gameState?.turn || !isRunning) return;

    const newTimes = {
      ...times,
      [gameState.turn]: Math.max(0, times[gameState.turn] - 1),
    };

    try {
      const response = await fetch(`/api/game/${gameId}/time`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ times: newTimes }),
      });
      const data = await response.json();

      // Update local times
      setTimes(data.times);

      // Check if game is over due to time
      if (data.gameOver) {
        stopTimer();
        setTimeoutWinner(data.winner);
        setTimeoutLoser(data.winner === "Red" ? "black" : "red");
        setShowWinModal(true);
      }
    } catch (error) {
      console.error("Failed to update time:", error);
    }
  }, [gameId, gameState?.turn, times, isRunning, stopTimer]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && gameState?.status === "active") {
      interval = setInterval(updateTime, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameState?.status, updateTime]);

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
