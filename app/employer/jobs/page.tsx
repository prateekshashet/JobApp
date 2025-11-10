import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function EmployerJobs() {
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
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your job postings
            </p>
          </div>
          <Link href="/employer/jobs/new">
            <Button>Post New Job</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t posted any jobs yet.
                </p>
                <Link href="/employer/jobs/new">
                  <Button>Post Your First Job</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {job.company} • {job.location}
                        {job.salary && ` • ${job.salary}`}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {job.applications.length} application(s)
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                    {job.description.substring(0, 200)}
                    {job.description.length > 200 && "..."}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Link href={`/employer/jobs/${job.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <Button>View Applicants</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

