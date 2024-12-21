import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/Navbar";
import { GameProvider } from "../hooks/useGameState";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";
import { ErrorProvider } from "@/context/ErrorContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ErrorProvider>
            <Navbar />
            <ChatProvider>
              <GameProvider>{children}</GameProvider>
            </ChatProvider>
          </ErrorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
