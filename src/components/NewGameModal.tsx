import styles from "@/styles/newGameModal.module.css";

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSide: (side: "red" | "black") => void;
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
        <h2>Choose Your Side</h2>
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.sideButton} ${styles.redSide}`}
            onClick={() => onSelectSide("red")}
          >
            Red Side
          </button>
          <button
            className={`${styles.sideButton} ${styles.blackSide}`}
            onClick={() => onSelectSide("black")}
          >
            Black Side
          </button>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
