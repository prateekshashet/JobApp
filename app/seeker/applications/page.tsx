import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buildResumeLink } from "@/lib/resume-links"

export default async function SeekerApplications() {
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
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job applications
          </p>
        </div>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t applied to any jobs yet.
                </p>
                <a
                  href="/seeker/jobs"
                  className="text-blue-600 hover:underline"
                >
                  Browse jobs
                </a>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle>{application.job.title}</CardTitle>
                  <CardDescription>
                    {application.job.company} • {application.job.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Applied on:{" "}
                        <span className="font-normal">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    {application.coverLetter && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                    {buildResumeLink(application.resumeUrl) && (
                      <div>
                        {(() => {
                          const resumeLink = buildResumeLink(application.resumeUrl)
                          if (!resumeLink) return null
                          return (
                        <a
                          href={resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                          )
                        })()}
                      </div>
                    )}
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

