let cleanupInterval: NodeJS.Timeout | null = null;

export function startGameCleanup() {
  if (cleanupInterval) {
    return; // Already running
  }

  // Run cleanup every minute
  cleanupInterval = setInterval(async () => {
    try {
      const response = await fetch("/api/game/cleanup", {
        method: "GET",
      });

      if (!response.ok) {
        console.error("Game cleanup failed:", await response.text());
      }
    } catch (error) {
      console.error("Error running game cleanup:", error);
    }
  }, 60000); // Run every minute
}

export function stopGameCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
