"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Swords,
  Trophy,
  Users,
  Brain,
  ChevronRight,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    document.body.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  const features = [
    {
      icon: <Swords className={styles.featureIcon} />,
      title: "Real-time Matches",
      description: "Challenge players worldwide in real-time matches",
    },
    {
      icon: <Brain className={styles.featureIcon} />,
      title: "AI Opponent",
      description:
        "Practice against our advanced AI with multiple difficulty levels",
    },
    {
      icon: <Trophy className={styles.featureIcon} />,
      title: "Tournaments",
      description:
        "Participate in regular tournaments and climb the leaderboard",
    },
    {
      icon: <Users className={styles.featureIcon} />,
      title: "Community",
      description: "Join a thriving community of Xiangqi enthusiasts",
    },
  ];

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <Swords className={styles.logoIcon} />
            <span className={styles.logoText}>Xiangqi Online</span>
          </div>
          <div className={styles.headerControls}>
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
            {session ? (
              <Link href="/lobby" className={styles.ctaButton}>
                Go to Lobby
                <ChevronRight className={styles.buttonIcon} />
              </Link>
            ) : (
              <Link href="/login" className={styles.ctaButton}>
                Get Started
                <ChevronRight className={styles.buttonIcon} />
              </Link>
            )}
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Master the Art of
                <span className={styles.highlight}> Chinese Chess</span>
              </h1>
              <p className={styles.heroText}>
                Experience the ancient game of Xiangqi in a modern digital
                platform. Challenge players worldwide, improve your skills, and
                become a grandmaster.
              </p>
              <div className={styles.heroButtons}>
                <Link
                  href={session ? "/games" : "/login"}
                  className={styles.primaryButton}
                >
                  Play Now
                  <ArrowRight className={styles.buttonIcon} />
                </Link>
                <Link href="/learn" className={styles.secondaryButton}>
                  Learn to Play
                  <ChevronRight className={styles.buttonIcon} />
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/assets/hero/xiangqi-modern-hero.jpg"
                alt="Modern Xiangqi - Chinese Chess"
                width={800}
                height={600}
                priority
                className={styles.boardImage}
                style={{
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </section>

          <section className={styles.features}>
            <h2 className={styles.sectionTitle}>Why Choose Us</h2>
            <div className={styles.featureGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIconWrapper}>
                    {feature.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.cta}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Play?</h2>
              <p className={styles.ctaText}>
                Join thousands of players and start your journey today.
              </p>
              <Link
                href={session ? "/games" : "/login"}
                className={styles.ctaButtonLarge}
              >
                Start Playing
                <ArrowRight className={styles.buttonIcon} />
              </Link>
            </div>
          </section>
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
