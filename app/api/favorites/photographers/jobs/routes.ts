// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/favorites/jobs/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// POST /api/favorites/jobs - Save a job
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can save jobs" }, { status: 403 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Verify job exists
    const [job] = await sql`SELECT id FROM jobs WHERE id = ${jobId};`;
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    try {
      const [savedJob] = await sql`
        INSERT INTO saved_jobs (photographer_id, job_id)
        VALUES (${decoded.userId}, ${jobId})
        RETURNING id;
      `;
      return NextResponse.json({ message: "Job saved successfully", id: savedJob.id }, { status: 201 });
    } catch (dbError: any) {
      if (dbError.code === '23505') { // PostgreSQL unique_violation error code
        return NextResponse.json({ error: "Job already saved" }, { status: 409 });
      }
      console.error("Save job DB error:", dbError);
      return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
    }

  } catch (error) {
    console.error("Save job API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/favorites/jobs - Unsave a job
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can unsave jobs" }, { status: 403 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const [deleted] = await sql`
      DELETE FROM saved_jobs
      WHERE photographer_id = ${decoded.userId} AND job_id = ${jobId}
      RETURNING id;
    `;

    if (deleted) {
      return NextResponse.json({ message: "Job unsaved successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Job not found in saved list" }, { status: 404 });
    }

  } catch (error) {
    console.error("Unsave job API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/favorites/jobs - Get all saved jobs for the current photographer
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can view saved jobs" }, { status: 403 });
    }

    const savedJobs = await sql`
      SELECT
        sj.job_id AS id,
        j.title,
        j.description,
        j.photography_type,
        j.duration_hours,
        j.budget,
        j.currency,
        j.job_date,
        j.job_time,
        j.location,
        j.status,
        j.is_collaboration,
        j.photographers_needed,
        u.first_name AS client_first_name,
        u.last_name AS client_last_name,
        cp.rating AS client_rating -- Fetch client rating
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN users u ON j.client_id = u.id
      LEFT JOIN client_profiles cp ON u.id = cp.user_id
      WHERE sj.photographer_id = ${decoded.userId}
      ORDER BY sj.created_at DESC;
    `;

    // Add mock application_count and distance if needed for display on photographer dashboard
    const jobsWithMockData = savedJobs.map(job => ({
        ...job,
        job_date: new Date(job.job_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        job_time: job.job_time.substring(0, 5),
        distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`, // Mocked distance
        application_count: Math.floor(Math.random() * 10), // Mocked application count
    }));


    return NextResponse.json({ savedJobs: jobsWithMockData }, { status: 200 });

  } catch (error) {
    console.error("Get saved jobs API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}