"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode
  allowedRole: "SEEKER" | "EMPLOYER"
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push(`/auth/login?role=${allowedRole}`)
      return
    }

    if (session.user.role !== allowedRole) {
      router.push(
        session.user.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard"
      )
      return
    }
  }, [session, status, router, allowedRole])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== allowedRole) {
    return null
  }

  return <>{children}</>
}

