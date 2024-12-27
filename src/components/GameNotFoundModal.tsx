import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/ErrorModal.module.css';

interface GameNotFoundModalProps {
  isOpen: boolean;
}

const GameNotFoundModal: React.FC<GameNotFoundModalProps> = ({ isOpen }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRedirect = () => {
    router.push('/games');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalTitle}>Game Not Found</div>
        <div className={styles.modalMessage}>
          The game you're looking for doesn't exist or has been removed.
        </div>
        <button onClick={handleRedirect} className={styles.closeButton}>
          Go to Games
        </button>
      </div>
    </div>
  );
};

export default GameNotFoundModal;
