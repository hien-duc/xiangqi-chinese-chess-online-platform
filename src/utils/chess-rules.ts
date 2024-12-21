import * as util from "./util";
import * as cg from "./types";
import { getValidMoves } from "./moves";
import { readXiangqi } from "./fen";

// Check if a move would put the moving side's general in check
export function wouldBeInCheck(
  pieces: cg.Pieces,
  from: cg.Key,
  to: cg.Key,
  color: cg.Color
): boolean {
  // Create a new map with the hypothetical move
  const newPieces = new Map(pieces);
  const piece = newPieces.get(from);
  if (!piece) return false;

  // Apply the move
  newPieces.delete(from);
  newPieces.set(to, piece);

  // Find the general's position
  let generalPos: cg.Key | undefined;
  for (const [key, p] of newPieces.entries()) {
    if (p.role === "king" && p.color === color) {
      generalPos = key;
      break;
    }
  }
  if (!generalPos) return false;

  // Check if any opponent piece can capture the general
  for (const [key, p] of newPieces.entries()) {
    if (p.color !== color) {
      const moves = getValidMoves(newPieces, key);
      if (moves.includes(generalPos)) {
        return true;
      }
    }
  }

  return false;
}

// Check if the current position is checkmate
export function isCheckmate(pieces: cg.Pieces, color: cg.Color): boolean;
export function isCheckmate(fen: string): boolean;
export function isCheckmate(arg1: string | cg.Pieces, arg2?: cg.Color): boolean {
  if (typeof arg1 === 'string') {
    // Parse FEN string to get pieces and turn
    const pieces = readXiangqi(arg1);
    // Get turn color from FEN (after the space)
    const [_, turn] = arg1.split(' ');
    const color = turn === 'w' ? 'red' : 'black';
    return isCheckmateCore(pieces, color);
  }
  return isCheckmateCore(arg1, arg2!);
}

// Core checkmate detection logic
function isCheckmateCore(pieces: cg.Pieces, color: cg.Color): boolean {
  // First check if we're in check
  let generalPos: cg.Key | undefined;
  for (const [key, p] of pieces.entries()) {
    if (p.role === "king" && p.color === color) {
      generalPos = key;
      break;
    }
  }
  
  // If no general found, technically it's checkmate
  if (!generalPos) return true;

  // Check if the general is in check
  let isInCheck = false;
  for (const [key, p] of pieces.entries()) {
    if (p.color !== color) {
      const moves = getValidMoves(pieces, key);
      if (moves.includes(generalPos)) {
        isInCheck = true;
        break;
      }
    }
  }

  // If we're not in check, it's not checkmate
  if (!isInCheck) return false;

  // For each piece of the current color
  for (const [from, piece] of pieces.entries()) {
    if (piece.color === color) {
      // Get all possible moves for this piece
      const moves = getValidMoves(pieces, from);
      
      // For each possible move
      for (const to of moves) {
        // Try the move and see if it gets us out of check
        const newPieces = new Map(pieces);
        const capturedPiece = newPieces.get(to);
        newPieces.delete(from);
        newPieces.set(to, piece);
        
        // After making the move, are we still in check?
        if (!wouldBeInCheck(newPieces, from, to, color)) {
          // Restore the captured piece before returning
          if (capturedPiece) {
            newPieces.set(to, capturedPiece);
          }
          return false; // Found a legal move that gets us out of check
        }
        
        // Restore the captured piece for next iteration
        if (capturedPiece) {
          newPieces.set(to, capturedPiece);
        }
      }
    }
  }
  
  // If we haven't found any legal moves and we're in check, it's checkmate
  return true;
}

// Check if two generals are facing each other
export function generalsAreFacing(pieces: cg.Pieces): boolean {
  let redGeneral: cg.Key | undefined;
  let blackGeneral: cg.Key | undefined;

  // Find both generals
  for (const [key, piece] of pieces.entries()) {
    if (piece.role === "king") {
      if (piece.color === "red") {
        redGeneral = key;
      } else {
        blackGeneral = key;
      }
    }
  }

  if (!redGeneral || !blackGeneral) return false;

  const [redX, redY] = util.key2pos(redGeneral);
  const [blackX, blackY] = util.key2pos(blackGeneral);

  // Check if generals are in the same file
  if (redX !== blackX) return false;

  // Check if there are any pieces between them
  for (let y = Math.min(redY, blackY) + 1; y < Math.max(redY, blackY); y++) {
    if (pieces.has(util.pos2key([redX, y]))) {
      return false;
    }
  }

  return true;
}

// Get all legal moves (considering check)
export function getLegalMoves(pieces: cg.Pieces, from: cg.Key): cg.Key[] {
  const piece = pieces.get(from);
  if (!piece) return [];

  const moves = getValidMoves(pieces, from);
  return moves.filter(to => !wouldBeInCheck(pieces, from, to, piece.color));
}

// Check if a move is legal (considering check and other special rules)
export function isLegalMove(
  pieces: cg.Pieces,
  from: cg.Key,
  to: cg.Key
): boolean {
  const piece = pieces.get(from);
  if (!piece) return false;

  // Check if the move is in the list of valid moves
  const validMoves = getValidMoves(pieces, from);
  if (!validMoves.includes(to)) return false;

  // Check if the move would put/leave us in check
  if (wouldBeInCheck(pieces, from, to, piece.color)) return false;

  // Create a new map with the hypothetical move
  const newPieces = new Map(pieces);
  newPieces.delete(from);
  newPieces.set(to, piece);

  // Check if the move would result in facing generals
  if (generalsAreFacing(newPieces)) return false;

  return true;
}
