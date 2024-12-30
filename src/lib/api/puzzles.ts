import { Config } from "@/utils/config";

export interface Puzzle {
  _id: string;
  fen: string;
  difficulty: "easy" | "medium" | "hard";
  rating: number;
  initialMove: string;
}

export interface PuzzleVerifyResponse {
  correct: boolean;
  solution: string[];
  rating: number;
}

export const puzzleApi = {
  // Get a random puzzle by difficulty
  getPuzzle: async (difficulty: string): Promise<Puzzle> => {
    const response = await fetch(`/api/v1/puzzles?difficulty=${difficulty}`);
    if (!response.ok) throw new Error("Failed to fetch puzzle");
    return response.json();
  },

  // Verify puzzle solution
  verifyPuzzle: async (puzzleId: string, moves: string[]): Promise<PuzzleVerifyResponse> => {
    const response = await fetch(`/api/v1/puzzles/${puzzleId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    });
    if (!response.ok) throw new Error("Failed to verify puzzle");
    return response.json();
  },
};

// Generate board configuration for a puzzle
export const getPuzzleConfig = (
  fen: string,
  currentTurn: "red" | "black",
  onMove: (orig: string, dest: string) => void,
  viewOnly: boolean = false
): Partial<Config> => ({
  orientation: "red", // Always show puzzles from red's perspective
  turnColor: currentTurn,
  movable: {
    free: false,
    color: currentTurn,
    showDests: !viewOnly,
    events: {
      after: onMove,
    },
  },
  fen,
  viewOnly,
  animation: {
    enabled: true,
    duration: 200,
  },
  highlight: {
    lastMove: true,
    check: true,
  },
  draggable: {
    enabled: !viewOnly,
    showGhost: !viewOnly,
    deleteOnDropOff: false,
  },
});
