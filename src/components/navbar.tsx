"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import styles from "../styles/Navbar.module.css"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>Xiangqi</span>
            </Link>
          </div>
          
          <div className={styles.authSection}>
            {status === "loading" ? (
              <span>Loading...</span>
            ) : session ? (
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>
                  Welcome, {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className={styles.signOutButton}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => signIn()}
                  className={styles.signInButton}
                >
                  Sign In
                </button>
                <Link
                  href="/register"
                  className={styles.registerButton}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
