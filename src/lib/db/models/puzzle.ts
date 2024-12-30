import mongoose, { Document, Schema } from "mongoose";

export interface IPuzzle extends Document {
  fen: string;
  solution: string[];
  difficulty: "easy" | "medium" | "hard";
  initialMove: string;
  rating: number;
  attempts: number;
  successes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PuzzleSchema = new Schema(
  {
    fen: {
      type: String,
      required: true,
      index: true,
    },
    solution: {
      type: [String],
      required: true,
      validate: {
        validator: function(moves: string[]) {
          // Easy: 1 move (2 half-moves)
          // Medium: 2 moves (4 half-moves)
          // Hard: 3 moves (6 half-moves)
          const difficulty = this.difficulty;
          const requiredMoves = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;
          return moves.length === requiredMoves;
        },
        message: "Solution length must match difficulty level"
      }
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    initialMove: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 1200,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    successes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient puzzle retrieval
PuzzleSchema.index({ difficulty: 1, rating: 1 });

// Calculate success rate
PuzzleSchema.virtual("successRate").get(function() {
  if (this.attempts === 0) return 0;
  return (this.successes / this.attempts) * 100;
});

// Update puzzle rating based on success/failure
PuzzleSchema.methods.updateRating = function(success: boolean) {
  const K = 32; // Rating adjustment factor
  const expectedScore = 1 / (1 + Math.pow(10, (1200 - this.rating) / 400));
  const actualScore = success ? 1 : 0;
  
  this.rating += K * (actualScore - expectedScore);
  this.attempts += 1;
  if (success) this.successes += 1;
  
  return this.save();
};

const PuzzleModel = mongoose.models.Puzzle || mongoose.model<IPuzzle>("Puzzle", PuzzleSchema);

export default PuzzleModel;
