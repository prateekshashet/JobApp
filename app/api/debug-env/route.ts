import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
    apiKey: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
    folder: process.env.CLOUDINARY_FOLDER || 'Not set (optional)',
    nodeEnv: process.env.NODE_ENV
  });
}
