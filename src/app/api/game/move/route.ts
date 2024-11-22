import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel from "@/src/lib/db/models/gameState";
// import PlayerModel from "@/src/lib/db/models/player.model";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id, orig, dest, fen, turn, playerId } = await req.json();
    // Get current game
    const game = await GameModel.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Verify player's turn
    const isRed = turn === "red";
    const currentPlayerId = isRed ? game.players.red.id : game.players.black.id;

    if (currentPlayerId != playerId) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 });
    }

    // Update game state
    const updatedGame = await GameModel.findByIdAndUpdate(
      id,
      {
        $set: {
          fen,
          status: "active",
        },
        $push: {
          moves: `${orig}-${dest}`,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error("Move handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
