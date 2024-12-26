import React, { useState, useEffect } from "react";
import { useGameContext } from "@/hooks/useGameState";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useChat } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import styles from "@/styles/RightPanel.module.css";
import { FaTrophy, FaSkull, FaHandshake } from "react-icons/fa";
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
          <div className={styles.playerName}>
            {player.name || "Waiting..."}
            {isCurrentTurn && <span className={styles.turnIndicator}></span>}
          </div>
          <div className={styles.playerStatus}>
            {player.isGuest ? "Guest" : playerStats?.rank || "Member"}
          </div>
        </div>

        <div className={styles.winStats}>
          <div className={styles.winStat}>
            <FaTrophy className={styles.statIcon} />
            <span>{playerStats?.wins || 0}</span>
          </div>
          <div className={styles.lossStat}>
            <FaSkull className={styles.statIcon} />
            <span>{playerStats?.losses || 0}</span>
          </div>
          <div className={styles.drawStat}>
            <FaHandshake className={styles.statIcon} />
            <span>{playerStats?.draws || 0}</span>
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
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [forfeitWinner, setForfeitWinner] = useState(null);
  const [forfeitedBy, setForfeitedBy] = useState(null);
  const {
    times,
    startTimer,
    stopTimer,
    showWinModal,
    timeoutWinner,
    timeoutLoser,
    onWinModalClose,
  } = useGameTimer();

  const isCurrentPlayer =
    session?.user?.id &&
    (session.user.id === gameState?.players.red.id ||
      session.user.id === gameState?.players.black.id);

  const handleForfeit = async () => {
    if (!gameState?._id) return;
    const currentSide =
      session?.user?.id === gameState?.players.red.id ? "red" : "black";
    const winner = currentSide === "red" ? "Black" : "Red";

    setForfeitWinner(winner);
    setForfeitedBy(currentSide);
    setShowForfeitModal(true);
    setShowForfeitConfirm(false);
  };

  const onForfeitModalClose = () => {
    setShowForfeitModal(false);
    setForfeitWinner(null);
    setForfeitedBy(null);
  };

  // Start timer when game starts
  useEffect(() => {
    if (gameState?.status === "active") {
      startTimer();
    } else {
      stopTimer();
    }
  }, [gameState?.status, startTimer, stopTimer]);

  // Get messages for current game
  const messages = gameState ? getGameMessages(gameState.id) : [];

  const handleSendMessage = async () => {
    if (!message.trim() || !gameState || !session?.user) return;

    try {
      await addMessage({
        gameId: gameState.id,
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        message: message.trim(),
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Simulated player stats
  const redPlayerStats = gameState?.players?.red?.isGuest
    ? null
    : {
        rating: 1500,
        rank: "Advanced",
        gamesPlayed: 25,
        wins: 15,
        losses: 8,
        draws: 2,
      };

  const blackPlayerStats = gameState?.players?.black?.isGuest
    ? null
    : {
        rating: 1420,
        rank: "Intermediate",
        gamesPlayed: 18,
        wins: 10,
        losses: 6,
        draws: 2,
      };
  const currentTurn = getTurnColor(gameState.fen);

  return (
    <>
      <div className={styles.rightPanel}>
        <PlayerInfo
          player={gameState?.players.red}
          side="red"
          isCurrentTurn={currentTurn === "red"}
          timeLeft={times.red}
          playerStats={redPlayerStats}
        />

        <div className={styles.chatContainer}>
          <div className={styles.messageList}>
            {messages.map((msg, index) => (
              <div key={index} className={styles.messageItem}>
                <span className={styles.messageSender}>{msg.userName}:</span>
                <span className={styles.messageContent}>{msg.message}</span>
              </div>
            ))}
          </div>
          <div className={styles.messageInput}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>

        {isCurrentPlayer && gameState?.status === "active" && (
          <div className={styles.forfeitContainer}>
            {showForfeitConfirm ? (
              <>
                <div className={styles.forfeitConfirm}>
                  Are you sure you want to forfeit?
                </div>
                <button
                  onClick={handleForfeit}
                  className={styles.forfeitConfirmBtn}
                >
                  Yes, Forfeit Game
                </button>
                <button
                  onClick={() => setShowForfeitConfirm(false)}
                  className={styles.forfeitCancelBtn}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowForfeitConfirm(true)}
                className={styles.forfeitBtn}
              >
                Forfeit Game
              </button>
            )}
          </div>
        )}

        <PlayerInfo
          player={gameState?.players.black}
          side="black"
          isCurrentTurn={currentTurn === "black"}
          timeLeft={times.black}
          playerStats={blackPlayerStats}
        />
      </div>

      <WinModal
        isOpen={showWinModal}
        winner={timeoutWinner}
        onClose={onWinModalClose}
        gameId={gameState?._id}
        timeoutLoss={timeoutLoser}
      />

      <WinModal
        isOpen={showForfeitModal}
        winner={forfeitWinner}
        onClose={onForfeitModalClose}
        gameId={gameState?._id}
        forfeitedBy={forfeitedBy}
      />
    </>
  );
};

export default RightPanel;
