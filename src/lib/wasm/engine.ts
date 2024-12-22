import init, { XiangqiEngine } from "../../../xiangqi-wasm/pkg";

let wasmModule: typeof import("../../../xiangqi-wasm/pkg") | null = null;
let engine: XiangqiEngine | null = null;

export interface EngineMove {
  from: string;
  to: string;
  fen: string;
}

export async function initWasmEngine(enginePath: string) {
  if (!wasmModule) {
    wasmModule = await init();
    engine = new XiangqiEngine(enginePath);
    try {
      await engine.start();
    } catch (error) {
      console.error("Failed to start engine:", error);
      throw error;
    }
  }
  return engine;
}

export async function getBestMove(fen: string): Promise<EngineMove> {
  if (!engine) {
    throw new Error("Engine not initialized");
  }

  try {
    const moveJson = await engine.get_best_move(fen);
    return JSON.parse(moveJson);
  } catch (error) {
    console.error("Failed to get best move:", error);
    throw error;
  }
}

export function stopEngine() {
  if (engine) {
    try {
      engine.stop();
      engine = null;
      wasmModule = null;
    } catch (error) {
      console.error("Failed to stop engine:", error);
      throw error;
    }
  }
}
