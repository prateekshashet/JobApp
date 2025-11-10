import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SeekerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SEEKER") {
    redirect("/auth/login?role=SEEKER")
  }

  const applications = await prisma.application.findMany({
    where: {
      seekerId: session.user.id,
    },
    include: {
      job: {
        include: {
          employer: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  const totalApplications = await prisma.application.count({
    where: {
      seekerId: session.user.id,
    },
  })

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {session.user.name}!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Applications</CardTitle>
              <CardDescription>Jobs you&apos;ve applied to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Your profile completeness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.resumeUrl ? "Complete" : "Incomplete"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/seeker/jobs">
                  <Button className="w-full" variant="outline">
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/seeker/profile">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven&apos;t applied to any jobs yet.{" "}
                <Link href="/seeker/jobs" className="text-blue-600 hover:underline">
                  Browse jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {application.job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {application.job.company} - {application.job.location}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Applied on{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/seeker/applications">
                  <Button variant="outline" className="w-full mt-4">
                    View All Applications
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

