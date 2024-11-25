// pages/api/players/setup.ts
import getServerSession from "next-auth";
import { config } from "@/auth";
import clientPromise from "@/src/lib/db/db-connect";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(config);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db();

    // Create player profile
    await db.collection("players").insertOne({
      userId: session.user.id,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Remove the profile setup flag
    await db
      .collection("users")
      .updateOne(
        { _id: session.user.id },
        { $unset: { needsProfileSetup: "" } }
      );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Profile setup error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
