import { useRouter } from "next/navigation";
import styles from "@/styles/WinModal.module.css";
import { FaTrophy, FaCrown, FaMedal, FaChessKing } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface WinModalProps {
  isOpen: boolean;
  winner: string;
  onClose: () => void;
  gameId: string;
  forfeitedBy?: "red" | "black" | null;
  timeoutLoss?: "red" | "black" | null;
}

const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  winner,
  onClose,
  forfeitedBy,
  timeoutLoss,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleReturnToGames = async () => {
    onClose();
    router.push("/games");
  };

  const getMessage = () => {
    if (forfeitedBy) {
      return (
        <div className={styles.messageContent}>
          <div className={styles.iconRow}>
            <FaCrown className={styles.icon} />
            <FaTrophy className={styles.iconLarge} />
            <FaCrown className={styles.icon} />
          </div>
          <div className={styles.messageText}>
            <span className={styles.subtitle}>Victory by Forfeit!</span>
            <span className={styles.winner}>{winner}</span>
            <span className={styles.details}>
              {forfeitedBy.charAt(0).toUpperCase() + forfeitedBy.slice(1)} has
              forfeited the match
            </span>
          </div>
        </div>
      );
    }
    if (timeoutLoss) {
      return (
        <div className={styles.messageContent}>
          <div className={styles.iconRow}>
            <FaMedal className={styles.icon} />
            <FaTrophy className={styles.iconLarge} />
            <FaMedal className={styles.icon} />
          </div>
          <div className={styles.messageText}>
            <span className={styles.subtitle}>Victory by Time!</span>
            <span className={styles.winner}>{winner}</span>
            <span className={styles.details}>
              {timeoutLoss.charAt(0).toUpperCase() + timeoutLoss.slice(1)} ran
              out of time
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.messageContent}>
        <div className={styles.iconRow}>
          <FaChessKing className={styles.icon} />
          <FaTrophy className={styles.iconLarge} />
          <FaChessKing className={styles.icon} />
        </div>
        <div className={styles.messageText}>
          <span className={styles.subtitle}>Checkmate!</span>
          <span className={styles.winner}>{winner}</span>
          <span className={styles.details}>has won the game</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className={styles.confetti}></div>
            <h2 className={styles.title}>Game Over!</h2>
            <div className={styles.message}>{getMessage()}</div>
            <div className={styles.buttonContainer}>
              <motion.button
                className={styles.primaryButton}
                onClick={handleReturnToGames}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Return to Games
              </motion.button>
              <motion.button
                className={styles.secondaryButton}
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinModal;
