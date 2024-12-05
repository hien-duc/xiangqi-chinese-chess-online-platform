import { useGameStore } from "@/stores/gameStore";
import { Session } from "next-auth";

interface PlayerInfo {
  id: string;
  isGuest: boolean;
  name: string;
}

export const createPlayerInfo = (session: Session | null): PlayerInfo => ({
  id: session?.user?.id || `guest-${Math.random().toString(36).substr(2, 9)}`,
  isGuest: !session?.user,
  name: session?.user?.name || "Guest Player",
});

export const joinGame = async (
  gameId: string,
  side: "red" | "black",
  session: Session | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    const playerInfo = createPlayerInfo(session);

    const response = await fetch(`/api/game/${gameId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerInfo,
        side,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      useGameStore.getState().updateGame(gameId, data.game);
      return { success: true };
    } else {
      console.error("Failed to join game:", data.error || "Unknown error");
      return { success: false, error: data.error || "Failed to join game" };
    }
  } catch (error) {
    console.error("Error joining game:", error);
    return { success: false, error: "Error joining game" };
  }
};

export const createGame = async (
  side: "red" | "black",
  session: Session | null
): Promise<{ success: boolean; gameId?: string; error?: string }> => {
  try {
    const playerInfo = createPlayerInfo(session);

    const response = await fetch("/api/game/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerInfo,
        side,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.gameId) {
      return { success: true, gameId: data.gameId };
    } else {
      console.error("Failed to create game:", data.error || "Unknown error");
      return { success: false, error: data.error || "Failed to create game" };
    }
  } catch (error) {
    console.error("Error creating game:", error);
    return { success: false, error: "Error creating game" };
  }
};

export const spectateGame = (gameId: string): string => {
  return `/games/${gameId}?spectate=true`;
};
