import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '../route';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ChatMessage from '@/lib/db/models/chatMessage';

// Mock NextAuth
jest.mock('@/lib/auth/config', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com'
    }
  }))
}));

// Mock db-connect
jest.mock('@/lib/db/db-connect', () => ({
  connectToDatabase: jest.fn(),
}));

describe('Chat API', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
    // Fix the mongoose connection
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.MONGODB_URI;
  });

  beforeEach(async () => {
    await ChatMessage.deleteMany({});
  });

  // Helper function to create a mock request
  const createMockRequest = (method: string, body?: any, searchParams?: URLSearchParams) => {
    const headers = new Headers();
    headers.set('x-email', 'test@example.com');

    const req = {
      method,
      headers,
      json: () => Promise.resolve(body),
      url: `http://localhost/api/chat${searchParams ? `?${searchParams.toString()}` : ''}`,
      nextUrl: {
        pathname: '/api/chat'
      }
    } as unknown as NextRequest;

    return req;
  };

  describe('POST /api/chat', () => {
    it('should create a new chat message', async () => {
      const request = createMockRequest('POST', {
        gameId: 'test-game',
        message: 'Hello, World!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.message.gameId).toBe('test-game');
      expect(data.message.message).toBe('Hello, World!');
      expect(data.message.userId).toBe('test-user-id');
      expect(data.message.userName).toBe('Test User');
    });

    it('should validate message length', async () => {
      const request = createMockRequest('POST', {
        gameId: 'test-game',
        message: '', // Empty message should fail validation
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('GET /api/chat', () => {
    beforeEach(async () => {
      // Create some test messages
      await ChatMessage.create([
        {
          gameId: 'test-game',
          userId: 'test-user-id',
          userName: 'Test User',
          message: 'Message 1',
          timestamp: new Date('2023-01-01T00:00:00Z'),
        },
        {
          gameId: 'test-game',
          userId: 'test-user-id',
          userName: 'Test User',
          message: 'Message 2',
          timestamp: new Date('2023-01-01T00:01:00Z'),
        },
      ]);
    });

    it('should fetch messages for a game', async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('gameId', 'test-game');
      const request = createMockRequest('GET', undefined, searchParams);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0].message).toBe('Message 1');
      expect(data.messages[1].message).toBe('Message 2');
    });

    it('should fetch messages after timestamp', async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('gameId', 'test-game');
      searchParams.set('lastTimestamp', '2023-01-01T00:00:30Z');
      const request = createMockRequest('GET', undefined, searchParams);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.messages).toHaveLength(1);
      expect(data.messages[0].message).toBe('Message 2');
    });
  });
});
