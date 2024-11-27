import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "@/src/app/utils/xiangqiground";
import { useGameContext } from "@/src/hooks/useGameState";
import { XiangqigroundConfig } from "../app/utils/types";
import { Config } from "../app/utils/config";

interface XiangqiBoardProps {
  className?: string;
}

interface XiangqigroundInstance {
  destroy?: () => void;
  set?: (config: Partial<Config>) => void;
}
const DEFAULT_FEN = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR";

const XiangqiBoard: React.FC<XiangqiBoardProps> = ({ className = "" }) => {
  const { gameState, makeMove } = useGameContext();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);
  const isInitialMount = useRef(true);

  // Initialize the board
  useEffect(() => {
    const config: Config = {
      orientation: "red",
      turnColor: gameState?.turn,
      movable: {
        free: false,
        color: "red",  
        showDests: true,
        events: {
          after: (orig: string, dest: string) => {
            makeMove(orig, dest);
          },
        },
      },
      fen: gameState?.fen || DEFAULT_FEN,
      drawable: {
        enabled: true,
      },
      premovable: {
        enabled: true,
        showDests: true,
        events: {
          set: (orig: string, dest: string) => {
            console.log(`Premove set from ${orig} to ${dest}`);
          },
          unset: () => {
            console.log("Premove unset");
          },
        },
      },
    };
    if (boardRef.current && !groundRef.current) {
      groundRef.current = Xiangqiground(boardRef.current, config);
    }
    return () => {
      if (groundRef.current?.destroy) {
        groundRef.current.destroy();
        groundRef.current = null;
      }
    };
  }, [gameState?.fen, makeMove]);

  // Update the board when game state changes
  useEffect(() => {
    if (!isInitialMount.current && groundRef.current?.set && gameState?.fen) {
      groundRef.current.set({ fen: gameState.fen });
    }
    isInitialMount.current = false;
  }, [gameState?.fen]);

  return (
    <div
      ref={boardRef}
      className={`xiangqiground ${className}`}
      style={{ width: "540px", height: "600px" }}
    />
  );
};

export default XiangqiBoard;