import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PuzzleModel from "@/lib/db/models/puzzle";

// POST /api/v1/puzzles/[puzzleId]/verify - Verify a puzzle solution
export async function POST(
  request: Request,
  { params }: { params: { puzzleId: string } }
) {
  try {
    const { moves } = await request.json();
    const { puzzleId } = await params;

    await connectToDatabase();

    const puzzle = await PuzzleModel.findById(puzzleId);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    // Compare moves with solution
    const isCorrect =
      moves.length === puzzle.solution.length &&
      moves.every(
        (move: string, index: number) => move === puzzle.solution[index]
      );

    // Update puzzle stats
    await puzzle.updateRating(isCorrect);

    return NextResponse.json({
      correct: isCorrect,
      rating: puzzle.rating,
      solution: puzzle.solution, // Only send solution after attempt
    });
  } catch (error) {
    console.error("Error verifying puzzle:", error);
    return NextResponse.json(
      { error: "Failed to verify puzzle" },
      { status: 500 }
    );
  }
}
