import { Metadata } from "next";
import PuzzleBoard from "@/components/game/PuzzleBoard";
import styles from "@/styles/Puzzle.module.css";

export const metadata: Metadata = {
  title: "Xiangqi Puzzles",
  description: "Improve your Xiangqi skills with tactical puzzles",
};

export default function PuzzlePage() {
  return (
    <div className={styles.puzzlePage}>
      <div className={styles.puzzleContainer}>
        <div className={styles.puzzleHeader}>
          <h1>Xiangqi Puzzles</h1>
          <p>
            Choose your difficulty and solve tactical puzzles to improve your
            game!
          </p>
        </div>
        <PuzzleBoard />
      </div>
    </div>
  );
}
