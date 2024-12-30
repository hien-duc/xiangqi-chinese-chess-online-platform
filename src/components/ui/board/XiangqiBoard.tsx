import React, { useEffect, useRef, useState } from "react";
import { Xiangqiground } from "@/utils/xiangqiground";
import { useGameContext } from "@/hooks/useGameState";
import { Config } from "@/utils/config";
import { useSession } from "next-auth/react";
import { getTurnColor, initialFen } from "@/lib/game/fen";
import styles from "@/styles/FloatingButton.module.css";
import { FaFlag } from "react-icons/fa";
import ForfeitModal from "@/components/game/modals/ForfeitModal";
import "@styles/XiangqiGround.css";
import { Key } from "@/utils/types";
import { isInCheck } from "@/lib/game/chess-rules";

interface XiangqiBoardProps {
  className?: string;
  isSpectator?: boolean;
}

interface XiangqigroundInstance {
  destroy?: () => void;
  set?: (config: Partial<Config>) => void;
  move?: (orig: string, dest: string) => void;
}
const DEFAULT_FEN = initialFen;

const XiangqiBoard: React.FC<XiangqiBoardProps> = ({
  className = "",
  isSpectator = false,
}) => {
  const { gameState, makeMove, isLoading, forfeitGame } = useGameContext();
  const { data: session } = useSession();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);
  const isInitialMount = useRef(true);
  const [showForfeitModal, setShowForfeitModal] = useState(false);

  const handleForfeit = async () => {
    await forfeitGame();
    setShowForfeitModal(false);
  };

  const canForfeit = () => {
    if (isSpectator) return false;
    if (!gameState) return false;

    // Get player ID from either session or game state
    const playerId =
      session?.user?.id ||
      (gameState.players.red.id.startsWith("guest-")
        ? gameState.players.red.id
        : gameState.players.black.id.startsWith("guest-")
        ? gameState.players.black.id
        : null);

    if (!playerId) return false;

    const isPlayer =
      gameState.players.red.id === playerId ||
      gameState.players.black.id === playerId;

    return isPlayer && gameState.status === "active";
  };

  const canMove = () => {
    if (isSpectator) return false;
    if (!gameState) return false;

    // Get player ID from either session or game state
    const playerId =
      session?.user?.id ||
      (gameState.players.red.id.startsWith("guest-")
        ? gameState.players.red.id
        : gameState.players.black.id.startsWith("guest-")
        ? gameState.players.black.id
        : null);

    if (!playerId) return false;

    const currentTurn = getTurnColor(gameState.fen);
    return (
      gameState.status === "active" &&
      ((currentTurn === "red" && gameState.players.red.id === playerId) ||
        (currentTurn === "black" && gameState.players.black.id === playerId))
    );
  };

  // Initialize the board
  useEffect(() => {
    const isGameActive = gameState?.status === "active";
    const currentTurn = getTurnColor(gameState?.fen || DEFAULT_FEN);

    // Get player ID from either session or game state
    const playerId =
      session?.user?.id ||
      (gameState?.players?.red?.id?.startsWith("guest-")
        ? gameState.players.red.id
        : gameState?.players?.black?.id?.startsWith("guest-")
        ? gameState.players.black.id
        : null);
    const config: Config = {
      viewOnly: isSpectator,
      orientation: gameState?.players?.red?.id === playerId ? "red" : "black",
      turnColor: canMove() ? currentTurn : undefined,
      check: isInCheck(gameState?.fen || DEFAULT_FEN),
      movable: {
        free: false,
        color: isGameActive ? currentTurn : undefined,
        showDests: isGameActive,
        events: {
          after: (orig: string, dest: string) => {
            if (canMove()) {
              makeMove(orig, dest);
            }
          },
        },
      },
      lastMove: gameState?.lastMove
        ? gameState.lastMove.map((move) => move as Key)
        : undefined,
      highlight: {
        lastMove: true,
        check: true,
      },
      fen: gameState?.fen || DEFAULT_FEN,
      drawable: {
        enabled: isGameActive && !isSpectator,
        visible: isGameActive,
        defaultSnapToValidMove: true,
        eraseOnClick: true,
      },
      premovable: {
        enabled: isGameActive && !isSpectator,
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

    if (!boardRef.current) return;

    if (!groundRef.current) {
      groundRef.current = Xiangqiground(boardRef.current, config);
    } else {
      groundRef.current.set(config);
    }
  }, [gameState, isSpectator, session?.user?.id, canMove, makeMove]);

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
    if (gameState.status === "completed") return "Game has ended";
    if (gameState.status !== "active") return "Game is not active";
    return null;
  };

  const message = getMessage();
  // console.log("Current message:", message);

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
      {canForfeit() && (
        <button
          className={styles.floatingButton}
          onClick={() => setShowForfeitModal(true)}
          title="Forfeit Game"
          disabled={isLoading}
        >
          <FaFlag />
        </button>
      )}
      <ForfeitModal
        isOpen={showForfeitModal}
        onClose={() => setShowForfeitModal(false)}
        onConfirm={handleForfeit}
      />
    </div>
  );
};

export default XiangqiBoard;
