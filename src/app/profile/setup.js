// pages/profile/setup.tsx
import { getServerSession } from "next-auth";
import { config } from "@/auth";
import ProfileSetup from "@/components/ProfileSetup";
import { redirect } from "next/navigation";

export async function getServerSideProps({ req, res }) {
  const session = await getServerSession(req, res, config);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}

export default function SetupPage({ user }) {
  return <ProfileSetup user={user} />;
}
