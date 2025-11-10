"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }

  if (!session) return null

  const isEmployer = session.user.role === "EMPLOYER"
  const basePath = isEmployer ? "/employer" : "/seeker"

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href={`${basePath}/dashboard`} className="text-xl font-bold">
              Job Portal
            </Link>
            <div className="flex space-x-4">
              <Link
                href={`${basePath}/dashboard`}
                className="text-sm font-medium hover:text-blue-600"
              >
                Dashboard
              </Link>
              {isEmployer ? (
                <>
                  <Link
                    href={`${basePath}/jobs`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    My Jobs
                  </Link>
                  <Link
                    href={`${basePath}/applicants`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    Applicants
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`${basePath}/jobs`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    href={`${basePath}/profile`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`${basePath}/applications`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    My Applications
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.name}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

