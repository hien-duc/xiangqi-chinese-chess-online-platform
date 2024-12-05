import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import PlayerModel, { updatePlayerStats } from "@/lib/db/models/player.model";

const RATING_CHANGE = {
  win: 15,
  loss: -15,
  draw: 0,
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { gameId, playerId } = await request.json();

    // Use findOneAndUpdate to atomically update or delete the game
    const game = await GameModel.findOne({ _id: gameId });
    
    if (!game) {
      return NextResponse.json({ message: "Game not found or already handled" });
    }

    // If game is in waiting state and the creator leaves, just delete it
    if (game.status === "waiting") {
      const isCreator = game.players.red.id === playerId || game.players.black.id === playerId;
      if (isCreator) {
        await GameModel.findByIdAndDelete(gameId);
        return NextResponse.json({ message: "Game deleted successfully" });
      }
      return NextResponse.json({ message: "Not the game creator" });
    }

    // If game is active, handle the forfeit
    if (game.status === "active") {
      // Determine which player left
      const isRedPlayer = game.players.red.id === playerId;
      const isBlackPlayer = game.players.black.id === playerId;

      if (!isRedPlayer && !isBlackPlayer) {
        return NextResponse.json({ message: "Player not in this game" });
      }

      const disconnectedColor = isRedPlayer ? "red" : "black";
      const winningColor = isRedPlayer ? "Black" : "Red";
      const winningPlayer = isRedPlayer ? game.players.black : game.players.red;
      const losingPlayer = isRedPlayer ? game.players.red : game.players.black;

      // Update game status
      game.status = "completed";
      game.gameOver = true;
      game.winner = winningColor;
      game.forfeitedBy = disconnectedColor;
      await game.save();

      // Update winner's stats if not a guest
      if (!winningPlayer.isGuest) {
        const winnerDoc = await PlayerModel.findOne({ userId: winningPlayer.id });
        if (winnerDoc) {
          await updatePlayerStats(
            winnerDoc._id.toString(),
            "win",
            RATING_CHANGE.win
          );
        }
      }

      // Update loser's stats if not a guest
      if (!losingPlayer.isGuest) {
        const loserDoc = await PlayerModel.findOne({ userId: losingPlayer.id });
        if (loserDoc) {
          await updatePlayerStats(
            loserDoc._id.toString(),
            "loss",
            RATING_CHANGE.loss
          );
        }
      }

      return NextResponse.json({
        message: "Game completed, stats updated",
        winner: winningColor,
      });
    }

    return NextResponse.json({ message: "No action needed" });
  } catch (error) {
    console.error("Error handling disconnection:", error);
    return NextResponse.json(
      { error: "Failed to handle disconnection" },
      { status: 500 }
    );
  }
}
