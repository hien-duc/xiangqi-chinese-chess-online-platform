import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameModel from "@/lib/db/models/gameState";

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    // Validate gameId format
    if (!/^[0-9a-fA-F]{24}$/.test(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Received message body:", body);

    const { sender, senderName, content } = body;

    // Validate required fields
    if (!sender || !senderName || !content || content.length > 500) {
      console.log("Validation failed:", { sender, senderName, content });
      return NextResponse.json(
        { error: "Invalid message data" },
        { status: 400 }
      );
    }

    // Add message to game
    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Initialize messages array if it doesn't exist
    if (!game.messages) {
      game.messages = [];
    }

    // Add new message
    const newMessage = {
      sender,
      senderName,
      content,
      timestamp: new Date(),
    };

    game.messages.push(newMessage);
    await game.save();

    // Return the latest message
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error in chat POST:", error);
    return NextResponse.json(
      { error: "Failed to add chat message" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    // Validate gameId format
    if (!/^[0-9a-fA-F]{24}$/.test(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID format" },
        { status: 400 }
      );
    }

    const game = await GameModel.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Initialize messages if they don't exist
    const messages = game.messages || [];

    // Return messages sorted by timestamp
    const sortedMessages = [...messages].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return NextResponse.json({ messages: sortedMessages });
  } catch (error) {
    console.error("Error in chat GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
