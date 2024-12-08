"use client";

import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { GameProvider } from "@/hooks/useGameState";
import "./globals.css";
import { useEffect } from "react";
import { startGameCleanupTask } from "@/utils/scheduledTasks";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Start game cleanup task
    const stopCleanup = startGameCleanupTask();

    // Cleanup when component unmounts
    return () => stopCleanup();
  }, []);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <GameProvider>{children}</GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
