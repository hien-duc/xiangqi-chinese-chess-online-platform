import { z } from "zod";

export const chatMessageSchema = z.object({
  gameId: z.string(),
  content: z.string().min(1),
  sender: z.string(),
  senderName: z.string(),
  timestamp: z.date().optional(),
});

export const chatQuerySchema = z.object({
  gameId: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
