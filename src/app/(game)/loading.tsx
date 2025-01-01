"use client";

import styles from "@/styles/Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.loadingIcon} />
      <div className={styles.loadingText}>Loading...</div>
    </div>
  );
}
