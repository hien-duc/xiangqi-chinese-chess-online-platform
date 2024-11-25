// pages/api/players/check.js
import { getServerSession } from "next-auth"
import { config } from "@/auth"
import dbConnect from "@/lib/db/db-connect"
import Player from "@/models/Player"

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, config)
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await dbConnect()

    const player = await Player.findOne({ userId: session.user.id })
    
    if (!player) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    return res.status(200).json({ player })
  } catch (error) {
    console.error('Profile check error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}