import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SEEKER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { skills, experience, resumeUrl } = body

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        skills: skills || null,
        experience: experience || null,
        resumeUrl: resumeUrl || null,
      },
      create: {
        userId: session.user.id,
        skills: skills || null,
        experience: experience || null,
        resumeUrl: resumeUrl || null,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

