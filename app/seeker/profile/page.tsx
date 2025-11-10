import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { ProfileForm } from "@/components/seeker/profile-form"

export default async function SeekerProfile() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SEEKER") {
    redirect("/auth/login?role=SEEKER")
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
          <ProfileForm
            profile={profile}
            userName={user?.name || ""}
            userEmail={user?.email || ""}
          />
        </div>
      </div>
    </div>
  )
}

