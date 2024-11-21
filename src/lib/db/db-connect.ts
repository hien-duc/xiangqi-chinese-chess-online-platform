import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { ConnectOptions } from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const options: ConnectOptions = {
    bufferCommands: false,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 100000,
    socketTimeoutMS: 20000,
  };
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    await mongoose.disconnect();
    await mongoose.connect(uri, options);

    console.log("✅ Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export default clientPromise;
