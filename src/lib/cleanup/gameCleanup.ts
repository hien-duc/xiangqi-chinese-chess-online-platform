let cleanupInterval: NodeJS.Timeout | null = null;

export function startGameCleanup() {
  if (cleanupInterval) {
    return; // Already running
  }

  // Run cleanup every minute
  cleanupInterval = setInterval(async () => {
    try {
      const response = await fetch("/api/v1/game/cleanup", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to run game cleanup");
      }
    } catch (error) {
      console.error("Error running game cleanup:", error);
      throw new Error("Failed to run game cleanup");
    }
  }, 60000); // Run every minute
}

export function stopGameCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
