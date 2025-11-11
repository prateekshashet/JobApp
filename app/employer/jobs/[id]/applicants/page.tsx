import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/auth/login?role=EMPLOYER")
  }

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      applications: {
        include: {
          seeker: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!job || job.employerId !== session.user.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Applicants for {job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {job.applications.length} application(s)
          </p>
        </div>

        <div className="grid gap-6">
          {job.applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  No applications for this job yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            job.applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle>{application.seeker.name}</CardTitle>
                  <CardDescription>
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email: {application.seeker.email}
                      </p>
                    </div>
                    {application.seeker.profile?.skills && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Skills:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {application.seeker.profile.skills}
                        </p>
                      </div>
                    )}
                    {application.seeker.profile?.experience && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Experience:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {application.seeker.profile.experience}
                        </p>
                      </div>
                    )}
                    {application.coverLetter && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                    {application.resumeUrl && (
                      <div>
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8">
          <Link href={`/employer/jobs/${job.id}`}>
            <Button variant="outline">Back to Job Details</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

