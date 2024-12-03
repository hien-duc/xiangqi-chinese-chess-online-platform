"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface ChatMessage {
  gameId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "timestamp">) => Promise<void>;
  getGameMessages: (gameId: string) => ChatMessage[];
  clearGameMessages: (gameId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);

  // Function to fetch messages from the API
  const fetchMessages = useCallback(
    async (gameId: string) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          gameId,
          ...(lastTimestamp && { lastTimestamp }),
        });

        const response = await fetch(`/api/chat?${params}`);
        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();

        if (data.messages.length > 0) {
          setMessages((prev) => {
            const newMessages = [...prev];
            data.messages.forEach((msg: ChatMessage) => {
              if (
                !newMessages.some(
                  (m) =>
                    m.userId === msg.userId &&
                    m.timestamp === msg.timestamp &&
                    m.message === msg.message
                )
              ) {
                newMessages.push(msg);
              }
            });
            return newMessages.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
          });
          setLastTimestamp(data.messages[data.messages.length - 1].timestamp);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch messages"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [lastTimestamp]
  );

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentGameId) return;

    const pollInterval = setInterval(() => {
      fetchMessages(currentGameId);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [currentGameId, fetchMessages]);

  const addMessage = async (message: Omit<ChatMessage, "timestamp">) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setLastTimestamp(data.message.timestamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      throw err;
    }
  };

  const getGameMessages = (gameId: string) => {
    if (currentGameId !== gameId) {
      setCurrentGameId(gameId);
      setLastTimestamp(null);
      setMessages([]);
      fetchMessages(gameId);
    }
    return messages.filter((msg) => msg.gameId === gameId);
  };

  const clearGameMessages = (gameId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.gameId !== gameId));
    if (currentGameId === gameId) {
      setLastTimestamp(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        getGameMessages,
        clearGameMessages,
        isLoading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
