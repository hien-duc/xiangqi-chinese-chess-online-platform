"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import XiangqiBoard from "@/components/ui/board/XiangqiBoard";
import styles from "@/styles/Puzzle.module.css";
import { useSession } from "next-auth/react";
import { getTurnColor } from "@/lib/game/fen";
import { puzzleApi, getPuzzleConfig, Puzzle } from "@/lib/api/puzzles";
import { Xiangqiground } from "@/utils/xiangqiground";
import type { Config } from "@/utils/config";

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

  // Verify puzzle solution
  const verifyPuzzle = async () => {
    if (!puzzle) return;

    try {
      const { correct, solution } = await puzzleApi.verifyPuzzle(puzzle._id, moves);
      setStatus(correct ? "correct" : "incorrect");

      if (!correct && groundRef.current?.set) {
        // Show correct solution after a wrong attempt
        setTimeout(() => {
          // Replay the correct solution
          solution.forEach((move: string, index: number) => {
            setTimeout(() => {
              const [orig, dest] = [move.slice(0, 2), move.slice(2)];
              const config = getPuzzleConfig(
                puzzle.fen,
                getTurnColor(puzzle.fen),
                handleMove,
                true
              );
              groundRef.current?.set({
                ...config,
                fen: puzzle.fen, // Reset to initial position
                lastMove: [orig, dest],
              });
            }, index * 1000);
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying puzzle:", error);
    }
  };

  // Handle move made on the board
  const handleMove = useCallback((orig: string, dest: string) => {
    setMoves(prev => [...prev, `${orig}${dest}`]);
  }, []);

  // Initialize board
  useEffect(() => {
    if (boardRef.current && !groundRef.current && puzzle) {
      const config = getPuzzleConfig(
        puzzle.fen,
        getTurnColor(puzzle.fen),
        handleMove,
        status !== "initial"
      );
      groundRef.current = Xiangqiground(boardRef.current, config);
    }
    return () => {
      if (groundRef.current?.destroy) {
        groundRef.current.destroy();
        groundRef.current = null;
      }
    };
  }, [puzzle]);

  // Load initial puzzle
  useEffect(() => {
    fetchPuzzle();
  }, [difficulty]);

  // Auto-verify when moves are made
  useEffect(() => {
    if (moves.length > 0 && moves.length === (difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6)) {
      verifyPuzzle();
    }
  }, [moves, difficulty]);

  return (
    <div>
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

      {puzzle && (
        <div className={styles.puzzleBoard}>
          <div
            ref={boardRef}
            className={`xiangqiground ${styles.board}`}
            style={{ width: "540px", height: "600px" }}
          />
        </div>
      )}

      {status !== "initial" && (
        <div className={`${styles.puzzleStatus} ${styles[status]}`}>
          {status === "correct" ? "Correct! Well done!" : "Incorrect. Try again!"}
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
  );
}
