import { useState, useCallback } from "react";

export const useComputerPlayer = () => {
  const [isThinking, setIsThinking] = useState(false);

  const getComputerMove = useCallback(async (fen: string) => {
    setIsThinking(true);
    try {
      const response = await fetch("/api/engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fen }),
      });

      if (!response.ok) {
        throw new Error("Failed to get computer move");
      }

      const data = await response.json();
      return data.move;
    } catch (error) {
      console.error("Error getting computer move:", error);
      throw error;
    } finally {
      setIsThinking(false);
    }
  }, []);

  return {
    getComputerMove,
    isThinking,
  };
};
