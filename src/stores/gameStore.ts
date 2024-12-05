import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IGameState } from "@/lib/db/models/gameState";

interface GameStore {
  games: IGameState[];
  currentGame: IGameState | null;
  isLoading: boolean;
  error: string | null;
  chatLoading: boolean;
  chatError: string | null;
  lastFetched: number | null;
  setGames: (games: IGameState[]) => void;
  updateGame: (gameId: string, updatedGame: IGameState) => void;
  addGame: (game: IGameState) => void;
  fetchGames: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  handleDisconnect: (gameId: string, playerId: string) => Promise<void>;
  setCurrentGame: (game: IGameState) => void;
  sendChatMessage: (gameId: string, message: { userId: string; userName: string; message: string }) => Promise<void>;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      let pollInterval: NodeJS.Timeout | null = null;

      return {
        games: [],
        currentGame: null,
        isLoading: false,
        error: null,
        chatLoading: false,
        chatError: null,
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
        handleDisconnect: async (gameId: string, playerId: string) => {
          try {
            // First check if the game exists in our local state
            const game = get().games.find(g => g._id === gameId);
            if (!game) {
              return; // Game doesn't exist, no need to handle disconnection
            }

            // Only handle disconnection if the player is actually in the game
            const isPlayerInGame = 
              game.players.red.id === playerId || 
              game.players.black.id === playerId;

            if (!isPlayerInGame) {
              return; // Player is not in this game
            }

            const response = await fetch("/api/game/disconnect", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ gameId, playerId }),
            });

            if (!response.ok) {
              throw new Error("Failed to handle disconnection");
            }

            // Remove the game from the local state
            set((state) => ({
              games: state.games.filter((g) => g._id !== gameId),
            }));

          } catch (error) {
            console.error("Error handling disconnection:", error);
            set({ error: "Failed to handle disconnection" });
          }
        },
        setCurrentGame: (game) => {
          set({ currentGame: game });
        },
        sendChatMessage: async (gameId, message) => {
          set({ chatLoading: true, chatError: null });
          try {
            const response = await fetch(`/api/game/${gameId}/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(message),
            });

            if (!response.ok) {
              throw new Error('Failed to send message');
            }

            const data = await response.json();
            
            // Update the current game with new chat message
            const currentGame = get().currentGame;
            if (currentGame && currentGame._id === gameId) {
              set({
                currentGame: {
                  ...currentGame,
                  chat: {
                    ...currentGame.chat,
                    messages: [...currentGame.chat.messages, { ...message, timestamp: new Date() }]
                  }
                }
              });
            }

            set({ chatLoading: false });
          } catch (error) {
            set({ chatError: 'Failed to send message', chatLoading: false });
          }
        },
      };
    },
    {
      name: "game-store",
      partialize: (state) => ({
        games: state.games,
      }),
    }
  )
);
