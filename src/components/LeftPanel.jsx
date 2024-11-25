import React, { useState } from "react";
import { useGameContext } from "../hooks/useGameState";
import styles from "../styles/LeftPanel.module.css";

const LeftPanel = () => {
  const { gameState } = useGameContext();
  const [activeView, setActiveView] = useState("view");

  const renderGameInfo = () => (
    <div className={styles.gameInfo}>
      <div className={styles.playerContainer}>
        <div className={styles.playerInfo}>
          <span className={styles.playerLabel}>Red Player</span>
          <span className={styles.playerName}>
            {gameState.players.red.name}
            {gameState.players.red.isGuest && " (Guest)"}
          </span>
        </div>
        <div className={`${styles.playerInfo} ${styles.textRight}`}>
          <span className={styles.playerLabel}>Black Player</span>
          <span className={styles.playerName}>
            {gameState.players.black.name}
            {gameState.players.black.isGuest && " (Guest)"}
          </span>
        </div>
      </div>

      <div className={styles.statusContainer}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status</span>
          <span className={styles.statusBadge} data-status={gameState.status}>
            {gameState.status}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Current Turn</span>
          <span className={styles.turnBadge} data-turn={gameState.turn}>
            {gameState.turn}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Moves Made</span>
          <span className={styles.movesCount}>{gameState.moves.length}</span>
        </div>
      </div>
    </div>
  );

  const renderCreateMode = () => (
    <div className={styles.createMode}>
      <h3>Create Mode</h3>
      <div className={styles.createContent}>
        <p>Setup your custom game configuration here</p>
        <p className={styles.comingSoon}>Feature coming soon...</p>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className={styles.chatSection}>
      <h3>Chat</h3>
      <div className={styles.chatContainer}>
        {gameState.chat.messages?.map((msg, index) => (
          <div key={index} className={styles.chatMessage}>
            <span className={styles.messageSender}>{msg.userId}:</span>
            <span className={styles.messageContent}>{msg.message}</span>
            <span className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )) || <p className={styles.noMessages}>No messages yet</p>}
      </div>
    </div>
  );

  const renderPanel = () => {
    switch (activeView) {
      case "view":
        return renderGameInfo();
      case "create":
        return renderCreateMode();
      case "chat":
        return renderChat();
      default:
        return null;
    }
  };

  return (
    <div className={styles.leftPanel}>
      <div className={styles.turnIndicator} data-turn={gameState.turn}>
        {gameState.turn}'s Turn
      </div>

      <div className={styles.contentPanel}>{renderPanel()}</div>

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.navButton} ${
            activeView === "view" ? styles.active : ""
          }`}
          onClick={() => setActiveView("view")}
        >
          View
        </button>
        <button
          className={`${styles.navButton} ${
            activeView === "create" ? styles.active : ""
          }`}
          onClick={() => setActiveView("create")}
        >
          Create
        </button>
        <button
          className={`${styles.navButton} ${
            activeView === "chat" ? styles.active : ""
          }`}
          onClick={() => setActiveView("chat")}
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;
