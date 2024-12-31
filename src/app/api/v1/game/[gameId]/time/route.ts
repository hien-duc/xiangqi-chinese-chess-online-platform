import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ times: game.times });
  } catch (error) {
    console.error("Error handling time request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const body = await request.json();
    game.times = body.times;
    await game.save();

    return NextResponse.json({ times: game.times });
  } catch (error) {
    console.error("Error handling time request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const body = await request.json();
    game.times = body.times;

    // Check if either player's time has run out
    if (game.times.red <= 0 || game.times.black <= 0) {
      // Determine winner based on who ran out of time
      const winner = game.times.red <= 0 ? "black" : "red";

      // Update game status
      game.status = "completed";
      game.gameOver = true;
      game.winner = winner;

      await game.save();

      return NextResponse.json({
        times: game.times,
        gameOver: true,
        winner,
        status: "completed",
      });
    }

    await game.save();
    return NextResponse.json({ times: game.times });
  } catch (error) {
    console.error("Error handling time request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
