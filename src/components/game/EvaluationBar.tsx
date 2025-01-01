"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/EvaluationBar.module.css";

interface EvaluationBarProps {
  evaluation: number; // Centipawns value, positive for red advantage, negative for black
  isLoading?: boolean;
}

export default function EvaluationBar({
  evaluation,
  isLoading = false,
}: EvaluationBarProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [barHeight, setBarHeight] = useState("50%");

  useEffect(() => {
    // Scale the evaluation for display
    const scaleEvaluation = (evalValue: number): number => {
      const absEval = Math.abs(evalValue);
      // Use a non-linear scaling for better visualization
      if (absEval <= 100) {
        // Linear scaling for small advantages (up to 1 pawn)
        return absEval;
      } else if (absEval <= 500) {
        // Slightly compressed scaling for medium advantages (1-5 pawns)
        return 100 + Math.pow(absEval - 100, 0.8);
      } else {
        // More compressed scaling for large advantages
        return 400 + Math.pow(absEval - 500, 0.6);
      }
    };

    // Convert evaluation to a percentage with non-linear scaling
    const scaledEval = scaleEvaluation(evaluation);
    const maxScaledEval = 800; // Maximum scaled value for display
    const basePercentage = Math.min(
      Math.max((scaledEval / maxScaledEval) * 50, 1),
      49
    );

    // Calculate bar height
    let height;
    if (evaluation === 0) {
      height = "50%";
    } else if (evaluation > 0) {
      height = `${50 + basePercentage}%`;
    } else {
      height = `${50 - basePercentage}%`;
    }

    setBarHeight(height);

    // Format the display value
    const formatEvaluation = (evalValue: number): string => {
      const absEval = Math.abs(evalValue);
      if (evalValue === 0) return "0.0";

      // Handle mate scores
      if (absEval >= 10000) {
        const movesToMate = Math.ceil((20000 - absEval) / 2);
        return `M${movesToMate}`;
      }

      // Format regular evaluations
      const pawns = absEval / 100;
      if (pawns >= 10) {
        // Show without decimal for large advantages
        return `${Math.floor(pawns)}`;
      } else {
        // Show one decimal place for smaller advantages
        return pawns.toFixed(1);
      }
    };

    setDisplayValue(formatEvaluation(evaluation));
  }, [evaluation]);

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
              className={styles.evaluationValue}
              style={{
                top: evaluation < 0 ? "10px" : "auto",
                bottom: evaluation < 0 ? "auto" : "10px",
                color: Math.abs(evaluation) > 1000 ? "#ff4444" : "#fff",
              }}
            >
              {displayValue}
            </div>
            <div
              className={styles.evaluationBar}
              style={{ height: barHeight }}
            />
          </>
        )}
      </div>
    </div>
  );
}
