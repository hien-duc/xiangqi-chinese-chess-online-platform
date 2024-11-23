  import { NextRequest, NextResponse } from "next/server";
  import { connectToDatabase } from "@/src/lib/db/db-connect";
  import GameModel, { IGameState } from "@/src/lib/db/models/gameState";

  export async function GET(
    req: NextRequest,
    { params }: { params: { gameId: string } }
  ) {
    try {
      await connectToDatabase();
      const { gameId } = await params;

      // Validate gameId format (assuming MongoDB ObjectId)
      if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json(
          { error: "Invalid game ID format" },
          { status: 400 }
        );
      }

      // Fetch game from database
      const game = await GameModel.findById(gameId);

      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      // Transform game data for client
      const testGameData: IGameState = game;
      // const gameData = {
      //   id: game._id,
      //   fen: game.fen,
      //   turn: game.turn,
      //   status: game.status,
      //   players: game.players,
      //   moves: game.moves,
      //   winner: game.winner,
      //   createdAt: game.createdAt,
      //   updatedAt: game.updatedAt,
      //   lastMove: game.lastMove || undefined,
      //   gameOver: game.gameOver || undefined,
      // };

      // console.log("GAME DATA:", testGameData);

      return NextResponse.json({ game: testGameData });
    } catch (error) {
      console.error("Error fetching game:", error);
      return NextResponse.json(
        { error: "Failed to fetch game" },
        { status: 500 }
      );
    }
  }
