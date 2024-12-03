// models/User.ts
import mongoose, { Model } from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    hashedPassword: {
      type: String,
      required: [true, 'Please provide a password'],
    },
  },
  {
    timestamps: true,
  }
);

// Export model
let User: Model<IUser>;

try {
  // Try to get the existing model
  User = mongoose.model<IUser>('User');
} catch {
  // If the model doesn't exist, create it
  User = mongoose.model<IUser>('User', userSchema);
}

export default User;
