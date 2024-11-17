import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig, User } from "next-auth"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { findUserByEmail } from "./src/lib/user-service"

// Validation schema for credentials
const signInSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string()
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
})

// Type for our extended session user
interface ExtendedUser extends User {
    id: string
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}

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
        Credentials({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials) {
                try {
                    // Validate credentials against schema
                    const { email, password } = await signInSchema.parseAsync(credentials)

                    // document
                    // logic to salt and hash password
                    //const pwHash = saltAndHashPassword(password)


                    // Find user in database
                    const user = await findUserByEmail(email)

                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.hashedPassword
                    )

                    if (!isPasswordValid) {
                        throw new Error("Invalid password")
                    }

                    // Return user object
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name || null,
                        //user
                        //image: user.image || null
                    }
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        throw new Error("Invalid credentials format")
                    }
                    throw error
                }
            }
        })
    ],

    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/error",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id ?? "";
                token.email = user.email
                token.name = user.name
                //token.picture = user.image
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                //as string; Use `as` to assert type if needed
                session.user.id = token.id
                session.user.email = token.email!
                session.user.name = token.name
                //session.user.image = token.picture
            }
            return session
        }
    },

    trustHost: true,
} satisfies NextAuthConfig

export const {
    auth,
    handlers: { GET, POST },
    signIn,
    signOut
} = NextAuth(config)