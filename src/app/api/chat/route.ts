import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import { chatMessageSchema, chatQuerySchema } from "@/lib/validations/chat";
import ChatMessage from "@/lib/db/models/chatMessage";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");
    const lastTimestamp = searchParams.get("lastTimestamp");

    const result = chatQuerySchema.safeParse({ gameId, lastTimestamp });
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const query: any = { gameId };
    if (lastTimestamp) {
      query.timestamp = { $gt: new Date(lastTimestamp) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const result = chatMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    const message = new ChatMessage({
      ...body,
      timestamp: new Date(),
    });

    await message.save();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error saving chat message:", error);
    return NextResponse.json(
      { error: "Failed to save chat message" },
      { status: 500 }
    );
  }
}
