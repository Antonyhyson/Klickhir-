// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/photographers/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get("id") // New: Check for specific ID
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "rating"
    const filterBy = searchParams.get("filterBy") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // If a specific photographerId is requested, return that photographer's detailed profile
    if (photographerId) {
      const [photographer] = await sql`
        SELECT
          u.id, u.email, u.first_name, u.last_name, u.location_country, u.currency, u.is_verified,
          pp.bio, pp.specialties, pp.camera_equipment, pp.hourly_rate, pp.availability_status,
          pp.rating, pp.total_reviews, pp.profile_image_url
        FROM users u
        JOIN photographer_profiles pp ON u.id = pp.user_id
        WHERE u.id = ${photographerId} AND u.user_type = 'photographer'
      `
      if (!photographer) {
        return NextResponse.json({ error: "Photographer not found" }, { status: 404 })
      }

      // Fetch dynamic counts (posts)
      const [postCountResult] = await sql`SELECT COUNT(*) FROM portfolio_posts WHERE photographer_id = ${photographerId}`
      // Mock other stats for now as they require more complex DB schema/relations
      // You would add queries for job_applications, connections, etc. here in a real app
      const connectionsCount = Math.floor(Math.random() * 3000); // Placeholder
      const projectsCount = Math.floor(Math.random() * 100);     // Placeholder


      const photographerDetails = {
        ...photographer,
        name: `${photographer.first_name} ${photographer.last_name}`,
        username: `${photographer.first_name.toLowerCase()}_${photographer.last_name.toLowerCase()}_photo`, // Example username
        location: photographer.location_country, // Simplified for now
        reviews: photographer.total_reviews,
        avatar: photographer.profile_image_url || "/placeholder.svg?height=128&width=128",
        posts: postCountResult.count || 0,
        connections: connectionsCount,
        projects: projectsCount,
        // isClient: this will be set on the frontend depending on current user
      }

      return NextResponse.json({ photographer: photographerDetails })
    }

    // Original logic: return a list of photographers (for client dashboard search/browse)
    let query = `
      SELECT
        u.id, u.first_name, u.last_name, u.location_country, u.currency, u.is_verified,
        pp.bio, pp.specialties, pp.hourly_rate, pp.availability_status,
        pp.rating, pp.total_reviews, pp.profile_image_url
      FROM users u
      JOIN photographer_profiles pp ON u.id = pp.user_id
      WHERE u.user_type = 'photographer' AND u.is_active = true
    `

    if (search) {
      query += ` AND (
        u.first_name ILIKE '%${search}%' OR
        u.last_name ILIKE '%${search}%'
      )`
    }

    if (filterBy === "available") {
      query += ` AND pp.availability_status = 'available'`
    }

    switch (sortBy) {
      case "rating":
        query += " ORDER BY pp.rating DESC, pp.total_reviews DESC"
        break
      case "price":
        query += " ORDER BY pp.hourly_rate ASC"
        break
      default:
        query += " ORDER BY pp.rating DESC, pp.total_reviews DESC"
    }

    query += ` LIMIT ${limit}`

    const photographers = await sql.unsafe(query)

    // Add mock distance, featured, and other client dashboard specific data
    const photographersWithExtraData = photographers.map((photographer) => ({
      ...photographer,
      name: `${photographer.first_name} ${photographer.last_name}`, // Add name for consistency
      distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`, // Mocked distance from API route currently
      featured: Math.random() > 0.7, // Random featured status for demo
      // Mocked stats for client dashboard cards (connections, projects, posts)
      connections: Math.floor(Math.random() * 2000),
      projects: Math.floor(Math.random() * 100),
      posts: Math.floor(Math.random() * 200),
    }))

    return NextResponse.json({ photographers: photographersWithExtraData })
  } catch (error) {
    console.error("Get photographers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}