import { nanoid } from "nanoid";
import { connectToDatabase } from "@/src/lib/db/db-connect";
import GameModel, { IGameState } from "@/src/lib/db/models/gameState";
import GuestModel from "@/src/lib/db/models/guest.model";
import { GameState } from "@/src/app/utils/types";

export async function createGuestGame(): Promise<IGameState> {
  const guestId = `guest_${nanoid(8)}`;

  return createGame({
    id: guestId,
    isGuest: true,
    name: `Guest${guestId.slice(-4)}`,
  });
}
export async function createGame(playerInfo: {
  id: string;
  isGuest: boolean;
  name: string;
}): Promise<IGameState> {
  await connectToDatabase();

  const game = await GameModel.create({
    players: {
      red: {
        id: playerInfo.id,
        isGuest: playerInfo.isGuest,
        name: playerInfo.name,
      },
      black: {
        id: "",
        isGuest: true,
        name: "",
      },
    },
    status: "waiting",
    chat: {
      enabled: !playerInfo.isGuest, // Only enable chat if creator is registered user
    },
  });

  return game;
}

export async function joinGame(
  gameId: string,
  playerInfo: {
    id: string;
    isGuest: boolean;
    name: string;
  }
): Promise<IGameState | null> {
  await connectToDatabase();

  const game = await GameModel.findById(gameId);
  if (!game || game.status !== "waiting") return null;

  game.players.black = {
    id: playerInfo.id,
    isGuest: playerInfo.isGuest,
    name: playerInfo.name,
  };
  game.status = "active";

  // Enable chat only if both players are registered users
  game.chat.enabled = !game.players.red.isGuest && !game.players.black.isGuest;

  return await game.save();
}

export async function createGuest(): Promise<string> {
  await connectToDatabase();

  const guestId = `guest_${nanoid(8)}`;
  const guestName = `Guest${Math.floor(Math.random() * 10000)}`;

  await GuestModel.create({
    guestId,
    name: guestName,
  });

  return guestId;
}
