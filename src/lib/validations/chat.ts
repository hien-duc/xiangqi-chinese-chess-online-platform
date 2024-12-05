import { z } from "zod";

export const chatMessageSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
  timestamp: z.date().optional().default(() => new Date()),
});

export const chatQuerySchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  lastTimestamp: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatQuery = z.infer<typeof chatQuerySchema>;
