import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import PlayerModel, { updatePlayerStats } from "@/lib/db/models/player.model";

const RATING_CHANGE = {
  win: 15,
  loss: -15,
  draw: 0,
};

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
    if (!redPlayer.isGuest) {
      const redPlayerDoc = await PlayerModel.findOne({ userId: redPlayer.id });
      if (redPlayerDoc) {
        await updatePlayerStats(
          redPlayerDoc._id.toString(),
          winner === "Red" ? "win" : winner === "Black" ? "loss" : "draw",
          winner === "Red"
            ? RATING_CHANGE.win
            : winner === "Black"
            ? RATING_CHANGE.loss
            : RATING_CHANGE.draw
        );
      }
    }

    if (!blackPlayer.isGuest) {
      const blackPlayerDoc = await PlayerModel.findOne({
        userId: blackPlayer.id,
      });
      if (blackPlayerDoc) {
        await updatePlayerStats(
          blackPlayerDoc._id.toString(),
          winner === "Black" ? "win" : winner === "Red" ? "loss" : "draw",
          winner === "Black"
            ? RATING_CHANGE.win
            : winner === "Red"
            ? RATING_CHANGE.loss
            : RATING_CHANGE.draw
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
