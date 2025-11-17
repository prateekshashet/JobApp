import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { cloudinary } from "@/lib/supabase";

const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const CLOUDINARY_HOST_PREFIX = "https://res.cloudinary.com/";

type Candidate = {
  publicId: string;
  format?: string;
  source: string;
};

type SplitResult = {
  withExtension: string;
  withoutExtension?: string;
  format?: string;
};

const privateDownload = cloudinary.utils.private_download_url as unknown as (
  publicId: string,
  format: string | undefined,
  options: Record<string, unknown>
) => string;

const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const PUBLIC_DIR = path.join(process.cwd(), "public");

function splitPublicId(value: string): SplitResult {
  const parts = value.split("/");
  const last = parts.pop();

  if (!last) {
    return { withExtension: value };
  }

  const prefix = parts.join("/");
  const withExtension = prefix ? `${prefix}/${last}` : last;
  const lastDot = last.lastIndexOf(".");

  if (lastDot === -1) {
    return { withExtension };
  }

  const base = last.slice(0, lastDot);
  const format = last.slice(lastDot + 1);
  const withoutExtension = prefix ? `${prefix}/${base}` : base;

  return { withExtension, withoutExtension, format };
}

function sanitizePublicId(value: string): string {
  return value.replace(/[^0-9a-zA-Z_\-/.]/g, "_");
}

function isLegacyLocalReference(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith("uploads/") || trimmed.startsWith("/uploads/");
}

async function tryServeLegacyLocal(reference: string | null | undefined): Promise<Response | null> {
  if (!reference) {
    console.log('No reference provided to tryServeLegacyLocal');
    return null;
  }
  
  console.log(`Trying to serve legacy local file: ${reference}`);
  
  // Normalize the reference by removing any leading slashes
  const normalizedRef = reference.replace(/^\/+/, '');
  console.log('Normalized reference:', normalizedRef);

  // Check if the reference is a local path
  const isLocalPath = normalizedRef.startsWith('uploads/') || 
                     normalizedRef.startsWith('public/uploads/');
  
  if (!isLocalPath) {
    console.log('Reference is not a local file path');
    return null;
  }

  // Resolve the full path
  const relativePath = normalizedRef.startsWith('public/') 
    ? normalizedRef 
    : `public/${normalizedRef}`;
  
  const targetPath = path.resolve(process.cwd(), relativePath);
  const publicPath = path.resolve(process.cwd(), 'public');
  
  console.log('Resolved paths:', { targetPath, publicPath });

  // Security check: ensure the target is inside the public directory
  if (!targetPath.startsWith(publicPath)) {
    console.error('Security violation: Attempted to access file outside public directory');
    return null;
  }

  try {
    console.log('Attempting to read file at:', targetPath);
    const fileBuffer = await fs.readFile(targetPath);
    const filename = path.basename(targetPath) || "resume.pdf";
    console.log('File read successfully, size:', fileBuffer.length);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    console.error('File read error:', {
      code: err.code,
      message: err.message,
      path: targetPath,
      error: err
    });
    
    // If file doesn't exist, try to find it case-insensitively
    if (err.code === 'ENOENT') {
      console.log('File not found, attempting case-insensitive search...');
      const dirPath = path.dirname(targetPath);
      const fileName = path.basename(targetPath);
      
      try {
        const files = await fs.readdir(dirPath);
        const foundFile = files.find(f => f.toLowerCase() === fileName.toLowerCase());
        
        if (foundFile) {
          const actualPath = path.join(dirPath, foundFile);
          console.log('Found file with different case:', actualPath);
          const fileBuffer = await fs.readFile(actualPath);
          
          return new Response(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Length": fileBuffer.length.toString(),
              "Content-Disposition": `inline; filename="${encodeURIComponent(foundFile)}"`,
              "Cache-Control": "private, max-age=300",
            },
          });
        }
      } catch (dirError) {
        console.error('Error during case-insensitive search:', dirError);
      }
    }
    
    return null;
  }
}

function extractFromUrl(url: string): SplitResult | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith("/")) {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex === segments.length - 1) {
      return null;
    }

    let publicIdSegments = segments.slice(uploadIndex + 1);
    if (publicIdSegments[0]?.startsWith("v") && /^v\d+$/i.test(publicIdSegments[0])) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    if (!publicIdSegments.length) {
      return null;
    }

    const withExtension = publicIdSegments.join("/");
    return splitPublicId(withExtension);
  } catch (error) {
    console.error("Failed to parse Cloudinary URL", error);
    return null;
  }
}

function buildCandidates(options: {
  decodedUrl: string | null;
  decodedPublicId: string | null;
}): { candidates: Candidate[]; directUrl: string | null } {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  const addCandidate = (publicId?: string, format?: string, source?: string) => {
    if (!publicId) return;
    const key = `${publicId}|${format ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ publicId, format, source: source ?? "unknown" });
  };

  if (options.decodedPublicId) {
    const split = splitPublicId(options.decodedPublicId);
    addCandidate(split.withExtension, undefined, "publicId-param");
    if (split.withoutExtension && split.format) {
      addCandidate(split.withoutExtension, split.format, "publicId-param-trimmed");
    }
    const sanitizedWithExtension = sanitizePublicId(split.withExtension);
    if (sanitizedWithExtension !== split.withExtension) {
      addCandidate(sanitizedWithExtension, undefined, "publicId-param-sanitized");
    }
    if (split.withoutExtension && split.format) {
      const sanitizedWithoutExtension = sanitizePublicId(split.withoutExtension);
      if (sanitizedWithoutExtension !== split.withoutExtension) {
        addCandidate(sanitizedWithoutExtension, split.format, "publicId-param-trimmed-sanitized");
      }
    }
  }

  if (options.decodedUrl?.startsWith(CLOUDINARY_HOST_PREFIX)) {
    const parsed = extractFromUrl(options.decodedUrl);
    if (parsed) {
      addCandidate(parsed.withExtension, undefined, "url-derived");
      if (parsed.withoutExtension && parsed.format) {
        addCandidate(parsed.withoutExtension, parsed.format, "url-derived-trimmed");
      }
      const sanitizedUrlWithExtension = sanitizePublicId(parsed.withExtension);
      if (sanitizedUrlWithExtension !== parsed.withExtension) {
        addCandidate(sanitizedUrlWithExtension, undefined, "url-derived-sanitized");
      }
      if (parsed.withoutExtension && parsed.format) {
        const sanitizedUrlWithoutExtension = sanitizePublicId(parsed.withoutExtension);
        if (sanitizedUrlWithoutExtension !== parsed.withoutExtension) {
          addCandidate(sanitizedUrlWithoutExtension, parsed.format, "url-derived-trimmed-sanitized");
        }
      }
    }
  }

  return { candidates, directUrl: options.decodedUrl }; // directUrl may be null
}

function deriveFilename(candidate: Candidate): string {
  const base = candidate.publicId.split("/").pop() || "resume";
  if (base.includes(".")) {
    return base;
  }
  const ext = candidate.format || "pdf";
  return `${base}.${ext}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const encodedUrl = searchParams.get("url");
    const publicIdParam = searchParams.get("publicId");

    const decodedUrl = encodedUrl ? decodeURIComponent(encodedUrl) : null;
    const decodedPublicId = publicIdParam ? decodeURIComponent(publicIdParam) : null;

    if (!decodedUrl && !decodedPublicId) {
      return NextResponse.json(
        { error: "Either url or publicId query parameter is required" },
        { status: 400 }
      );
    }

    // Always try local file first if we have a public ID that looks like a local path
    if (decodedPublicId?.startsWith('uploads/') || decodedPublicId?.startsWith('/uploads/')) {
      const legacyResponse = await tryServeLegacyLocal(decodedPublicId);
      if (legacyResponse) {
        return legacyResponse;
      }
    }
    
    // If Cloudinary is not configured, try to serve from local files before giving up
    if (!CLOUDINARY_CONFIGURED) {
      if (decodedUrl || decodedPublicId) {
        const legacyResponse = await tryServeLegacyLocal(decodedUrl ?? decodedPublicId ?? undefined);
        if (legacyResponse) {
          return legacyResponse;
        }
      }
      return NextResponse.json(
        { error: "Cloudinary is not configured and local file not found" },
        { status: 404 }
      );
    }

    const attempts: Array<{ type: string; status: number; detail?: string }> = [];

    // Attempt direct fetch first if we received a Cloudinary secure_url.
    if (decodedUrl?.startsWith(CLOUDINARY_HOST_PREFIX)) {
      const directResponse = await fetch(decodedUrl);
      if (directResponse.ok) {
        const buffer = Buffer.from(await directResponse.arrayBuffer());
        const contentType = directResponse.headers.get("Content-Type") || "application/pdf";
        const dispositionName = decodedUrl.split("/").pop() || "resume.pdf";

        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            "Content-Disposition": `inline; filename="${dispositionName}"`,
            "Cache-Control": "private, max-age=300",
          },
        });
      }

      const failureBody = await directResponse.text().catch(() => "");
      attempts.push({ type: "direct", status: directResponse.status, detail: failureBody.slice(0, 200) });

      if (apiKey && apiSecret) {
        const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        const authedResponse = await fetch(decodedUrl, {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        });

        if (authedResponse.ok) {
          const buffer = Buffer.from(await authedResponse.arrayBuffer());
          const contentType = authedResponse.headers.get("Content-Type") || "application/pdf";
          const dispositionName = decodedUrl.split("/").pop() || "resume.pdf";

          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Length": buffer.length.toString(),
              "Content-Disposition": `inline; filename="${dispositionName}"`,
              "Cache-Control": "private, max-age=300",
            },
          });
        }

        const authedFailure = await authedResponse.text().catch(() => "");
        attempts.push({
          type: "direct-basic",
          status: authedResponse.status,
          detail: authedFailure.slice(0, 200),
        });
      }
    }

    const { candidates } = buildCandidates({ decodedUrl, decodedPublicId });

    if (!candidates.length) {
      return NextResponse.json(
        { error: "Unable to derive Cloudinary public ID from inputs" },
        { status: 400 }
      );
    }

    const assetTypes = ["upload", "authenticated", "private"] as const;

    for (const candidate of candidates) {
      try {
        const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
        for (const assetType of assetTypes) {
          try {
            const signedUrl = privateDownload(candidate.publicId, candidate.format, {
              resource_type: "raw",
              type: assetType,
              expires_at: expiresAt,
            });

            const signedResponse = await fetch(signedUrl);
            if (!signedResponse.ok) {
              const failurePreview = await signedResponse.text().catch(() => "");
              attempts.push({
                type: `signed:${candidate.source}:${assetType}`,
                status: signedResponse.status,
                detail: `${candidate.publicId}${candidate.format ? `.${candidate.format}` : ""} :: ${failurePreview.slice(0, 120)}`,
              });
              // Try signed delivery URL as a fallback for this asset type
              const urlOptions: Record<string, unknown> = {
                resource_type: "raw",
                type: assetType,
                secure: true,
                sign_url: true,
              };
              if (candidate.format && !candidate.publicId.includes(".")) {
                urlOptions.format = candidate.format;
              }

              const signedDirectUrl = cloudinary.url(candidate.publicId, urlOptions);
              const urlResponse = await fetch(signedDirectUrl);
              if (!urlResponse.ok) {
                const urlFailure = await urlResponse.text().catch(() => "");
                attempts.push({
                  type: `signed-url:${candidate.source}:${assetType}`,
                  status: urlResponse.status,
                  detail: `${candidate.publicId}${candidate.format ? `.${candidate.format}` : ""} :: ${urlFailure.slice(0, 120)}`,
                });
                continue;
              }

              const urlBuffer = Buffer.from(await urlResponse.arrayBuffer());
              const filename = deriveFilename(candidate);
              const urlContentType = urlResponse.headers.get("Content-Type") || "application/pdf";

              return new Response(urlBuffer, {
                status: 200,
                headers: {
                  "Content-Type": urlContentType,
                  "Content-Length": urlBuffer.length.toString(),
                  "Content-Disposition": `inline; filename="${filename}"`,
                  "Cache-Control": "private, max-age=300",
                },
              });
            }

            const buffer = Buffer.from(await signedResponse.arrayBuffer());
            const filename = deriveFilename(candidate);
            const contentType = signedResponse.headers.get("Content-Type") || "application/pdf";

            return new Response(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Content-Length": buffer.length.toString(),
                "Content-Disposition": `inline; filename="${filename}"`,
                "Cache-Control": "private, max-age=300",
              },
            });
          } catch (innerSignedError) {
            console.error("Signed fetch attempt threw", { candidate, assetType }, innerSignedError);
            attempts.push({
              type: `signed-error:${candidate.source}:${assetType}`,
              status: 500,
              detail: candidate.publicId,
            });
          }
        }
      } catch (innerError) {
        console.error("Signed fetch attempt failed", candidate, innerError);
        attempts.push({ type: `signed-exception:${candidate.source}`, status: 500, detail: candidate.publicId });
      }
    }

    const lastStatus = attempts.at(-1)?.status ?? 404;
    return NextResponse.json(
      {
        error: "Unable to retrieve file from Cloudinary",
        attempts,
      },
      { status: lastStatus }
    );
  } catch (error) {
    console.error("serve-resume error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
