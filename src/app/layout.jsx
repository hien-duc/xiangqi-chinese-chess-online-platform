import { AuthProvider } from "@/src/components/auth-provider"
import { Navbar } from "@/src/components/navbar"
import { GameProvider } from "../hooks/useGameState"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <GameProvider>
            {children}
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
