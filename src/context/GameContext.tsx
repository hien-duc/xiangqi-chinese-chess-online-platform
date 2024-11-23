// "use client"

// import React, { createContext, useContext, useState, useEffect } from 'react'
// import { IGameState } from '../lib/db/models/gameState'

// interface GameContextType {
//     gameId: string
//     setGameId: (id: string) => void
//     gameData: IGameState
//     isLoading: boolean
//     error: string | null
// }

// const GameContext = createContext<GameContextType | null>(null)

// export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
//     children
// }) => {
//     const [gameId, setGameId] = useState("55153a8014829a865bbf700d")
//     const [gameData, setGameData] = useState<IGameState | null>(null)
//     const [isLoading, setIsLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     useEffect(() => {
//         const fetchGame = async () => {
//             if (!gameId) return

//             setIsLoading(true)
//             try {
//                 const response = await fetch(`/api/game/${gameId}`)
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch game')
//                 }
//                 const data = await response.json()
//                 setGameData(data)
//             } catch (err) {
//                 setError(err instanceof Error ? err.message : 'An error occurred')
//             } finally {
//                 setIsLoading(false)
//             }
//         }

//         fetchGame()
//     }, [gameId])

//     return (
//         <GameContext.Provider
//             value={{
//                 gameId,
//                 setGameId,
//                 gameData,
//                 isLoading,
//                 error
//             }}
//         >
//             {children}
//         </GameContext.Provider>
//     )
// }

// export const useGameContext = () => {
//     const context = useContext(GameContext)
//     if (!context) {
//         throw new Error('useGameContext must be used within a GameProvider')
//     }
//     return context
// }