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
  const [gameId, setGameId] = useState("");
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

  const makeMove = useCallback(
    async (orig: string, dest: string) => {
      if (!gameState || isMakingMoveRef.current) return;

      isMakingMoveRef.current = true;
      setError(null);

      try {
        // First validate the move
        const validateResponse = await fetch("/api/game/validate-move", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: gameId,
            orig,
            dest,
            fen: gameState.fen,
            turn: gameState.turn,
            playerId: gameState.turn === "red" ? gameState.players.red.id : gameState.players.black.id,
          }),
        });

        const responseData = await validateResponse.json();

        if (!validateResponse.ok) {
          throw new Error(responseData.error || "Move validation failed");
        }

        if (!responseData.success || !responseData.game) {
          throw new Error("Invalid response from server");
        }

        // Update local state with the validated move
        setGameState(prevState => {
          if (!prevState) return null;

          const newState = {
            ...prevState,
            ...responseData.game,
            lastMove: responseData.game.lastMove,
            turn: responseData.game.turn,
            fen: responseData.game.fen,
            moves: responseData.game.moves
          };

          // Update refs immediately to prevent race conditions
          lastFenRef.current = responseData.game.fen;
          currentGameStateRef.current = newState;

          return newState;
        });

        setLastMoveTimestamp(Date.now());

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to make move";
        setError(errorMessage);
        if (err instanceof Error) {
          console.error("Move error:", err);
        }
      } finally {
        // Small delay before allowing new moves
        await new Promise(resolve => setTimeout(resolve, 100));
        isMakingMoveRef.current = false;
      }
    },
    [gameId, gameState]
  );

  const refetch = useCallback(
    async (silent: boolean = false) => {
      const timeSinceLastMove = Date.now() - lastMoveTimestamp;
      if (timeSinceLastMove < 1000 || isMakingMoveRef.current) {
        return;
      }

      try {
        if (!silent) setIsLoading(true);
        const response = await fetch(`/api/game/${gameId}`);
        const data = await response.json();

        if (response.status === 404) {
          setGameState(null);
          setError("Game not found");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch game state");
        }

        if (!data.game) {
          throw new Error("No game data received");
        }

        // Only update if the state has actually changed
        if (data.game.fen !== lastFenRef.current) {
          setGameState(prevState => {
            if (!prevState) return data.game;
            return {
              ...prevState,
              fen: data.game.fen,
              moves: data.game.moves,
              turn: data.game.turn,
              status: data.game.status,
              winner: data.game.winner,
              gameOver: data.game.gameOver,
              check: data.game.check,
              lastMove: data.game.lastMove
            };
          });
          lastFenRef.current = data.game.fen;
        }
      } catch (err) {
        if (!silent) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch game state";
          setError(errorMessage);
          console.error("Fetch error:", err);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [gameId, lastMoveTimestamp]
  );

  useEffect(() => {
    // Don't start polling if there's no gameId
    if (!gameId) return;

    const startPolling = () => {
      if (pollingIntervalRef.current) return;

      pollingIntervalRef.current = setInterval(async () => {
        if (!isMakingMoveRef.current) {
          await refetch(true);
        }
      }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    startPolling();
    return () => stopPolling();
  }, [refetch, gameId]);

  const value = {
    gameId,
    setGameId,
    gameState,
    isLoading,
    error,
    makeMove,
    refetch,
    togglePolling: () => { },
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