import { NextResponse } from "next/server";
import { EngineHandler } from "@/lib/engine-handler";
import path from "path";

let engineHandler: EngineHandler | null = null;

export async function POST(req: Request) {
  try {
    const { fen } = await req.json();

    if (!engineHandler) {
      // Initialize engine handler with your engine path
      const enginePath = path.join(process.cwd(), "engines", "xiangqi.exe");
      engineHandler = new EngineHandler(enginePath);
      await engineHandler.start();
    }

    return new Promise((resolve) => {
      engineHandler?.sendMove(fen, (move) => {
        resolve(NextResponse.json({ move }));
      });
    });
  } catch (error) {
    console.error("Engine error:", error);
    return NextResponse.json({ error: "Engine error" }, { status: 500 });
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
