import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buildResumeLink } from "@/lib/resume-links"

export default async function EmployerApplicants() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/auth/login?role=EMPLOYER")
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        employerId: session.user.id,
      },
    },
    include: {
      job: true,
      seeker: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Group applications by job
  const applicationsByJob = applications.reduce((acc, app) => {
    if (!acc[app.job.id]) {
      acc[app.job.id] = {
        job: app.job,
        applications: [],
      }
    }
    acc[app.job.id].applications.push(app)
    return acc
  }, {} as Record<string, { job: typeof applications[0]["job"]; applications: typeof applications }>)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Applicants</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View applicants across all your jobs
          </p>
        </div>

        <div className="space-y-8">
          {Object.keys(applicationsByJob).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  No applications received yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.values(applicationsByJob).map(({ job, applications }) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.company} • {applications.length} application(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => {
                      const resumeLink = buildResumeLink(application.resumeUrl)

                      return (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {application.seeker.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {application.seeker.email}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Applied on{" "}
                                {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                              {resumeLink && (
                                <a
                                  href={resumeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  View Resume
                                </a>
                              )}
                            </div>
                            <Link href={`/employer/jobs/${job.id}/applicants`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4">
                    <Link href={`/employer/jobs/${job.id}/applicants`}>
                      <Button variant="outline" className="w-full">
                        View All Applicants for this Job
                      </Button>
                    </Link>
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

