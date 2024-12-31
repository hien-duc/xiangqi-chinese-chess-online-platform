"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Trophy,
  BookOpen,
  PlayCircle,
  Settings,
  User,
} from "lucide-react";
import styles from "@/styles/Navbar.module.css";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userId = session?.user?.id;

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          {/* Logo and primary navigation */}
          <div className={styles.leftSection}>
            <Link href="/lobby" className={styles.logo}>
              <span className={styles.logoText}>Xiangqi</span>
            </Link>

            <div className={styles.mainNav}>
              <Link href="/games" className={styles.navLink}>
                <PlayCircle className={styles.navIcon} />
                <span>Play</span>
              </Link>
              <Link href="/puzzles" className={styles.navLink}>
                <BookOpen className={styles.navIcon} />
                <span>Learn</span>
              </Link>
              <Link href="/leaderboard" className={styles.navLink}>
                <Trophy className={styles.navIcon} />
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* User profile section */}
          <div className={styles.rightSection}>
            {status === "loading" ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
              </div>
            ) : session ? (
              <div className={styles.userSection}>
                <button
                  onClick={toggleProfile}
                  className={styles.profileButton}
                >
                  <div className={styles.userAvatar}>
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {session.user?.name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <span className={styles.userName}>
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown className={styles.dropdownIcon} />
                </button>

                {isProfileOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{session.user.name}</p>
                      <p className={styles.dropdownEmail}>
                        {session.user.email}
                      </p>
                    </div>
                    <Link href={`/profile/${userId}`} className={styles.dropdownItem}>
                      <User className={styles.dropdownIcon} />
                      <span>Profile</span>
                    </Link>
                    <Link href="/settings" className={styles.dropdownItem}>
                      <Settings className={styles.dropdownIcon} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className={styles.signOutButton}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <button
                  onClick={() => signIn()}
                  className={styles.signInButton}
                >
                  Sign In
                </button>
                <Link href="/register" className={styles.registerButton}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={toggleMenu} className={styles.mobileMenuButton}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/play" className={styles.mobileNavLink}>
              <PlayCircle className={styles.mobileNavIcon} />
              <span>Play</span>
            </Link>
            <Link href="/learn" className={styles.mobileNavLink}>
              <BookOpen className={styles.mobileNavIcon} />
              <span>Learn</span>
            </Link>
            <Link href="/leaderboard" className={styles.mobileNavLink}>
              <Trophy className={styles.mobileNavIcon} />
              <span>Leaderboard</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
