import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PlayerModel from "@/lib/db/models/player.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;
    if (
      userId.startsWith("waiting-") ||
      userId.startsWith("bot-") ||
      userId.startsWith("guest-")
    ) {
      return NextResponse.json({
        rating: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        rank: "Unknown",
      });
    }

    await connectToDatabase();
    const player = await PlayerModel.findOne({ userId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      rating: player.rating,
      gamesPlayed: player.gamesPlayed,
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      rank: player.rank,
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
