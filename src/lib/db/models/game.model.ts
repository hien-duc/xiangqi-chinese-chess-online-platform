import mongoose, { Schema, model } from "mongoose";

export interface IGame extends Document {
  players: {
    red: {
      id: string;
      isGuest: boolean;
      name: string;
    };
    black: {
      id: string;
      isGuest: boolean;
      name: string;
    };
  };
  fen: string;
  moves: string[];
  status: "waiting" | "active" | "completed";
  winner?: string;
  chat: {
    enabled: boolean;
    messages?: {
      userId: string;
      message: string;
      timestamp: Date;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema(
  {
    players: {
      red: {
        id: { type: String, required: true },
        isGuest: { type: Boolean, default: true },
        name: { type: String, required: true },
      },
      black: {
        id: { type: String, required: true },
        isGuest: { type: Boolean, default: true },
        name: { type: String, required: true },
      },
    },
    fen: {
      type: String,
      default:
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
    },
    moves: [String],
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },
    winner: String,
    chat: {
      enabled: { type: Boolean, default: false },
      messages: [
        {
          userId: String,
          message: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game || model<IGame>("Game", GameSchema);
