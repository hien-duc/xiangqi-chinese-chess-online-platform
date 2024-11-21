import mongoose, { Schema, model } from "mongoose";
// import { connectToDatabase } from "../db-connect";

// Define the User interface for TypeScript
export interface IUser {
  email: string;
  hashedPassword: string;
  name?: string;
  //image?: string
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema with type safety
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Convert email to lowercase
      trim: true, // Remove whitespace
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    //image: String,
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Add any pre-save middleware if needed
userSchema.pre("save", function (next) {
  // You can add custom logic here
  // For example, transforming data before saving
  next();
});

// Export the model with type safety

export default mongoose.models.User || model("User", userSchema);

// Add example usage for better understanding:
// Example usage:
// async function createUser(userData: Partial<IUser>) {
//   try {
//     await connectToDatabase();
//     const user = await User.create(userData);
//     return user;
//   } catch (error) {
//     console.error("Error creating user:", error);
//     throw error;
//   }
// }

// async function findUserByEmail(email: string) {
//   try {
//     await connectToDatabase();
//     const user = await User.findOne({ email: email.toLowerCase() });
//     return user;
//   } catch (error) {
//     console.error("Error finding user:", error);
//     throw error;
//   }
// }
