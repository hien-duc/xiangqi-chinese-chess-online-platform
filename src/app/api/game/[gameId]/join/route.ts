import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/db-connect';
import GameModel from '@/lib/db/models/gameState';

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerInfo } = await request.json();
    const { gameId } = params;

    await connectToDatabase();
    const game = await GameModel.findById(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game is not available to join' },
        { status: 400 }
      );
    }

    // Determine which side to join
    const side = game.players.red.id ? 'black' : 'red';
    game.players[side] = playerInfo;
    game.status = 'active';

    // Enable chat only if both players are registered users
    game.chat.enabled = !game.players.red.isGuest && !game.players.black.isGuest;

    await game.save();
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
