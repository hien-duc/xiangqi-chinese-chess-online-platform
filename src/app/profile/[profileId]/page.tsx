"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Activity, Trophy, Clock, Star } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "@/styles/Profile.module.css";

interface ProfileStats {
  rating: number;
  totalGames: number;
  winRate: number;
  averageTime?: number;
}

interface RecentGame {
  id: string;
  opponent: string;
  result: string;
  date: string;
}

interface ProfileData {
  stats: ProfileStats;
  recentGames: RecentGame[];
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
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = session?.user?.id === params.profileId;
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(`/api/v1/player/${params.profileId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch profile data");
        }
        const data = await response.json();
        setProfileData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (params.profileId) {
      fetchProfileData();
    }
  }, [params.profileId]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Profile not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
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
            <h1 className={styles.userName}>{profileData.user?.name}</h1>
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
                  <p>{profileData.stats.totalGames}</p>
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
            activeTab === "puzzles" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("puzzles")}
        >
          Puzzles
        </button>
      </div>

      {/* Content Sections */}
      <div className={styles.content}>
        {activeTab === "overview" && (
          <div className={styles.overview}>
            <div className={styles.card}>
              <h2>Recent Activity</h2>
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
                            {game.result}
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
              <h2>Statistics</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Win Rate</h3>
                  <p>{profileData.stats.winRate}%</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Games</h3>
                  <p>{profileData.stats.totalGames}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Rating</h3>
                  <p>{profileData.stats.rating}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Average Time</h3>
                  <p>{profileData.stats.averageTime || 0}m</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div className={styles.games}>
            <div className={styles.card}>
              <h2>Game History</h2>
              <div className={styles.gamesList}>
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
                            {game.result}
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
                    <Trophy className={styles.emptyIcon} />
                    <p>No games played yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "puzzles" && (
          <div className={styles.puzzles}>
            <div className={styles.card}>
              <h2>Puzzle History</h2>
              <div className={styles.puzzlesList}>
                <div className={styles.emptyState}>
                  <Star className={styles.emptyIcon} />
                  <p>No puzzles solved yet</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
