import * as util from "@/utils/util";
import * as cg from "@/utils/types";
import { getValidMoves } from "./moves";
import { getTurnColor, readXiangqi } from "@/lib/game/fen";

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

  // Check if any enemy piece can attack the general
  for (const [key, p] of newPieces.entries()) {
    if (p.color !== color) {
      if (p.role === "cannon") {
        // Special check for cannon since it has unique capture rules
        const [fromX, fromY] = util.key2pos(key);
        const [toX, toY] = util.key2pos(generalPos);

        // Check if cannon and general are on same file or rank
        if (fromX === toX || fromY === toY) {
          let jumpCount = 0;

          // Count pieces between cannon and general
          if (fromX === toX) {
            const minY = Math.min(fromY, toY);
            const maxY = Math.max(fromY, toY);
            for (let y = minY + 1; y < maxY; y++) {
              if (newPieces.has(util.pos2key([fromX, y]))) {
                jumpCount++;
              }
            }
          } else {
            const minX = Math.min(fromX, toX);
            const maxX = Math.max(fromX, toX);
            for (let x = minX + 1; x < maxX; x++) {
              if (newPieces.has(util.pos2key([x, fromY]))) {
                jumpCount++;
              }
            }
          }

          // Cannon captures with exactly one piece in between
          if (jumpCount === 1) {
            return true;
          }
        }
      } else {
        // For other pieces, use normal move validation
        const validMoves = getValidMoves(newPieces, key);
        if (validMoves.includes(generalPos)) {
          return true;
        }
      }
    }
  }

  // Check if generals are facing each other
  if (generalsAreFacing(newPieces)) {
    return true;
  }

  return false;
}

// Check if the current position is checkmate
export function isCheckmate(fen: string): boolean {
  // Parse FEN string to get pieces and turn
  const pieces = readXiangqi(fen);
  const currentTurn = getTurnColor(fen);

  // First check if we're in check
  let generalPos: cg.Key | undefined;
  for (const [key, p] of pieces.entries()) {
    if (p.role === "king" && p.color === currentTurn) {
      generalPos = key;
      break;
    }
  }

  // If no general found, technically it's checkmate
  if (!generalPos) return true;

  // Check if the general is in check
  if (!wouldBeInCheck(pieces, generalPos, generalPos, currentTurn)) {
    return false;
  }

  // For each piece of the current color
  for (const [from, piece] of pieces.entries()) {
    if (piece.color === currentTurn) {
      // Get all possible moves for this piece
      const moves = getValidMoves(pieces, from);

      // For each possible move
      for (const to of moves) {
        // Try the move and see if it gets us out of check
        if (!wouldBeInCheck(pieces, from, to, currentTurn)) {
          // Found a legal move that gets us out of check
          return false;
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
  return moves.filter((to) => !wouldBeInCheck(pieces, from, to, piece.color));
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
