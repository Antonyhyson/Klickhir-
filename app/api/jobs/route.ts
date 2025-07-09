// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/jobs/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth" // Import verifyToken from lib/auth

// Remove the duplicated verifySimpleToken function from here

// GET /api/jobs - Get jobs (for photographers) or posted jobs (for clients)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the centralized verifyToken function
    const decoded = verifyToken(token) //
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // Prioritize userType from token if not explicitly provided in search params
    const userType = searchParams.get("userType") || decoded.userType
    const status = searchParams.get("status") || "open"
    const isCollaboration = searchParams.get("collaboration") === "true"

    let jobs

    if (userType === "photographer") {
      // Get available jobs for photographers
      jobs = await sql`
        SELECT j.*, u.first_name, u.last_name,
               (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
        FROM jobs j
        JOIN users u ON j.client_id = u.id
        WHERE j.status = ${status}
        AND j.is_collaboration = ${isCollaboration}
        ORDER BY j.created_at DESC
        LIMIT 50
      `
    } else {
      // Get jobs posted by this client
      jobs = await sql`
        SELECT j.*,
               (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
        FROM jobs j
        WHERE j.client_id = ${decoded.userId}
        ORDER BY j.created_at DESC
        LIMIT 50
      `
    }

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

    // Use the centralized verifyToken function
    const decoded = verifyToken(token) //
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