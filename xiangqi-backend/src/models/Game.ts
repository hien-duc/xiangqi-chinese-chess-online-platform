// src/models/Game.ts
import mongoose, { Document, Schema } from 'mongoose';
import { GameStatus } from '../types/game';

export interface IGame extends Document {
    fen: string;
    status: GameStatus;
    players: {
        red: mongoose.Types.ObjectId;
        black: mongoose.Types.ObjectId;
    };
    currentTurn: 'red' | 'black';
    moves: Array<{
        pieceId: string;
        from: {
            x: number;
            y: number;
        };
        to: {
            x: number;
            y: number;
        };
        timestamp: Date;
        player: mongoose.Types.ObjectId;
        fen: string;
    }>;
    isCheck: boolean;
    isCheckmate: boolean;
    startTime: Date;
    endTime?: Date;
    result?: 'red' | 'black' | 'draw';
    lastMoveTime?: Date;
    timer?: {
        red: number;
        black: number;
    };
}

const gameSchema = new Schema<IGame>({
    fen: {
        type: String,
        required: true,
        default: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1' // Starting position
    },
    status: {
        type: String,
        enum: Object.values(GameStatus),
        default: GameStatus.WAITING
    },
    players: {
        red: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        black: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    currentTurn: {
        type: String,
        enum: ['red', 'black'],
        default: 'red'
    },
    moves: [{
        pieceId: { type: String, required: true },
        from: {
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        },
        to: {
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        },
        timestamp: { type: Date, default: Date.now },
        player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fen: { type: String, required: true }
    }],
    isCheck: {
        type: Boolean,
        default: false
    },
    isCheckmate: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    result: {
        type: String,
        enum: ['red', 'black', 'draw']
    },
    lastMoveTime: {
        type: Date
    },
    timer: {
        red: { type: Number },
        black: { type: Number }
    }
});

// Indexes for better query performance
gameSchema.index({ 'players.red': 1, status: 1 });
gameSchema.index({ 'players.black': 1, status: 1 });
gameSchema.index({ startTime: -1 });
gameSchema.index({ status: 1, startTime: -1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);