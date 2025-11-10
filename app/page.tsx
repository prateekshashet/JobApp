import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Job Application Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find your dream job or hire the best talent
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">I am a Job Seeker</CardTitle>
              <CardDescription>
                Browse jobs, create your profile, and apply for positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>Create and manage your profile</li>
                <li>Upload your resume</li>
                <li>Browse available jobs</li>
                <li>Apply to positions</li>
                <li>Track your applications</li>
              </ul>
              <Link href="/auth/register?role=SEEKER">
                <Button className="w-full" size="lg">
                  Get Started as Job Seeker
                </Button>
              </Link>
              <div className="text-center">
                <Link href="/auth/login?role=SEEKER" className="text-sm text-blue-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">I am an Employer</CardTitle>
              <CardDescription>
                Post jobs, manage listings, and review applicants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>Post job listings</li>
                <li>Manage your job postings</li>
                <li>View applicants</li>
                <li>Review resumes and cover letters</li>
                <li>Find the perfect candidate</li>
              </ul>
              <Link href="/auth/register?role=EMPLOYER">
                <Button className="w-full" size="lg">
                  Get Started as Employer
                </Button>
              </Link>
              <div className="text-center">
                <Link href="/auth/login?role=EMPLOYER" className="text-sm text-blue-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
