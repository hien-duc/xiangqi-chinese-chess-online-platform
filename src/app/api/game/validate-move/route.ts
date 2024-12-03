import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";
import { readXiangqi, write } from "@/utils/fen";
import { getValidMoves } from "@/utils/moves";
import { Key, Piece } from "@/utils/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id, orig, dest, fen, turn, playerId } = await req.json();

    // Validate inputs
    if (!id || !orig || !dest || !fen || !turn || !playerId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            id: !id ? "Game ID is required" : null,
            orig: !orig ? "Origin position is required" : null,
            dest: !dest ? "Destination position is required" : null,
            fen: !fen ? "FEN string is required" : null,
            turn: !turn ? "Player turn is required" : null,
            playerId: !playerId ? "Player ID is required" : null,
          },
        },
        { status: 400 }
      );
    }

    // Fetch the game
    const game = await GameModel.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Verify if the game is active
    if (game.status !== "active") {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Verify player's turn
    const isRed = turn === "red";
    const currentPlayerId = isRed ? game.players.red.id : game.players.black.id;

    if (currentPlayerId !== playerId) {
      return NextResponse.json({ error: "Not your turn" }, { status: 403 });
    }

    // Parse the FEN and validate the move
    const piecesList = readXiangqi(fen);
    const newPiecesList = new Map<Key, Piece>(piecesList);
    const pickedPiece = newPiecesList.get(orig);

    if (!pickedPiece) {
      return NextResponse.json(
        { error: "No piece at the origin" },
        { status: 400 }
      );
    }

    // Get valid moves and check if the move is valid
    const validMoves = getValidMoves(newPiecesList, orig);
    if (!validMoves.includes(dest)) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    // Apply the move
    newPiecesList.delete(orig);
    newPiecesList.set(dest, pickedPiece);
    const newFen = write(newPiecesList);

    // Update the game state in the database
    const updatedGame = await GameModel.findByIdAndUpdate(
      id,
      {
        $set: { 
          fen: newFen,
          turn: turn === 'red' ? 'black' : 'red',
          lastMove: [orig, dest]
        },
        $push: { moves: `${orig}-${dest}` },
      },
      { new: true }
    );

    if (!updatedGame) {
      return NextResponse.json(
        { error: "Failed to update game state" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      game: {
        ...updatedGame.toObject(),
        lastMove: [orig, dest]
      }
    });
  } catch (error) {
    console.error("Error handling move:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
