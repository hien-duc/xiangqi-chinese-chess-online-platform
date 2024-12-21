import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig, User } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "./src/lib/user-service";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./src/lib/db/db-connect";
import { signInSchema } from "./src/lib/zod";
import { createPlayerProfile } from "./src/lib/db/models/player.model";

// Type for our extended session user
interface ExtendedUser extends User {
  id: string;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

export const config = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          // Validate credentials against schema
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          // document
          // logic to salt and hash password
          //const pwHash = saltAndHashPassword(password)

          // Find user in database
          const user = await findUserByEmail(email);

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error("Invalid credentials format");
          }
          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
  },
  events: {
    async createUser({ user }) {
      try {
        // Create player profile for new users
        await createPlayerProfile(
          user.id,
          user.name || user.email?.split("@")[0] || "Player"
        );
        console.log("Player profile created for new user:", user.email);
      } catch (error) {
        console.error("Error creating player profile:", error);
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      // Ensure only necessary user data is exposed in the session
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name || null;
        // Explicitly remove sensitive fields
        delete (session.user as any).hashedPassword;
        delete (session.user as any).createdAt;
        delete (session.user as any).updatedAt;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth(config);
