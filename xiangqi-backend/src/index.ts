// src/server.ts
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ucciRoutes } from './routes/ucci';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/xiangqi')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// UCCI routes
app.use('/api/ucci', ucciRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});