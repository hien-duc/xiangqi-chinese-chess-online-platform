import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('app:database');

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xiangqi');
        log('Connected to MongoDB');
    } catch (error) {
        log('MongoDB connection error:', error);
        process.exit(1);
    }
}