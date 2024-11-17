import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local')
}

export async function connectToDatabase() {
    try {
        // Attempt to connect to MongoDB
        const { connection } = await mongoose.connect(process.env.MONGODB_URI!)

        // Check connection status
        // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        if (connection.readyState === 1) {
            console.log('✅ Connected to MongoDB')
            return Promise.resolve(true)
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error)
        return Promise.reject(error)
    }
}