"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from "react";
import { IGameState } from "../lib/db/models/gameState";

// Define action types
type GameAction =
  | { type: 'SET_GAME_ID'; payload: string }
  | { type: 'SET_GAME_STATE'; payload: IGameState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

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

interface GameState {
  gameId: string;
  gameState: IGameState | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: GameState = {
  gameId: "55153a8014829a865bbf700d",
  gameState: null,
  isLoading: true,
  error: null,
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME_ID':
      return { ...state, gameId: action.payload };
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return { ...initialState, gameId: state.gameId };
    default:
      return state;
  }
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
const MOVE_THROTTLE = 500;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string | null>(null);
  const isMakingMoveRef = useRef(false);
  const lastMoveTimestampRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchGameState = useCallback(
    async (silent: boolean = false) => {
      if (!state.gameId || isMakingMoveRef.current) return;

      // Cancel any ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (!silent) {
          dispatch({ type: 'SET_LOADING', payload: true });
        }

        const response = await fetch(`/api/game/${state.gameId}`, {
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error("Failed to fetch game");
        }

        const data = await response.json();
        if (!data.game) {
          throw new Error("No game data received");
        }

        // Only update state if FEN has changed
        if (lastFenRef.current !== data.game.fen) {
          lastFenRef.current = data.game.fen;
          dispatch({ type: 'SET_GAME_STATE', payload: data.game });
          dispatch({ type: 'SET_ERROR', payload: null });
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        if (!state.gameState) {
          dispatch({ type: 'SET_GAME_STATE', payload: null });
        }
      } finally {
        if (!silent) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    },
    [state.gameId, state.gameState]
  );

  const makeMove = useCallback(
    async (orig: string, dest: string) => {
      const now = Date.now();
      if (now - lastMoveTimestampRef.current < MOVE_THROTTLE || !state.gameState) return;

      isMakingMoveRef.current = true;
      try {
        const playerId = state.gameState.turn === "red"
          ? state.gameState.players.red.id
          : state.gameState.players.black.id;

        const res = await fetch("/api/game/validate-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: state.gameId,
            orig,
            dest,
            fen: state.gameState.fen,
            turn: state.gameState.turn,
            playerId,
          }),
        });

        if (!res.ok) {
          throw new Error("Move validation failed");
        }

        const newState = await res.json();
        dispatch({ type: 'SET_GAME_STATE', payload: newState.game });
        lastFenRef.current = newState.game.fen;
        lastMoveTimestampRef.current = now;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to make move";
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        isMakingMoveRef.current = false;
      }
    },
    [state.gameId, state.gameState]
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

  // Initialize polling
  useEffect(() => {
    fetchGameState();
    togglePolling(true);

    return () => {
      togglePolling(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchGameState, togglePolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const setGameId = useCallback((id: string) => {
    dispatch({ type: 'SET_GAME_ID', payload: id });
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      setGameId,
      makeMove,
      refetch: fetchGameState,
      togglePolling,
    }),
    [state, setGameId, makeMove, fetchGameState, togglePolling]
  );

  return (
    <GameContext.Provider value={contextValue}>
      {children}
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