import { NextApiRequest, NextApiResponse } from "next";
import { updateGameState, findGameById } from "../../api/gameService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { gameId, orig, dest, fen, turn } = req.body;

    // 1. Get current game
    const game = await findGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // 2. Update game state
    const newTurn = turn === "white" ? "black" : "white";
    const updatedGame = await updateGameState(gameId, {
      fen,
      lastMove: [orig, dest],
      turn: newTurn,
    });

    return res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Move handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
