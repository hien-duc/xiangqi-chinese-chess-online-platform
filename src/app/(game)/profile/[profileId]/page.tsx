"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Activity,
  Trophy,
  Clock,
  Star,
  Sun,
  Moon,
  Award,
  Target,
  Sword,
  Shield,
  Zap,
  Crown,
} from "lucide-react";
import { useParams } from "next/navigation";
import styles from "@/styles/Profile.module.css";

interface ProfileStats {
  rating: number;
  gamesPlayed: number;
  rank: string;
  winRate: number;
  wins: number;
  losses: number;
  draws: number;
  averageTime?: number;
}

interface RecentGame {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  progress: number;
  maxProgress: number;
}

interface ProfileData {
  stats: ProfileStats;
  recentGames: RecentGame[];
  achievements?: Achievement[];
  user?: {
    name: string;
    email: string;
    image: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isOwnProfile = session?.user?.id === params.profileId;

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem("profileDarkMode");
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true");
    }
  }, []);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem("profileDarkMode", isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(`/api/v1/player/${params.profileId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();

        // Add some sample achievements (you can replace this with real data)
        const achievements: Achievement[] = [
          {
            id: "1",
            title: "First Victory",
            description: "Win your first game",
            icon: <Trophy className={styles.achievementIcon} />,
            progress: data.stats.wins,
            maxProgress: 1,
          },
          {
            id: "2",
            title: "Warrior",
            description: "Play 100 games",
            icon: <Sword className={styles.achievementIcon} />,
            progress: data.stats.gamesPlayed,
            maxProgress: 100,
          },
          {
            id: "3",
            title: "Strategist",
            description: "Achieve a 60% win rate",
            icon: <Target className={styles.achievementIcon} />,
            progress: data.stats.winRate,
            maxProgress: 60,
          },
          {
            id: "4",
            title: "Grandmaster",
            description: "Reach 2000 rating",
            icon: <Crown className={styles.achievementIcon} />,
            progress: data.stats.rating,
            maxProgress: 2000,
          },
        ];

        setProfileData({ ...data, achievements });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.profileId) {
      fetchProfileData();
    }
  }, [params.profileId]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoading) {
    return <div></div>;
  }

  if (!profileData) {
    throw new Error("Profile data not found");
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <div className={styles.wrapper}>
        {/* Header Section */}
        <div className={styles.header}>
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
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <div className={styles.profileInfo}>
            <div className={styles.avatarContainer}>
              {profileData.user?.image ? (
                <Image
                  src={profileData.user.image}
                  alt={profileData.user.name || "User"}
                  width={120}
                  height={120}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {profileData.user?.name?.[0] || "U"}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>
                {profileData.user?.name}
                {profileData.stats.rating >= 2000 && (
                  <Crown className={styles.crownIcon} />
                )}
              </h1>
              {isOwnProfile && (
                <p className={styles.userEmail}>{profileData.user?.email}</p>
              )}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <Trophy className={styles.statIcon} />
                  <div>
                    <h3>Rating</h3>
                    <p>{profileData.stats.rating}</p>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <Activity className={styles.statIcon} />
                  <div>
                    <h3>Games</h3>
                    <p>{profileData.stats.gamesPlayed}</p>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <Star className={styles.statIcon} />
                  <div>
                    <h3>Win Rate</h3>
                    <p>{profileData.stats.winRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "games" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("games")}
          >
            Games
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "achievements" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </button>
        </div>

        {/* Content Sections */}
        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.card}>
                <h2>
                  <Activity className={styles.cardIcon} />
                  Recent Activity
                </h2>
                <div className={styles.activityList}>
                  {profileData.recentGames &&
                  profileData.recentGames.length > 0 ? (
                    <div className={styles.gameHistory}>
                      {profileData.recentGames.map((game) => (
                        <div key={game.id} className={styles.gameItem}>
                          <div className={styles.gameInfo}>
                            <span className={styles.opponent}>
                              vs {game.opponent}
                            </span>
                            <span
                              className={`${styles.result} ${
                                styles[game.result]
                              }`}
                            >
                              {game.result.toUpperCase()}
                            </span>
                          </div>
                          <span className={styles.date}>
                            {new Date(game.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <Clock className={styles.emptyIcon} />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.card}>
                <h2>
                  <Award className={styles.cardIcon} />
                  Latest Achievements
                </h2>
                <div className={styles.achievements}>
                  {profileData.achievements?.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className={styles.achievement}>
                      {achievement.icon}
                      <h3 className={styles.achievementTitle}>
                        {achievement.title}
                      </h3>
                      <p className={styles.achievementDesc}>
                        {achievement.description}
                      </p>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${Math.min(
                              (achievement.progress / achievement.maxProgress) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "games" && (
            <div className={styles.card}>
              <h2>
                <Sword className={styles.cardIcon} />
                Game History
              </h2>
              {/* Add detailed game history here */}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className={styles.card}>
              <h2>
                <Trophy className={styles.cardIcon} />
                All Achievements
              </h2>
              <div className={styles.achievements}>
                {profileData.achievements?.map((achievement) => (
                  <div key={achievement.id} className={styles.achievement}>
                    {achievement.icon}
                    <h3 className={styles.achievementTitle}>
                      {achievement.title}
                    </h3>
                    <p className={styles.achievementDesc}>
                      {achievement.description}
                    </p>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(
                            (achievement.progress / achievement.maxProgress) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
