import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"

<<<<<<< Updated upstream
const providers: Provider[] = [
    Credentials({
        credentials: { password: { label: "Password", type: "password" } },
        authorize(c) {
            if (c.password !== "password") return null
            return {
                id: "test",
                name: "Test User",
                email: "test@example.com",
=======
// Validation schema for credentials
// const signInSchema = z.object({
//     email: z.string()
//         .min(1, "Email is required")
//         .email("Invalid email"),
//     password: z.string()
//         .min(1, "Password is required")
//         .min(8, "Password must be more than 8 characters")
//         .max(32, "Password must be less than 32 characters"),
// })

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
>>>>>>> Stashed changes
            }
        },
    }),
    GitHub,
]

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== "credentials")

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    pages: {
        signIn: "/signin",
    },
})