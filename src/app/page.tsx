"use client";
import styles from "../styles/Page.module.css";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import XiangqiBoard from "../components/XiangqiBoard";
import '../styles/xiangqiground.css';
import "./globals.css";

const config = {
  movable: {
    free: true,
    color: 'both',
    showDests: true
  },
  drawable: {
    enabled: true,
    moveIndicator: {
      enabled: true,
      showDests: true,
      brushes: {
        normal: { key: 'normal', color: '#15781B', opacity: 0.5, lineWidth: 2 },
        capture: { key: 'capture', color: '#882020', opacity: 0.7, lineWidth: 2 },
        check: { key: 'check', color: '#E89B0C', opacity: 0.8, lineWidth: 2 }
      }
    }
  },
  premovable: {
    enabled: true,
    showDests: true,
    events: {
      set: (orig: string, dest: string) => {
        console.log(`Premove set from ${orig} to ${dest}`);
      },
      unset: () => {
        console.log('Premove unset');
      }
    }
  },
};

export default function Home() {

  return (
    <main className="p-8">
      <div className={styles["container"]}>
        <div className={styles["game-container"]}>
          <LeftPanel />
          <XiangqiBoard config={config} />
          <RightPanel />
        </div>
      </div>
    </main>
  );
}