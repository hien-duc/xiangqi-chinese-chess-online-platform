import { GameProvider } from '../context/GameContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}