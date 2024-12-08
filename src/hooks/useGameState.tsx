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
// import { isCheckmate } from "../utils/chess-rules";
import { readXiangqi, write } from "../utils/fen";
import * as cg from "../utils/types";
import { Key } from "../utils/types";

interface GameContextType {
  gameId: string;
  setGameId: (id: string) => void;
  gameState: IGameState | null;
  isLoading: boolean;
  error: string | null;
  hasInitialLoad: boolean;
  makeMove: (orig: cg.Key, dest: cg.Key) => Promise<void>;
  refetch: (silent?: boolean) => Promise<void>;
  togglePolling: (shouldPoll: boolean) => void;
}

const GameContext = createContext<GameContextType>({
  gameId: "",
  setGameId: () => {},
  gameState: null,
  isLoading: false,
  error: null,
  hasInitialLoad: false,
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
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [gameIdState, setGameId] = useState(gameId);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string | null>(null);
  const isMakingMoveRef = useRef(false);
  const currentGameStateRef = useRef<IGameState | null>(null);
  const isMountedRef = useRef(true);
  const pendingRefetchRef = useRef<boolean>(false);
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
        setIsLoading(false);
        return;
      }

      // If there's already a pending refetch, mark it for retry
      if (isMakingMoveRef.current) {
        pendingRefetchRef.current = true;
        return;
      }

      try {
        if (!silent) setIsLoading(true);
        const response = await fetch(`/api/game/${gameIdState}`);

        if (!isMountedRef.current) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (!isMountedRef.current) {
          setIsLoading(false);
          return;
        }

        if (response.status === 404) {
          setIsLoading(false);
          // Only show "Game not found" after initial load
          if (hasInitialLoad) {
            setGameState(null);
            setError("Game not found");
          }
          return;
        }

        if (!response.ok) {
          setIsLoading(false);
          throw new Error(data.error || "Failed to fetch game state");
        }

        if (!data.game) {
          setIsLoading(false);
          throw new Error("No game data received");
        }

        setIsLoading(false);
        setGameState(data.game);
        setError(null);
        lastFenRef.current = data.game.fen;
        setHasInitialLoad(true);
      } catch (err) {
        // Only show errors after initial load
        if (hasInitialLoad) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch game state";
          setError(errorMessage);
        }
      } finally {
        // If there was a pending refetch, execute it now
        if (pendingRefetchRef.current && isMountedRef.current) {
          pendingRefetchRef.current = false;
          setTimeout(() => refetch(silent), 100); // Add small delay between refetches
        }
      }
    },
    [gameIdState, hasInitialLoad]
  );

  useEffect(() => {
    currentGameStateRef.current = gameState;
  }, [gameState]);

  const makeMove = useCallback(
    async (orig: cg.Key, dest: cg.Key) => {
      if (!gameState || isMakingMoveRef.current) return;

      isMakingMoveRef.current = true;
      const previousState = currentGameStateRef.current;

      try {
        // Optimistically update the UI
        const pieces = gameState ? readXiangqi(gameState.fen) : null;
        if (pieces) {
          const piece = pieces.get(orig);
          if (piece) {
            pieces.delete(orig);
            pieces.set(dest, piece);
            const newFen = write(pieces);
            setGameState((prev) => {
              if (!prev) return null;
              const updatedState = { ...prev };
              updatedState.fen = newFen;
              updatedState.lastMove = [orig, dest];
              return updatedState as IGameState;
            });
          }
        }

        const response = await fetch("/api/game/validate-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: gameIdState,
            orig,
            dest,
            fen: gameState?.fen,
            turn: gameState?.turn,
            playerId: gameState?.players[gameState?.turn]?.id,
          }),
        });

        const responseData = await response.json();
        if (!response.ok || responseData.error) {
          // Revert to previous state on error
          setGameState(previousState);
          throw new Error(
            responseData.error ||
              (responseData.details
                ? Object.entries(responseData.details)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(", ")
                : "Invalid move")
          );
        }

        // setLastMoveTimestamp(Date.now());
        await refetch(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to make move");
        setGameState(previousState);
      } finally {
        isMakingMoveRef.current = false;
        if (pendingRefetchRef.current) {
          pendingRefetchRef.current = false;
          refetch(true);
        }
      }
    },
    [gameIdState, gameState, refetch]
  );

  useEffect(() => {
    if (!isValidGameContext) return;

    isMountedRef.current = true;
    const isFirstFetch = true;

    if (gameIdState) {
      refetch(!isFirstFetch);

      // Only start polling if we're on a game page (not during creation)
      if (pathname?.startsWith("/games/")) {
        pollingIntervalRef.current = setInterval(() => {
          if (isMountedRef.current && !isMakingMoveRef.current) {
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
    hasInitialLoad,
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
