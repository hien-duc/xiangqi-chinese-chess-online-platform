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
  //   free: false,
  //   color: 'red',
  //   showDests: true,
  //   events: {
  //     after: (orig: string, dest: string) => {
  //       console.log(`Moved from ${orig} to ${dest}`);
  //     }
  //   }
  // },
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
  // draggable: {
  //   enabled: true,
  //   showGhost: true
  // },
  // highlight: {
  //   lastMove: true,
  //   check: true
  // },
  // animation: {
  //   enabled: true,
  //   duration: 200
  // }
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

      {/* <div className="mt-8">
        <h2 className="mb-4">Board with a FEN position</h2>
        <XiangqiBoard
          config={{
            fen: '3k1a3/4a4/4P4/1R4C2/9/9/9/4E1r2/5p3/3AK2H1 b - - 2 25'
          }}
        />
      </div>
      <div className="mt-8">
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
        />
      </div> */}
    </main>
  );
}