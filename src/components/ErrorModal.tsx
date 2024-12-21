import React from "react";
import styles from "@/styles/ErrorModal.module.css";

interface ErrorModalProps {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, error, onClose }) => {
  if (!isOpen || !error) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={onClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalTitle}>Error</div>
        <div className={styles.modalMessage}>{error}</div>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
