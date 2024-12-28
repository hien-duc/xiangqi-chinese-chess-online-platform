import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function GET() {
  try {
    await connectToDatabase();

    // Calculate the timestamp from 2 minutes ago
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

    // Find and delete games that meet ANY of these conditions:
    // 1. Created more than 2 minutes ago with no moves and not completed
    // 2. Created more than 2 minutes ago with no players joined
    // 3. Created more than 2 minutes ago and abandoned (no moves in last 2 minutes)
    const result = await GameModel.deleteMany({
      $or: [
        {
          // Condition 1: No moves made
          createdAt: { $lt: twoMinutesAgo },
          "moves.0": { $exists: false },
          status: { $ne: "completed" },
        },
        {
          // Condition 2: No players joined
          createdAt: { $lt: twoMinutesAgo },
          $or: [
            { "players.red": { $exists: false } },
            { "players.black": { $exists: false } },
          ],
          status: { $ne: "completed" },
        },
        {
          // Condition 3: No recent moves (abandoned game)
          createdAt: { $lt: twoMinutesAgo },
          lastMoveAt: { $lt: twoMinutesAgo },
          status: { $ne: "completed" },
        },
      ],
    });

    console.log(`[Game Cleanup] Removed ${result.deletedCount} inactive games`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} inactive games`,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Game Cleanup] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clean up games",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
