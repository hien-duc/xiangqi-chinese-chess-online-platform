import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import type { IGameState } from "@/lib/db/models/gameState";

export async function POST(request: Request) {
  try {
    const { side, playerInfo } = await request.json();
    await connectToDatabase();

    const waitingPlayer = {
      id: "waiting",
      isGuest: true,
      name: "Waiting for player...",
      orientation: "red"
    };

    // Initialize game data with the default FEN for Xiangqi
    const gameData: Partial<IGameState> = {
      fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR",
      players: {
        red: side === "red" 
          ? { ...playerInfo, orientation: "red" }
          : { ...waitingPlayer, orientation: "red" },
        black: side === "black"
          ? { ...playerInfo, orientation: "black" }
          : { ...waitingPlayer, orientation: "black" },
      },
      status: "waiting",
      turn: "red", // Red always moves first in Xiangqi
      moves: [],
      gameOver: false,
      check: undefined,
      winner: undefined,
      lastMove: undefined,
      premove: undefined
    };

    const game = await GameModel.create(gameData);
    return NextResponse.json({ 
      success: true,
      gameId: game._id.toString(),
      game: game.toObject()
    });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
