import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { JobForm } from "@/components/employer/job-form"

export default async function NewJobPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/auth/login?role=EMPLOYER")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Post New Job</h1>
          <JobForm />
        </div>
      </div>
    </div>
  )
}

