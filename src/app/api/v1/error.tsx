"use client";

import { useEffect } from "react";
import styles from "@/styles/Error.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <h2>Something went wrong!</h2>
      <p>{error.message || "An unexpected error occurred"}</p>
      <div className={styles.actions}>
        <button onClick={() => reset()} className={styles.retryButton}>
          Try again
        </button>
      </div>
    </div>
  );
}
