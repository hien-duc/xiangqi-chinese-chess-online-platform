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
import WinModal from "../components/WinModal";
import { isCheckmate } from "../utils/chess-rules";
import { useError } from "../context/ErrorContext";
import { useComputerPlayer } from "./useComputerPlayer";
import { getTurnColor } from "@/utils/fen";

interface GameContextType {
  gameId: string;
  setGameId: (id: string) => void;
  gameState: IGameState | null;
  isLoading: boolean;
  makeMove: (orig: string, dest: string) => Promise<void>;
  refetch: (silent?: boolean) => Promise<void>;
  togglePolling: (shouldPoll: boolean) => void;
  forfeitGame: (leavingPlayerId?: string) => Promise<void>;
}

const GameContext = createContext<GameContextType>({
  gameId: "",
  setGameId: () => {},
  gameState: null,
  isLoading: false,
  makeMove: async () => {},
  refetch: async () => {},
  togglePolling: () => {},
  forfeitGame: async () => {},
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
  const [gameIdState, setGameId] = useState(gameId);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load only

  const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string | null>(null);
  const isMakingMoveRef = useRef(false);
  const currentGameStateRef = useRef<IGameState | null>(null);
  const { showError } = useError();
  const { getComputerMove, isThinking } = useComputerPlayer();

  useEffect(() => {
    currentGameStateRef.current = gameState;
  }, [gameState]);

  const makeMove = useCallback(
    async (orig: string, dest: string) => {
      if (!gameState || isMakingMoveRef.current) return;

      isMakingMoveRef.current = true;
      const currentTurn = getTurnColor(gameState.fen);

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
            playerId:
              currentTurn === "red"
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
          const currentTurn = getTurnColor(responseData.game.fen);

          const winningColor = currentTurn === "red" ? "Black" : "Red";
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
        showError(errorMessage);
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

  const refetch = useCallback(
    async (silent: boolean = false) => {
      if (!gameIdState) return;

      const timeSinceLastMove = Date.now() - lastMoveTimestamp;
      if (timeSinceLastMove < 1000 || isMakingMoveRef.current) {
        return;
      }

      try {
        if (!silent) setIsLoading(true);
        const response = await fetch(`/api/game/${gameIdState}`);
        const data = await response.json();

        if (response.status === 404) {
          // If game is not found, immediately stop polling and reset state
          setGameState(null);
          togglePolling(false);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch game state");
        }

        if (!data.game) {
          throw new Error("No game data received");
        }

        // Check for inactive games
        if (
          data.game.status === "active" &&
          data.game.moves &&
          data.game.moves.length > 0
        ) {
          const lastMoveTime = new Date(data.game.updatedAt).getTime();
          const now = new Date().getTime();
          const inactiveTime = now - lastMoveTime;
          const currentTurn = getTurnColor(data.game.fen);

          // 2 minutes
          const timeoutThreshold = 2 * 60 * 1000;

          if (inactiveTime > timeoutThreshold) {
            // The current turn player has been inactive too long
            const inactivePlayer = currentTurn; // red or black
            const winner = inactivePlayer === "red" ? "Black" : "Red";

            // Complete the game and update stats
            await fetch(`/api/game/${gameIdState}/complete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                winner,
                forfeitedBy: inactivePlayer,
                timeoutLoss: true,
              }),
            });

            data.game.status = "completed";
            data.game.gameOver = true;
            data.game.winner = winner;
          }
        }

        // Update state if any field has changed
        setGameState((prevState) => {
          if (!prevState) return data.game;
          const previousTurn = getTurnColor(prevState.fen);
          const currentTurn = getTurnColor(data.game.fen);

          // Check if any field has changed
          const hasChanged =
            prevState.fen !== data.game.fen ||
            prevState.status !== data.game.status ||
            previousTurn !== currentTurn ||
            prevState.players.red.id !== data.game.players.red.id ||
            prevState.players.black.id !== data.game.players.black.id ||
            JSON.stringify(prevState.moves) !==
              JSON.stringify(data.game.moves) ||
            JSON.stringify(prevState.messages) !==
              JSON.stringify(data.game.messages);

          // Stop polling if game is completed or inactive
          if (
            data.game.status === "completed" ||
            data.game.gameOver ||
            data.game.status === "waiting"
          ) {
            togglePolling(false);
          }

          // Show win modal if game just completed
          if (
            data.game.status === "completed" &&
            data.game.winner &&
            !showWinModal
          ) {
            setWinner(data.game.winner);
            setShowWinModal(true);
          }

          return hasChanged ? data.game : prevState;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch game state";
        showError(errorMessage);
        console.error("Fetch error:", err);

        // Stop polling on any error
        togglePolling(false);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [gameIdState, lastMoveTimestamp, showWinModal]
  );

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

  const forfeitGame = useCallback(
    async (leavingPlayerId?: string) => {
      try {
        let currentPlayer: "red" | "black";

        if (leavingPlayerId) {
          // If we have a specifi c player ID that's leaving
          currentPlayer =
            gameState.players.red.id === leavingPlayerId ? "red" : "black";
        } else {
          // Fallback to current turn if no specific player ID
          currentPlayer = getTurnColor(gameState.fen);
        }

        const winner = currentPlayer === "red" ? "Black" : "Red";

        await fetch(`/api/game/${gameIdState}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            winner,
            forfeitedBy: currentPlayer,
            timeoutLoss: false,
          }),
        });

        setGameState((prevState) => {
          if (!prevState) return null;
          return {
            ...prevState,
            status: "completed",
            gameOver: true,
            winner,
            forfeitedBy: currentPlayer,
          };
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to forfeit game";
        showError(errorMessage);
        console.error("Forfeit error:", err);
      }
    },
    [gameIdState, showError, gameState]
  );

  useEffect(() => {
    const handleBotMove = async () => {
      if (!gameState || gameState.status !== "active" || isThinking) return;
      const currentTurn = getTurnColor(gameState.fen);

      const currentPlayer = gameState.players[currentTurn];
      if (currentPlayer.isBot) {
        try {
          const botMove = await getComputerMove(gameState.fen);
          console.log("Current FEN:", gameState.fen);
          console.log("Bot move received:", botMove);
          if (botMove) {
            // Split into 2-character chunks (e.g., "a0b1" -> ["a0", "b1"])
            const [orig, dest] = botMove.match(/.{1,2}/g) || [];
            console.log("Parsed move - Origin:", orig, "Destination:", dest);
            if (orig && dest) {
              await makeMove(orig, dest);
            }
          }
        } catch (error) {
          console.error("Bot move error:", error);
          showError("Failed to make bot move");
        }
      }
    };

    handleBotMove();
  }, [gameState?.fen, gameState?.status]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Start polling when gameId changes or game status changes
  useEffect(() => {
    if (gameIdState && (!gameState || gameState.status === "active")) {
      refetch();
      togglePolling(true);
    } else {
      togglePolling(false);
    }
    return () => togglePolling(false);
  }, [gameIdState, togglePolling, gameState?.status]);

  const value = {
    gameId: gameIdState,
    setGameId,
    gameState,
    isLoading,
    makeMove,
    refetch,
    togglePolling,
    forfeitGame,
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
