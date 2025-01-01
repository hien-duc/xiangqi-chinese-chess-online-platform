// Piece values in centipawns (1 pawn = 100 centipawns)
const PIECE_VALUES = {
  R: 1000, // Red Chariot (increased value)
  N: 450, // Red Horse (slightly increased)
  B: 250, // Red Elephant (slightly increased)
  A: 250, // Red Advisor (slightly increased)
  K: 10000, // Red King (increased to better handle checkmate)
  C: 500, // Red Cannon (increased value)
  P: 100, // Red Pawn
  r: -1000, // Black Chariot
  n: -450, // Black Horse
  b: -250, // Black Elephant
  a: -250, // Black Advisor
  k: -10000, // Black King
  c: -500, // Black Cannon
  p: -100, // Black Pawn
};

// Constants for evaluation
const CHECKMATE_SCORE = 20000;
const STALEMATE_SCORE = 0;
const TEMPO_BONUS = 10;

const KING_SAFETY = {
  DEFENDER_BONUS: 50, // Bonus for each defending piece
  ATTACKER_PENALTY: -80, // Penalty for each attacking piece
  EXPOSED_PENALTY: 200, // Penalty for exposed king
  CHECK_PENALTY: 300, // Additional penalty when in check
  MATE_THREAT_PENALTY: 500, // Penalty when mate threat exists
};

const CENTER_CONTROL = {
  CENTRAL_SQUARE: 30,
  PALACE_CONTROL: 40,
  RIVER_CONTROL: 25,
};

const MOBILITY_BONUS = {
  R: 10, // Chariot mobility bonus
  N: 8, // Horse mobility bonus
  C: 8, // Cannon mobility bonus
  P: 5, // Pawn mobility bonus
  r: -10,
  n: -8,
  c: -8,
  p: -5,
};

// Position bonuses for different pieces
const POSITION_BONUSES = {
  // Pawn position values
  P: [
    // Red Pawn
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [10, 10, 20, 20, 20, 20, 20, 10, 10],
    [20, 20, 40, 40, 40, 40, 40, 20, 20],
    [30, 30, 60, 60, 60, 60, 60, 30, 30],
    [40, 40, 80, 80, 80, 80, 80, 40, 40],
    [50, 50, 100, 100, 100, 100, 100, 50, 50],
    [60, 60, 120, 120, 120, 120, 120, 60, 60],
    [70, 70, 140, 140, 140, 140, 140, 70, 70],
  ],
  p: [
    // Black Pawn (inverted)
    [-70, -70, -140, -140, -140, -140, -140, -70, -70],
    [-60, -60, -120, -120, -120, -120, -120, -60, -60],
    [-50, -50, -100, -100, -100, -100, -100, -50, -50],
    [-40, -40, -80, -80, -80, -80, -80, -40, -40],
    [-30, -30, -60, -60, -60, -60, -60, -30, -30],
    [-20, -20, -40, -40, -40, -40, -40, -20, -20],
    [-10, -10, -20, -20, -20, -20, -20, -10, -10],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  // Chariot position values
  R: [
    // Red Chariot
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5, 5],
    [5, 5, 5, 5, 5, 5, 5, 5, 5],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  r: [
    // Black Chariot (inverted)
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-5, -5, -5, -5, -5, -5, -5, -5, -5],
    [-5, -5, -5, -5, -5, -5, -5, -5, -5],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  // Horse position values
  N: [
    // Red Horse
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
    [0, 0, 0, 0, 25, 0, 0, 0, 0],
    [0, 0, 0, 0, 25, 0, 0, 0, 0],
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    // Black Horse (inverted)
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, -20, 0, 0, 0, -20, 0, 0],
    [0, 0, 0, 0, -25, 0, 0, 0, 0],
    [0, 0, 0, 0, -25, 0, 0, 0, 0],
    [0, 0, -20, 0, 0, 0, -20, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

import { isInCheck, isCheckmate } from "./chess-rules";
import { getValidMoves } from "./moves";
import * as cg from "@/utils/types";
import { readXiangqi } from "./fen";

function countDefenders(
  board: string[][],
  kingRow: number,
  kingCol: number,
  isRed: boolean
): number {
  let defenders = 0;
  const range = 2; // Check within 2 squares

  for (
    let row = Math.max(0, kingRow - range);
    row <= Math.min(9, kingRow + range);
    row++
  ) {
    for (
      let col = Math.max(0, kingCol - range);
      col <= Math.min(8, kingCol + range);
      col++
    ) {
      const piece = board[row][col];
      if (!piece) continue;

      const isPieceRed = piece === piece.toUpperCase();
      if (isPieceRed === isRed && piece !== (isRed ? "K" : "k")) {
        defenders++;
      }
    }
  }

  return defenders;
}

function countAttackers(
  board: string[][],
  kingRow: number,
  kingCol: number,
  isRed: boolean
): number {
  let attackers = 0;
  const range = 2; // Check within 2 squares

  for (
    let row = Math.max(0, kingRow - range);
    row <= Math.min(9, kingRow + range);
    row++
  ) {
    for (
      let col = Math.max(0, kingCol - range);
      col <= Math.min(8, kingCol + range);
      col++
    ) {
      const piece = board[row][col];
      if (!piece) continue;

      const isPieceRed = piece === piece.toUpperCase();
      if (isPieceRed !== isRed) {
        attackers++;
      }
    }
  }

  return attackers;
}

function isExposed(
  board: string[][],
  kingRow: number,
  kingCol: number,
  isRed: boolean
): boolean {
  // Check if the king is in an exposed position (e.g., few defenders, open lines)
  const defenders = countDefenders(board, kingRow, kingCol, isRed);
  const attackers = countAttackers(board, kingRow, kingCol, isRed);

  return defenders < 2 || attackers > defenders;
}

export async function evaluatePosition(fen: string): Promise<number> {
  // Check for checkmate first
  const currentTurn = fen.split(" ")[1];
  if (isCheckmate(fen)) {
    // If it's red's turn and checkmate, black wins (negative score)
    // If it's black's turn and checkmate, red wins (positive score)
    return currentTurn === "w" ? -CHECKMATE_SCORE : CHECKMATE_SCORE;
  }

  // Get the current position and pieces
  const pieces = readXiangqi(fen);
  let evaluation = 0;

  // Check for check
  const inCheck = isInCheck(fen);
  const isRedInCheck = currentTurn === "w" && inCheck;
  const isBlackInCheck = currentTurn === "b" && inCheck;

  // If in check, check if it's mate in 1
  if (inCheck) {
    let canEscape = false;
    const defendingColor = currentTurn === "w" ? "black" : "red";

    // Check all possible moves for the defending side
    for (const [from, piece] of pieces.entries()) {
      if (piece.color === defendingColor) {
        const moves = getValidMoves(pieces, from);
        for (const to of moves) {
          if (!wouldBeInCheck(pieces, from, to, defendingColor)) {
            canEscape = true;
            break;
          }
        }
        if (canEscape) break;
      }
    }

    // If can't escape check, it's mate in 1
    if (!canEscape) {
      return currentTurn === "w" ? -CHECKMATE_SCORE : CHECKMATE_SCORE;
    }
  }

  // Evaluate material, position, mobility, and other factors
  for (const [key, piece] of pieces.entries()) {
    const isRed = piece.color === "red";
    const pieceChar = getPieceChar(piece);

    // Material value
    evaluation += PIECE_VALUES[pieceChar] || 0;

    // Position bonus from position tables
    const [row, col] = key.split("").map(Number);
    if (POSITION_BONUSES[pieceChar] && POSITION_BONUSES[pieceChar][row]) {
      evaluation += POSITION_BONUSES[pieceChar][row][col];
    }

    // Mobility bonus
    if (MOBILITY_BONUS[pieceChar]) {
      const moves = getValidMoves(pieces, key);
      const mobility = moves.length;
      evaluation += mobility * MOBILITY_BONUS[pieceChar];
    }

    // Center control bonus
    if (isCentralSquare(row, col)) {
      evaluation += isRed
        ? CENTER_CONTROL.CENTRAL_SQUARE
        : -CENTER_CONTROL.CENTRAL_SQUARE;
    }

    // Palace control bonus
    if (isInPalace(row, col, isRed ? "red" : "black")) {
      evaluation += isRed
        ? CENTER_CONTROL.PALACE_CONTROL
        : -CENTER_CONTROL.PALACE_CONTROL;
    }

    // River control bonus for pawns that have crossed
    if (piece.role === "pawn" && ((isRed && row < 5) || (!isRed && row > 4))) {
      evaluation += isRed
        ? CENTER_CONTROL.RIVER_CONTROL
        : -CENTER_CONTROL.RIVER_CONTROL;
    }

    // King safety evaluation
    if (piece.role === "king") {
      const defenders = countDefenders(
        boardFromPieces(pieces),
        row,
        col,
        isRed
      );
      const attackers = countAttackers(
        boardFromPieces(pieces),
        row,
        col,
        isRed
      );

      let kingScore =
        defenders * KING_SAFETY.DEFENDER_BONUS +
        attackers * KING_SAFETY.ATTACKER_PENALTY;

      // Apply check penalty based on whose turn it is
      if ((isRed && isRedInCheck) || (!isRed && isBlackInCheck)) {
        kingScore -= KING_SAFETY.CHECK_PENALTY;
      }

      if (isExposed(boardFromPieces(pieces), row, col, isRed)) {
        kingScore -= KING_SAFETY.EXPOSED_PENALTY;
      }

      evaluation += isRed ? kingScore : -kingScore;
    }
  }

  // Add tempo bonus for the side to move
  const isRedTurn = currentTurn === "w";
  evaluation += isRedTurn ? TEMPO_BONUS : -TEMPO_BONUS;

  return evaluation;
}

// Helper function to convert piece to char
function getPieceChar(piece: cg.Piece): string {
  const roleMap: { [key: string]: string } = {
    rook: "R",
    knight: "N",
    bishop: "B",
    advisor: "A",
    king: "K",
    cannon: "C",
    pawn: "P",
  };

  const character = roleMap[piece.role.toLowerCase()];
  if (!character) {
    console.error("Unknown piece role:", piece.role);
    return "";
  }

  return piece.color === "red" ? character : character.toLowerCase();
}

// Helper function to convert pieces map to board array
function boardFromPieces(pieces: cg.Pieces): string[][] {
  // Initialize a 10x9 board with empty strings
  const board: string[][] = [];
  for (let i = 0; i < 10; i++) {
    board[i] = Array(9).fill("");
  }

  // Place pieces on the board
  for (const [key, piece] of pieces.entries()) {
    const [row, col] = key.split("").map(Number);
    if (row >= 0 && row < 10 && col >= 0 && col < 9) {
      board[row][col] = getPieceChar(piece);
    }
  }

  return board;
}

function isInPalace(row: number, col: number, side: "red" | "black"): boolean {
  if (side === "red") {
    return row >= 7 && row <= 9 && col >= 3 && col <= 5;
  } else {
    return row >= 0 && row <= 2 && col >= 3 && col <= 5;
  }
}

function isCentralSquare(row: number, col: number): boolean {
  return row >= 4 && row <= 5 && col >= 3 && col <= 5;
}

function wouldBeInCheck(
  pieces: cg.Pieces,
  from: string,
  to: string,
  color: string
): boolean {
  // Simulate the move
  const newPieces = { ...pieces };
  newPieces[to] = newPieces[from];
  delete newPieces[from];

  // Check if the king is in check
  const kingPosition = getKingPosition(newPieces, color);
  if (!kingPosition) return false;

  const [kingRow, kingCol] = kingPosition.split("").map(Number);
  const board = boardFromPieces(newPieces);
  const attackers = countAttackers(board, kingRow, kingCol, color === "red");

  return attackers > 0;
}

function getKingPosition(pieces: cg.Pieces, color: string): string | null {
  for (const [key, piece] of pieces.entries()) {
    if (piece.role === "king" && piece.color === color) {
      return key;
    }
  }

  return null;
}
