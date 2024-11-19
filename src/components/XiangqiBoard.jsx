"use client";

import React, { useEffect, useRef } from "react";
import { Xiangqiground } from "../app/utils/xiangqiground";
import { makeMove } from "../app/api/gameService";

const XiangqiBoard = ({ config = {}, className = "" }) => {
  const boardRef = useRef(null);
  const groundRef = useRef(null);

  const handleMove = async (orig, dest, metadata) => {
    if (!groundRef.current) return;

    try {
      // If it's a premove, handle it differently
      if (metadata.premove) {
        console.log("Playing premove:", orig, dest);
      }

      // Your move logic here
      const result = await makeMove(gameId, orig, dest, groundRef.current);

      if (!result.success) {
        console.error(result.error);
        // Reset to previous state
        groundRef.current.set({
          fen: currentFen,
        });
      } else {
        // After successful move, try to play any pending premove
        groundRef.current.playPremove();
      }
    } catch (error) {
      console.error("Move error:", error);
      groundRef.current.cancelPremove();
    }
  };

  useEffect(() => {
    if (boardRef.current && !groundRef.current) {
      const defaultConfig = {
        movable: {
          events: {
            after: handleMove, // Connect the handleMove function here
          },
        },
        premovable: {
          enabled: true,
          showDests: true,
          events: {
            set: (orig, dest) => {
              console.log("Premove set:", orig, dest);
            },
            unset: () => {
              console.log("Premove cancelled");
            },
          },
        },
      };

      // Merge configs
      const mergedConfig = {
        ...defaultConfig,
        ...config,
        movable: {
          ...defaultConfig.movable,
          ...config.movable,
          events: {
            ...defaultConfig.movable.events,
            ...config.movable?.events,
          },
        },
      };

      groundRef.current = Xiangqiground(boardRef.current, mergedConfig);
    }

    return () => {
      if (groundRef.current?.destroy) {
        groundRef.current.destroy();
      }
      groundRef.current = null;
    };
  }, [config]);

  return (
    <div
      ref={boardRef}
      className={`xiangqiground ${className}`}
      style={{ width: "540px", height: "600px" }}
      onContextMenu={(e) => {
        e.preventDefault();
        groundRef.current?.cancelPremove();
      }}
    />
  );
};
export default XiangqiBoard;
