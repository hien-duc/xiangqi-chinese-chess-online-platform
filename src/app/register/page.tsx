"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import "@/styles/login.css";
import "../globals.css";
import Link from "next/link";
import { SignupFormSchema } from "@/lib/zod";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(formData: FormData) {
    try {
      const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const validatedData = SignupFormSchema.parse(rawData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        throw new Error(errorData.message);
      }

      await response.json();
      // Registration successful - redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="chess-pattern"></div>

        <div className="content">
          <div className="header">
            <h1>Xiangqi</h1>
            <p>Create Your Account</p>
          </div>

          <div className="button-container">
            {/* Credentials */}
            <form
              className="credentials-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleRegister(formData);
              }}
            >
              {error && <div className="error-message">{error}</div>}
              <label>
                Name
                <input
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </label>
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={32}
                />
                <div className="password-requirements">
                  Password must be 8-32 characters
                </div>
              </label>
              <button type="submit" className="credentials-button">
                Create Account
              </button>
            </form>
          </div>

          <div className="register-link">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="create-account-link">
                Sign in now!
              </Link>
            </p>
          </div>

          <div className="features">
            <div className="feature">
              <h3>Secure Account</h3>
              <p>Strong password protection</p>
            </div>
            <div className="feature">
              <h3>Quick Setup</h3>
              <p>Start playing in minutes</p>
            </div>
          </div>
        </div>
      </div>
      <footer>2024 Xiangqi Online. All rights reserved.</footer>
    </div>
  );
}
