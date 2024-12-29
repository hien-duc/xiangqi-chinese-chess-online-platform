import * as cg from "../../utils/types";
import { getValidMoves } from "./moves";
import * as util from "../../utils/util";

describe("Xiangqi Piece Movement Tests", () => {
  // Helper function to create a pieces map
  const createPieces = (pieces: { [key: string]: { role: cg.Role; color: cg.Color } }): cg.Pieces => {
    const piecesMap = new Map<cg.Key, cg.Piece>();
    Object.entries(pieces).forEach(([key, piece]) => {
      piecesMap.set(key as cg.Key, piece);
    });
    return piecesMap;
  };

  describe("Pawn (Soldier) Movement", () => {
    it("should move forward one step before crossing river", () => {
      const pieces = createPieces({
        "e6": { role: "pawn", color: "red" },
        "e3": { role: "pawn", color: "black" },
      });

      const redMoves = getValidMoves(pieces, "e6");
      const blackMoves = getValidMoves(pieces, "e3");

      expect(redMoves).toContain("e7"); // red moves up
      expect(blackMoves).toContain("e2"); // black moves down
    });

    it("should move sideways after crossing river", () => {
      const pieces = createPieces({
        "e5": { role: "pawn", color: "red" },
        "e4": { role: "pawn", color: "black" },
      });

      const redMoves = getValidMoves(pieces, "e5");
      const blackMoves = getValidMoves(pieces, "e4");

      expect(redMoves).toEqual(expect.arrayContaining(["d5", "f5", "e6"]));
      expect(blackMoves).toEqual(expect.arrayContaining(["d4", "f4", "e3"]));
    });
  });

  describe("Advisor Movement", () => {
    it("should move diagonally within palace", () => {
      const pieces = createPieces({
        "d8": { role: "advisor", color: "red" },
        "d1": { role: "advisor", color: "black" },
      });

      const redMoves = getValidMoves(pieces, "d8");
      const blackMoves = getValidMoves(pieces, "d1");

      expect(redMoves).toEqual(expect.arrayContaining(["e9", "e7"]));
      expect(blackMoves).toEqual(expect.arrayContaining(["e2", "e0"]));
    });

    it("should not move outside palace", () => {
      const pieces = createPieces({
        "e8": { role: "advisor", color: "red" },
      });

      const moves = getValidMoves(pieces, "e8");
      const expectedMoves = ["d7", "d9", "f9"]; // Only these moves are within the red palace (y >= 7)
      expect(moves.sort()).toEqual(expectedMoves.sort());
    });

    it("should respect color-specific palace boundaries", () => {
      const redPieces = createPieces({
        "e8": { role: "advisor", color: "red" },
      });
      const blackPieces = createPieces({
        "e1": { role: "advisor", color: "black" },
      });

      const redMoves = getValidMoves(redPieces, "e8");
      const blackMoves = getValidMoves(blackPieces, "e1");

      expect(redMoves.sort()).toEqual(["d7", "d9", "f9"].sort()); // red advisor in top palace
      expect(blackMoves.sort()).toEqual(["d0", "d2", "f2"].sort()); // black advisor in bottom palace
    });
  });

  describe("Bishop Movement", () => {
    it("should move exactly two points diagonally", () => {
      const pieces = createPieces({
        "c7": { role: "bishop", color: "red" },
      });

      const moves = getValidMoves(pieces, "c7");
      expect(moves).toEqual(expect.arrayContaining(["a9", "e9", "e5"]));
    });

    it("should not cross river", () => {
      const pieces = createPieces({
        "e5": { role: "bishop", color: "red" },
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).not.toContain("c3"); // Cannot cross river
    });

    it("should be blocked by intermediate pieces", () => {
      const pieces = createPieces({
        "c7": { role: "bishop", color: "red" },
        "d8": { role: "pawn", color: "red" }, // Blocking piece
      });

      const moves = getValidMoves(pieces, "c7");
      expect(moves).not.toContain("e9"); // Blocked by pawn
    });
  });

  describe("Knight Movement", () => {
    it("should move in L-shape pattern", () => {
      const pieces = createPieces({
        "e5": { role: "knight", color: "red" },
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).toEqual(
        expect.arrayContaining(["d7", "f7", "g6", "g4", "f3", "d3", "c4", "c6"])
      );
    });

    it("should be blocked by adjacent pieces", () => {
      const pieces = createPieces({
        "e5": { role: "knight", color: "red" },
        "e6": { role: "pawn", color: "red" }, // Blocking piece
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).not.toContain("d7"); // Blocked by pawn
      expect(moves).not.toContain("f7"); // Blocked by pawn
    });
  });

  describe("Rook Movement", () => {
    it("should move horizontally and vertically", () => {
      const pieces = createPieces({
        "e5": { role: "rook", color: "red" },
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).toEqual(
        expect.arrayContaining([
          "e0", "e1", "e2", "e3", "e4", "e6", "e7", "e8", "e9",
          "a5", "b5", "c5", "d5", "f5", "g5", "h5", "i5"
        ])
      );
    });

    it("should be blocked by other pieces", () => {
      const pieces = createPieces({
        "e5": { role: "rook", color: "red" },
        "e7": { role: "pawn", color: "red" },
        "c5": { role: "pawn", color: "black" },
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).not.toContain("e8"); // Blocked by red pawn
      expect(moves).toContain("e6"); // Can move up to blocking piece
      expect(moves).toContain("c5"); // Can capture black pawn
      expect(moves).not.toContain("b5"); // Blocked by black pawn
    });
  });

  describe("Cannon Movement", () => {
    it("should move like rook when not capturing", () => {
      const pieces = createPieces({
        "e5": { role: "cannon", color: "red" },
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).toEqual(
        expect.arrayContaining([
          "e0", "e1", "e2", "e3", "e4", "e6", "e7", "e8", "e9",
          "a5", "b5", "c5", "d5", "f5", "g5", "h5", "i5"
        ])
      );
    });

    it("should capture by jumping over exactly one piece", () => {
      const pieces = createPieces({
        "e5": { role: "cannon", color: "red" },
        "e7": { role: "pawn", color: "red" }, // Screen
        "e8": { role: "pawn", color: "black" }, // Target
      });

      const moves = getValidMoves(pieces, "e5");
      expect(moves).toContain("e8"); // Can capture over one piece
      expect(moves).not.toContain("e9"); // Cannot move beyond capture
      expect(moves).not.toContain("e7"); // Cannot capture screen
    });
  });

  describe("King Movement", () => {
    it("should move one step orthogonally within palace", () => {
      const pieces = createPieces({
        "e8": { role: "king", color: "red" },
        "e1": { role: "king", color: "black" },
      });

      const redMoves = getValidMoves(pieces, "e8");
      const blackMoves = getValidMoves(pieces, "e1");

      expect(redMoves).toEqual(expect.arrayContaining(["e9", "e7", "d8", "f8"]));
      expect(blackMoves).toEqual(expect.arrayContaining(["e0", "e2", "d1", "f1"]));
    });

    it("should not move outside palace", () => {
      const pieces = createPieces({
        "e7": { role: "king", color: "red" },
      });

      const moves = getValidMoves(pieces, "e7");
      expect(moves).not.toContain("e6"); // Cannot move outside palace
    });

    it("should not move diagonally", () => {
      const pieces = createPieces({
        "e8": { role: "king", color: "red" },
      });

      const moves = getValidMoves(pieces, "e8");
      expect(moves).not.toContain("d9"); // Cannot move diagonally
    });
  });
});
