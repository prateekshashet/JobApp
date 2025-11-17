export function buildResumeLink(resumeReference: string | null | undefined): string | null {
  if (!resumeReference) {
    return null;
  }

  const value = resumeReference.trim();
  if (!value) {
    return null;
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue.startsWith("http://") || lowerValue.startsWith("https://")) {
    return `/api/serve-resume?url=${encodeURIComponent(value)}`;
  }

  // Handle local file paths
  const sanitized = value.replace(/^\/+/, "");
  if (!sanitized) {
    return null;
  }

  // If it's a local path (starts with uploads/), use it as is
  if (sanitized.startsWith("uploads/")) {
    return `/api/serve-resume?publicId=${encodeURIComponent(sanitized)}`;
  }

  // For other cases (like Cloudinary public IDs), ensure they're properly encoded
  return `/api/serve-resume?publicId=${encodeURIComponent(sanitized)}`;
}
