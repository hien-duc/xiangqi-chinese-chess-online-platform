"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/PlayModal.module.css'
import { IoClose } from 'react-icons/io5'

interface PlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PlayModal({ isOpen, onClose }: PlayModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handlePlayAsGuest = () => {
    router.push('/play/online')
    onClose()
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoClose />
        </button>

        <h2 className={styles.title}>Play as Guest</h2>

        <div className={styles.buttonContainer}>
          <button className={styles.guestButton} onClick={handlePlayAsGuest}>
            Play as Guest
          </button>
          <Link href="/register" className={styles.registerButton}>
            Sign Up
          </Link>
        </div>

        <div className={styles.loginPrompt}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
