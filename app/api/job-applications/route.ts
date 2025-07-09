// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/job-applications/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// POST /api/job-applications - Submit a new job application
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can apply for jobs" }, { status: 403 });
    }

    const body = await request.json();
    const { jobId, message, proposedRate } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const [job] = await sql`SELECT id FROM jobs WHERE id = ${jobId}`;
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [existingApplication] = await sql`
      SELECT id FROM job_applications WHERE job_id = ${jobId} AND photographer_id = ${decoded.userId}
    `;
    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
    }

    const [application] = await sql`
      INSERT INTO job_applications (job_id, photographer_id, message, proposed_rate, status)
      VALUES (
        ${jobId},
        ${decoded.userId},
        ${message || null},
        ${proposedRate ? parseFloat(proposedRate) : null},
        'pending'
      )
      RETURNING id, status, applied_at;
    `;

    return NextResponse.json(
      {
        message: "Job application submitted successfully",
        application: application,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Submit job application API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/job-applications - Fetch job applications for a client's jobs or specific applications
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.userType !== "client") {
        return NextResponse.json({ error: "Only clients can fetch job applications for their jobs" }, { status: 403 });
    }


    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId"); // Optional: filter by specific job
    const status = searchParams.get("status"); // Optional: filter by application status

    let query = `
      SELECT
        ja.id,
        ja.job_id AS "jobId",
        ja.photographer_id AS "photographerId",
        ja.message,
        ja.proposed_rate AS "proposedRate",
        ja.status,
        ja.applied_at AS "appliedAt",
        u.first_name AS "photographerFirstName",
        u.last_name AS "photographerLastName",
        u.email AS "photographerEmail",
        pp.profile_image_url AS "photographerAvatar",
        pp.rating AS "photographerRating",
        pp.total_reviews AS "photographerReviews",
        j.title AS "jobTitle",
        j.client_id AS "jobClientId"
      FROM job_applications ja
      JOIN users u ON ja.photographer_id = u.id
      LEFT JOIN photographer_profiles pp ON u.id = pp.user_id
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.client_id = ${decoded.userId}
    `;

    const queryParams: any[] = [];
    if (jobId) {
      query += ` AND ja.job_id = $${queryParams.length + 1}`;
      queryParams.push(jobId);
    }
    if (status) {
      query += ` AND ja.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    query += ` ORDER BY ja.applied_at DESC`;

    const applications = await sql.unsafe(query, queryParams);

    return NextResponse.json({ applications });

  } catch (error) {
    console.error("Get job applications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/job-applications/[id] - Update job application status
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can update application status" }, { status: 403 });
    }

    // Extract application ID from URL path (e.g., /api/job-applications/some-id)
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const applicationId = segments[segments.length - 1]; // Get the ID from the URL last segment

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const { newStatus } = await request.json();

    if (!newStatus || !['accepted', 'rejected', 'pending'].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid new status provided. Must be 'accepted', 'rejected', or 'pending'." }, { status: 400 });
    }

    // Verify that the client owns the job associated with this application
    const [applicationCheck] = await sql`
      SELECT ja.job_id, j.client_id
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.id = ${applicationId}
    `;

    if (!applicationCheck) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }
    if (applicationCheck.client_id !== decoded.userId) {
      return NextResponse.json({ error: "You are not authorized to update this application" }, { status: 403 });
    }

    // Update the application status
    const [updatedApplication] = await sql`
      UPDATE job_applications
      SET status = ${newStatus}
      WHERE id = ${applicationId}
      RETURNING id, status;
    `;

    // Handle cascading effects if an application is accepted:
    // If a job application is accepted, you might want to:
    // 1. Set the job status to 'in_progress' or 'closed'.
    // 2. Reject other applications for the same job.
    // 3. Potentially create a contract or assign the photographer.
    // For simplicity in this step, we are only updating the single application status.

    return NextResponse.json(
      {
        message: `Application status updated to '${newStatus}'`,
        application: updatedApplication,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update application status API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}