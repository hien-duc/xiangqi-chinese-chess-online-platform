import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
    // serverApi: {
    //     version: ServerApiVersion.v1,
    //     strict: true,
    //     deprecationErrors: true,
    //   },
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
    }
    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
} else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

// export async function connectToDatabase() {
//     try {
//         // Attempt to connect to MongoDB
//         const { connection } = await mongoose.connect(process.env.MONGODB_URI!)

//         // Check connection status
//         // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//         if (connection.readyState === 1) {
//             console.log('✅ Connected to MongoDB')
//             return Promise.resolve(true)
//         }
//     } catch (error) {
//         console.error('❌ MongoDB connection error:', error)
//         return Promise.reject(error)
//     }
// }

export default clientPromise