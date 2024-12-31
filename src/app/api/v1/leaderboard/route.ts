import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PlayerModel from "@/lib/db/models/player.model";
import UserModel from "@/lib/db/models/user.model";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get players sorted by rating
    const players = await PlayerModel.find({
      gamesPlayed: { $gt: 0 }, // Only show players who have played games
    })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalPlayers = await PlayerModel.countDocuments({
      gamesPlayed: { $gt: 0 },
    });

    // Get user information for each player
    const playersWithInfo = await Promise.all(
      players.map(async (player) => {
        const user = await UserModel.findById(player.userId)
          .select("name image")
          .lean();
        return {
          id: player.userId,
          name: user?.name || "Unknown Player",
          image: user?.image,
          rating: player.rating,
          gamesPlayed: player.gamesPlayed,
          wins: player.wins,
          losses: player.losses,
          draws: player.draws,
          winRate: player.gamesPlayed > 0 
            ? Math.round((player.wins / player.gamesPlayed) * 100) 
            : 0,
          rank: player.rank,
        };
      })
    );

    return NextResponse.json({
      players: playersWithInfo,
      pagination: {
        total: totalPlayers,
        pages: Math.ceil(totalPlayers / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
