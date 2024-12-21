import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "@/utils/xiangqiground";
import { useGameContext } from "@/hooks/useGameState";
import { Config } from "@/utils/config";
import { useSession } from "next-auth/react";

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
  const { gameState, makeMove, isLoading } = useGameContext();
  const { data: session } = useSession();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);
  const isInitialMount = useRef(true);

  // Initialize the board
  useEffect(() => {
    const isGameActive = gameState?.status === "active";
    const config: Config = {
      orientation:
        gameState?.players?.red?.id === session?.user?.id ? "red" : "black",
      turnColor: gameState?.turn,
      movable: {
        free: false,
        color: isGameActive ? gameState?.turn : undefined,
        showDests: isGameActive,
        events: {
          after: (orig: string, dest: string) => {
            makeMove(orig, dest);
          },
        },
      },
      fen: gameState?.fen || DEFAULT_FEN,
      drawable: {
        enabled: isGameActive,
        visible: isGameActive,
        defaultSnapToValidMove: true,
        eraseOnClick: true,
      },
      premovable: {
        enabled: isGameActive,
        showDests: isGameActive,
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
        enabled: isGameActive,
        showGhost: isGameActive,
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

  // Get message based on game state
  const getMessage = () => {
    if (isLoading || !gameState) return "Loading...";
    if (gameState.status === "waiting") return "Waiting for opponent...";
    if (gameState.status !== "active") return "Game is not active";
    return null;
  };

  const message = getMessage();
  console.log("Current message:", message);

  return (
    <div style={{ position: "relative", width: "540px", height: "600px" }}>
      <div
        ref={boardRef}
        className={`xiangqiground ${className} ${
          !gameState || gameState.status !== "active" ? "inactive-game" : ""
        }`}
        style={{ width: "100%", height: "100%" }}
      />
      {message && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "8px",
            fontSize: "1.2rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default XiangqiBoard;
