import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db-connect";
import PuzzleModel from "@/lib/db/models/puzzle";

const initialPuzzles = [
  // Easy Puzzles (1 move to mate)
  {
    fen: "2bak4/4a4/4b4/p1p3p2/6p2/9/P1P3P2/1C2B4/4K4/2B1r4 w - - 0 1",
    solution: ["e2e1", "e1e4"], // Red cannon checkmates
    difficulty: "easy",
    initialMove: "e2e1",
    rating: 1200,
  },
  {
    fen: "4ka3/4a4/4b4/p3p3p/2p3p2/P8/4P3P/4B4/4A4/2R1KA3 w - - 0 1",
    solution: ["c0c9", "c9c4"], // Red rook checkmates
    difficulty: "easy",
    initialMove: "c0c9",
    rating: 1200,
  },

  // Medium Puzzles (2 moves to mate)
  {
    fen: "2bakab2/9/2n1c1n2/p1p1p1p1p/9/2P6/P3P3P/2N1C1N2/9/R1BAKAB1R w - - 0 1",
    solution: ["h2h4", "h4h9", "h9h7", "h7g7"], // Red horse then checkmate
    difficulty: "medium",
    initialMove: "h2h4",
    rating: 1400,
  },
  {
    fen: "3ak1b2/4a4/4b4/p1p3p1p/4p4/2P6/P3P3P/4B4/4A4/2BAK1R2 w - - 0 1",
    solution: ["i0i9", "i9d9", "d9d4", "d4d7"], // Red rook sacrifice then checkmate
    difficulty: "medium",
    initialMove: "i0i9",
    rating: 1400,
  },

  // Hard Puzzles (3 moves to mate)
  {
    fen: "3ak4/4a4/4b3b/p3p3p/2p3p2/P8/4P3P/4B4/4A4/2BAK1R2 w - - 0 1",
    solution: ["i0i9", "i9d9", "d9d7", "d7e7", "e7e4", "e4e5"], // Complex rook maneuver
    difficulty: "hard",
    initialMove: "i0i9",
    rating: 1600,
  },
  {
    fen: "2bak4/4a4/4b4/p1p3p1p/4p4/2P6/P3P3P/2N1B4/4A4/R2AK1B2 w - - 0 1",
    solution: ["a0a9", "a9d9", "d9d4", "d4d7", "d7e7", "e7e5"], // Complex combination
    difficulty: "hard",
    initialMove: "a0a9",
    rating: 1600,
  },
];

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Clear existing puzzles
    await PuzzleModel.deleteMany({});

    // Insert new puzzles
    await PuzzleModel.insertMany(initialPuzzles);

    return NextResponse.json({
      message: "Successfully seeded puzzles!",
      count: initialPuzzles.length,
    });
  } catch (error) {
    console.error("Error seeding puzzles:", error);
    return NextResponse.json(
      { error: "Failed to seed puzzles" },
      { status: 500 }
    );
  }
}
