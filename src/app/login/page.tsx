import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Github } from "lucide-react"
import "../../styles/login.css"

export default async function SignInPage() {
    const session = await auth()

    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="chess-pattern"></div>

                <div className="content">
                    <div className="header">
                        <h1>象棋 Xiangqi</h1>
                        <p>Chinese Chess Online</p>
                    </div>

                    <form action={async () => {
                        "use server"
                        await signIn("github", { redirectTo: "/" })
                    }}>
                        <button type="submit" className="github-button">
                            <Github className="github-icon" />
                            Sign in with GitHub
                        </button>
                    </form>

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
            <footer>
                © 2024 Xiangqi Online. All rights reserved.
            </footer>
        </div>
    )
}


