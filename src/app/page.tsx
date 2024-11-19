"use client";
import styles from "../styles/Page.module.css";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import XiangqiBoard from "../components/XiangqiBoard";
import '../styles/xiangqiground.css';
import "./globals.css"


const config = {
  // orientation: 'red' as const,
  // viewOnly: false,

  // movable: {
  //   free: true,
  //   color: 'both',
  //   showDests: true
  // }, 
  movable: {
    events: {
      after: (orig: string, dest: string) => {
        console.log(`Move from ${orig} to ${dest}`);
      },
    },
    color: 'both', // Allow both colors to move
    dests: undefined // Let the board calculate valid moves
  },
  drawable: {
    enabled: true,
    moveIndicator: {
      enabled: false,
      showDests: true,

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
  draggable: {
    enabled: true,
    showGhost: true
  },
  highlight: {
    lastMove: true,
    check: true
  },
  animation: {
    enabled: true,
    duration: 300
  }
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

      <div className="mt-8">
        <h2 className="mb-4">Board with a FEN position</h2>
        <XiangqiBoard
          config={{
            fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR'
          }}
        />
      </div>
      {/* <div className="mt-8">
        <h2 className="mb-4">Board with arrows and labels</h2>
        <XiangqiBoard
          config={{
            drawable: {
              autoShapes: [
                {
                  orig: 'a2',
                  dest: 'a6',
                  brush: 'green',
                  label: { text: 'A' },
                  modifiers: { hilite: true }
                },
                // Add more shapes as needed
              ]
            }
          }}
        /> */}
      {/* </div> */}
    </main >
  );
}


