import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Github, Mail } from "lucide-react";
import "../../styles/login.css";
import { signInSchema } from "../../lib/zod";
import "../globals.css";
import Link from "next/link";
import { Params } from "next/dist/server/request/params";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function LoginPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  if (session?.user) {
    redirect("/");
  }

  async function handleCredentialsLogin(formData: FormData) {
    "use server";

    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const validatedData = signInSchema.parse({
        email: rawData.email,
        password: rawData.password,
      });

      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirectTo: "/",
      });
    } catch (error) {
      if (error instanceof Error) {
        redirect(
          `/login?message=Invalid email or password. Please check again.`
        );
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
            <p>Chinese Chess Online</p>
            {searchParams?.message && (
              <div className="error-message">{searchParams.message}</div>
            )}
          </div>

          <div className="button-container">
            {/* Credentials */}
            <form className="credentials-form" action={handleCredentialsLogin}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  className="gapLabel"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  className="gapLabel"
                  required
                  minLength={8}
                  maxLength={32}
                />
              </label>
              <button type="submit" className="credentials-button">
                Sign in with Email
              </button>
            </form>

            {/* Github login */}
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/" });
              }}
            >
              <button type="submit" className="github-button">
                <Github className="github-icon" />
                Sign in with GitHub
              </button>
            </form>

            {/* Google Sign In */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button type="submit" className="google-button">
                <Mail className="google-icon" />
                Sign in with Google
              </button>
            </form>
          </div>

          <div className="register-link">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="create-account-link">
                Create one
              </Link>
            </p>
          </div>

          <div className="features">
            <div className="feature">
              <h3>Play Online</h3>
              <p>Challenge players worldwide</p>
            </div>
            <div className="feature">
              <h3>Track Progress</h3>
              <p>Save games & analyze</p>
            </div>
          </div>
        </div>
      </div>
      <footer> 2024 Xiangqi Online. All rights reserved.</footer>
    </div>
  );
}
