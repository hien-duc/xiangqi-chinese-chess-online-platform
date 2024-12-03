import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();

    const gameId = (await params).gameId;

    // Validate gameId format
    if (!/^[0-9a-fA-F]{24}$/.test(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const { userId, message } = await req.json();

    // Validate required fields
    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      );
    }

    // Find game and validate chat is enabled
    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (!game.chat.enabled) {
      return NextResponse.json(
        { error: "Chat is disabled for this game" },
        { status: 403 }
      );
    }

    // Add new message
    const newMessage = {
      userId,
      message,
      timestamp: new Date(),
    };

    game.chat.messages = game.chat.messages || [];
    game.chat.messages.push(newMessage);

    // Save updated game
    await game.save();

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error adding chat message:", error);
    return NextResponse.json(
      { error: "Failed to add chat message" },
      { status: 500 }
    );
  }
}
