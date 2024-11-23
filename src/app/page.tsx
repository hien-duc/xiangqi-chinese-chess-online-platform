"use client";
import styles from "../styles/Page.module.css";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import XiangqiBoard from "../components/XiangqiBoard";
import '../styles/xiangqiground.css';
import "./globals.css";
import { useGameContext } from "../hooks/useGameState";
export default function Home() {
  const { isLoading, error, gameState } = useGameContext();

  // Only show loading on initial load
  if (isLoading && !gameState) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="p-8">
      <div className={styles["container"]}>
        <div className={styles["game-container"]}>
          <LeftPanel />
          <XiangqiBoard />
          <RightPanel />
        </div>
      </div>
    </main>
  );
}