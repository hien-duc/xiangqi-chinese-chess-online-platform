import { create } from 'zustand'
import { IGameState } from '@/lib/db/models/gameState'

interface GameStore {
  games: IGameState[]
  setGames: (games: IGameState[]) => void
  updateGame: (gameId: string, updatedGame: IGameState) => void
  addGame: (game: IGameState) => void
  fetchGames: () => Promise<void>
}

export const useGameStore = create<GameStore>((set) => ({
  games: [],
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
    try {
      const response = await fetch('/api/games')
      if (response.ok) {
        const data = await response.json()
        set({ games: data.games })
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  },
}))
