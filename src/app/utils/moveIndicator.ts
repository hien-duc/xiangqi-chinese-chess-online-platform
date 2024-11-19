import { State } from "./state";
import { DrawShape } from "./draw";
import * as cg from "./types";

export function generateMoveIndicators(
  state: State,
  orig: cg.Key
): DrawShape[] {
  const piece = state.pieces.get(orig);
  if (!piece) return [];

  const shapes: DrawShape[] = [];
  const dests = state.movable.dests?.get(orig) || [];

  // Circle on the selected piece
  shapes.push({
    orig,
    brush: "blue",
    modifiers: { lineWidth: 2 },
  });

  // Destination indicators
  for (const dest of dests) {
    const destPiece = state.pieces.get(dest);
    const brush = destPiece ? "red" : "green";

    shapes.push({
      orig: dest,
      brush,
      modifiers: {
        lineWidth: 2,
      },
    });
  }

  return shapes;
}

export function showMoveIndicators(state: State, orig: cg.Key): void {
  if (!state.drawable.moveIndicator?.enabled) return;
  
  // Clear existing auto shapes
  state.drawable.autoShapes = [];
  // Generate and set new indicators
  const indicators = generateMoveIndicators(state, orig);
  state.drawable.autoShapes = indicators;
  state.dom.redraw();
}
