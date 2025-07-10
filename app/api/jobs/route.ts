// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/jobs/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth" // Import verifyToken from lib/auth

// GET /api/jobs - Get jobs (for photographers) or posted jobs (for clients)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("userType") || decoded.userType
    const status = searchParams.get("status") || "open"
    const isCollaboration = searchParams.get("collaboration") === "true"

    // New filter parameters
    const minDate = searchParams.get("minDate") // YYYY-MM-DD
    const maxDate = searchParams.get("maxDate") // YYYY-MM-DD
    const minClientRating = searchParams.get("minClientRating") // Number string

    let query = ``
    const queryParams: any[] = [];

    if (userType === "photographer") {
      // Base query for photographers searching jobs
      query = `
        SELECT
          j.*,
          u.first_name,
          u.last_name,
          cp.rating as client_rating, -- Join client profile to get client rating
          (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
        FROM jobs j
        JOIN users u ON j.client_id = u.id
        LEFT JOIN client_profiles cp ON u.id = cp.user_id -- Join to get client rating
        WHERE j.status = $1
        AND j.is_collaboration = $2
      `;
      queryParams.push(status, isCollaboration);

      if (minDate) {
        queryParams.push(minDate);
        query += ` AND j.job_date >= $${queryParams.length}`;
      }
      if (maxDate) {
        queryParams.push(maxDate);
        query += ` AND j.job_date <= $${queryParams.length}`;
      }
      if (minClientRating) {
        queryParams.push(parseFloat(minClientRating));
        query += ` AND cp.rating >= $${queryParams.length}`;
      }

      query += ` ORDER BY j.created_at DESC LIMIT 50`; // Always add limit last

    } else {
      // Get jobs posted by this client (no new filters apply here as they're for finding jobs, not managing owned jobs)
      query = `
        SELECT j.*,
               (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
        FROM jobs j
        WHERE j.client_id = $1
        ORDER BY j.created_at DESC
        LIMIT 50
      `;
      queryParams.push(decoded.userId);
    }

    const jobs = await sql.unsafe(query, queryParams);

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Get jobs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/jobs - Create a new job (clients only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can post jobs" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      photographyType,
      hours,
      budget,
      date,
      time,
      location,
      transportationFee,
      isCollaboration,
      photographersNeeded,
    } = body

    // Validation
    if (!title || !description || !photographyType || !hours || !budget || !date || !time || !location) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Get user's currency
    const [user] = await sql`
      SELECT currency FROM users WHERE id = ${decoded.userId}
    `

    const [job] = await sql`
      INSERT INTO jobs (
        client_id, title, description, photography_type, duration_hours,
        budget, currency, job_date, job_time, location, transportation_fee,
        is_collaboration, photographers_needed
      ) VALUES (
        ${decoded.userId}, ${title}, ${description}, ${photographyType}, ${Number.parseInt(hours)},
        ${Number.parseFloat(budget)}, ${user.currency}, ${date}, ${time}, ${location}, ${transportationFee || false},
        ${isCollaboration || false}, ${photographersNeeded || 1}
      ) RETURNING *
    `

    return NextResponse.json(
      {
        message: "Job posted successfully",
        job,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// NEW: PUT /api/jobs - Update job status (e.g., mark as complete)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can update job status" }, { status: 403 });
    }

    const { jobId, newStatus, photographerId } = await request.json(); // newStatus should be 'completed'

    if (!jobId || !newStatus || !['open', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
      return NextResponse.json({ error: "Job ID and a valid new status are required" }, { status: 400 });
    }

    // Verify that the client owns this job
    const [jobCheck] = await sql`
      SELECT client_id, title FROM jobs WHERE id = ${jobId}
    `;

    if (!jobCheck) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (jobCheck.client_id !== decoded.userId) {
      return NextResponse.json({ error: "You are not authorized to update this job" }, { status: 403 });
    }

    // Update the job status
    const [updatedJob] = await sql`
      UPDATE jobs
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${jobId}
      RETURNING id, status;
    `;

    // If the job is marked as 'completed' and there's a photographer associated (via an accepted application)
    // send a notification to the photographer.
    if (newStatus === 'completed' && photographerId) {
        const [photographerUser] = await sql`SELECT first_name, last_name FROM users WHERE id = ${photographerId}`;
        if (photographerUser) {
            const notificationMessage = `Your job "${jobCheck.title}" has been marked as completed by the client. Don't forget to leave a review!`;
            await sql`
                INSERT INTO notifications (user_id, type, entity_id, message, is_read)
                VALUES (${photographerId}, 'job_completed', ${jobId}, ${notificationMessage}, FALSE);
            `;
        }
    }


    return NextResponse.json(
      {
        message: `Job status updated to '${newStatus}'`,
        job: updatedJob,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update job status API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}