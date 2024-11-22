import { connectToDatabase } from "@/src/lib/db/db-connect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import GameModel from "@/src/lib/db/models/gameState";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Parse the request body
    const gameState = await req.json();
    // Validate required fields
    const requiredFields = ["id", "fen", "turn", "players"];
    for (const field of requiredFields) {
      if (!gameState[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure `players` structure is valid
    if (
      !gameState.players.red ||
      !gameState.players.red.id ||
      !gameState.players.black ||
      !gameState.players.black.id
    ) {
      return NextResponse.json(
        { error: "Invalid or missing player details" },
        { status: 400 }
      );
    }

    // Prepare the update object
    const updateData: Partial<typeof gameState> = {
      fen: gameState.fen,
      moves: gameState.lastMove
        ? [...(gameState.moves || []), gameState.lastMove.join(",")]
        : gameState.moves,
      status: gameState.gameOver ? "completed" : gameState.status || "active",
      turn: gameState.turn, // Ensure this is included
      winner: gameState.winner || undefined,
      players: gameState.players,
      chat: gameState.chat,
      lastMove: gameState.lastMove,
      gameOver: gameState.gameOver,
    };

    const updatedGame = await GameModel.findByIdAndUpdate(
      gameState.id,
      {
        $set: {
          turn: gameState.turn, // Explicitly update the `turn` key
          fen: gameState.fen,
          moves: gameState.lastMove
            ? [...(gameState.moves || []), gameState.lastMove.join(",")]
            : gameState.moves,
          status: gameState.gameOver
            ? "completed"
            : gameState.status || "active",
          players: gameState.players,
          chat: gameState.chat,
          lastMove: gameState.lastMove,
          gameOver: gameState.gameOver,
        },
        $currentDate: { updatedAt: true },
      },
      { new: true, upsert: true }
    );

    // console.log("Update Data:", updateData);
    // console.log("Updated Game:", updatedGame);

    // If the game is not found and upsert is false
    if (!updatedGame) {
      return NextResponse.json(
        { error: "Game not found and could not create new game" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    console.error("Game state update error:", error);
    return NextResponse.json(
      { error: "Failed to update or create game state" },
      { status: 500 }
    );
  }
}
