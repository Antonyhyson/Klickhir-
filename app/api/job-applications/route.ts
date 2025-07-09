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

    const [job] = await sql`SELECT id, client_id, title FROM jobs WHERE id = ${jobId}`;
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [existingApplication] = await sql`
      SELECT id FROM job_applications WHERE job_id = ${jobId} AND photographer_id = ${decoded.userId}
    `;
    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
    }

    // Insert new job application
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

    // Create notification for the client
    const [photographerUser] = await sql`SELECT first_name, last_name FROM users WHERE id = ${decoded.userId}`;
    if (photographerUser) {
      const notificationMessage = `A new application for your job '${job.title}' has been received from ${photographerUser.first_name} ${photographerUser.last_name}.`;
      await sql`
        INSERT INTO notifications (user_id, type, entity_id, message, is_read)
        VALUES (${job.client_id}, 'job_application_received', ${application.id}, ${notificationMessage}, FALSE);
      `;
    }

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
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

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
        j.client_id AS "jobClientId",
        j.is_collaboration AS "isCollaboration" -- Added to determine if it's a collaboration job
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

    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const applicationId = segments[segments.length - 1];

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const { newStatus } = await request.json();

    if (!newStatus || !['accepted', 'rejected', 'pending'].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid new status provided. Must be 'accepted', 'rejected', or 'pending'." }, { status: 400 });
    }

    const [applicationCheck] = await sql`
      SELECT ja.job_id, ja.photographer_id, j.client_id, j.title, j.is_collaboration
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

    // --- NEW: Cascading effects if an application is accepted ---
    if (newStatus === 'accepted') {
        await sql.begin(async (sql) => {
            // 1. Update job status to 'in_progress'
            await sql`
                UPDATE jobs
                SET status = 'in_progress', updated_at = NOW()
                WHERE id = ${applicationCheck.job_id};
            `;

            // 2. If it's not a collaboration job, reject other pending applications for this job
            if (!applicationCheck.is_collaboration) {
                await sql`
                    UPDATE job_applications
                    SET status = 'rejected'
                    WHERE job_id = ${applicationCheck.job_id}
                    AND id != ${applicationId}
                    AND status = 'pending';
                `;
                // Optionally notify those rejected applicants.
            }
        });
    }
    // --- END NEW ---

    // Create notification for the photographer
    const [photographerUser] = await sql`SELECT first_name, last_name FROM users WHERE id = ${applicationCheck.photographer_id}`;
    if (photographerUser) {
      const notificationType = newStatus === 'accepted' ? 'application_accepted' : 'application_rejected';
      const notificationMessage = `Your application for job '${applicationCheck.title}' has been ${newStatus}.`;
      await sql`
        INSERT INTO notifications (user_id, type, entity_id, message, is_read)
        VALUES (${applicationCheck.photographer_id}, ${notificationType}, ${applicationId}, ${notificationMessage}, FALSE);
      `;
    }

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