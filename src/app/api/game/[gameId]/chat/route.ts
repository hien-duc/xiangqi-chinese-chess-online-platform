import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/db-connect";
import GameState from "@/lib/db/models/gameState";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { chatMessageSchema } from "@/lib/zod";

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = params;
    const body = await req.json();

    const validatedMessage = chatMessageSchema.parse(body);

    await connectToDatabase();

    const game = await GameState.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Add message to game chat
    game.chat.messages.push({
      ...validatedMessage,
      timestamp: new Date(),
    });

    await game.save();

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await params;

    await connectToDatabase();

    const game = await GameState.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      messages: game.chat.messages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
