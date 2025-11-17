import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      error: "This endpoint has been retired. Use /api/upload/resume for Cloudinary uploads.",
    },
    { status: 410 }
  );
}

export function GET() {
  return NextResponse.json(
    {
      error: "This endpoint has been retired. Use /api/upload/resume instead.",
    },
    { status: 410 }
  );
}
