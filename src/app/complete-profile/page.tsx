import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm.tsx"

export default async function CompleteProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.isProfileComplete) {
        redirect("/")
    }

    return (
        <div className="profile-completion-container">
            <h1>Complete Your Profile</h1>
            <ProfileForm userId={session.user.id} />
        </div>
    )
}