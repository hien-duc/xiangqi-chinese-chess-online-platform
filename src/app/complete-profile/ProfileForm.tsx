"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfileForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: formData.get("name"),
          // Add other profile fields as needed
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push("/dashboard")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div>
        <label htmlFor="name">Player Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
        />
      </div>
      {/* Add other profile fields as needed */}
      <button type="submit">Complete Profile</button>
    </form>
  )
}