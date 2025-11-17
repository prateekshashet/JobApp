import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { buildResumeLink } from "@/lib/resume-links";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("Cloudinary environment variables not fully set for get-resume route.");
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function isLocalReference(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith("uploads/") || trimmed.startsWith("/uploads/");
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    // support ?applicationId=... or ?s3Key=...
    const applicationId = url.searchParams.get("applicationId");
    const s3KeyParam = url.searchParams.get("s3Key");
    const filePathParam = url.searchParams.get("filePath");
    const publicIdParam = url.searchParams.get("publicId");

    let fileKey = publicIdParam ?? filePathParam ?? s3KeyParam ?? null;
    
    // If we have an applicationId but no s3Key, look it up in the database
    if (!fileKey && applicationId) {
      const db = await getDb();
      const applications = db.collection("applications");
      const doc = await applications.findOne({ _id: new ObjectId(applicationId) });
      
      if (!doc) {
        return NextResponse.json(
          { error: "Application not found" }, 
          { status: 404 }
        );
      }
      
      // Use s3Key if available, otherwise try publicUrl
      fileKey = doc.filePath || doc.s3Key || null;
      
      // If we have a publicUrl in the document, return it directly
      if (doc.publicUrl) {
        return NextResponse.json({ 
          url: doc.publicUrl, 
          key: fileKey,
          expiresIn: null, // Public URLs don't expire
          isPublic: true
        });
      }
    }

    if (!fileKey) {
      return NextResponse.json(
        { error: "filePath/publicId or applicationId with valid file reference required" },
        { status: 400 }
      );
    }

    // If the reference points to a local file, return a local link even when Cloudinary is not configured
    if (isLocalReference(fileKey)) {
      const localLink = buildResumeLink(fileKey);
      if (!localLink) {
        return NextResponse.json(
          { error: "Unable to build local resume link" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: localLink,
        key: fileKey,
        expiresIn: null,
        isPublic: true,
      });
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary configuration missing" },
        { status: 500 }
      );
    }

    const expiresInSeconds = 60 * 60; // 1 hour
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const signedUrl = cloudinary.utils.private_download_url(
      fileKey,
      "",
      {
        resource_type: "raw",
        expires_at: expiresAt,
      }
    );

    return NextResponse.json({
      url: signedUrl,
      key: fileKey,
      expiresIn: expiresInSeconds,
      isPublic: false,
    });
    
  } catch (err: any) {
    console.error("Get resume error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
