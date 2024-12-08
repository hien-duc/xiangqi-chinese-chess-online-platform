import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "@/utils/xiangqiground";
import { useGameContext } from "@/hooks/useGameState";
import { Config } from "@/utils/config";
import { useSession } from "next-auth/react";
import * as cg from "@/utils/types";

interface XiangqiBoardProps {
  className?: string;
}

interface XiangqigroundInstance {
  destroy?: () => void;
  set?: (config: Partial<Config>) => void;
}
const DEFAULT_FEN =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR";

const XiangqiBoard: React.FC<XiangqiBoardProps> = ({ className = "" }) => {
  const { gameState, makeMove } = useGameContext();
  const { data: session } = useSession();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);
  const isInitialMount = useRef(true);

  // Initialize the board
  useEffect(() => {
    const config: Config = {
      orientation:
        gameState?.players?.red?.id === session?.user?.id ? "red" : "black",
      turnColor: gameState?.turn,
      movable: {
        free: false,
        color: gameState?.turn,
        showDests: true,
        events: {
          after: (orig: string, dest: string) => {
            makeMove(orig as cg.Key, dest as cg.Key);
          },
        },
      },
      fen: gameState?.fen || DEFAULT_FEN,
      drawable: {
        enabled: true,
        visible: true,
        defaultSnapToValidMove: true,
        eraseOnClick: true,
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
      highlight: {
        lastMove: true,
        check: true,
      },
      animation: {
        enabled: true,
        duration: 200,
      },
      draggable: {
        enabled: true,
        showGhost: true,
        deleteOnDropOff: false,
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
  }, [gameState?.fen, makeMove, session]);

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
