"use client";

import Link from "next/link";
import styles from "@/styles/NotFound.module.css";
import { FiSearch, FiHome, FiArrowLeft } from "react-icons/fi";

interface NotFoundDisplayProps {
  title?: string;
  message?: string;
  backUrl?: string;
  backText?: string;
  variant?: "game" | "auth" | "default";
}

export default function NotFoundDisplay({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  backUrl = "/",
  backText = "Go Back",
  variant = "default",
}: NotFoundDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[variant]}`}>
        <div className={styles.iconWrapper}>
          <FiSearch className={styles.icon} />
          <div className={styles.searchRays}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={styles.ray}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.actions}>
          <Link href={backUrl} className={`${styles.button} ${styles.back}`}>
            <FiArrowLeft />
            {backText}
          </Link>
          <Link href="/" className={`${styles.button} ${styles.home}`}>
            <FiHome />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
