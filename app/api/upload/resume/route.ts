import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const hasS3Config =
  !!process.env.AWS_REGION &&
  !!process.env.AWS_S3_BUCKET &&
  !!process.env.AWS_S3_PUBLIC_URL &&
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY

const s3Client = hasS3Config
  ? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isJsonRequest =
      request.headers.get("content-type")?.includes("application/json") ?? false

    if (isJsonRequest) {
      const body = await request.json().catch(() => null)

      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        )
      }

      const { contentType, fileName } = body as {
        contentType?: string
        fileName?: string
      }

      if (!contentType) {
        return NextResponse.json(
          { error: "Missing content type" },
          { status: 400 }
        )
      }

      if (contentType !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are allowed" },
          { status: 400 }
        )
      }

      if (hasS3Config && s3Client) {
        const extension = fileName?.includes(".")
          ? `.${fileName.split(".").pop()?.toLowerCase()}`
          : ".pdf"

        const key = `resumes/${session.user.id}-${randomUUID()}${extension}`

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
          ContentType: contentType,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 60,
        })

        const fileUrl = `${process.env.AWS_S3_PUBLIC_URL!.replace(/\/$/, "")}/${key}`

        return NextResponse.json({ strategy: "s3", uploadUrl, fileUrl, key })
      }

      // No S3 configured: instruct client to fallback to local upload
      return NextResponse.json({ strategy: "local" })
    }

    if (hasS3Config) {
      return NextResponse.json(
        { error: "Expected JSON request body" },
        { status: 400 }
      )
    }

    // Fallback for local development without S3 configuration accepting multipart data
    const formData = await request.formData()
    const file = formData.get("resume") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), "public", "uploads", "resumes")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const filename = `${session.user.id}-${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/resumes/${filename}`

    return NextResponse.json({ strategy: "local", url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

