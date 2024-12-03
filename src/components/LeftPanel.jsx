import React, { useState, useEffect } from "react";
import { useGameContext } from "../hooks/useGameState";
import styles from "../styles/leftPanel.module.css";

const LeftPanel = () => {
  const { gameState } = useGameContext();
  const [activeView, setActiveView] = useState("view");
  const [message, setMessage] = useState("");
  const [games, setGames] = useState([]);
  const [selectedSide, setSelectedSide] = useState(null);
  const [showSideSelection, setShowSideSelection] = useState(false);

  // Fetch available games
  useEffect(() => {
    if (activeView === "create") {
      fetchGames();
    }
  }, [activeView]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleCreateGame = async (side) => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          side,
          // TODO: Get actual user info
          playerInfo: {
            id: 'user123',
            isGuest: false,
            name: 'User123'
          }
        }),
      });

      if (response.ok) {
        const game = await response.json();
        await fetchGames();
        setShowSideSelection(false);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      const response = await fetch(`/api/game/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // TODO: Get actual user info
          playerInfo: {
            id: 'user123',
            isGuest: false,
            name: 'User123'
          }
        }),
      });

      if (response.ok) {
        const game = await response.json();
        // TODO: Handle game joined
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch(`/api/game/${gameState.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: gameState.players.red.id, // TODO: Get actual current user ID
          message: message.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error sending message:', error);
        return;
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      <h3>Games</h3>
      <div className={styles.gamesList}>
        {games.map(game => (
          <div key={game._id} className={styles.gameItem}>
            <div className={styles.gameInfo}>
              <span className={styles.playerName}>{game.players.red.name}</span>
              <span className={styles.vs}>vs</span>
              <span className={styles.playerName}>
                {game.players.black.name || 'Waiting...'}
              </span>
            </div>
            <div className={styles.gameStatus}>
              <span className={styles.statusBadge} data-status={game.status}>
                {game.status}
              </span>
              {game.status === 'waiting' && (
                <button 
                  className={styles.joinButton}
                  onClick={() => handleJoinGame(game._id)}
                >
                  Join
                </button>
              )}
              {game.status === 'active' && (
                <button 
                  className={styles.spectateButton}
                  onClick={() => {/* TODO: Handle spectate */}}
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
              onClick={() => handleCreateGame('red')}
            >
              Red Side
            </button>
            <button 
              className={`${styles.sideButton} ${styles.blackSide}`}
              onClick={() => handleCreateGame('black')}
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
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            className={styles.chatInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button 
            className={styles.sendButton}
            onClick={handleSendMessage}
          >
            Send
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
