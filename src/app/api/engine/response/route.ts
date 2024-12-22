import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import { initWasmEngine, getBestMove, stopEngine } from "@/lib/wasm/engine";
import path from "path";

const ENGINE_PATH =
  process.env.ENGINE_PATH || path.join(process.cwd(), "engines", "xiangqi.exe");
let engineInitialized = false;

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { gameId, fen } = await request.json();

    if (!gameId || !fen) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize engine if not already initialized
    if (!engineInitialized) {
      try {
        await initWasmEngine(ENGINE_PATH);
        engineInitialized = true;
      } catch (error) {
        console.error("Failed to initialize engine:", error);
        return NextResponse.json(
          { error: "Failed to initialize chess engine" },
          { status: 500 }
        );
      }
    }

    // Get the best move using WebAssembly engine
    const engineMove = await getBestMove(fen);

    // Find and update the game with new FEN and last move
    const game = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          fen: engineMove.fen,
          lastMove: engineMove.from + engineMove.to,
        },
      },
      { new: true }
    );

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({
      move: {
        from: engineMove.from,
        to: engineMove.to,
      },
      fen: engineMove.fen,
    });
  } catch (error) {
    console.error("Error processing move:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clean up when the API is destroyed
export function DELETE() {
  stopEngine();
  return NextResponse.json({ status: "Engine stopped" });
}
