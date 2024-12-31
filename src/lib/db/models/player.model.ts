import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  userId: string | Schema.Types.ObjectId; // Allow both string and ObjectId
  name: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rank: string;
  lastPlayed: Date;
}

export interface IPlayerStats {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rank: string;
  winRate: number;
  averageTime?: number;
}

export interface IRecentGame {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw" | "active";
  date: Date;
}

export interface IPlayerProfile {
  stats: IPlayerStats;
  recentGames: IRecentGame[];
}

const PlayerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Mixed, // Allow both string and ObjectId
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, default: 1200 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    rank: { type: String, default: "Beginner" },
    lastPlayed: { type: Date, default: null },
  },
  {
    timestamps: true,
    methods: {
      async getPlayerProfile(): Promise<IPlayerProfile> {
        // Get recent games from GameState model
        const recentGames = await mongoose
          .model("gameState")
          .find({
            $or: [
              { "players.red.id": this.userId },
              { "players.black.id": this.userId },
            ],
            status: { $in: ["completed", "active"] },
          })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean();

        // Calculate win rate
        const winRate =
          this.gamesPlayed > 0 ? (this.wins / this.gamesPlayed) * 100 : 0;

        // Calculate average time from completed games
        const completedGames = await mongoose
          .model("gameState")
          .find({
            $or: [
              { "players.red.id": this.userId },
              { "players.black.id": this.userId },
            ],
            status: "completed",
          })
          .select("times players")
          .lean();

        let totalTime = 0;
        let gameCount = 0;

        completedGames.forEach((game) => {
          const playerTime =
            game.players.red.id === this.userId
              ? game.times?.red
              : game.times?.black;

          if (playerTime) {
            totalTime += playerTime;
            gameCount++;
          }
        });

        const averageTime =
          gameCount > 0
            ? Math.round(totalTime / gameCount / 60) // Convert to minutes
            : undefined;

        // Format recent games
        const formattedGames = recentGames.map((game) => ({
          id: game._id.toString(),
          opponent:
            game.players.red.id === this.userId
              ? game.players.black.name
              : game.players.red.name,
          result:
            game.status === "completed"
              ? game.winner === this.userId
                ? "win"
                : game.winner
                ? "loss"
                : "draw"
              : "active",
          date: game.updatedAt,
        }));

        return {
          stats: {
            rating: this.rating,
            gamesPlayed: this.gamesPlayed,
            wins: this.wins,
            losses: this.losses,
            draws: this.draws,
            rank: this.rank,
            winRate: Math.round(winRate),
            averageTime,
          },
          recentGames: formattedGames,
        };
      },
    },
  }
);

// Function to calculate rank based on rating
function calculateRank(rating: number): string {
  if (rating < 1300) return "Beginner";
  if (rating < 1500) return "Intermediate";
  if (rating < 1700) return "Advanced";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Master";
  return "Grandmaster";
}

// Create player profile after user registration
export async function createPlayerProfile(userId: string, name: string) {
  const PlayerModel =
    mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

  try {
    const existingPlayer = await PlayerModel.findOne({ userId });
    if (existingPlayer) {
      return existingPlayer;
    }

    const newPlayer = await PlayerModel.create({
      userId,
      name,
      rating: 1200,
      rank: "Beginner",
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      lastPlayed: null,
    });

    return newPlayer;
  } catch (error) {
    console.error("Error creating player profile:", error);
    throw error;
  }
}

// Update player stats after a game
export async function updatePlayerStats(
  playerId: string,
  result: "win" | "loss" | "draw",
  ratingChange: number
) {
  const PlayerModel =
    mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

  try {
    const player = await PlayerModel.findById(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    player.gamesPlayed += 1;
    player.rating += ratingChange;
    player.lastPlayed = new Date();
    player.rank = calculateRank(player.rating);

    if (result === "win") player.wins += 1;
    else if (result === "loss") player.losses += 1;
    else player.draws += 1;

    await player.save();
    return player;
  } catch (error) {
    console.error("Error updating player stats:", error);
    throw error;
  }
}

export default mongoose.models.Player ||
  mongoose.model<IPlayer>("Player", PlayerSchema);
