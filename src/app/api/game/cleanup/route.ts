import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

const CLEANUP_THRESHOLDS = {
  waiting: 10 * 60 * 1000, // 10 minutes for waiting games
  active: 30 * 60 * 1000, // 30 minutes for active games
};

export async function POST() {
  try {
    await connectToDatabase();
    const now = new Date();

    // Clean up waiting games
    const waitingGames = await GameModel.find({
      status: "waiting",
      updatedAt: { 
        $lt: new Date(now.getTime() - CLEANUP_THRESHOLDS.waiting) 
      }
    });

    if (waitingGames.length > 0) {
      await GameModel.deleteMany({
        _id: { $in: waitingGames.map(game => game._id) }
      });
    }

    // Clean up inactive games
    const inactiveGames = await GameModel.find({
      status: "active",
      updatedAt: { 
        $lt: new Date(now.getTime() - CLEANUP_THRESHOLDS.active) 
      }
    });

    for (const game of inactiveGames) {
      game.status = "completed";
      game.gameOver = true;
      game.winner = "Draw";
      game.forfeitedBy = "both";
      await game.save();
    }

    return NextResponse.json({
      message: "Cleanup completed",
      waitingGamesRemoved: waitingGames.length,
      inactiveGamesHandled: inactiveGames.length
    });
  } catch (error) {
    console.error("Error during game cleanup:", error);
    return NextResponse.json(
      { error: "Failed to perform cleanup" },
      { status: 500 }
    );
  }
}
