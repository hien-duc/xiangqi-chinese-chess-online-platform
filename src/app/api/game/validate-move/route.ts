import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/db-connect";
import GameModel from "../../../../lib/db/models/game.model";
import { getValidMoves } from "../../../utils/moves";
import { read } from "../../../utils/fen";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { gameId, orig, dest, fen } = await req.json();

    // Get current game
    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if game is active
    if (game.status !== "active") {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Validate move
    const pieces = read(fen);
    const validMoves = getValidMoves(pieces, orig);
    const isValidMove = validMoves.includes(dest);

    if (!isValidMove) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Move validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
