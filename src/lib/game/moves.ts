import * as util from "../../utils/util";
import * as cg from "../../utils/types";

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;

function isBlocked(pieces: cg.Pieces, x: number, y: number): boolean {
  return pieces.has(util.pos2key([Math.floor(x), Math.floor(y)]));
}

// Pawn (soldier) movement
function pawn(color: cg.Color): Mobility {
  return (x1, y1, x2, y2) => {
    const forward = color === "red" ? 1 : -1;
    const crossed = color === "red" ? y1 > 4 : y1 < 5;

    if (crossed) {
      // Can move sideways after crossing river
      return (
        (Math.abs(x2 - x1) === 1 && y2 === y1) ||
        (x2 === x1 && y2 === y1 + forward)
      );
    } else {
      // Can only move forward before crossing
      return x2 === x1 && y2 === y1 + forward;
    }
  };
}

// Advisor (士) movement
function advisor(x1: number, y1: number, x2: number, y2: number): boolean {
  return (
    Math.abs(x1 - x2) === 1 &&
    Math.abs(y1 - y2) === 1 &&
    x2 >= 3 &&
    x2 <= 5 &&
    ((y2 >= 0 && y2 <= 2) || (y2 >= 7 && y2 <= 9))
  );
}

// Elephant (相) movement
function elephant(
  pieces: cg.Pieces,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Check basic elephant move pattern (2 squares diagonally)
  if (Math.abs(dx) !== 2 || Math.abs(dy) !== 2) return false;

  // Check if elephant stays on its side of the river
  if (y1 <= 4 && y2 > 4) return false; // Can't cross river
  if (y1 >= 5 && y2 < 5) return false; // Can't cross river

  // Check if the path is blocked
  return !isBlocked(pieces, x1 + dx / 2, y1 + dy / 2);
}

// Bishop movement
function bishop(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pieces: cg.Pieces
): boolean {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  // Basic L-shape movement check
  if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;

  // Check for blocking piece (蹩马腿)
  const blockX = dx === 2 ? x1 + (x2 > x1 ? 1 : -1) : x1;
  const blockY = dy === 2 ? y1 + (y2 > y1 ? 1 : -1) : y1;

  return !isBlocked(pieces, blockX, blockY);
}

// Knight (马) movement
function knight(
  pieces: cg.Pieces,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  // Basic L-shape movement check
  if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;

  // Check for blocking piece (蹩马腿)
  const blockX = dx === 2 ? x1 + (x2 > x1 ? 1 : -1) : x1;
  const blockY = dy === 2 ? y1 + (y2 > y1 ? 1 : -1) : y1;

  return !isBlocked(pieces, blockX, blockY);
}

// Rook (车) movement
function rook(
  pieces: cg.Pieces,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  if (x1 !== x2 && y1 !== y2) return false;

  // Check for pieces blocking the path
  if (x1 === x2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY + 1; y < maxY; y++) {
      if (isBlocked(pieces, x1, y)) return false;
    }
  } else {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX + 1; x < maxX; x++) {
      if (isBlocked(pieces, x, y1)) return false;
    }
  }
  return true;
}

// Cannon movement (similar to bishop but can jump over one piece to capture)
function cannon(
  pieces: cg.Pieces,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  if (x1 !== x2 && y1 !== y2) return false;

  const pieceAtDest = pieces.get(util.pos2key([x2, y2]));
  let piecesInBetween = 0;

  if (x1 === x2) {
    for (let y = Math.min(y1, y2) + 1; y < Math.max(y1, y2); y++) {
      if (pieces.has(util.pos2key([x1, y]))) piecesInBetween++;
    }
  } else {
    for (let x = Math.min(x1, x2) + 1; x < Math.max(x1, x2); x++) {
      if (pieces.has(util.pos2key([x, y1]))) piecesInBetween++;
    }
  }

  return pieceAtDest ? piecesInBetween === 1 : piecesInBetween === 0;
}

// King (general) movement
function king(
  pieces: cg.Pieces,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: cg.Color
): boolean {
  // Check if move is orthogonal and only one step
  if (
    !(
      (Math.abs(x2 - x1) === 1 && y2 === y1) ||
      (x1 === x2 && Math.abs(y2 - y1) === 1)
    )
  ) {
    return false;
  }

  // Check palace boundaries (3x3 grid)
  const inPalace = (x: number, y: number, color: cg.Color) => {
    // Files are 0-based: 3,4,5 correspond to 'd','e','f'
    const validX = x >= 3 && x <= 5;
    
    // For black (top): y should be 7-9
    // For red (bottom): y should be 0-2
    // Note: The coordinate system is flipped for red player
    const validY = color === 'red' ? (y >= 0 && y <= 2) : (y >= 7 && y <= 9);
    
    return validX && validY;
  };

  // Check both start and end positions
  return inPalace(x1, y1, color) && inPalace(x2, y2, color);
}

export function getValidMoves(pieces: cg.Pieces, key: cg.Key): cg.Key[] {
  const piece = pieces.get(key);
  if (!piece) return [];

  const pos = util.key2pos(key);
  const mobility: Mobility =
    piece.role === "pawn"
      ? pawn(piece.color)
      : piece.role === "advisor"
      ? advisor
      : piece.role === "bishop"
      ? (x1, y1, x2, y2) => elephant(pieces, x1, y1, x2, y2)
      : piece.role === "knight"
      ? (x1, y1, x2, y2) => knight(pieces, x1, y1, x2, y2)
      : piece.role === "king"
      ? (x1, y1, x2, y2) => king(pieces, x1, y1, x2, y2, piece.color)
      : piece.role === "rook"
      ? (x1, y1, x2, y2) => rook(pieces, x1, y1, x2, y2)
      : piece.role === "cannon"
      ? (x1, y1, x2, y2) => cannon(pieces, x1, y1, x2, y2)
      : (x1, y1, x2, y2) => false;

  return util.allPos
    .filter((pos2) => {
      if (pos[0] === pos2[0] && pos[1] === pos2[1]) return false;
      const destPiece = pieces.get(util.pos2key(pos2));
      if (destPiece && destPiece.color === piece.color) return false;
      return mobility(pos[0], pos[1], pos2[0], pos2[1]);
    })
    .map(util.pos2key);
}
