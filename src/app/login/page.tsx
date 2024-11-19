import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Github, Mail } from "lucide-react"
import "../../styles/login.css"

export default async function LoginPage() {
    const session = await auth()

    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="chess-pattern"></div>

                <div className="content">
                    <div className="header">
                        <h1>Xiangqi</h1>
                        <p>Chinese Chess Online</p>
                    </div>

                    <div className="button-container">
                        {/* Credentials */}
                        <form
                            className="credentials-form"
                            action={async () => {
                                "use server";
                                await signIn("credentials", { redirectTo: "/" });
                            }}
                        >
                            <label>
                                Email
                                <input
                                    name="email"
                                    type="email"
                                //placeholder="example@example.com"/
                                />
                            </label>
                            <label>
                                Password
                                <input
                                    name="password"
                                    type="password"
                                // placeholder="********"
                                />
                            </label>
                            <button type="submit" className="credentials-button">
                                Sign in with Email
                            </button>
                        </form>

                        {/* Github login */}
                        <form action={async () => {
                            "use server"
                            await signIn("github", { redirectTo: "/" })
                        }}>
                            <button type="submit" className="github-button">
                                <Github className="github-icon" />
                                Sign in with GitHub
                            </button>
                        </form>
                        {/* Google Sign In */}
                        <form action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/" })
                        }}>
                            <button type="submit" className="google-button">
                                <Mail className="google-icon" />
                                Sign in with Google
                            </button>
                        </form>
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
            <br />
            <footer>
                © 2024 Xiangqi Online. All rights reserved.
            </footer>
        </div>
    )
}


