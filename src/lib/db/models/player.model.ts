import mongoose, { Schema, Document, model } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

const PlayerSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, default: 1200 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Player || model<IPlayer>("Player", PlayerSchema);
