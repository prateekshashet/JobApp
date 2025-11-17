"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ApplyFormProps {
  jobId: string
  profile: {
    resumeUrl: string | null
  } | null
}

export function ApplyForm({ jobId, profile }: ApplyFormProps) {
  const router = useRouter()
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let resumeUrl = profile?.resumeUrl || ""

      // Upload resume if a new file is provided or if no resume exists
      if (resumeFile) {
        if (resumeFile.type !== "application/pdf") {
          throw new Error("Resume must be a PDF file")
        }

        if (resumeFile.size > 5 * 1024 * 1024) {
          throw new Error("Resume must be smaller than 5MB")
        }

        const formData = new FormData()
        formData.append("resume", resumeFile)
        formData.append("jobId", jobId)

        const uploadResponse = await fetch("/api/upload/resume", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.json().catch(() => null)
          throw new Error(errorBody?.error || "Failed to upload resume")
        }

        const uploadData = await uploadResponse.json()
        resumeUrl =
          uploadData.publicUrl ||
          uploadData.secureUrl ||
          uploadData.secure_url ||
          uploadData.public_id ||
          uploadData.publicId ||
          uploadData.filePath ||
          ""
      }

      if (!resumeUrl) {
        throw new Error("Please upload a resume")
      }

      // Submit application
      const response = await fetch("/api/seeker/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          resumeUrl,
          coverLetter,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit application")
      }

      router.push("/seeker/applications")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF) *</Label>
            <input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {profile?.resumeUrl && !resumeFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Using resume from profile. Upload a new file to use a different resume.
              </p>
            )}
            {!profile?.resumeUrl && !resumeFile && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Please upload a resume to apply.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Write a cover letter explaining why you're a good fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading || (!resumeFile && !profile?.resumeUrl)}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

