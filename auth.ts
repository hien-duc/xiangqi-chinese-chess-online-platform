import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export const config = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    pages: {
        signIn: "/login",
        signOut: "/logout",
    },
    callbacks: {
        async session({ session, token }) {
            return session
        },
        async jwt({ token, user }) {
            return token
        },
    },

    trustHost: true,
} satisfies NextAuthConfig

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config)