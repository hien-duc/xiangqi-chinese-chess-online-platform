import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import { initialFen } from "@/utils/fen";
// GET /api/games - Get all games
export async function GET() {
  try {
    await connectToDatabase();
    const games = await GameModel.find({
      status: { $ne: "completed" },
    }).sort({ createdAt: -1 });
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST /api/games - Create a new game
export async function POST(request: Request) {
  try {
    const { players } = await request.json();
    await connectToDatabase();

    const gameData = {
      players: {
        red: { ...players.red, orientation: "red" },
        black: { ...players.black, orientation: "black" },
      },
      fen: initialFen, // Initial position
      moves: [],
      status:
        players.red.isBot && players.black.isBot ? "completed" : "waiting",
      times: {
        red: 600, // 10 minutes in milliseconds
        black: 600,
      },
    };

    const game = await GameModel.create(gameData);

    // If one player is a bot and the other has joined, set status to active
    if (
      (players.red.isBot && players.black.id) ||
      (players.black.isBot && players.red.id)
    ) {
      game.status = "active";
      await game.save();
    }

    return NextResponse.json({ game });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
