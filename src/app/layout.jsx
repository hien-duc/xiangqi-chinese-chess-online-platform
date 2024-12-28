import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/Navbar";
import { GameProvider } from "../hooks/useGameState";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <ChatProvider>
            <GameProvider>{children}</GameProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
