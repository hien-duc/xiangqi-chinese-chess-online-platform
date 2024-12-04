import { useRouter } from "next/navigation";
import styles from "@/styles/winmodal.module.css";

interface WinModalProps {
  isOpen: boolean;
  winner: string;
  onClose: () => void;
  gameId: string;
  forfeitedBy?: "red" | "black" | null;
}

const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  winner,
  onClose,
  gameId,
  forfeitedBy,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleReturnToGames = async () => {
    try {
      // Complete the game and update player stats
      const completeResponse = await fetch(`/api/game/${gameId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winner,
          forfeitedBy,
        }),
      });

      if (!completeResponse.ok) {
        console.error("Failed to complete game:", await completeResponse.text());
      }

      // Delete the completed game from active games list
      const deleteResponse = await fetch(`/api/game/${gameId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        console.error("Failed to delete game:", await deleteResponse.text());
      }
    } catch (error) {
      console.error("Error handling game completion:", error);
    }

    // Navigate back regardless of completion success
    onClose(); // Close the modal first
    router.push("/games"); // Then navigate
  };

  const message = forfeitedBy
    ? `${
        forfeitedBy.charAt(0).toUpperCase() + forfeitedBy.slice(1)
      } forfeited. ${winner} Wins!`
    : `${winner} has won the game!`;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Game Over!</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonContainer}>
          <button
            onClick={handleReturnToGames}
            className={styles.primaryButton}
          >
            Return to Games
          </button>
          <button onClick={onClose} className={styles.secondaryButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
