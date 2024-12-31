"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  Crown,
  Target,
  TrendingUp,
  User,
  Moon,
  Sun,
} from "lucide-react";
import styles from "@/styles/Leaderboard.module.css";

interface Player {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rank: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("leaderboardDarkMode");
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("leaderboardDarkMode", isDarkMode.toString());
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    fetchLeaderboard(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchLeaderboard = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/leaderboard?page=${page}&limit=${pagination.perPage}`
      );
      const data = await response.json();
      setPlayers(data.players);
      setPagination(data.pagination);

      if (session?.user?.id) {
        const userIndex = data.players.findIndex(
          (player: Player) => player.id === session.user.id
        );
        if (userIndex !== -1) {
          setUserRank((page - 1) * pagination.perPage + userIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className={styles.goldIcon} />;
      case 1:
        return <Medal className={styles.silverIcon} />;
      case 2:
        return <Award className={styles.bronzeIcon} />;
      default:
        return <span className={styles.rank}>{index + 1}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
        <div className={styles.loading}></div>
      </div>
    );
  }

  const topPlayers = players.slice(0, 3);
  const remainingPlayers = players.slice(3);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.statsSummary}>
            <div className={styles.darkModeToggle}>
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
            </div>
            <h2>Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <Crown className={styles.statIcon} />
                <div>
                  <h3>Top Rating</h3>
                  <p>{players[0]?.rating || 0}</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <Target className={styles.statIcon} />
                <div>
                  <h3>Total Players</h3>
                  <p>{pagination.total}</p>
                </div>
              </div>
              {session?.user?.id && userRank && (
                <div className={styles.statBox}>
                  <TrendingUp className={styles.statIcon} />
                  <div>
                    <h3>Your Rank</h3>
                    <p>#{userRank}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1>Leaderboard</h1>
            <p>Top players ranked by rating</p>
          </div>

          <div className={styles.topPlayers}>
            {topPlayers.map((player, index) => (
              <Link
                href={`/profile/${player.id}`}
                key={player.id}
                className={styles.topPlayerCard}
              >
                <div className={styles.topPlayerRank}>
                  {getRankIcon(index)}
                </div>
                <div className={styles.topPlayerAvatar}>
                  {player.image ? (
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={80}
                      height={80}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {player.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.topPlayerInfo}>
                  <span className={styles.topPlayerName}>{player.name}</span>
                  <span className={styles.topPlayerRating}>
                    <Star className={styles.ratingIcon} />
                    {player.rating}
                  </span>
                  <div className={styles.topPlayerStats}>
                    <span className={styles.wins}>{player.wins}W</span>
                    <span className={styles.losses}>{player.losses}L</span>
                    <span className={styles.draws}>{player.draws}D</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.leaderboardContainer}>
            <div className={styles.leaderboard}>
              <div className={styles.tableHeader}>
                <div className={styles.rank}>Rank</div>
                <div className={styles.player}>Player</div>
                <div className={styles.rating}>Rating</div>
                <div className={styles.stats}>W/L/D</div>
                <div className={styles.winRate}>Win Rate</div>
              </div>

              {remainingPlayers.map((player, index) => (
                <Link
                  href={`/profile/${player.id}`}
                  key={player.id}
                  className={`${styles.playerRow} ${
                    player.id === session?.user?.id ? styles.currentUser : ""
                  }`}
                >
                  <div className={styles.rankCell}>
                    {getRankIcon(index + 3 + (pagination.currentPage - 1) * pagination.perPage)}
                  </div>
                  <div className={styles.playerCell}>
                    {player.image ? (
                      <Image
                        src={player.image}
                        alt={player.name}
                        width={40}
                        height={40}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {player.name.charAt(0)}
                      </div>
                    )}
                    <div className={styles.playerInfo}>
                      <span className={styles.playerName}>
                        {player.name}
                        {player.id === session?.user?.id && (
                          <User className={styles.currentUserIcon} />
                        )}
                      </span>
                      <span className={styles.playerRank}>{player.rank}</span>
                    </div>
                  </div>
                  <div className={styles.ratingCell}>
                    <Star className={styles.ratingIcon} />
                    {player.rating}
                  </div>
                  <div className={styles.statsCell}>
                    <span className={styles.wins}>{player.wins}</span>/
                    <span className={styles.losses}>{player.losses}</span>/
                    <span className={styles.draws}>{player.draws}</span>
                  </div>
                  <div className={styles.winRateCell}>
                    <div className={styles.winRateBar}>
                      <div
                        className={styles.winRateFill}
                        style={{ width: `${player.winRate}%` }}
                      />
                    </div>
                    <span>{player.winRate}%</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={styles.pageButton}
              >
                <ChevronLeft />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageButton} ${
                      pagination.currentPage === page ? styles.activePage : ""
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.pages}
                className={styles.pageButton}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
