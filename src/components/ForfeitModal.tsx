import React, { useEffect } from "react";
import styles from "@/styles/ForfeitModal.module.css";
import { FaFlag } from "react-icons/fa";

interface ForfeitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ForfeitModal: React.FC<ForfeitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <FaFlag />
          <h2 className={styles.title}>Forfeit Game</h2>
        </div>
        <div className={styles.content}>
          Are you sure you want to forfeit this game? This action cannot be
          undone.
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.forfeitButton}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Forfeit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForfeitModal;
