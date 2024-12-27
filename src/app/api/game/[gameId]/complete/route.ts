import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import PlayerModel, { updatePlayerStats } from "@/lib/db/models/player.model";

// ELO rating calculation
function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  actualScore: number
) {
  const K = 32; // K-factor for rating calculations
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(K * (actualScore - expectedScore));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;
    const { winner, forfeitedBy, timeoutLoss } = await request.json();

    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Update game status
    game.status = "completed";
    game.gameOver = true;
    game.winner = winner;
    game.forfeitedBy = forfeitedBy;
    game.timeoutLoss = timeoutLoss;
    await game.save();

    // Update player stats
    const redPlayer = game.players.red;
    const blackPlayer = game.players.black;

    // Find player documents by userId
    const redPlayerDoc = !redPlayer.isGuest
      ? await PlayerModel.findOne({ userId: redPlayer.id })
      : null;
    const blackPlayerDoc = !blackPlayer.isGuest
      ? await PlayerModel.findOne({ userId: blackPlayer.id })
      : null;

    if (redPlayerDoc && blackPlayerDoc) {
      // Calculate ELO changes
      const redScore = winner === "Red" ? 1 : winner === "Black" ? 0 : 0.5;
      const blackScore = 1 - redScore;

      const redRatingChange = calculateEloChange(
        redPlayerDoc.rating,
        blackPlayerDoc.rating,
        redScore
      );
      const blackRatingChange = calculateEloChange(
        blackPlayerDoc.rating,
        redPlayerDoc.rating,
        blackScore
      );

      // Update red player stats
      await updatePlayerStats(
        redPlayerDoc._id.toString(),
        winner === "Red" ? "win" : winner === "Black" ? "loss" : "draw",
        redRatingChange
      );

      // Update black player stats
      await updatePlayerStats(
        blackPlayerDoc._id.toString(),
        winner === "Black" ? "win" : winner === "Red" ? "loss" : "draw",
        blackRatingChange
      );
    } else {
      // If one player is a guest or bot, use simpler rating changes
      if (redPlayerDoc) {
        const ratingChange =
          winner === "Red" ? 15 : winner === "Black" ? -15 : 0;
        await updatePlayerStats(
          redPlayerDoc._id.toString(),
          winner === "Red" ? "win" : winner === "Black" ? "loss" : "draw",
          ratingChange
        );
      }

      if (blackPlayerDoc) {
        const ratingChange =
          winner === "Black" ? 15 : winner === "Red" ? -15 : 0;
        await updatePlayerStats(
          blackPlayerDoc._id.toString(),
          winner === "Black" ? "win" : winner === "Red" ? "loss" : "draw",
          ratingChange
        );
      }
    }

    return NextResponse.json({
      success: true,
      game: game.toObject(),
    });
  } catch (error) {
    console.error("Error completing game:", error);
    return NextResponse.json(
      { error: "Failed to complete game" },
      { status: 500 }
    );
  }
}
