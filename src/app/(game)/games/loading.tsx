"use client";

import { usePathname } from "next/navigation";
import styles from "@/styles/Loading.module.css";

export default function GamesLoading() {
  const pathname = usePathname();

  // Only show loading for the games list page, not for individual games
  if (pathname !== "/games") {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.loadingIcon} />
      <div className={styles.loadingText}>Loading Games...</div>
    </div>
  );
}
