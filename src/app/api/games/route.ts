import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel, { IPlayer } from "@/lib/db/models/gameState";
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

    // Helper function to get player data with defaults for waiting players
    const getPlayerData = (
      playerInfo: IPlayer,
      orientation: "red" | "black"
    ) => {
      if (playerInfo.id && playerInfo.name) {
        return {
          ...playerInfo,
          orientation,
        };
      }
      if (playerInfo.isBot) {
        return {
          id: `bot-${Math.random().toString(36).substr(2, 9)}`,
          name: "XiangQi Bot",
          isBot: true,
          orientation,
        };
      }
      return {
        id: `waiting-${orientation}`,
        name: "Waiting for player...",
        orientation,
        isBot: false,
      };
    };

    const gameData = {
      players: {
        red: getPlayerData(players.red, "red"),
        black: getPlayerData(players.black, "black"),
      },
      fen: initialFen,
      moves: [],
      messages: [], // Initialize empty messages array
      status:
        players.red.isBot && players.black.isBot ? "completed" : "waiting",
      times: {
        red: 600,
        black: 600,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const game = await GameModel.create(gameData);

    // If one player is a bot and the other has joined, set status to active
    if (
      (players.red.isBot && players.black.id && !players.black.isBot) ||
      (players.black.isBot && players.red.id && !players.red.isBot)
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
