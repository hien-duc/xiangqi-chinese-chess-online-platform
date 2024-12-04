import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/db-connect';
import GameModel from '@/lib/db/models/gameState';

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerInfo, side } = await request.json();
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

    // Check if the requested side is available
    if (game.players[side].id !== 'waiting') {
      return NextResponse.json(
        { error: 'Selected side is not available' },
        { status: 400 }
      );
    }

    // Update the player info for the selected side
    game.players[side] = {
      ...playerInfo,
      orientation: side
    };

    // If both sides are filled, set the game to active
    if (game.players.red.id !== 'waiting' && game.players.black.id !== 'waiting') {
      game.status = 'active';
    }

    await game.save();
    return NextResponse.json({ 
      success: true,
      game: game.toObject() 
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
