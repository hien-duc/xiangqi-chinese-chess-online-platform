import React, { useState, useEffect, useRef } from "react";
import { useGameContext } from "@/hooks/useGameState";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useChat } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import styles from "@/styles/RightPanel.module.css";
import {
  FaTrophy,
  FaSkull,
  FaHandshake,
  FaComments,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import WinModal from "@/components/game/modals/WinModal";
import { getTurnColor } from "@/lib/game/fen";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatTimeChat = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isCurrentUser = (senderId, session) => {
  return senderId === session?.user?.id;
};

const PlayerInfo = ({
  player,
  side,
  isCurrentTurn,
  timeLeft,
  playerStats,
  timer,
}) => {
  if (!player) return null;

  return (
    <div className={`${styles.playerCard} ${styles[side]}`}>
      <div className={styles.playerInfo}>
        <div className={styles.playerBasicInfo}>
          <div className={styles.playerNameSection}>
            <div className={styles.playerName}>
              {player.name || "Waiting..."}
              {isCurrentTurn && <span className={styles.turnIndicator}></span>}
            </div>
            <div className={styles.playerStatus}>
              {player.isGuest ? "Guest" : playerStats?.rank || "The Bot"}
            </div>
          </div>
          {!player.isGuest && playerStats && (
            <div className={styles.ratingSection}>
              <div className={styles.rating}>{playerStats.rating}</div>
              <div className={styles.ratingLabel}>Rating</div>
            </div>
          )}
        </div>

        {!player.isBot && playerStats?.stats && (
          <div className={styles.statsSection}>
            <div className={styles.winStats}>
              <div className={styles.statItem}>
                <FaTrophy className={styles.statIcon} />
                <span>{playerStats.stats.wins}</span>
                <div className={styles.statLabel}>Wins</div>
              </div>
              <div className={styles.statItem}>
                <FaSkull className={styles.statIcon} />
                <span>{playerStats.stats.losses}</span>
                <div className={styles.statLabel}>Losses</div>
              </div>
              <div className={styles.statItem}>
                <FaHandshake className={styles.statIcon} />
                <span>{playerStats.stats.draws}</span>
                <div className={styles.statLabel}>Draws</div>
              </div>
            </div>
            <div className={styles.additionalStats}>
              <div className={styles.gamesPlayed}>
                Games: {playerStats.stats.gamesPlayed}
              </div>
              <div className={styles.winRate}>
                {playerStats.stats.winRate}% WR
              </div>
            </div>
          </div>
        )}

        <div className={styles.timeInfo}>
          <div className={styles.timeLeft}>
            Time: {formatTime(timeLeft || timer)}
          </div>
          {isCurrentTurn && <div className={styles.thinking}>Thinking...</div>}
          {timer !== null && (
            <div
              className={`${styles.timer} ${
                timer <= 10 ? styles.timerWarning : ""
              }`}
            >
              {formatTime(timer)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * The RightPanel component renders the chat panel and player information
 * for the current game. It fetches player stats and handles chat messages.
 * It also displays a win modal when the game is won.
 *
 * @returns {JSX.Element} The JSX element for the RightPanel component.
 */
const RightPanel = () => {
  const { gameState } = useGameContext();
  const { data: session } = useSession();
  const { sendMessage } = useChat();
  const [message, setMessage] = useState("");
  const [redPlayerStats, setRedPlayerStats] = useState(null);
  const [blackPlayerStats, setBlackPlayerStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const initialTimer = 1200;
  const [redTimer, setRedTimer] = useState(initialTimer); // 2 minutes for red player
  const [blackTimer, setBlackTimer] = useState(initialTimer); // 2 minutes for black player
  const redTimerRef = useRef(null);
  const blackTimerRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  const {
    times,
    startTimer,
    stopTimer,
    showWinModal,
    timeoutWinner,
    timeoutLoser,
    onWinModalClose,
  } = useGameTimer();

  const { forfeitGame } = useGameContext();

  // Fetch player stats when game state changes
  useEffect(() => {
    async function fetchPlayerStats() {
      if (!gameState?.players) return;

      try {
        // Fetch red player stats if not a bot
        if (!gameState.players.red.isBot) {
          const redResponse = await fetch(
            `/api/v1/player/${gameState.players.red.id}`
          );
          if (redResponse.ok) {
            const redData = await redResponse.json();
            setRedPlayerStats(redData);
          } else {
            console.error(
              "Failed to fetch red player stats:",
              await redResponse.text()
            );
          }
        } else {
          setRedPlayerStats({
            stats: {
              rating: "BOT",
              rank: "Bot Player",
              wins: 0,
              losses: 0,
              draws: 0,
              gamesPlayed: 0,
              winRate: 0,
            },
          });
        }

        // Fetch black player stats if not a bot
        if (!gameState.players.black.isBot) {
          const blackResponse = await fetch(
            `/api/v1/player/${gameState.players.black.id}`
          );
          if (blackResponse.ok) {
            const blackData = await blackResponse.json();
            setBlackPlayerStats(blackData);
          } else {
            console.error(
              "Failed to fetch black player stats:",
              await blackResponse.text()
            );
          }
        } else {
          setBlackPlayerStats({
            stats: {
              rating: "BOT",
              rank: "Bot Player",
              wins: 0,
              losses: 0,
              draws: 0,
              gamesPlayed: 0,
              winRate: 0,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
      }
    }

    fetchPlayerStats();
  }, [gameState?.players]);

  // Start timer when game starts
  useEffect(() => {
    if (gameState?.status === "active") {
      startTimer();
    } else {
      stopTimer();
    }
  }, [gameState?.status, startTimer, stopTimer]);

  useEffect(() => {
    setPreviousMessageCount(gameState?.messages?.length || 0);
  }, [gameState?.messages]);

  useEffect(() => {
    if (!showChat && gameState?.messages) {
      setUnreadCount(gameState.messages.length - (previousMessageCount || 0));
    }
  }, [gameState?.messages, showChat, previousMessageCount]);

  useEffect(() => {
    if (showChat) {
      setUnreadCount(0);
    }
  }, [showChat]);

  useEffect(() => {
    if (gameState?.status !== "active") {
      setRedTimer(initialTimer);
      setBlackTimer(initialTimer);
      if (redTimerRef.current) clearInterval(redTimerRef.current);
      if (blackTimerRef.current) clearInterval(blackTimerRef.current);
      return;
    }

    const currentTurn = getTurnColor(gameState?.fen);

    // Clear previous intervals
    if (redTimerRef.current) clearInterval(redTimerRef.current);
    if (blackTimerRef.current) clearInterval(blackTimerRef.current);

    // Start timer for current turn
    if (currentTurn === "red") {
      redTimerRef.current = setInterval(() => {
        setRedTimer((prev) => {
          if (prev <= 0) {
            clearInterval(redTimerRef.current);
            // Handle red player timeout
            if (gameState.status === "active") {
              forfeitGame("red");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      blackTimerRef.current = setInterval(() => {
        setBlackTimer((prev) => {
          if (prev <= 0) {
            clearInterval(blackTimerRef.current);
            // Handle black player timeout
            if (gameState.status === "active") {
              forfeitGame("black");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (redTimerRef.current) clearInterval(redTimerRef.current);
      if (blackTimerRef.current) clearInterval(blackTimerRef.current);
    };
  }, [gameState?.fen, gameState?.status]);

  // Reset timers when a move is made
  useEffect(() => {
    const currentTurn = getTurnColor(gameState?.fen);
    if (currentTurn === "red") {
      setRedTimer(initialTimer);
    } else {
      setBlackTimer(initialTimer);
    }
  }, [gameState?.fen]);

  const currentTurn = getTurnColor(gameState?.fen);
  const isRedPlayer =
    session?.user?.id === gameState?.players?.red?.id ||
    gameState?.players?.red?.id.startsWith("guest-");

  // Determine which player should be shown at the bottom based on board orientation
  const [topPlayer, bottomPlayer] = isRedPlayer
    ? [gameState?.players.black, gameState?.players.red]
    : [gameState?.players.red, gameState?.players.black];

  const [topPlayerStats, bottomPlayerStats] = isRedPlayer
    ? [blackPlayerStats, redPlayerStats]
    : [redPlayerStats, blackPlayerStats];

  const [topSide, bottomSide] = isRedPlayer
    ? ["black", "red"]
    : ["red", "black"];
  const [topTime, bottomTime] = isRedPlayer
    ? [times.black, times.red]
    : [times.red, times.black];

  return (
    <div className={styles.rightPanel}>
      <div className={styles.content}>
        <PlayerInfo
          player={topPlayer}
          side={topSide}
          isCurrentTurn={currentTurn === topSide}
          timeLeft={topTime}
          playerStats={topPlayerStats}
          timer={topSide === "red" ? redTimer : blackTimer}
        />

        <PlayerInfo
          player={bottomPlayer}
          side={bottomSide}
          isCurrentTurn={currentTurn === bottomSide}
          timeLeft={bottomTime}
          playerStats={bottomPlayerStats}
          timer={bottomSide === "red" ? redTimer : blackTimer}
        />
      </div>

      {/* Chat Button */}
      <button
        className={`${styles.chatToggle} ${showChat ? styles.active : ""}`}
        onClick={() => setShowChat(!showChat)}
        title={showChat ? "Hide Chat" : "Show Chat"}
      >
        <FaComments />
        {!showChat && unreadCount > 0 && (
          <span className={styles.messageCount}>{unreadCount}</span>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`${styles.floatingChat} ${showChat ? styles.show : ""}`}>
        <div className={styles.chatHeader}>
          <h3>Game Chat</h3>
          <button
            className={styles.closeChat}
            onClick={() => setShowChat(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {gameState?.messages?.length === 0 ? (
            <div className={styles.noMessages}>No messages yet</div>
          ) : (
            gameState?.messages?.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageWrapper} ${
                  isCurrentUser(msg.sender, session) ? styles.ownMessage : ""
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageSender}>
                      {isCurrentUser(msg.sender, session)
                        ? "You"
                        : msg.senderName}
                    </span>
                    <span className={styles.messageTime}>
                      {formatTimeChat(msg.timestamp)}
                    </span>
                  </div>
                  <div className={styles.messageText}>{msg.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.chatInput}
            onKeyPress={(e) => {
              if (e.key === "Enter" && message.trim()) {
                sendMessage(gameState._id, message.trim());
                setMessage("");
              }
            }}
          />
          <button
            className={styles.sendButton}
            onClick={() => {
              if (message.trim()) {
                sendMessage(gameState._id, message.trim());
                setMessage("");
              }
            }}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      <WinModal
        isOpen={showWinModal}
        winner={timeoutWinner}
        onClose={onWinModalClose}
        gameId={gameState?._id}
        timeoutLoss={timeoutLoser}
      />
    </div>
  );
};

export default RightPanel;
