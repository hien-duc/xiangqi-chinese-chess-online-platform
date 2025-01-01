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
        <h2>Select Game Mode</h2>
        <div className={styles.modesGrid}>
          <div className={`${styles.modeSection} ${styles.botSection}`}>
            <div className={styles.modeHeader}>
              <svg
                className={styles.modeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a7 7 0 017 7v3h3v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8h3V9a7 7 0 017-7z" />
                <circle cx="12" cy="10" r="3" />
                <path d="M8 16h8M12 16v4" />
              </svg>
              <h3>Play vs Computer</h3>
            </div>
            <p className={styles.modeDescription}>
              Challenge our AI in a strategic battle
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.sideButton} ${styles.redSide}`}
                onClick={() => onSelectSide("red", true)}
              >
                Play as Red
              </button>
              <button
                className={`${styles.sideButton} ${styles.blackSide}`}
                onClick={() => onSelectSide("black", true)}
              >
                Play as Black
              </button>
            </div>
          </div>

          <div className={`${styles.modeSection} ${styles.playerSection}`}>
            <div className={styles.modeHeader}>
              <svg
                className={styles.modeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <h3>Play vs Friend</h3>
            </div>
            <p className={styles.modeDescription}>
              Play against another player locally
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.sideButton} ${styles.redSide}`}
                onClick={() => onSelectSide("red", false)}
              >
                Play as Red
              </button>
              <button
                className={`${styles.sideButton} ${styles.blackSide}`}
                onClick={() => onSelectSide("black", false)}
              >
                Play as Black
              </button>
            </div>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
