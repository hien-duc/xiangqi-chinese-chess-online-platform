import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();

    const gameId = (await params).gameId;

    // Fetch game from database without strict format validation
    const game = await GameModel.findById(gameId).catch(() => null);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Return the game data
    return NextResponse.json({ game: game.toObject() });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
