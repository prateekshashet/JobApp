import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/auth/login?role=EMPLOYER")
  }

  if (!id) {
    notFound()
  }

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      applications: true,
    },
  })

  if (!job || job.employerId !== session.user.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {job.company} • {job.location}
                {job.salary && ` • ${job.salary}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.applications.length} application(s)
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link href={`/employer/jobs/${job.id}/applicants`}>
                    <Button>View Applicants ({job.applications.length})</Button>
                  </Link>
                  <Link href="/employer/jobs">
                    <Button variant="outline">Back to Jobs</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

