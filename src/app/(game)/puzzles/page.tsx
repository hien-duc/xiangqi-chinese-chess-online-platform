"use client";

import { useState, useEffect } from "react";
import PuzzleBoard from "@/components/game/PuzzleBoard";
import styles from "@/styles/Puzzle.module.css";
import { Moon, Sun } from "lucide-react";

export default function PuzzlePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("puzzleTheme");
    setIsDarkMode(savedTheme === "dark");
    document.body.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("puzzleTheme", newTheme);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  return (
    <div
      className={`${styles.puzzlePage} ${isDarkMode ? styles.darkMode : ""}`}
    >
      <button
        className={styles.themeToggle}
        onClick={toggleDarkMode}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className={styles.themeIcon} />
        ) : (
          <Moon className={styles.themeIcon} />
        )}
      </button>
      <div className={styles.puzzleContainer}>
        <div className={styles.puzzleHeader}>
          <h1>Xiangqi Puzzles</h1>
          <p>Challenge yourself with tactical puzzles to improve your game!</p>
        </div>

        <PuzzleBoard />
      </div>
    </div>
  );
}
