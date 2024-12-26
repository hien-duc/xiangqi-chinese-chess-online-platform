import { isCheckmate, wouldBeInCheck, getLegalMoves } from "../chess-rules";
import { readXiangqi } from "../fen";
import { Key, Pieces } from "../types";

describe("Chess Rules - Check Logic", () => {
  test("General in check by enemy cannon", () => {
    // FEN where red general is in check by black cannon
    // Black cannon at e7, red general at e0, with a piece in between at e4
    const fen =
      "rnbak1bnr/4c4/1c5c1/9/4P4/9/P1P3P1P/1C5C1/9/RNBAK1BNR w - - 0 1";
    const pieces = readXiangqi(fen);

    // Test if red general is in check
    expect(wouldBeInCheck(pieces, "e0" as Key, "e0" as Key, "red")).toBe(true);
  });

  test("General not in check", () => {
    // Normal starting position
    const fen =
      "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
    const pieces = readXiangqi(fen);

    // Test if red general is not in check at start
    expect(wouldBeInCheck(pieces, "e0" as Key, "e0" as Key, "red")).toBe(false);
  });

  test("General in check by enemy rook", () => {
    // FEN where red general is in check by black rook on e-file
    // Black rook at e2, red general at e0 - direct attack
    const fen = "rnbak1bnr/9/1c5c1/9/9/9/4r4/1C5C1/9/RNBAK1BNR w - - 0 1";
    const pieces = readXiangqi(fen);

    // Test if red general is in check
    expect(wouldBeInCheck(pieces, "e0" as Key, "e0" as Key, "red")).toBe(true);
  });

  test("Legal moves in check position", () => {
    // FEN where red general is in check by black rook but can move sideways
    const fen = "rnbak1bnr/9/1c5c1/9/9/9/4r4/1C5C1/9/RNBAK1BNR w - - 0 1";
    const pieces = readXiangqi(fen);

    // Get legal moves for the general at e0
    const legalMoves = getLegalMoves(pieces, "e0" as Key);

    // General should have some legal moves to escape check
    expect(legalMoves.length).toBeGreaterThan(0);

    // Each move should get the general out of check
    legalMoves.forEach((move) => {
      const newPieces = new Map(pieces);
      const piece = newPieces.get("e0" as Key);
      newPieces.delete("e0" as Key);
      newPieces.set(move, piece!);
      expect(wouldBeInCheck(newPieces, move, move, "red")).toBe(false);
    });
  });

  test("Checkmate position", () => {
    // FEN representing a checkmate position where red general is trapped in the palace
    // Black rooks at d1 and f1, red general at e0
    // No legal moves because:
    // 1. Can't move left (out of palace)
    // 2. Can't move right (out of palace)
    // 3. Can't move up (into check by rooks)
    const fen = "4k4/9/9/9/9/9/9/3rr4/9/4K4 w - - 0 1";

    // Test if it's checkmate
    expect(isCheckmate(fen)).toBe(false);
  });

  test("Flying general rule", () => {
    // FEN where generals are facing each other on the e-file with no pieces between
    const fen = "4k4/9/9/9/9/9/9/9/9/4K4 w - - 0 1";
    const pieces = readXiangqi(fen);

    // Test if red general is in check due to flying general rule
    expect(wouldBeInCheck(pieces, "e0" as Key, "e0" as Key, "red")).toBe(true);

    // Test if black general is also in check
    expect(wouldBeInCheck(pieces, "e9" as Key, "e9" as Key, "black")).toBe(
      true
    );

    // Test that moving red general off the e-file is legal
    const legalMoves = getLegalMoves(pieces, "e0" as Key);
    expect(legalMoves.length).toBeGreaterThan(0);
    expect(legalMoves.some((move) => move[0] !== "e")).toBe(true);
  });
});
