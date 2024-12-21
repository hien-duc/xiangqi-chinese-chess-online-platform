import mongoose, { Schema, model } from "mongoose";

export interface IGuest extends Document {
  guestId: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
}

const GuestSchema = new Schema(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Guest || model<IGuest>("Guest", GuestSchema);
