import { NextRequest, NextResponse } from "next/server";

interface RateLimitContext {
  email: string;
  attempts: number;
  resetTime: number;
  chatMessages: number;
  chatResetTime: number;
}

// Use a simple Map for storage (will reset on server restart)
const rateLimitMap = new Map<string, RateLimitContext>();

export function rateLimit(req: NextRequest): NextResponse | null {
  // Get identifier from request (email or IP)
  const identifier = req.headers.get("x-email") || 
                    req.ip || 
                    'anonymous';
  
  const now = Date.now();

  // Get existing rate limit context or create new one
  let context = rateLimitMap.get(identifier);
  if (!context || (context.resetTime < now && context.chatResetTime < now)) {
    context = {
      email: identifier,
      attempts: 0,
      resetTime: now + 15 * 60 * 1000, // 15 minutes for login
      chatMessages: 0,
      chatResetTime: now + 60 * 1000, // 1 minute for chat
    };
  }

  // Rate limit login attempts
  if (req.nextUrl?.pathname.startsWith("/api/auth/callback/credentials")) {
    if (context.attempts >= 5) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((context.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((context.resetTime - now) / 1000)),
          },
        }
      );
    }
    context.attempts++;
  }

  // Rate limit chat messages
  if (req.nextUrl?.pathname.startsWith("/api/chat") && req.method === "POST") {
    // Reset chat counter if time expired
    if (context.chatResetTime < now) {
      context.chatMessages = 0;
      context.chatResetTime = now + 60 * 1000;
    }

    if (context.chatMessages >= 20) { // 20 messages per minute
      return new NextResponse(
        JSON.stringify({
          error: "Too many messages. Please wait a moment before sending more.",
          retryAfter: Math.ceil((context.chatResetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((context.chatResetTime - now) / 1000)),
          },
        }
      );
    }
    context.chatMessages++;
  }

  // Update the context in the map
  rateLimitMap.set(identifier, context);
  return null;
}
