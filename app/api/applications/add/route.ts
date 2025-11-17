import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // expected payload example:
    // { 
    //   name: "Alice", 
    //   email: "a@b.com", 
    //   jobId: "...", 
    //   filePath: "resumes/12345-resume.pdf",
    //   publicUrl: "https://..."
    // }

    const { name, email, jobId, filePath, publicUrl, phone, coverLetter } = body;
    
    // Validate required fields
    if (!name || !email || !filePath) {
      return NextResponse.json(
        { error: "name, email, and filePath are required" }, 
        { status: 400 }
      );
    }

    const db = await getDb();
    const applications = db.collection("applications");

    const application = {
      name,
      email,
      phone: phone || null,
      coverLetter: coverLetter || null,
      jobId: jobId || null,
      filePath,
      publicUrl,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await applications.insertOne(application);

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      application: {
        ...application,
        _id: result.insertedId,
      }
    });
    
  } catch (error: any) {
    console.error("Error adding application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add application" },
      { status: 500 }
    );
  }
}
