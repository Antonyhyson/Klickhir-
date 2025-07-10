// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/favorites/photographers/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// POST /api/favorites/photographers - Save a photographer
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can save photographers" }, { status: 403 });
    }

    const { photographerId } = await request.json();

    if (!photographerId) {
      return NextResponse.json({ error: "Photographer ID is required" }, { status: 400 });
    }

    // Verify photographer exists and is actually a photographer
    const [photographer] = await sql`
      SELECT id FROM users WHERE id = ${photographerId} AND user_type = 'photographer';
    `;
    if (!photographer) {
      return NextResponse.json({ error: "Photographer not found" }, { status: 404 });
    }

    try {
      const [savedPhotographer] = await sql`
        INSERT INTO saved_photographers (client_id, photographer_id)
        VALUES (${decoded.userId}, ${photographerId})
        RETURNING id;
      `;
      return NextResponse.json({ message: "Photographer saved successfully", id: savedPhotographer.id }, { status: 201 });
    } catch (dbError: any) {
      if (dbError.code === '23505') { // PostgreSQL unique_violation error code
        return NextResponse.json({ error: "Photographer already saved" }, { status: 409 });
      }
      console.error("Save photographer DB error:", dbError);
      return NextResponse.json({ error: "Failed to save photographer" }, { status: 500 });
    }

  } catch (error) {
    console.error("Save photographer API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/favorites/photographers - Unsave a photographer
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can unsave photographers" }, { status: 403 });
    }

    const { photographerId } = await request.json();

    if (!photographerId) {
      return NextResponse.json({ error: "Photographer ID is required" }, { status: 400 });
    }

    const [deleted] = await sql`
      DELETE FROM saved_photographers
      WHERE client_id = ${decoded.userId} AND photographer_id = ${photographerId}
      RETURNING id;
    `;

    if (deleted) {
      return NextResponse.json({ message: "Photographer unsaved successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Photographer not found in saved list" }, { status: 404 });
    }

  } catch (error) {
    console.error("Unsave photographer API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/favorites/photographers - Get all saved photographers for the current client
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can view saved photographers" }, { status: 403 });
    }

    const savedPhotographers = await sql`
      SELECT
        sp.photographer_id AS id,
        u.first_name,
        u.last_name,
        u.location_country AS location,
        u.currency,
        u.is_verified,
        pp.bio,
        pp.specialties,
        pp.hourly_rate,
        pp.availability_status,
        pp.rating,
        pp.total_reviews,
        pp.profile_image_url
      FROM saved_photographers sp
      JOIN users u ON sp.photographer_id = u.id
      JOIN photographer_profiles pp ON u.id = pp.user_id
      WHERE sp.client_id = ${decoded.userId}
      ORDER BY sp.created_at DESC;
    `;

    // Add mock data for connections, projects, posts if needed for display on client dashboard
    const photographersWithMockData = savedPhotographers.map(p => ({
        ...p,
        name: `${p.first_name} ${p.last_name}`,
        distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`, // Mocked distance
        featured: Math.random() > 0.7, // Mocked featured status
        connections: Math.floor(Math.random() * 2000),
        projects: Math.floor(Math.random() * 100),
        posts: Math.floor(Math.random() * 200),
    }));

    return NextResponse.json({ savedPhotographers: photographersWithMockData }, { status: 200 });

  } catch (error) {
    console.error("Get saved photographers API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}