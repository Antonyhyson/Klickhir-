// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/portfolio/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth" // Import verifyToken from lib/auth

// Remove the duplicated verifySimpleToken function from here

// GET /api/portfolio - Get portfolio posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get("photographerId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = `
      SELECT
        pp.*,
        u.first_name, u.last_name, u.location_country,
        prof.rating, prof.total_reviews
      FROM portfolio_posts pp
      JOIN users u ON pp.photographer_id = u.id
      JOIN photographer_profiles prof ON u.id = prof.user_id
    `

    if (photographerId) {
      query += ` WHERE pp.photographer_id = '${photographerId}'`
    }

    query += ` ORDER BY pp.created_at DESC LIMIT ${limit}`

    const posts = await sql.unsafe(query)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get portfolio error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/portfolio - Create a new portfolio post (photographers only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the centralized verifyToken function
    const decoded = verifyToken(token) //
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can create portfolio posts" }, { status: 403 })
    }

    const body = await request.json()
    const { projectName, description, location, date, images } = body

    // Validation
    if (!projectName || !images || images.length === 0) {
      return NextResponse.json({ error: "Project name and at least one image are required" }, { status: 400 })
    }

    const [post] = await sql`
      INSERT INTO portfolio_posts (
        photographer_id, project_name, description, location, project_date, images
      ) VALUES (
        ${decoded.userId}, ${projectName}, ${description || ""},
        ${location || ""}, ${date || null}, ${images}
      ) RETURNING *
    `

    return NextResponse.json(
      {
        message: "Portfolio post created successfully",
        post,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create portfolio post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}