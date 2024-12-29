import { State } from "@/lib/game/state.ts";
import * as cg from "@/utils/types.ts";
import * as board from "@/components/ui/board/_lib/board.ts";
import * as util from "@/utils/util.ts";
import { cancel as dragCancel } from "./drag.ts";

export function setDropMode(s: State, piece?: cg.Piece): void {
  s.dropmode = {
    active: true,
    piece,
  };
  dragCancel(s);
}

export function cancelDropMode(s: State): void {
  s.dropmode = {
    active: false,
  };
}

export function drop(s: State, e: cg.MouchEvent): void {
  if (!s.dropmode.active) return;

  board.unsetPremove(s);
  board.unsetPredrop(s);

  const piece = s.dropmode.piece;

  if (piece) {
    s.pieces.set("a0", piece);
    const position = util.eventPosition(e);
    const dest =
      position &&
      board.getKeyAtDomPos(position, board.redPov(s), s.dom.bounds());
    if (dest) board.dropNewPiece(s, "a0", dest);
  }
  s.dom.redraw();
}
