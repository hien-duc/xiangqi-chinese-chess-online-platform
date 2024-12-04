import chatMessages from './chatMessages.json';
import gameStates from './gameState.json';
import players from './players.json';
import users from './users.json';
import guests from './guests.json';
import { IChatMessage } from '@/lib/db/models/chatMessage';
import { IGameState } from '@/lib/db/models/gameState';
import { IPlayer } from '@/lib/db/models/player.model';
import { IUser } from '@/lib/db/models/user.model';
import { IGuest } from '@/lib/db/models/guest.model';

// Chat Messages
export const getMockMessages = (gameId: string): IChatMessage[] => {
  return chatMessages.messages
    .filter(msg => msg.gameId === gameId)
    .map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
};

export const addMockMessage = (message: Omit<IChatMessage, 'timestamp'>) => {
  const newMessage = {
    ...message,
    timestamp: new Date().toISOString()
  };
  chatMessages.messages.push(newMessage);
  return newMessage;
};

export const clearMockMessages = (gameId: string) => {
  chatMessages.messages = chatMessages.messages.filter(msg => msg.gameId !== gameId);
};

// Game States
export const getMockGame = (gameId: string): IGameState | undefined => {
  return gameStates.games.find(game => game.id === gameId);
};

export const getMockGamesByPlayer = (playerId: string): IGameState[] => {
  return gameStates.games.filter(game => 
    game.players.red.id === playerId || game.players.black.id === playerId
  );
};

export const updateMockGame = (gameId: string, updates: Partial<IGameState>) => {
  const gameIndex = gameStates.games.findIndex(game => game.id === gameId);
  if (gameIndex !== -1) {
    gameStates.games[gameIndex] = {
      ...gameStates.games[gameIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return gameStates.games[gameIndex];
  }
  return null;
};

// Players
export const getMockPlayer = (playerId: string): IPlayer | undefined => {
  return players.players.find(player => player.id === playerId);
};

export const getMockPlayerByUserId = (userId: string): IPlayer | undefined => {
  return players.players.find(player => player.userId === userId);
};

export const updateMockPlayerStats = (
  playerId: string,
  result: 'win' | 'loss' | 'draw',
  ratingChange: number
) => {
  const playerIndex = players.players.findIndex(player => player.id === playerId);
  if (playerIndex !== -1) {
    const player = players.players[playerIndex];
    player.gamesPlayed += 1;
    player.rating += ratingChange;
    player.lastPlayed = new Date().toISOString();

    if (result === 'win') player.wins += 1;
    else if (result === 'loss') player.losses += 1;
    else player.draws += 1;

    player.rank = calculateRank(player.rating);
    return player;
  }
  return null;
};

// Users
export const getMockUser = (userId: string): IUser | undefined => {
  return users.users.find(user => user.id === userId);
};

export const getMockUserByEmail = (email: string): IUser | undefined => {
  return users.users.find(user => user.email === email);
};

// Guests
export const getMockGuest = (guestId: string): IGuest | undefined => {
  return guests.guests.find(guest => guest.guestId === guestId);
};

export const updateMockGuestLastActive = (guestId: string) => {
  const guestIndex = guests.guests.findIndex(guest => guest.guestId === guestId);
  if (guestIndex !== -1) {
    guests.guests[guestIndex].lastActive = new Date().toISOString();
    return guests.guests[guestIndex];
  }
  return null;
};

// Helper function
function calculateRank(rating: number): string {
  if (rating < 1300) return "Beginner";
  if (rating < 1500) return "Intermediate";
  if (rating < 1700) return "Advanced";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Master";
  return "Grandmaster";
}

export default {
  chatMessages,
  gameStates,
  players,
  users,
  guests,
  getMockMessages,
  addMockMessage,
  clearMockMessages,
  getMockGame,
  getMockGamesByPlayer,
  updateMockGame,
  getMockPlayer,
  getMockPlayerByUserId,
  updateMockPlayerStats,
  getMockUser,
  getMockUserByEmail,
  getMockGuest,
  updateMockGuestLastActive
};
