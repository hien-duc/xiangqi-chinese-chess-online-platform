import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { ConnectOptions } from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoUriPromise?: Promise<string>;
  _mongoMemoryServer?: any;
};

async function resolveUri(): Promise<string> {
  const defaultUri = process.env.MONGODB_URI!;
  
  if (process.env.NODE_ENV !== "development") {
    return defaultUri;
  }

  try {
    // Ping configured MongoDB with a short timeout to see if it's reachable
    const client = new MongoClient(defaultUri, {
      ...options,
      serverSelectionTimeoutMS: 2000,
    });
    await client.connect();
    await client.close();
    return defaultUri;
  } catch (err) {
    console.warn("⚠️ Local MongoDB is unreachable. Attempting to start in-memory MongoDB fallback...");
    
    if (!globalWithMongo._mongoMemoryServer) {
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        globalWithMongo._mongoMemoryServer = mongoServer;
        console.log("✅ In-memory MongoDB fallback started successfully.");
      } catch (memErr) {
        console.error("❌ Failed to start in-memory MongoDB server:", memErr);
        throw err;
      }
    }
    return globalWithMongo._mongoMemoryServer.getUri();
  }
}

if (!globalWithMongo._mongoUriPromise) {
  globalWithMongo._mongoUriPromise = resolveUri();
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoUriPromise.then(async (resolvedUri) => {
  const client = new MongoClient(resolvedUri, options);
  return client.connect();
});

export async function connectToDatabase() {
  const connectOptions: ConnectOptions = {
    bufferCommands: false,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  };
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    const resolvedUri = (await globalWithMongo._mongoUriPromise) as string;
    await mongoose.disconnect();
    await mongoose.connect(resolvedUri, connectOptions);
    console.log("✅ Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export default clientPromise;
