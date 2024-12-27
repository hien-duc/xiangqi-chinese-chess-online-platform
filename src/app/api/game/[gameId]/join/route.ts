import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerInfo, side } = await request.json();
    const { gameId } = await params;

    await connectToDatabase();
    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "waiting") {
      return NextResponse.json(
        { error: "Game is not available to join" },
        { status: 400 }
      );
    }

    // Check if the requested side is available
    if (game.players[side].id !== `waiting-${side}`) {
      return NextResponse.json(
        { error: "Selected side is not available" },
        { status: 400 }
      );
    }

    // Update the player info for the selected side
    game.players[side] = {
      ...playerInfo,
      orientation: side,
      isBot: false,
    };

    // If both sides are filled, set the game to active
    const redPlayer = game.players.red;
    const blackPlayer = game.players.black;
    if (
      redPlayer.id &&
      redPlayer.id !== "waiting-red" &&
      blackPlayer.id &&
      blackPlayer.id !== "waiting-black"
    ) {
      game.status = "active";
      console.log("Game activated:", gameId); // Add logging for debugging
    }

    await game.save();
    return NextResponse.json({
      success: true,
      game: game.toObject(),
    });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}
