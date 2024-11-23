import { GameProvider } from "../hooks/useGameState";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
