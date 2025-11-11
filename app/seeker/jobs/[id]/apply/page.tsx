import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { ApplyForm } from "@/components/seeker/apply-form"
import { notFound } from "next/navigation"

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SEEKER") {
    redirect("/auth/login?role=SEEKER")
  }

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      employer: true,
    },
  })

  if (!job) {
    notFound()
  }

  // Check if already applied
  const existingApplication = await prisma.application.findUnique({
    where: {
      jobId_seekerId: {
        jobId: id,
        seekerId: session.user.id,
      },
    },
  })

  if (existingApplication) {
    redirect("/seeker/applications")
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Apply for {job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {job.company} • {job.location}
          </p>
          <ApplyForm jobId={job.id} profile={profile} />
        </div>
      </div>
    </div>
  )
}

