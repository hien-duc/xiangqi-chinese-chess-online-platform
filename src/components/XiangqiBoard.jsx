"use client";

import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "../app/utils/xiangqiground";
import { useGameState } from "../hooks/useGameState";

const XiangqiBoard = ({ gameId, config = {}, className = "" }) => {
  const { gameState, error, makeMove } = useGameState(gameId);
  const boardRef = useRef(null);
  const groundRef = useRef(null);

  useEffect(() => {
    if (boardRef.current && !groundRef.current) {
      groundRef.current = Xiangqiground(boardRef.current, {
        ...config,
        movable: {
          ...config.movable,
          events: {
            after: (orig, dest) => makeMove(orig, dest),
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (groundRef.current && groundRef.current.destroy) {
        groundRef.current.destroy();
      }
      groundRef.current = null;
    };
  }, [config, makeMove]); // Re-run if config or makeMove changes

  return (
    <div
      ref={boardRef}
      className={`xiangqiground ${className}`}
      style={{ width: "540px", height: "600px" }}
    />
  );
};

export default XiangqiBoard;
