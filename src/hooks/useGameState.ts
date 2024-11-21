import { useState, useEffect } from "react";
import { GameState } from "../app/utils/types";

export function useGameState(gameId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function makeMove(orig: string, dest: string) {
    try {
      // Validate move
      const validateRes = await fetch("/api/game/validate-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          orig,
          dest,
          fen: gameState?.fen,
        }),
      });

      if (!validateRes.ok) {
        const error = await validateRes.json();
        throw new Error(error.message);
      }

      // Make move
      const moveRes = await fetch("/api/game/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          orig,
          dest,
          fen: gameState?.fen,
          turn: gameState?.turn,
        }),
      });

      if (!moveRes.ok) {
        throw new Error("Failed to make move");
      }

      const newState = await moveRes.json();
      setGameState(newState.game);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make move");
    }
  }

  return { gameState, error, makeMove };
}
