import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel from "@/src/lib/db/models/gameState";
import { getValidMoves } from "@/src/app/utils/moves";
import { readXiangqi, write } from "@/src/app/utils/fen";
import { Piece, Key } from "@/src/app/utils/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id, orig, dest, fen, turn, playerId } = await req.json();

    if (!orig || !dest || !fen) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            orig: !orig ? "Origin position is required" : null,
            dest: !dest ? "Destination position is required" : null,
            fen: !fen ? "FEN string is required" : null,
          },
        },
        { status: 400 }
      );
    }
    // Get current game
    const game = await GameModel.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Verify if game is active
    if (game.status !== "active") {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Verify player's turn
    const isRed = turn === "red";
    const currentPlayerId = isRed ? game.players.red.id : game.players.black.id;

    if (currentPlayerId != playerId) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 });
    }

    // read and get the picked piece
    const piecesList = readXiangqi(fen);
    const newPiecesList = new Map<Key, Piece>(piecesList);
    const pickedPiece = newPiecesList.get(orig);

    // update the list
    newPiecesList.delete(orig);
    newPiecesList.set(dest, pickedPiece!);

    // Validate the move
    const newFen = write(newPiecesList);
    console.log(newFen, " ", fen);
    // const validMoves = getValidMoves(newPiecesList, orig);
    // const isValidMove = validMoves.includes(dest);

    // Log validMoves
    // console.log("validMoves:", validMoves);

    // if (!isValidMove) {
    //   return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    // }

    // Update game state
    const updatedGame = await GameModel.findByIdAndUpdate(
      id,
      {
        $set: { fen: newFen, status: "active" },
        $push: { moves: `${orig}-${dest}` },
      },
      { new: true }
    );

    return NextResponse.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error("Move handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
