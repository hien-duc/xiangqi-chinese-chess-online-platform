import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PuzzleModel from "@/lib/db/models/puzzle";

// GET /api/v1/puzzles - Get a random puzzle based on difficulty
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty") || "easy";

    await connectToDatabase();

    // Get a random puzzle of the specified difficulty
    const puzzles = await PuzzleModel.aggregate([
      { $match: { difficulty } },
      { $sample: { size: 1 } },
    ]);

    if (!puzzles.length) {
      return NextResponse.json({ error: "No puzzles found" }, { status: 404 });
    }

    // Return puzzle without solution
    const puzzle = puzzles[0];
    const { solution, ...puzzleWithoutSolution } = puzzle;

    return NextResponse.json(puzzleWithoutSolution);
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
