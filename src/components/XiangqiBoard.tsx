import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "@/src/app/utils/xiangqiground";
import { useGameContext } from "@/src/hooks/useGameState";
import { XiangqigroundConfig } from "../app/utils/types";

interface XiangqiBoardProps {
  className?: string;
}

interface XiangqigroundInstance {
  destroy?: () => void;
  set?: (config: Partial<XiangqigroundConfig>) => void;
}
const DEFAULT_FEN = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR";

const XiangqiBoard: React.FC<XiangqiBoardProps> = ({ className = "" }) => {
  const { gameState, makeMove } = useGameContext();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);
  const lastFenRef = useRef<string | null>(null);

  // Create config object outside of effects to maintain consistency
  const config: XiangqigroundConfig = {
    movable: {
      free: true,
      color: "both",
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
      moveIndicator: {
        enabled: true,
        showDests: true,
        brushes: {
          normal: {
            key: "normal",
            color: "#15781B",
            opacity: 0.5,
            lineWidth: 2,
          },
          capture: {
            key: "capture",
            color: "#882020",
            opacity: 0.7,
            lineWidth: 2,
          },
          check: {
            key: "check",
            color: "#E89B0C",
            opacity: 0.8,
            lineWidth: 2,
          },
        },
      },
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

  // Initialize the board
  useEffect(() => {
    if (boardRef.current && !groundRef.current) {
      groundRef.current = Xiangqiground(boardRef.current, config);
    }
    return () => {
      if (groundRef.current?.destroy) {
        groundRef.current.destroy();
        groundRef.current = null;
      }
    };
  }, []);

  // Update the board when game state changes
  useEffect(() => {
    if (groundRef.current?.set && gameState?.fen) {
      // Only update if FEN has actually changed
      if (lastFenRef.current != gameState.fen) {
        lastFenRef.current = gameState.fen;
        groundRef.current.set({ fen: gameState.fen });
      }
    }
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