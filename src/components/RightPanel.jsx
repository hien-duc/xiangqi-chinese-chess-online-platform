import React, { useState, useEffect } from "react";
import { useGameContext } from "@/hooks/useGameState";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useChat } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import styles from "@/styles/RightPanel.module.css";
import { FaTrophy, FaSkull, FaHandshake, FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import WinModal from "@/components/WinModal";
import { getTurnColor } from "@/utils/fen";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlayerInfo = ({ player, side, isCurrentTurn, timeLeft, playerStats }) => {
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

        <div className={styles.statsSection}>
          <div className={styles.winStats}>
            <div className={styles.statItem}>
              <FaTrophy className={styles.statIcon} />
              <span>{playerStats?.wins || 0}</span>
              <div className={styles.statLabel}>Wins</div>
            </div>
            <div className={styles.statItem}>
              <FaSkull className={styles.statIcon} />
              <span>{playerStats?.losses || 0}</span>
              <div className={styles.statLabel}>Losses</div>
            </div>
            <div className={styles.statItem}>
              <FaHandshake className={styles.statIcon} />
              <span>{playerStats?.draws || 0}</span>
              <div className={styles.statLabel}>Draws</div>
            </div>
          </div>
        </div>

        <div className={styles.timeInfo}>
          <div className={styles.timeLeft}>Time: {formatTime(timeLeft)}</div>
          {isCurrentTurn && <div className={styles.thinking}>Thinking...</div>}
        </div>
      </div>
    </div>
  );
};

const RightPanel = () => {
  const { gameState } = useGameContext();
  const { data: session } = useSession();
  const { getGameMessages, addMessage } = useChat();
  const [message, setMessage] = useState("");
  const [redPlayerStats, setRedPlayerStats] = useState(null);
  const [blackPlayerStats, setBlackPlayerStats] = useState(null);

  const {
    times,
    startTimer,
    stopTimer,
    showWinModal,
    timeoutWinner,
    timeoutLoser,
    onWinModalClose,
  } = useGameTimer();

  const [showChat, setShowChat] = useState(false);

  // Fetch player stats when game state changes
  useEffect(() => {
    async function fetchPlayerStats() {
      if (!gameState?.players) return;

      // Fetch red player stats if not a guest
      if (!gameState.players.red.isGuest) {
        try {
          const response = await fetch(
            `/api/player/${gameState.players.red.id}`
          );
          if (response.ok) {
            const stats = await response.json();
            setRedPlayerStats(stats);
          }
        } catch (error) {
          console.error("Error fetching red player stats:", error);
        }
      }

      // Fetch black player stats if not a guest
      if (!gameState.players.black.isGuest) {
        try {
          const response = await fetch(
            `/api/player/${gameState.players.black.id}`
          );
          if (response.ok) {
            const stats = await response.json();
            setBlackPlayerStats(stats);
          }
        } catch (error) {
          console.error("Error fetching black player stats:", error);
        }
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

  const currentTurn = getTurnColor(gameState?.fen);
  const isRedPlayer = session?.user?.id === gameState?.players?.red?.id;

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
        />

        <PlayerInfo
          player={bottomPlayer}
          side={bottomSide}
          isCurrentTurn={currentTurn === bottomSide}
          timeLeft={bottomTime}
          playerStats={bottomPlayerStats}
        />
      </div>

      {/* Floating Chat Button */}
      <button
        className={`${styles.chatToggle} ${showChat ? styles.active : ''}`}
        onClick={() => setShowChat(!showChat)}
        title={showChat ? "Hide Chat" : "Show Chat"}
      >
        <FaComments />
        {!showChat && gameState?.messages?.length > 0 && (
          <span className={styles.messageCount}>
            {gameState.messages.length}
          </span>
        )}
      </button>

      {/* Floating Chat Panel */}
      <div className={`${styles.floatingChat} ${showChat ? styles.show : ''}`}>
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
                className={`${styles.chatMessage} ${
                  msg.sender === session?.user?.id ? styles.ownMessage : ""
                }`}
              >
                <span className={styles.messageSender}>
                  {msg.sender === session?.user?.id
                    ? "You"
                    : msg.senderName || "Guest"}
                </span>
                <span className={styles.messageContent}>{msg.content}</span>
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
                addMessage(message);
                setMessage("");
              }
            }}
          />
          <button
            className={styles.sendButton}
            onClick={() => {
              if (message.trim()) {
                addMessage(message);
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
