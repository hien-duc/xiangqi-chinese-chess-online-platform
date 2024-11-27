// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  hashedPassword?: string;
  image?: string | null;
  emailVerified?: Date | null;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: String,
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined to prevent OverwriteModelError
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
