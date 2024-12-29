"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Error.module.css";
import { FiAlertTriangle, FiHome, FiRefreshCw } from "react-icons/fi";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: "auth" | "game" | "default";
}

export default function ErrorDisplay({
  error,
  reset,
  variant = "default",
}: ErrorDisplayProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const getErrorMessage = () => {
    switch (variant) {
      case "auth":
        return "Authentication Error";
      case "game":
        return "Game Error";
      default:
        return "Something went wrong";
    }
  };

  const getErrorDescription = () => {
    if (error?.message) {
      return error.message;
    }
    switch (variant) {
      case "auth":
        return "There was a problem with authentication. Please try again.";
      case "game":
        return "We encountered an issue with the game. Please try refreshing.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[variant]}`}>
        <div className={styles.iconWrapper}>
          <FiAlertTriangle className={styles.icon} />
        </div>
        <h1 className={styles.title}>{getErrorMessage()}</h1>
        <p className={styles.description}>{getErrorDescription()}</p>
        <div className={styles.actions}>
          <button
            onClick={() => reset()}
            className={`${styles.button} ${styles.retry}`}
          >
            <FiRefreshCw />
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className={`${styles.button} ${styles.home}`}
          >
            <FiHome />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
