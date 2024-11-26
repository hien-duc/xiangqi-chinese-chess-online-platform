import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel, { IGameState } from "@/src/lib/db/models/gameState";

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = params;

    // Validate gameId format (assuming MongoDB ObjectId)
    if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid game ID format" },
        { status: 400 }
      );
    }

    // Fetch game from database
    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Return the game data
    return NextResponse.json({ game });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
