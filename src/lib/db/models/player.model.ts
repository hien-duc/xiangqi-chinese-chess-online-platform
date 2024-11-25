import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../models/user.model";

export interface IPlayer extends Document {
  userId: IUser["_id"]; // Reference to User
  name: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

const PlayerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export default mongoose.models.Player ||
  mongoose.model<IPlayer>("Player", PlayerSchema);
