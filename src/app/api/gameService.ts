// api/gameService.ts
import { GameState, MoveResult } from "../utils/types";

export async function makeMove(
  gameId: string,
  orig: string,
  dest: string,
  xiangqiground: any
): Promise<MoveResult> {
  try {
    // 1. Validate move locally first
    const state = xiangqiground.state;
    if (!state.movable.dests?.get(orig)?.includes(dest)) {
      return {
        success: false,
        error: "Invalid move",
      };
    }

    // 2. Send move to backend
    const response = await fetch("/api/games/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        orig,
        dest,
        fen: xiangqiground.getFen(),
        turn: state.turnColor,
      }),
    });

    if (!response.ok) {
      throw new Error("Move failed");
    }

    // 3. Get updated game state
    const gameState: GameState = await response.json();

    // 4. Update local board
    xiangqiground.set({
      fen: gameState.fen,
      turnColor: gameState.turn,
      movable: {
        color: gameState.turn,
        dests: undefined, // Force recalculation of valid moves
      },
      check: gameState.check,
    });

    // 5. Play any pending premove
    if (gameState.premove) {
      xiangqiground.playPremove();
    }

    return {
      success: true,
      gameState,
    };
  } catch (error) {
    console.error("Move error:", error);
    return {
      success: false,
      error: "Failed to make move",
    };
  }
}
