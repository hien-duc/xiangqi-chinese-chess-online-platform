import NotFoundDisplay from "@/components/ui/not-found/NotFoundDisplay";

export default function GameNotFound() {
  return (
    <NotFoundDisplay
      title="Game Not Found"
      message="The game you're looking for doesn't exist or has been deleted."
      backUrl="/games"
      backText="Back to Games"
      variant="game"
    />
  );
}
