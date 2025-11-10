import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/auth/login?role=EMPLOYER")
  }

  const jobs = await prisma.job.findMany({
    where: {
      employerId: session.user.id,
    },
    include: {
      applications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  const totalJobs = await prisma.job.count({
    where: {
      employerId: session.user.id,
    },
  })

  const totalApplications = await prisma.application.count({
    where: {
      job: {
        employerId: session.user.id,
      },
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
              <CardTitle>Total Jobs</CardTitle>
              <CardDescription>Jobs you&apos;ve posted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Applications</CardTitle>
              <CardDescription>Applications received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/employer/jobs/new">
                  <Button className="w-full" variant="outline">
                    Post New Job
                  </Button>
                </Link>
                <Link href="/employer/applicants">
                  <Button className="w-full" variant="outline">
                    View Applicants
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your latest job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven&apos;t posted any jobs yet.{" "}
                <Link href="/employer/jobs/new" className="text-blue-600 hover:underline">
                  Post your first job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {job.company} - {job.location}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {job.applications.length} application(s) • Posted on{" "}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/employer/jobs/${job.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link href="/employer/jobs">
                  <Button variant="outline" className="w-full mt-4">
                    View All Jobs
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

