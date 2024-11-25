
// app/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
})

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    async function handleRegister(formData: FormData) {
        try {
            const rawData = {
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
            }

            const validatedData = registerSchema.parse(rawData)

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validatedData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
            }

            // Registration successful - redirect to login
            router.push("/login")
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError(error.errors[0].message)
            } else if (error instanceof Error) {
                setError(error.message)
            }
        }
    }

    return (
        <div className="register-container">
            {error && <div className="error-message">{error}</div>}
            <form action={handleRegister}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    )
}