"use client";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Play Chinese Chess For Free</h1>
        <div className={styles.buttonGroup}>
          <Link href="/lobby" className={styles.playButton}>
            Play Now
          </Link>
          <Link href="/register" className={styles.signUpButton}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
