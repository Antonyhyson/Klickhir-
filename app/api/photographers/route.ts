import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "rating"
    const filterBy = searchParams.get("filterBy") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build the query dynamically
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.location_country, u.currency,
        pp.bio, pp.specialties, pp.hourly_rate, pp.availability_status,
        pp.rating, pp.total_reviews, pp.profile_image_url,
        pp.created_at
      FROM users u
      JOIN photographer_profiles pp ON u.id = pp.user_id
      WHERE u.user_type = 'photographer' AND u.is_active = true
    `

    // Add search filter
    if (search) {
      query += ` AND (
        u.first_name ILIKE '%${search}%' OR 
        u.last_name ILIKE '%${search}%'
      )`
    }

    // Add availability filter
    if (filterBy === "available") {
      query += ` AND pp.availability_status = 'available'`
    }

    // Add sorting
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

    // Add mock distance data (in a real app, this would be calculated based on user location)
    const photographersWithDistance = photographers.map((photographer) => ({
      ...photographer,
      distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
      featured: Math.random() > 0.7, // Random featured status for demo
    }))

    return NextResponse.json({ photographers: photographersWithDistance })
  } catch (error) {
    console.error("Get photographers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
