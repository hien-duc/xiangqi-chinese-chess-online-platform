import mongoose, { Schema, model, Document } from "mongoose";

interface IPlayer {
  id: string;
  isGuest: boolean;
  name: string;
  orientation: string;
}

export interface IGameState extends Document {
  id: string;
  players: {
    red: IPlayer;
    black: IPlayer;
  };
  fen: string;
  moves: string[];
  status: "waiting" | "active" | "completed";
  winner?: string;
  lastMove?: [string, string];
  turn: "red" | "black"; 
  premove?: [string, string];
  check?: string;
  gameOver?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGameState>(
  {
    players: {
      red: {
        id: { type: String, required: true },
        isGuest: { type: Boolean, default: true },
        name: { type: String, required: true },
        orientation: { type: String, required: true }
      },
      black: {
        id: { type: String, required: true },
        isGuest: { type: Boolean, default: true },
        name: { type: String, required: true },
        orientation: { type: String, required: true }
      },
    },
    fen: {
      type: String,
      default:
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
    },
    moves: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },
    winner: {
      type: String,
      default: null,
    },
    lastMove: {
      type: [String],
      default: null,
    },
    turn: {
      type: String,
      enum: ["red", "black"],
      required: true,
    },
    premove: {
      type: [String],
      default: null,
    },
    check: {
      type: String,
      default: null,
    },
    gameOver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

GameSchema.index({ status: 1 });
GameSchema.index({ "players.red.id": 1 });
GameSchema.index({ "players.black.id": 1 });
GameSchema.index({ createdAt: 1 });

export default mongoose.models.Game || model<IGameState>("Game", GameSchema);
