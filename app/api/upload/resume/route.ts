import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Define Cloudinary upload result type
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  [key: string]: any;
}

// Helper to handle file upload to Cloudinary
const streamUpload = (buffer: Buffer, folder = "resumes"): Promise<CloudinaryUploadResult> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: "raw",
        folder,
        use_filename: true,
        unique_filename: true,
        format: "pdf"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('No result from Cloudinary'));
        }
        resolve(result as CloudinaryUploadResult);
      }
    );
    stream.end(buffer);
  });

type UploadProvider = "cloudinary" | "local";

interface UnifiedUploadResult {
  provider: UploadProvider;
  publicId: string;
  publicUrl: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
}

async function uploadToLocal(buffer: Buffer): Promise<UnifiedUploadResult> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}.pdf`;
  const absolutePath = path.join(uploadsDir, fileName);
  await fs.writeFile(absolutePath, buffer);

  const relativePath = path.posix.join("uploads", "resumes", fileName);
  const publicUrl = `/${relativePath}`;

  return {
    provider: "local",
    publicId: relativePath,
    publicUrl,
    secureUrl: publicUrl,
    format: "pdf",
    resourceType: "raw",
    bytes: buffer.length,
  };
}

async function uploadToCloudinary(buffer: Buffer): Promise<UnifiedUploadResult> {
  const uploadResult = await streamUpload(buffer, process.env.CLOUDINARY_FOLDER);

  if (!uploadResult?.secure_url) {
    throw new Error("Cloudinary upload succeeded but no secure_url was returned");
  }

  return {
    provider: "cloudinary",
    publicId: uploadResult.public_id,
    publicUrl: uploadResult.secure_url,
    secureUrl: uploadResult.secure_url,
    format: uploadResult.format,
    resourceType: uploadResult.resource_type,
    bytes: uploadResult.bytes,
  };
}

// Parse form data with proper type safety
async function parseFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get("resume") as File | null;
  
  return {
    file,
    fields: {
      name: (formData.get("name") as string | null)?.trim() || null,
      email: (formData.get("email") as string | null)?.trim() || null,
      jobId: (formData.get("jobId") as string | null)?.trim() || null,
      phone: (formData.get("phone") as string | null)?.trim() || null,
      coverLetter: (formData.get("coverLetter") as string | null)?.trim() || null,
    }
  };
}

export async function POST(request: Request) {
  console.log("Upload request received");
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const { file, fields } = await parseFormData(request);
    console.log("Form data parsed:", { fields });

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using Cloudinary when configured, otherwise fall back to local storage
    console.log("Uploading resume...", {
      bytes: buffer.length,
      provider: CLOUDINARY_CONFIGURED ? "cloudinary" : "local",
    });

    let uploadResult: UnifiedUploadResult;
    try {
      uploadResult = CLOUDINARY_CONFIGURED
        ? await uploadToCloudinary(buffer)
        : await uploadToLocal(buffer);
    } catch (error) {
      console.error("Upload failed:", error);
      return NextResponse.json(
        { error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // Save to MongoDB if we have required fields
    let insertedId = null;
    if (fields.name && fields.email) {
      const db = await getDb();
      const applications = db.collection("applications");
      
      const doc = {
        ...fields,
        filePath: uploadResult.publicId,
        publicUrl: uploadResult.publicUrl,
        provider: uploadResult.provider,
        fileFormat: uploadResult.format,
        fileBytes: uploadResult.bytes,
        status: "submitted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await applications.insertOne(doc);
      insertedId = result.insertedId;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      id: insertedId,
      provider: uploadResult.provider,
      public_id: uploadResult.publicId,
      secure_url: uploadResult.secureUrl,
      secureUrl: uploadResult.secureUrl,
      publicUrl: uploadResult.publicUrl,
      filePath: uploadResult.publicId,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      resource_type: uploadResult.resourceType,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

