import { connectToDatabase } from "../../../lib/db/db-connect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import GameModel from "../../../lib/db/models/game.model";
import { GameState } from "../../utils/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Parse the request body
    const gameState: GameState = await req.json();
    
    // Validate required fields
    if (!gameState.id || !gameState.fen || !gameState.turn) {
      return NextResponse.json(
        { error: "Missing required game state fields" },
        { status: 400 }
      );
    }

    // Update or create game state
    const updatedGame = await GameModel.findByIdAndUpdate(
      gameState.id,
      {
        $set: {
          fen: gameState.fen,
          moves: gameState.lastMove
            ? { $push: gameState.lastMove.join(",") }
            : undefined,
          status: gameState.gameOver ? "completed" : "active",
        },
        $currentDate: { updatedAt: true },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    console.error("Game state update error:", error);
    return NextResponse.json(
      { error: "Failed to update game state" },
      { status: 500 }
    );
  }
}
