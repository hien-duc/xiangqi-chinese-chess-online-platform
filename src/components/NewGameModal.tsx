import styles from "@/styles/NewGameModal.module.css";

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSide: (side: "red" | "black", againstBot: boolean) => void;
}

export default function NewGameModal({
  isOpen,
  onClose,
  onSelectSide,
}: NewGameModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Choose Game Mode</h2>
        <div className={styles.modeContainer}>
          <h3>Play Against Bot</h3>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.sideButton} ${styles.redSide}`}
              onClick={() => onSelectSide("red", true)}
            >
              Red Side
            </button>
            <button
              className={`${styles.sideButton} ${styles.blackSide}`}
              onClick={() => onSelectSide("black", true)}
            >
              Black Side
            </button>
          </div>
          
          <h3>Play Against Player</h3>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.sideButton} ${styles.redSide}`}
              onClick={() => onSelectSide("red", false)}
            >
              Red Side
            </button>
            <button
              className={`${styles.sideButton} ${styles.blackSide}`}
              onClick={() => onSelectSide("black", false)}
            >
              Black Side
            </button>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
