"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { IGameState } from "../lib/db/models/gameState";
import WinModal from "../components/WinModal";
import { isCheckmate } from "../utils/chess-rules";

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
  setGameId: () => {},
  gameState: null,
  isLoading: false,
  error: null,
  makeMove: async () => {},
  refetch: async () => {},
  togglePolling: () => {},
});

const POLLING_INTERVAL = 2000;

interface GameProviderProps {
  children: React.ReactNode;
  gameId: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  gameId,
}) => {
  const pathname = usePathname();
  const [gameIdState, setGameId] = useState(gameId);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string | null>(null);
  const isMakingMoveRef = useRef(false);
  const currentGameStateRef = useRef<IGameState | null>(null);
  const isMountedRef = useRef(true);
  // Allow fetching on both game pages and during game creation
  const isValidGameContext =
    pathname?.startsWith("/games/") || pathname === "/games";

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Clear everything when leaving valid game contexts
  useEffect(() => {
    if (!isValidGameContext) {
      stopPolling();
      setGameState(null);
      setError(null);
      setIsLoading(false);
      isMountedRef.current = false;
    } else {
      isMountedRef.current = true;
    }
  }, [isValidGameContext, stopPolling]);

  const refetch = useCallback(
    async (silent: boolean = false) => {
      if (!gameIdState || !isMountedRef.current) {
        return;
      }

      const timeSinceLastMove = Date.now() - lastMoveTimestamp;
      if (timeSinceLastMove < 1000 || isMakingMoveRef.current) {
        return;
      }

      try {
        if (!silent && isMountedRef.current) setIsLoading(true);
        const response = await fetch(`/api/game/${gameIdState}`);

        if (!isMountedRef.current) return;

        const data = await response.json();

        if (!isMountedRef.current) return;

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

        if (isMountedRef.current) {
          setGameState(data.game);
          setError(null);
          lastFenRef.current = data.game.fen;
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch game state";
          setError(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [gameIdState, lastMoveTimestamp]
  );

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
            id: gameIdState,
            orig,
            dest,
            fen: gameState.fen,
            turn: gameState.turn,
            playerId:
              gameState.turn === "red"
                ? gameState.players.red.id
                : gameState.players.black.id,
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
        setGameState((prevState) => {
          if (!prevState) return null;

          const newState = {
            ...prevState,
            ...responseData.game,
            lastMove: responseData.game.lastMove,
            turn: responseData.game.turn,
            fen: responseData.game.fen,
            moves: responseData.game.moves,
          };

          // Update refs immediately to prevent race conditions
          lastFenRef.current = responseData.game.fen;
          currentGameStateRef.current = newState;

          return newState;
        });

        setLastMoveTimestamp(Date.now());

        // Check for checkmate after each move
        if (isCheckmate(responseData.game.fen)) {
          // The turn in responseData.game.turn is already switched to the next player
          // So if turn is 'red', it means black just won
          const winningColor =
            responseData.game.turn === "red" ? "Black" : "Red";
          setWinner(winningColor);
          setShowWinModal(true);

          // Update game status in database
          try {
            await fetch(`/api/game/${gameIdState}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "completed",
                gameOver: true,
                winner: winningColor,
              }),
            });

            // Update local state
            setGameState((prevState) => {
              if (!prevState) return null;
              return {
                ...prevState,
                status: "completed",
                gameOver: true,
                winner: winningColor,
              };
            });
          } catch (err) {
            console.error("Failed to update game status:", err);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to make move";
        setError(errorMessage);
        if (err instanceof Error) {
          console.error("Move error:", err);
        }
      } finally {
        // Small delay before allowing new moves
        await new Promise((resolve) => setTimeout(resolve, 100));
        isMakingMoveRef.current = false;
      }
    },
    [gameIdState, gameState]
  );

  useEffect(() => {
    if (!isValidGameContext) return;

    isMountedRef.current = true;

    if (gameIdState) {
      refetch();

      // Only start polling if we're on a game page (not during creation)
      if (pathname?.startsWith("/game/")) {
        pollingIntervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            refetch(true);
          }
        }, POLLING_INTERVAL);
      }
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
      setGameState(null);
      setError(null);
      setIsLoading(false);
    };
  }, [gameIdState, refetch, isValidGameContext, pathname, stopPolling]);

  const togglePolling = useCallback(
    (shouldPoll: boolean) => {
      if (shouldPoll) {
        // Start polling if not already polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            refetch(true);
          }, POLLING_INTERVAL);
        }
      } else {
        // Stop polling if currently polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    },
    [refetch]
  );

  const value = {
    gameId: gameIdState,
    setGameId,
    gameState,
    isLoading,
    error,
    makeMove,
    refetch,
    togglePolling,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      {showWinModal && (
        <WinModal
          isOpen={showWinModal}
          winner={winner}
          onClose={() => setShowWinModal(false)}
          gameId={gameIdState}
        />
      )}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
