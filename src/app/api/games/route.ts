import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/lib/db/db-connect';
import GameModel from '@/src/lib/db/models/gameState';

// GET /api/games - Get all games
export async function GET() {
  try {
    await connectToDatabase();
    const games = await GameModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST /api/games - Create a new game
export async function POST(request: Request) {
  try {
    const { side, playerInfo } = await request.json();
    await connectToDatabase();

    const gameData = {
      players: {
        red: side === 'red' ? playerInfo : { id: '', isGuest: true, name: '' },
        black: side === 'black' ? playerInfo : { id: '', isGuest: true, name: '' },
      },
      status: 'waiting',
      chat: {
        enabled: !playerInfo.isGuest,
      },
    };

    const game = await GameModel.create(gameData);
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
