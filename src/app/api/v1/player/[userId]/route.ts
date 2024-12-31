import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PlayerModel from "@/lib/db/models/player.model";
import UserModel from "@/lib/db/models/user.model";

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
        stats: {
          rating: 0,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          rank: "Unknown",
          winRate: 0,
        },
        recentGames: [],
        user: {
          name: "Guest",
          image: null,
        },
      });
    }

    await connectToDatabase();
    const player = await PlayerModel.findOne({ userId });
    const user = await UserModel.findById(userId).select("name email image");
    // const [player, user] = await Promise.all([
    //   PlayerModel.findOne({ userId }),
    //   UserModel.findById(userId).select("name email image"),
    // ]);

    if (!player || !user) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const profile = await player.getPlayerProfile();
    return NextResponse.json({
      ...profile,
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error fetching player profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch player profile" },
      { status: 500 }
    );
  }
}
