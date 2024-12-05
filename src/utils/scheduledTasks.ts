const CLEANUP_INTERVAL = 5 * 60 * 1000; // Run cleanup every 5 minutes

export function startGameCleanupTask() {
  const runCleanup = async () => {
    try {
      const response = await fetch('/api/game/cleanup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error('Game cleanup failed:', await response.text());
      } else {
        const result = await response.json();
        console.log('Game cleanup completed:', result);
      }
    } catch (error) {
      console.error('Error running game cleanup:', error);
    }
  };

  // Run cleanup immediately
  runCleanup();

  // Schedule periodic cleanup
  const intervalId = setInterval(runCleanup, CLEANUP_INTERVAL);

  // Return function to stop the cleanup task
  return () => clearInterval(intervalId);
}
