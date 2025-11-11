"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  profile: {
    id: string
    skills: string | null
    experience: string | null
    resumeUrl: string | null
  } | null
  userName: string
  userEmail: string
}

export function ProfileForm({ profile, userName, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [skills, setSkills] = useState(profile?.skills || "")
  const [experience, setExperience] = useState(profile?.experience || "")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      let finalResumeUrl = resumeUrl

      // Upload resume if a new file is selected
      if (resumeFile) {
        if (resumeFile.type !== "application/pdf") {
          throw new Error("Resume must be a PDF file")
        }

        const presignResponse = await fetch("/api/upload/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentType: resumeFile.type,
            fileName: resumeFile.name,
          }),
        })

        if (!presignResponse.ok) {
          throw new Error("Failed to prepare resume upload")
        }

        const presignPayload = await presignResponse.json()

        if (presignPayload.strategy === "s3") {
          const s3Response = await fetch(presignPayload.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": resumeFile.type,
            },
            body: resumeFile,
          })

          if (!s3Response.ok) {
            throw new Error("Failed to upload resume to storage")
          }

          finalResumeUrl = presignPayload.fileUrl as string
        } else if (presignPayload.strategy === "local") {
          const formData = new FormData()
          formData.append("resume", resumeFile)

          const uploadResponse = await fetch("/api/upload/resume", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload resume")
          }

          const uploadData = await uploadResponse.json()
          finalResumeUrl = uploadData.url as string
        } else {
          throw new Error("Unsupported upload strategy")
        }
      }

      setResumeUrl(finalResumeUrl)

      // Update profile
      const response = await fetch("/api/seeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills,
          experience,
          resumeUrl: finalResumeUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess(true)
      setResumeFile(null)
      router.refresh()
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={userName} disabled />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              placeholder="e.g., JavaScript, React, Node.js, Python"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              placeholder="Describe your work experience..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {resumeUrl && !resumeFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current resume:{" "}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View resume
                </a>
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Profile updated successfully!
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

