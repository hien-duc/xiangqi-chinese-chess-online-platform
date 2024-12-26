import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PlayerModel from "@/lib/db/models/player.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectToDatabase();
    const { userId } = await params;

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
