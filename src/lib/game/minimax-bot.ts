import { getLegalMoves, isCheckmate } from "./chess-rules";
import { evaluatePosition } from "./evaluation";
import { readXiangqi, write, getTurnColor } from "./fen";
import * as cg from "@/utils/types";

export async function getBestMoveMinimax(fen: string, depth: number = 2): Promise<string | null> {
  const pieces = readXiangqi(fen);
  const turn = getTurnColor(fen);

  const moves: { from: cg.Key; to: cg.Key }[] = [];
  for (const [from, piece] of pieces.entries()) {
    if (piece.color === turn) {
      const validDests = getLegalMoves(pieces, from);
      for (const to of validDests) {
        moves.push({ from, to });
      }
    }
  }

  if (moves.length === 0) return null;

  // Heuristic sort: captures first
  moves.sort((a, b) => {
    const targetA = pieces.get(a.to);
    const targetB = pieces.get(b.to);
    const valA = targetA ? 1 : 0;
    const valB = targetB ? 1 : 0;
    return valB - valA;
  });

  let bestMove: { from: cg.Key; to: cg.Key } | null = null;
  let bestScore = turn === "red" ? -Infinity : Infinity;

  for (const move of moves) {
    const newPieces = new Map(pieces);
    const piece = newPieces.get(move.from)!;
    newPieces.set(move.to, piece);
    newPieces.delete(move.from);

    const nextTurn = turn === "red" ? "black" : "red";
    const nextFen = write(newPieces, nextTurn);

    const score = await minimax(nextFen, depth - 1, -Infinity, Infinity, nextTurn === "red");

    if (turn === "red") {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  if (bestMove) {
    return `${bestMove.from}${bestMove.to}`;
  }
  return null;
}

async function minimax(
  fen: string,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): Promise<number> {
  if (depth === 0 || isCheckmate(fen)) {
    return evaluatePosition(fen);
  }

  const pieces = readXiangqi(fen);
  const turn = getTurnColor(fen);

  const moves: { from: cg.Key; to: cg.Key }[] = [];
  for (const [from, piece] of pieces.entries()) {
    if (piece.color === turn) {
      const validDests = getLegalMoves(pieces, from);
      for (const to of validDests) {
        moves.push({ from, to });
      }
    }
  }

  if (moves.length === 0) {
    return evaluatePosition(fen);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newPieces = new Map(pieces);
      const piece = newPieces.get(move.from)!;
      newPieces.set(move.to, piece);
      newPieces.delete(move.from);

      const nextFen = write(newPieces, "black");
      const evalScore = await minimax(nextFen, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newPieces = new Map(pieces);
      const piece = newPieces.get(move.from)!;
      newPieces.set(move.to, piece);
      newPieces.delete(move.from);

      const nextFen = write(newPieces, "red");
      const evalScore = await minimax(nextFen, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
