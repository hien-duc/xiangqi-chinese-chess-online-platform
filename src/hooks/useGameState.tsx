"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { IGameState } from "../lib/db/models/gameState";

interface GameContextType {
  gameId: string;
  setGameId: (id: string) => void;
  gameState: IGameState | null;
  isLoading: boolean;
  error: string | null;
  makeMove: (orig: string, dest: string) => Promise<void>;
  refetch: (silent?: boolean) => Promise<void>;
  togglePolling: (shouldPoll: boolean) => void;
}

const GameContext = createContext<GameContextType>({
  gameId: "",
  setGameId: () => { },
  gameState: null,
  isLoading: false,
  error: null,
  makeMove: async () => { },
  refetch: async () => { },
  togglePolling: () => { },
});

const POLLING_INTERVAL = 2000;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gameId, setGameId] = useState("55153a8014829a865bbf700d");
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load only
  const [error, setError] = useState<string | null>(null);
  const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string | null>(null);
  const isMakingMoveRef = useRef(false);
  const currentGameStateRef = useRef<IGameState | null>(null);

  useEffect(() => {
    currentGameStateRef.current = gameState;
  }, [gameState]);

  const fetchGameState = useCallback(
    async (silent: boolean = false) => {
      if (!gameId || isMakingMoveRef.current) return;

      try {
        if (!silent) setIsLoading(true);
        const response = await fetch(`/api/game/${gameId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch game");
        }
        const data = await response.json();
        if (!data.game) {
          throw new Error("No game data received");
        }

        // Only update if the new state is different
        const newFen = data.game.fen;
        if (lastFenRef.current !== newFen) {
          setGameState(prevState => {
            if (!prevState) return data.game;
            return {
              ...prevState,
              ...data.game,
              lastMove: data.game.lastMove || prevState.lastMove,
              premove: prevState.premove
            };
          });
          lastFenRef.current = newFen;
        }
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        if (!gameState) setGameState(null);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [gameId]
  );

  const makeMove = useCallback(
    async (orig: string, dest: string) => {
      if (!gameState) return;

      try {
        // Set making move flag and stop polling
        isMakingMoveRef.current = true;
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        const playerId = gameState.turn === "red" ? gameState.players.red.id : gameState.players.black.id;
        const res = await fetch("/api/game/validate-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: gameId,
            orig,
            dest,
            fen: gameState.fen,
            turn: gameState.turn,
            playerId: playerId,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Move validation failed");
        }

        if (data.success && data.game) {
          // Optimistically update the state first
          setGameState(prevState => {
            if (!prevState) return data.game;
            const updatedState = {
              ...prevState,
              ...data.game,
              lastMove: [orig, dest],
              premove: prevState.premove,
            };
            return updatedState;
          });

          // Update the lastFenRef after state is updated
          lastFenRef.current = data.game.fen;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to make move";
        setError(errorMessage);
        // Refresh the game state to ensure consistency
        await fetchGameState(true);
      } finally {
        isMakingMoveRef.current = false;
        // Resume polling with a clean interval
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            fetchGameState(true);
          }, POLLING_INTERVAL);
        }
      }
    },
    [gameId, gameState, fetchGameState]
  );

  const togglePolling = useCallback(
    (shouldPoll: boolean) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (shouldPoll) {
        pollingIntervalRef.current = setInterval(() => {
          fetchGameState(true);
        }, POLLING_INTERVAL);
      }
    },
    [fetchGameState]
  );

  useEffect(() => {
    fetchGameState();
    pollingIntervalRef.current = setInterval(() => {
      fetchGameState(true);
    }, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchGameState]);

  const value = {
    gameId,
    setGameId,
    gameState,
    isLoading,
    error,
    makeMove,
    refetch: fetchGameState,
    togglePolling,
    lastFenRef,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};