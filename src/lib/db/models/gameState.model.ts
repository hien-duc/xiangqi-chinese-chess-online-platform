import mongoose, { Schema, model, Document } from "mongoose";

export interface IPlayer {
  id: string;
  name: string;
  orientation: string;
  isBot?: boolean;
}

export interface IMessage {
  sender: string;
  senderName: string;
  content: string;
  timestamp: Date;
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
  premove?: [string, string];
  check?: string;
  gameOver?: boolean;
  times?: {
    red: number;
    black: number;
  };
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
});

const GameSchema = new Schema<IGameState>(
  {
    players: {
      red: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        orientation: { type: String, required: true },
        isBot: { type: Boolean, default: false },
      },
      black: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        orientation: { type: String, required: true },
        isBot: { type: Boolean, default: false },
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
    times: {
      type: {
        red: { type: Number, required: true, default: 1800 }, // 10 minutes in seconds
        black: { type: Number, required: true, default: 1800 },
      },
      default: { red: 600, black: 600 },
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ timestamp: -1 });
GameSchema.index({ status: 1 });
GameSchema.index({ "players.red.id": 1 });
GameSchema.index({ "players.black.id": 1 });
GameSchema.index({ createdAt: 1 });

const GameStateModel =
  mongoose.models.gameStates || model("gameStates", GameSchema);

export default GameStateModel;
