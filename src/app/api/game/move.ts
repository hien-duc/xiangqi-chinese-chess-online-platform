import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/db/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { gameId, orig, dest, fen, turn } = req.body;
    const dbConnection = await connectToDatabase();

    if (!dbConnection?.db) {
      throw new Error("Database connection failed");
    }

    const { db } = dbConnection;

    // Rest of your code using db...
    const game = await db.collection("games").findOne({
      _id: new ObjectId(gameId),
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Your existing update logic...
    const newTurn = turn === "white" ? "black" : "white";
    const update = {
      $set: {
        fen,
        lastMove: [orig, dest],
        turn: newTurn,
        updatedAt: new Date(),
      },
    };

    await db.collection("moves").insertOne({
      gameId: new ObjectId(gameId),
      orig,
      dest,
      fen,
      turn,
      createdAt: new Date(),
    });

    await db
      .collection("games")
      .updateOne({ _id: new ObjectId(gameId) }, update);

    const updatedGame = await db.collection("games").findOne({
      _id: new ObjectId(gameId),
    });

    return res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Move handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
