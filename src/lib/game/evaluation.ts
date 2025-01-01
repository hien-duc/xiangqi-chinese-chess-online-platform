// Piece values in centipawns (1 pawn = 100 centipawns)
const PIECE_VALUES = {
  R: 900,  // Red Chariot
  N: 400,  // Red Horse
  B: 200,  // Red Elephant
  A: 200,  // Red Advisor
  K: 6000, // Red King
  C: 450,  // Red Cannon
  P: 100,  // Red Pawn
  r: -900, // Black Chariot
  n: -400, // Black Horse
  b: -200, // Black Elephant
  a: -200, // Black Advisor
  k: -6000,// Black King
  c: -450, // Black Cannon
  p: -100, // Black Pawn
};

// Position bonuses for different pieces (simplified)
const POSITION_BONUSES = {
  P: [ // Red Pawn position bonuses
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [10, 10, 20, 20, 20, 20, 20, 10, 10],
    [20, 20, 40, 40, 40, 40, 40, 20, 20],
    [30, 30, 60, 60, 60, 60, 60, 30, 30],
    [40, 40, 80, 80, 80, 80, 80, 40, 40],
    [50, 50, 100,100,100,100,100,50, 50],
    [60, 60, 120,120,120,120,120,60, 60],
    [70, 70, 140,140,140,140,140,70, 70],
  ],
  p: [ // Black Pawn position bonuses (inverted)
    [-70,-70,-140,-140,-140,-140,-140,-70,-70],
    [-60,-60,-120,-120,-120,-120,-120,-60,-60],
    [-50,-50,-100,-100,-100,-100,-100,-50,-50],
    [-40,-40,-80, -80, -80, -80, -80, -40,-40],
    [-30,-30,-60, -60, -60, -60, -60, -30,-30],
    [-20,-20,-40, -40, -40, -40, -40, -20,-20],
    [-10,-10,-20, -20, -20, -20, -20, -10,-10],
    [0,  0,  0,   0,   0,   0,   0,   0,  0],
    [0,  0,  0,   0,   0,   0,   0,   0,  0],
    [0,  0,  0,   0,   0,   0,   0,   0,  0],
  ],
};

export async function evaluatePosition(fen: string): Promise<number> {
  const [position] = fen.split(" ");
  const rows = position.split("/");
  let evaluation = 0;

  // Evaluate material and position
  for (let row = 0; row < rows.length; row++) {
    let col = 0;
    for (const char of rows[row]) {
      if (/\d/.test(char)) {
        col += parseInt(char);
      } else {
        // Add material value
        evaluation += PIECE_VALUES[char] || 0;

        // Add position bonus for pawns
        if (char === "P" && POSITION_BONUSES.P[row]) {
          evaluation += POSITION_BONUSES.P[row][col];
        } else if (char === "p" && POSITION_BONUSES.p[row]) {
          evaluation += POSITION_BONUSES.p[row][col];
        }

        col++;
      }
    }
  }

  return evaluation;
}
