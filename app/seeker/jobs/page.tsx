import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SeekerJobs() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SEEKER") {
    redirect("/auth/login?role=SEEKER")
  }

  const jobs = await prisma.job.findMany({
    include: {
      employer: true,
      applications: {
        where: {
          seekerId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next opportunity
          </p>
        </div>

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No jobs available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const hasApplied = job.applications.length > 0
              return (
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
                      {hasApplied && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Applied
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                      {job.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      {!hasApplied ? (
                        <Link href={`/seeker/jobs/${job.id}/apply`}>
                          <Button>Apply Now</Button>
                        </Link>
                      ) : (
                        <Button disabled variant="outline">
                          Already Applied
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

