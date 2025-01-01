"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/EvaluationBar.module.css";

interface EvaluationBarProps {
  evaluation: number; // Centipawns value, positive for red advantage, negative for black
  isLoading?: boolean;
  orientation?: "red" | "black";
}

export default function EvaluationBar({
  evaluation,
  isLoading = false,
  orientation = "red",
}: EvaluationBarProps) {
  const [barHeight, setBarHeight] = useState("50%");
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Convert evaluation to a percentage (capped at ±10 pawns)
    const maxEval = 1000; // 10 pawns
    const percentage = Math.min(
      Math.max(50 + (evaluation / maxEval) * 50, 0),
      100
    );
    
    // Invert the bar if playing as black
    const adjustedPercentage = orientation === "black" ? 100 - percentage : percentage;
    setBarHeight(`${adjustedPercentage}%`);

    // Format the display value
    if (evaluation === 0) {
      setDisplayValue("0.0");
    } else {
      const absEval = Math.abs(evaluation);
      const sign = evaluation > 0 ? "+" : "-";
      if (absEval >= 10000) {
        setDisplayValue(`M${sign}${Math.ceil(20000 - absEval) / 2}`);
      } else {
        setDisplayValue(`${sign}${(absEval / 100).toFixed(1)}`);
      }
    }
  }, [evaluation, orientation]);

  return (
    <div className={styles.container}>
      <div className={styles.barWrapper}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.pulse}></div>
          </div>
        ) : (
          <>
            <div
              className={styles.evaluationBar}
              style={{ height: barHeight }}
            ></div>
            <div className={styles.evaluationValue}>{displayValue}</div>
          </>
        )}
      </div>
    </div>
  );
}
