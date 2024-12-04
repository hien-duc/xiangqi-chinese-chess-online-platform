import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();

    const gameId = (await params).gameId;

    // Fetch game from database without strict format validation
    const game = await GameModel.findById(gameId).catch(() => null);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Return the game data
    return NextResponse.json({ game: game.toObject() });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = params;
    const updateData = await request.json();

    // Find and update the game
    const game = await GameModel.findByIdAndUpdate(
      gameId,
      { $set: updateData },
      { new: true }
    );

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ game: game.toObject() });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

// Delete game
export async function DELETE(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = params;

    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Handle game abandonment which will update player stats if needed
    await game.handleAbandonment();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}

// Add a new endpoint to handle player disconnection
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = params;
    const { playerId } = await request.json();

    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // If player disconnects during active game, they forfeit
    if (game.status === 'active') {
      const playerColor = game.players.red.id === playerId ? 'red' : 'black';
      const winningColor = playerColor === 'red' ? 'Black' : 'Red';

      game.status = 'completed';
      game.gameOver = true;
      game.winner = winningColor;
      game.forfeitedBy = playerColor;
      await game.save();
      await game.remove(); // This will trigger the pre-remove hook to update stats
    }
    // If in waiting state, just remove the game
    else if (game.status === 'waiting') {
      await game.remove();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling player disconnection:", error);
    return NextResponse.json(
      { error: "Failed to handle player disconnection" },
      { status: 500 }
    );
  }
}
