import { NextResponse } from "next/server";
import { EngineHandler } from "@/lib/engine-handler";
import path from "path";

let engineHandler: EngineHandler | null = null;

export async function POST(req: Request) {
  try {
    const { fen } = await req.json();

    if (!fen) {
      console.error("Missing FEN position");
      return NextResponse.json(
        { error: "FEN position is required" },
        { status: 400 }
      );
    }

    if (!engineHandler) {
      // Initialize engine handler with your engine path
      // const enginePath = path.join(process.cwd(), "engines", "xiangqi.exe");
      const enginePath = path.join(
        process.cwd(),
        "engines",
        "chess_engine.exe"
      );
      engineHandler = new EngineHandler(enginePath);
      await engineHandler.start();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Engine timeout"));
      }, 10000); // 10 second timeout

      engineHandler?.sendMove(fen, (move) => {
        clearTimeout(timeoutId);
        if (!move) {
          reject(new Error("No valid move found"));
        } else {
          resolve(NextResponse.json({ move }));
        }
      });
    }).catch((error) => {
      console.error("Engine error:", error);
      return NextResponse.json(
        { error: "Failed to get engine move" },
        { status: 500 }
      );
    });
  } catch (error) {
    console.error("Engine processing error:", error);
    return NextResponse.json(
      { error: "Engine processing failed" },
      { status: 500 }
    );
  }
}

// Clean up when the API is destroyed
export function DELETE() {
  if (engineHandler) {
    engineHandler.stop();
    engineHandler = null;
  }
  return NextResponse.json({ status: "ok" });
}
