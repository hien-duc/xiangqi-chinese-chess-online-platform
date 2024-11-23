// /api/game/[gameId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel from "@/src/lib/db/models/gameState";

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Extract game ID from params
    const gameId = params.gameId;

    // Parse request body
    const body = await req.json();
    const { orig, dest, fen, turn, playerId } = body;

    // Validate input
    if (!gameId || !orig || !dest || !fen || !turn || !playerId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            gameId: !gameId ? "Game ID is required" : null,
            orig: !orig ? "Origin position is required" : null,
            dest: !dest ? "Destination position is required" : null,
            fen: !fen ? "FEN string is required" : null,
            turn: !turn ? "Turn is required" : null,
            playerId: !playerId ? "Player ID is required" : null,
          },
        },
        { status: 400 }
      );
    }

    // Find the game
    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Verify game status
    if (game.status !== "active") {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Verify player's turn
    const isRed = turn === "red";
    const currentPlayerId = isRed ? game.players.red.id : game.players.black.id;
    if (currentPlayerId != playerId) {
      return NextResponse.json({ error: "Not your turn" }, { status: 403 });
    }

    // Update game state
    const updatedGame = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          fen,
          status: "active",
          currentTurn: isRed ? "black" : "red",
        },
        $push: {
          moves: `${orig}-${dest}`,
        },
        // $inc: {
        //   moveCount: 1,
        // },
      },
      {
        new: true,
        runValidators: true, // Ensure model validation runs
      }
    );

    // Additional game state checks could be added here
    // e.g., check for checkmate, draw conditions, etc.

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: "Move successfully processed",
    });
  } catch (error) {
    console.error("Move handler error:", error);

    // Differentiate between different types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Move processing failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
