import { Api, start } from "@/lib/api/api.ts";
import { Config, configure } from "@/utils/config.ts";
import { HeadlessState, State, defaults } from "@/lib/game/state.ts";
import { renderWrap } from "@/utils/wrap.ts";
import * as events from "@/utils/events.ts";
import {
  render,
  renderResized,
  updateBounds,
} from "@/components/ui/board/_lib/render.ts";
import * as autoPieces from "@/components/ui/pieces/_lib/autoPieces.ts";
import * as svg from "@/components/ui/board/_lib/svg.ts";
import * as util from "@/utils/util.ts";

export function initModule({
  el,
  config,
}: {
  el: HTMLElement;
  config?: Config;
}): Api {
  return Xiangqiground(el, config);
}

export function Xiangqiground(element: HTMLElement, config?: Config): Api {
  const maybeState: State | HeadlessState = defaults();

  configure(maybeState, config || {});

  function redrawAll(): State {
    const prevUnbind = "dom" in maybeState ? maybeState.dom.unbind : undefined;
    // compute bounds from existing board element if possible
    // this allows non-square boards from CSS to be handled (for 3D)
    const elements = renderWrap(element, maybeState),
      bounds = util.memo(() => elements.board.getBoundingClientRect()),
      redrawNow = (skipSvg?: boolean): void => {
        render(state);
        if (elements.autoPieces) autoPieces.render(state, elements.autoPieces);
        if (!skipSvg && elements.svg)
          svg.renderSvg(state, elements.svg, elements.customSvg!);
      },
      onResize = (): void => {
        updateBounds(state);
        renderResized(state);
        if (elements.autoPieces) autoPieces.renderResized(state);
      };
    const state = maybeState as State;
    state.dom = {
      elements,
      bounds,
      redraw: debounceRedraw(redrawNow),
      redrawNow,
      unbind: prevUnbind,
    };
    state.drawable.prevSvgHash = "";
    updateBounds(state);
    redrawNow(false);
    events.bindBoard(state, onResize);
    if (!prevUnbind) state.dom.unbind = events.bindDocument(state, onResize);
    state.events.insert && state.events.insert(elements);
    return state;
  }

  return start(redrawAll(), redrawAll);
}

function debounceRedraw(redrawNow: (skipSvg?: boolean) => void): () => void {
  let redrawing = false;
  return () => {
    if (redrawing) return;
    redrawing = true;
    requestAnimationFrame(() => {
      redrawNow();
      redrawing = false;
    });
  };
}
