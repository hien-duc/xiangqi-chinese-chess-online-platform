"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  content: string;
  sender: string;
  senderName: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Record<string, ChatMessage[]>;
  sendMessage: (gameId: string, content: string) => Promise<void>;
  getGameMessages: (gameId: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const { data: session } = useSession();

  // Polling function
  const pollMessages = async (gameId: string) => {
    try {
      const response = await fetch(`/api/game/${gameId}/chat`);
      if (!response.ok) return;

      const data = await response.json();
      setMessages((prev) => ({
        ...prev,
        [gameId]: data.messages,
      }));
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  // Set up polling when game ID changes
  useEffect(() => {
    if (!activeGameId) return;

    // Initial fetch
    pollMessages(activeGameId);

    // Set up polling interval
    const interval = setInterval(() => {
      pollMessages(activeGameId);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeGameId]);

  const sendMessage = async (gameId: string, content: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/game/${gameId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: session.user.id,
          senderName: session.user.name || "Anonymous",
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Immediately fetch messages to update UI
      pollMessages(gameId);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const getGameMessages = (gameId: string) => {
    // Set this game as active for polling
    if (activeGameId !== gameId) {
      setActiveGameId(gameId);
    }
    return messages[gameId] || [];
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, getGameMessages }}>
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
