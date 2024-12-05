import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IGameState } from "@/lib/db/models/gameState";

interface GameStore {
  games: IGameState[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  setGames: (games: IGameState[]) => void;
  updateGame: (gameId: string, updatedGame: IGameState) => void;
  addGame: (game: IGameState) => void;
  fetchGames: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      let pollInterval: NodeJS.Timeout | null = null;

      return {
        games: [],
        isLoading: false,
        error: null,
        lastFetched: null,
        setGames: (games) => set({ games }),
        updateGame: (gameId, updatedGame) =>
          set((state) => ({
            games: state.games.map((game) =>
              game.id === gameId ? updatedGame : game
            ),
          })),
        addGame: (game) =>
          set((state) => ({
            games: [...state.games, game],
          })),
        fetchGames: async () => {
          // Don't fetch if we've fetched within the last 10 seconds
          const now = Date.now();
          if (get().lastFetched !== null && now - get().lastFetched < 10000) {
            return;
          }

          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/games");
            if (response.ok) {
              const data = await response.json();
              set({
                games: data.games,
                lastFetched: now,
                isLoading: false,
              });
            } else {
              throw new Error("Failed to fetch games");
            }
          } catch (error) {
            console.error("Error fetching games:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch games",
              isLoading: false,
            });
          }
        },
        startPolling: () => {
          if (!pollInterval) {
            // Initial fetch
            get().fetchGames();
            // Start polling every 10 seconds
            pollInterval = setInterval(() => {
              get().fetchGames();
            }, 10000);
          }
        },
        stopPolling: () => {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        },
      };
    },
    {
      name: "game-store",
      partialize: (state) => ({ games: state.games }), // Only persist games array
    }
  )
);
