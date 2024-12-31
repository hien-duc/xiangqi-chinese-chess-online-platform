'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Lobby.module.css';
import { Moon, Sun, Users, Trophy, History, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';

export default function LobbyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    // Apply theme class to body
    document.body.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  const menuItems = [
    {
      title: 'Quick Match',
      description: 'Find a game and start playing immediately',
      icon: <Trophy className={styles.menuIcon} />,
      link: '/games'
    },
    {
      title: 'Game History',
      description: 'View your past games and replays',
      icon: <History className={styles.menuIcon} />,
      link: '/history'
    },
    {
      title: 'Profile Settings',
      description: 'Customize your gaming experience',
      icon: <Settings className={styles.menuIcon} />,
      link: '/profile'
    },
    {
      title: 'Leaderboard',
      description: 'See top players and rankings',
      icon: <Users className={styles.menuIcon} />,
      link: '/leaderboard'
    }
  ];

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              Welcome back, {session.user?.name || 'Player'}
            </h1>
            <p className={styles.subtitle}>
              Choose your next move
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={styles.darkModeButton}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className={styles.darkModeIcon} />
            ) : (
              <Moon className={styles.darkModeIcon} />
            )}
          </button>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <Link href={item.link} key={index} className={styles.menuCard}>
                <div className={styles.menuCardContent}>
                  <div className={styles.iconWrapper}>
                    {item.icon}
                  </div>
                  <div className={styles.menuInfo}>
                    <h2 className={styles.menuTitle}>{item.title}</h2>
                    <p className={styles.menuDescription}>{item.description}</p>
                  </div>
                  <ChevronRight className={styles.arrowIcon} />
                </div>
              </Link>
            ))}
          </div>
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            2024 Xiangqi Online. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
