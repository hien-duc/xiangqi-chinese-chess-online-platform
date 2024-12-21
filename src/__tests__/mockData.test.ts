import mockData from '../mock/mockData';

describe('Mock Data Tests', () => {
  // Chat Messages Tests
  describe('Chat Messages', () => {
    test('should get messages for a specific game', () => {
      const messages = mockData.getMockMessages('game123');
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].gameId).toBe('game123');
    });

    test('should add a new message', () => {
      const newMessage = {
        gameId: 'game123',
        userId: 'user1',
        userName: 'Alice',
        message: 'Test message'
      };
      const added = mockData.addMockMessage(newMessage);
      expect(added).toHaveProperty('timestamp');
      expect(added.message).toBe('Test message');
    });

    test('should clear messages for a game', () => {
      mockData.clearMockMessages('game123');
      const messages = mockData.getMockMessages('game123');
      expect(messages.length).toBe(0);
    });
  });

  // Game State Tests
  describe('Game States', () => {
    test('should get a specific game', () => {
      const game = mockData.getMockGame('game123');
      expect(game).toBeDefined();
      expect(game?.players.red.name).toBe('Alice');
    });

    test('should get games by player', () => {
      const games = mockData.getMockGamesByPlayer('user1');
      expect(games.length).toBeGreaterThan(0);
      expect(games[0].players.red.id).toBe('user1');
    });

    test('should update game state', () => {
      const updated = mockData.updateMockGame('game123', {
        status: 'completed',
        winner: 'red'
      });
      expect(updated?.status).toBe('completed');
      expect(updated?.winner).toBe('red');
    });
  });

  // Player Tests
  describe('Players', () => {
    test('should get a player by id', () => {
      const player = mockData.getMockPlayer('player1');
      expect(player).toBeDefined();
      expect(player?.name).toBe('Alice');
    });

    test('should get a player by user id', () => {
      const player = mockData.getMockPlayerByUserId('user1');
      expect(player).toBeDefined();
      expect(player?.name).toBe('Alice');
    });

    test('should update player stats', () => {
      const updated = mockData.updateMockPlayerStats('player1', 'win', 15);
      expect(updated?.wins).toBeGreaterThan(0);
      expect(updated?.rating).toBe(1565); // 1550 + 15
    });
  });

  // User Tests
  describe('Users', () => {
    test('should get a user by id', () => {
      const user = mockData.getMockUser('user1');
      expect(user).toBeDefined();
      expect(user?.name).toBe('Alice');
    });

    test('should get a user by email', () => {
      const user = mockData.getMockUserByEmail('alice@example.com');
      expect(user).toBeDefined();
      expect(user?.id).toBe('user1');
    });
  });

  // Guest Tests
  describe('Guests', () => {
    test('should get a guest by id', () => {
      const guest = mockData.getMockGuest('guest_123');
      expect(guest).toBeDefined();
      expect(guest?.name).toBe('Guest123');
    });

    test('should update guest last active time', () => {
      const updated = mockData.updateMockGuestLastActive('guest_123');
      expect(updated).toBeDefined();
      expect(new Date(updated!.lastActive)).toBeInstanceOf(Date);
    });
  });
});
