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
<<<<<<< Updated upstream
=======

        // Don't update if we're in the middle of a move or if the state is too recent
        const timeSinceLastMove = Date.now() - lastMoveTimestamp;
        if (timeSinceLastMove < 2000) {
          console.log("Skipping update - too soon after move");
          return;
        }

        const shouldUpdate =
          !currentGameStateRef.current ||
          (lastFenRef.current !== data.game.fen &&
          timeSinceLastMove >= 2000);

        if (shouldUpdate) {
          console.log("Game State Update [Fetch]:", {
            currentFen: lastFenRef.current,
            newFen: data.game.fen,
            timeSinceLastMove,
            currentMoves: currentGameStateRef.current?.moves.length,
            newMoves: data.game.moves.length
          });
>>>>>>> Stashed changes

        // Only update if the new state is different
        const newFen = data.game.fen;
        if (lastFenRef.current !== newFen) {
          setGameState(prevState => {
<<<<<<< Updated upstream
            if (!prevState) return data.game;
=======
            if (!prevState) {
              console.log("Initial game state set:", data.game.fen);
              return data.game;
            }

            // Only update if the new state is actually different
            if (prevState.fen === data.game.fen) {
              return prevState;
            }

            console.log("Updating existing game state:", {
              from: prevState.fen,
              to: data.game.fen
            });
            
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      if (!gameState) return;
=======
      if (!gameState || isMakingMoveRef.current) return;
>>>>>>> Stashed changes

      isMakingMoveRef.current = true;
      setError(null);

      const moveStartTime = Date.now();
      try {
<<<<<<< Updated upstream
        // Set making move flag and stop polling
        isMakingMoveRef.current = true;
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        const playerId = gameState.turn === "red" ? gameState.players.red.id : gameState.players.black.id;
        const res = await fetch("/api/game/validate-move", {
=======
        // First validate the move
        const validateResponse = await fetch("/api/game/validate-move", {
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
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
          
          console.log("Game State Update [Move]:", {
            prevFen: prevState.fen,
            newFen: responseData.game.fen,
            prevTurn: prevState.turn,
            newTurn: responseData.game.turn,
            lastMove: responseData.game.lastMove,
            moveTime: Date.now() - moveStartTime
          });

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
>>>>>>> Stashed changes
      } finally {
        // Small delay before allowing new moves
        await new Promise(resolve => setTimeout(resolve, 100));
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

  const refetch = useCallback(
    async (silent: boolean = false) => {
      const timeSinceLastMove = Date.now() - lastMoveTimestamp;
      if (timeSinceLastMove < 1000 || isMakingMoveRef.current) {
        return;
      }

      try {
        if (!silent) setIsLoading(true);
        const response = await fetch(`/api/game/${gameId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch game state");
        }

        const data = await response.json();

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
  }, [refetch]);

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