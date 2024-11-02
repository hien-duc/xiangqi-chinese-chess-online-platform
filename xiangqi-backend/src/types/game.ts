// src/types/game.ts
export interface Position {
    x: number;
    y: number;
}

export interface Piece {
    id: string;
    type: PieceType;
    position: Position;
    color: 'red' | 'black';
}

export enum PieceType {
    GENERAL = 'general',    // 将/帅
    ADVISOR = 'advisor',    // 士/仕
    ELEPHANT = 'elephant',  // 象/相
    HORSE = 'horse',       // 马
    CHARIOT = 'chariot',   // 車
    CANNON = 'cannon',     // 炮
    SOLDIER = 'soldier'    // 兵/卒
}

export interface Move {
    pieceId: string;
    from: Position;
    to: Position;
    timestamp: Date;
    player: string;
    fen: string;  // FEN after this move
}

export enum GameStatus {
    WAITING = 'waiting',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned'
}

export interface GameState {
    id: string;
    fen: string;  // Current FEN position
    currentTurn: 'red' | 'black';
    status: GameStatus;
    moves: Move[];
    players: {
        red: string;
        black: string;
    };
    timer?: {
        red: number;
        black: number;
    };
    isCheck: boolean;
    isCheckmate: boolean;
    startTime: Date;
    endTime?: Date;
    result?: 'red' | 'black' | 'draw';
    lastMoveTime?: Date;
}