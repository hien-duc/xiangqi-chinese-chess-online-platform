/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import styles from "@/styles/Error.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <h2 className={styles.title}>Something went wrong!</h2>
            <p className={styles.message}>
              We apologize for the inconvenience. The application encountered an
              unexpected error.
            </p>
            <button onClick={() => reset()} className={styles.button}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
