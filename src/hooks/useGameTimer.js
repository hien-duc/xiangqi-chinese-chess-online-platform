import { useState, useEffect, useCallback, useRef } from "react";
import { useGameContext } from "./useGameState";
import { getTurnColor } from "../lib/game/fen";

const DEFAULT_TIME = 15 * 60; // 15 minutes in seconds

export const useGameTimer = () => {
  const { gameState, gameId } = useGameContext();
  const [times, setTimes] = useState({
    red: DEFAULT_TIME,
    black: DEFAULT_TIME,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [timeoutWinner, setTimeoutWinner] = useState(null);
  const [timeoutLoser, setTimeoutLoser] = useState(null);

  // Refs to track moves and times
  const lastMoveRef = useRef(null);
  const movesCountRef = useRef(0);
  const lastTimesRef = useRef({ red: DEFAULT_TIME, black: DEFAULT_TIME });

  // Initialize times from game state
  useEffect(() => {
    if (gameState?.times) {
      setTimes(gameState.times);
      lastTimesRef.current = gameState.times;
    }
  }, [gameState?.times]);

  // Update time locally every second for display
  useEffect(() => {
    let interval;

    if (isRunning && gameState?.status === "active") {
      interval = setInterval(() => {
        const currentTurn = getTurnColor(gameState?.fen);
        if (!currentTurn) return;

        const now = new Date().getTime();
        const elapsedSinceLastMove = lastMoveRef.current
          ? Math.floor((now - lastMoveRef.current) / 1000)
          : 0;

        setTimes((prevTimes) => {
          const newTimes = { ...prevTimes };

          // Only update current player's time based on elapsed time
          newTimes[currentTurn] = Math.max(
            0,
            lastTimesRef.current[currentTurn] - elapsedSinceLastMove
          );

          // Check for timeout
          if (newTimes[currentTurn] === 0) {
            stopTimer();
            setTimeoutWinner(currentTurn === "red" ? "black" : "red");
            setTimeoutLoser(currentTurn);
            setShowWinModal(true);
            updateTimeInDB(newTimes);
          }

          return newTimes;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, gameState?.status, gameState?.fen]);

  // Update DB only when moves are made
  useEffect(() => {
    if (!gameState?.moves || !isRunning) return;

    const currentMovesCount = gameState.moves.length;
    if (currentMovesCount !== movesCountRef.current) {
      // A move was made
      const now = new Date().getTime();
      const currentTurn = getTurnColor(gameState.fen);
      const previousTurn = currentTurn === "red" ? "black" : "red";

      if (lastMoveRef.current) {
        // Calculate elapsed time since last move
        const elapsedSeconds = Math.floor((now - lastMoveRef.current) / 1000);

        // Update times with elapsed time
        const updatedTimes = {
          ...lastTimesRef.current,
          [previousTurn]: Math.max(
            0,
            lastTimesRef.current[previousTurn] - elapsedSeconds
          ),
        };

        // Update both display and stored times
        lastTimesRef.current = updatedTimes;
        setTimes(updatedTimes);

        // Update DB
        updateTimeInDB(updatedTimes);
      }

      // Update move tracking
      lastMoveRef.current = now;
      movesCountRef.current = currentMovesCount;
    }
  }, [gameState?.moves, gameState?.fen, isRunning]);

  const updateTimeInDB = useCallback(
    async (currentTimes) => {
      if (!gameId) return;
      try {
        await fetch(`/api/v1/game/${gameId}/time`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ times: currentTimes }),
        });
      } catch (error) {
        console.error("Failed to update time in DB:", error);
      }
    },
    [gameId]
  );

  const startTimer = useCallback(() => {
    setIsRunning(true);
    const now = new Date().getTime();
    lastMoveRef.current = now;
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleWinModalClose = useCallback(() => {
    setShowWinModal(false);
    setTimeoutWinner(null);
    setTimeoutLoser(null);
  }, []);

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
