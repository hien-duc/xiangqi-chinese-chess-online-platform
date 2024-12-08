import React, { useState, useEffect } from "react";
import { useGameContext } from "@/hooks/useGameState";
import { useSession } from "next-auth/react";
import { useGameStore } from "@/stores/gameStore";
import { createGame, joinGame } from "@/actions/gameActions";
import styles from "@/styles/leftpanel.module.css";

const LeftPanel = () => {
  const { gameState } = useGameContext();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("view");
  const [showSideSelection, setShowSideSelection] = useState(false);

  const {
    games,
    fetchGames,
    currentGame,
    setCurrentGame,
    sendChatMessage,
    chatLoading,
    chatError,
  } = useGameStore();

  // Set current game when gameState changes
  useEffect(() => {
    if (gameState) {
      setCurrentGame(gameState);
    }
  }, [gameState, setCurrentGame]);

  // Fetch available games when view changes to create
  useEffect(() => {
    if (activeView === "create") {
      fetchGames();
    }
  }, [activeView, fetchGames]);

  const handleSendMessage = async () => {
    if (!message.trim() || !session || !gameState) return;

    try {
      await sendChatMessage(gameState.id, {
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        message: message.trim(),
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateGame = async (side) => {
    const result = await createGame(side, session);
    if (result.success && result.gameId) {
      await fetchGames();
      setShowSideSelection(false);
    }
  };

  const handleJoinGame = async (gameId, game) => {
    // Determine which side is available
    const availableSide = game.players.red.id === "waiting" ? "red" : "black";
    const result = await joinGame(gameId, availableSide, session);
    if (result.success) {
      await fetchGames();
    }
  };

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
          <div className={styles.playerInfo}>
            <span className={styles.playerLabel}>Black Player</span>
            <span className={styles.playerName}>
              {gameState.players.black.name}
              {gameState.players.black.isGuest && " (Guest)"}
            </span>
          </div>
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
      <h3>Games</h3>
      <div className={styles.gamesList}>
        {games.map((game) => (
          <div key={game._id} className={styles.gameItem}>
            <div className={styles.gameInfo}>
              <span className={styles.playerName}>
                {game.players.red.name || "Waiting..."}
              </span>
              <span className={styles.vs}>vs</span>
              <span className={styles.playerName}>
                {game.players.black.name || "Waiting..."}
              </span>
            </div>
            <div className={styles.gameStatus}>
              <span className={styles.statusBadge} data-status={game.status}>
                {game.status}
              </span>
              {game.status === "waiting" && (
                <button
                  className={styles.joinButton}
                  onClick={() => handleJoinGame(game._id, game)}
                >
                  Join {game.players.red.id === "waiting" ? "Red" : "Black"}
                </button>
              )}
              {game.status === "active" && (
                <button
                  className={styles.spectateButton}
                  onClick={() => {
                    /* TODO: Handle spectate */
                  }}
                >
                  Spectate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showSideSelection ? (
        <div className={styles.sideSelection}>
          <h4>Choose your side</h4>
          <div className={styles.sideButtons}>
            <button
              className={`${styles.sideButton} ${styles.redSide}`}
              onClick={() => handleCreateGame("red")}
            >
              Red Side
            </button>
            <button
              className={`${styles.sideButton} ${styles.blackSide}`}
              onClick={() => handleCreateGame("black")}
            >
              Black Side
            </button>
          </div>
          <button
            className={styles.cancelButton}
            onClick={() => setShowSideSelection(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className={styles.createButton}
          onClick={() => setShowSideSelection(true)}
        >
          Create New Game
        </button>
      )}
    </div>
  );

  const renderChat = () => (
    <div className={styles.chatSection}>
      <h3>Chat</h3>
      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {chatError && (
            <div className={styles.errorMessage}>Error: {chatError}</div>
          )}
          {currentGame?.chat?.messages?.length > 0 ? (
            currentGame.chat.messages.map((msg, index) => (
              <div
                key={`${msg.userId}-${msg.timestamp}-${index}`}
                className={`${styles.chatMessage} ${
                  msg.userId === session?.user?.id ? styles.ownMessage : ""
                }`}
              >
                <span className={styles.messageSender}>{msg.userName}:</span>
                <span className={styles.messageContent}>{msg.message}</span>
                <span className={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.noMessages}>No messages yet</p>
          )}
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={!session || chatLoading}
          />
          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={!session || chatLoading}
          >
            {chatLoading ? "Sending..." : "Send"}
          </button>
        </div>
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
