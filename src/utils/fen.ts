import { pos2key, invRanks } from "./util.ts";
import * as cg from "./types.ts";

export const initialFen: cg.FEN =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";

const roles: { [letter: string]: cg.Role } = {
  k: "king",
  a: "advisor",
  b: "bishop",
  r: "rook",
  c: "cannon",
  n: "knight",
  p: "pawn",
};

const letters = {
  king: "k",
  advisor: "a",
  bishop: "b",
  rook: "r",
  cannon: "c",
  knight: "n",
  pawn: "p",
};

export function read(fen: cg.FEN): cg.Pieces {
  if (fen === "start") fen = initialFen;
  const pieces: cg.Pieces = new Map();
  let row = 9,
    col = 0;
  for (const c of fen) {
    switch (c) {
      case " ":
        return pieces;
      case "/":
        --row;
        if (row < 0) return pieces;
        col = 0;
        break;
      default: {
        const nb = c.charCodeAt(0);
        if (nb < 58) col += nb - 48;
        else {
          const role = c.toLowerCase();
          // console.log(col, row);
          pieces.set(pos2key([col, row]), {
            role: roles[role],
            color: c === role ? "black" : "red",
          });
          ++col;
        }
      }
    }
  }
  return pieces;
}

export function readXiangqi(fen: cg.FEN): cg.Pieces {
  if (fen === "start") fen = initialFen; // Use the initial Xiangqi position if "start" is passed.
  const pieces: cg.Pieces = new Map();
  let row = 9, // Start from the top row (9 in Xiangqi).
    col = 0;

  for (const c of fen) {
    switch (c) {
      case " ":
        return pieces; // End of the position description.
      case "/":
        --row; // Move to the next row.
        col = 0; // Reset the column.
        break;
      default: {
        const nb = c.charCodeAt(0);
        if (nb < 58) {
          // Handle numbers ('1' to '9') representing empty spaces.
          col += nb - 48; // Add the number of empty columns.
        } else {
          const role = roles[c.toLowerCase()] as cg.Role; // Map the piece character to its role.
          if (role) {
            pieces.set(pos2key([col, row]), {
              role,
              color: c === c.toLowerCase() ? "black" : "red", // Determine color based on case.
            });
            ++col; // Move to the next column.
          }
        }
      }
    }
  }
  return pieces;
}

/**
 * Write the current position to FEN notation
 * @param pieces The pieces on the board
 * @param nextTurn Optional - specify whose turn is next (defaults to black)
 * @returns Complete FEN string including turn, castling rights, etc.
 */
export function write(pieces: cg.Pieces, nextTurn: "red" | "black" = "black"): cg.FEN {
  const position = invRanks
    .map((y) =>
      cg.files
        .map((x) => {
          const piece = pieces.get((x + y) as cg.Key);
          if (piece) {
            let p = letters[piece.role];
            if (piece.color === "red") p = p.toUpperCase();
            return p;
          } else return "1";
        })
        .join("")
    )
    .join("/")
    .replace(/1{2,}/g, (s) => s.length.toString());

  // Add the latter part of FEN: turn, castling, en passant, halfmove, fullmove
  return `${position} ${nextTurn === "red" ? "w" : "b"} - - 0 1`;
}

/**
 * Extract the turn color from a FEN string
 * @param fen The FEN string
 * @returns "red" if it's red's turn (w), "black" if it's black's turn (b)
 */
export function getTurnColor(fen: cg.FEN): "red" | "black" {
  const [_, turn] = fen.split(" ");
  return turn === "w" ? "red" : "black";
}
