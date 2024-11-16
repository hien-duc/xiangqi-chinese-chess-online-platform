import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

export const config = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    pages: {
        signIn: "/login",
        signOut: "/logout",
    },
    
    trustHost: true,
} satisfies NextAuthConfig

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config)