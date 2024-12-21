import { auth, signIn } from "auth";
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

  // Redirect authenticated users
  if (session?.user) {
    redirect(searchParams?.callbackUrl || "/");
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

      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Failed to sign in");
      }

      // Successful login
      redirect(searchParams?.callbackUrl || "/");
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage =
          error.message === "NEXT_REDIRECT"
            ? "Invalid credentials"
            : error.message;

        const params = new URLSearchParams({
          message: errorMessage,
          email: rawData.email as string,
        });
        redirect(`/login?${params.toString()}`);
      }
      throw error;
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
              <div className="error-message" role="alert">
                {searchParams.message}
              </div>
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
                  defaultValue={searchParams?.email || ""}
                  autoComplete="email"
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
                  autoComplete="current-password"
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
                await signIn("github", {
                  redirectTo: searchParams?.callbackUrl || "/",
                });
              }}
            >
              <button type="submit" className="github-button">
                <Github className="github-icon" />
                Sign in with GitHub
              </button>
            </form>

            {/* Google login */}
            <form
              action={async () => {
                "use server";
                await signIn("google", {
                  redirectTo: searchParams?.callbackUrl || "/",
                });
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
              <Link href="/register" className="register-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
