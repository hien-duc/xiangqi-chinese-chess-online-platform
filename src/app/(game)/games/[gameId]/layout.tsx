import { ChatProvider } from "@/context/ChatContext";
import { GameProvider } from "@/hooks/useGameState";

export default async function GamesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <GameProvider gameId={gameId}>
      <ChatProvider>{children}</ChatProvider>
    </GameProvider>
  );
}
