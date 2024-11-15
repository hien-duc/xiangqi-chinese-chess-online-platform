"use client";
import styles from "../styles/ChineseChess.module.css";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import XiangqiBoard from "../components/XiangqiBoard";

const ChineseChess = () => {
  return (
    <div className={styles["container"]}>
      <div className={styles["game-container"]}>
        <LeftPanel />
        <XiangqiBoard />
        <RightPanel />
      </div>
    </div>
  );
};

export default ChineseChess;
