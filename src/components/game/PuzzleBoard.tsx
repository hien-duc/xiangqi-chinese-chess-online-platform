"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "@/styles/Puzzle.module.css";
import { useSession } from "next-auth/react";
import { getTurnColor } from "@/lib/game/fen";
import { puzzleApi, getPuzzleConfig, Puzzle } from "@/lib/api/puzzles";
import { Xiangqiground } from "@/utils/xiangqiground";
import { Key } from "@/utils/types";
import type { Config } from "@/utils/config";
import "@styles/XiangqiGround.css";

type Difficulty = "easy" | "medium" | "hard";
type GameStatus = "initial" | "correct" | "incorrect";

interface XiangqigroundInstance {
  destroy?: () => void;
  set?: (config: Partial<Config>) => void;
}

export default function PuzzleBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>("initial");
  const { data: session } = useSession();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<XiangqigroundInstance | null>(null);

  // Fetch a new puzzle
  const fetchPuzzle = async () => {
    try {
      const newPuzzle = await puzzleApi.getPuzzle(difficulty);
      setPuzzle(newPuzzle);
      setMoves([]);
      setStatus("initial");

      // Update board configuration
      if (groundRef.current?.set) {
        const config = getPuzzleConfig(
          newPuzzle.fen,
          getTurnColor(newPuzzle.fen),
          handleMove,
          false
        );
        groundRef.current.set(config);
      }
    } catch (error) {
      console.error("Error fetching puzzle:", error);
    }
  };

  // Handle move made on the board
  const handleMove = useCallback((orig: string, dest: string) => {
    setMoves((prev) => [...prev, `${orig}${dest}`]);
  }, []);

  // Verify puzzle solution
  const verifyPuzzle = async () => {
    if (!puzzle) return;

    try {
      const { correct, solution } = await puzzleApi.verifyPuzzle(
        puzzle._id,
        moves
      );
      setStatus(correct ? "correct" : "incorrect");

      if (!correct && groundRef.current?.set) {
        // Show correct solution after a wrong attempt
        setTimeout(() => {
          // Replay the correct solution
          solution.forEach((move: string, index: number) => {
            setTimeout(() => {
              const [orig, dest] = [
                move.slice(0, 2) as Key,
                move.slice(2) as Key,
              ];
              if (groundRef.current?.set) {
                groundRef.current.set({
                  fen: puzzle.fen,
                  lastMove: [orig, dest],
                });
              }
            }, index * 1000);
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying puzzle:", error);
    }
  };

  // Initialize board
  useEffect(() => {
    if (boardRef.current && puzzle) {
      const config: Config = {
        orientation: "red",
        movable: {
          free: false,
          showDests: true,
          events: {
            after: handleMove,
          },
        },
        drawable: {
          enabled: true,
          visible: true,
        },
        highlight: {
          lastMove: true,
          check: true,
        },
        animation: {
          enabled: true,
          duration: 200,
        },
        fen: puzzle.fen,
      };
      if (!boardRef.current) return;

      if (!groundRef.current) {
        groundRef.current = Xiangqiground(boardRef.current, config);
      } else {
        groundRef.current.set(config);
      }
      return () => {
        if (groundRef.current?.destroy) {
          groundRef.current.destroy();
          groundRef.current = null;
        }
      };
    }

    return () => {
      if (groundRef.current?.destroy) {
        groundRef.current.destroy();
        groundRef.current = null;
      }
    };
  }, [puzzle, status, handleMove]);

  // Auto-verify when moves are made
  useEffect(() => {
    if (
      moves.length > 0 &&
      moves.length ===
        (difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6)
    ) {
      verifyPuzzle();
    }
  }, [moves, difficulty]);

  // Load initial puzzle
  useEffect(() => {
    fetchPuzzle();
  }, [difficulty]);

  return (
    <div className={styles.puzzleLayout}>
      <div className={styles.leftPanel}>
        <div className={styles.puzzleInfo}>
          <h2>Training Mode</h2>
          <p className={styles.puzzleDescription}>
            Make the best moves to solve the puzzle. The difficulty level
            determines the number of moves required:
            <span className={styles.moveCount}>
              {difficulty === "easy"
                ? "2 moves"
                : difficulty === "medium"
                ? "4 moves"
                : "6 moves"}
            </span>
          </p>
        </div>

        <div className={styles.difficultySelector}>
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={`${styles.difficultyButton} ${styles[d]} ${
                difficulty === d ? styles.active : ""
              }`}
              onClick={() => setDifficulty(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {status !== "initial" && (
          <div className={`${styles.puzzleStatus} ${styles[status]}`}>
            {status === "correct" ? (
              <>
                <h3>Correct! Well done!</h3>
                <p>You've successfully solved this puzzle.</p>
              </>
            ) : (
              <>
                <h3>Incorrect</h3>
                <p>Watch the correct solution and try again.</p>
              </>
            )}
          </div>
        )}

        <div className={styles.puzzleControls}>
          <button
            className={`${styles.puzzleButton} ${styles.primary}`}
            onClick={fetchPuzzle}
          >
            Next Puzzle
          </button>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div style={{ position: "relative", width: "540px", height: "600px" }}>
          <div
            ref={boardRef}
            className={`xiangqiground ${styles.board}`}
            style={{ width: "100%", height: "100%" }}
          />
          {status !== "initial" && puzzle && (
            <div className={styles.boardOverlay}>
              <div className={styles.overlayContent}>
                {status === "correct" ? "Correct!" : "Incorrect"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
