import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel from "@/src/lib/db/models/gameState";
import { getValidMoves } from "@/src/app/utils/moves";
import { readXiangqi } from "@/src/app/utils/fen";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id, orig, dest, fen, turn, playerId } = await req.json();

    // Get current game
    const game = await GameModel.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Verify if game is active
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
      return NextResponse.json({ error: "Not your turn" }, { status: 400 });
    }

    // Validate the move
    const pieces = readXiangqi(fen);
    const validMoves = getValidMoves(pieces, orig);
    const isValidMove = validMoves.includes(dest);

    // Log the contents of pieces
    console.log("pieces (map):");
    pieces.forEach((value, key) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });

    // Log validMoves
    console.log("validMoves:", validMoves);

    if (!isValidMove) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    // Update game state
    const updatedGame = await GameModel.findByIdAndUpdate(
      id,
      {
        $set: { fen, status: "active" },
        $push: { moves: `${orig}-${dest}` },
      },
      { new: true }
    );

    return NextResponse.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error("Move handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
