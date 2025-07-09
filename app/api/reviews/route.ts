// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/reviews/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const { jobId, photographerId, rating, comment } = body;

    // Validate input
    if (!jobId || !photographerId || rating === undefined || rating === null) {
      return NextResponse.json({ error: "Job ID, Photographer ID, and Rating are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify job and photographer, and that the client is authorized to review this job
    const [jobDetails] = await sql`
      SELECT client_id, status, title FROM jobs WHERE id = ${jobId}
    `;

    if (!jobDetails) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (jobDetails.client_id !== decoded.userId) {
      return NextResponse.json({ error: "You are not authorized to review this job" }, { status: 403 });
    }

    // Check if review already exists for this job
    const [existingReview] = await sql`
      SELECT id FROM reviews WHERE job_id = ${jobId} AND client_id = ${decoded.userId} AND photographer_id = ${photographerId}
    `;
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this job" }, { status: 409 });
    }

    // Insert the new review
    const [newReview] = await sql`
      INSERT INTO reviews (job_id, client_id, photographer_id, rating, comment)
      VALUES (${jobId}, ${decoded.userId}, ${photographerId}, ${rating}, ${comment || null})
      RETURNING id, rating, comment, created_at;
    `;

    // Recalculate photographer's average rating and total reviews
    await sql.begin(async (sql) => {
      const photographerReviews = await sql`
        SELECT rating FROM reviews WHERE photographer_id = ${photographerId}
      `;

      const totalRating = photographerReviews.reduce((sum, review) => sum + review.rating, 0);
      const newTotalReviews = photographerReviews.length;
      const newAverageRating = newTotalReviews > 0 ? (totalRating / newTotalReviews) : 0;

      await sql`
        UPDATE photographer_profiles
        SET rating = ${newAverageRating}, total_reviews = ${newTotalReviews}, updated_at = NOW()
        WHERE user_id = ${photographerId};
      `;
    });

    // --- NEW: Create notification for the photographer ---
    const [clientUser] = await sql`SELECT first_name, last_name FROM users WHERE id = ${decoded.userId}`;
    if (clientUser) {
        const notificationMessage = `You have received a new ${newReview.rating}-star review for job '${jobDetails.title}' from ${clientUser.first_name} ${clientUser.last_name}.`;
        await sql`
            INSERT INTO notifications (user_id, type, entity_id, message, is_read)
            VALUES (${photographerId}, 'review_submitted', ${newReview.id}, ${notificationMessage}, FALSE);
        `;
    }
    // --- END NEW ---

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review: newReview,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Submit review API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/reviews - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photographerId = searchParams.get("photographerId");
    const jobId = searchParams.get("jobId");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    let query = `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at as "createdAt",
        u.id as "clientId",
        u.first_name as "clientFirstName",
        u.last_name as "clientLastName",
        cp.profile_image_url as "clientProfileImageUrl"
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      LEFT JOIN client_profiles cp ON u.id = cp.user_id
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    if (photographerId) {
      query += ` AND r.photographer_id = $${queryParams.length + 1}`;
      queryParams.push(photographerId);
    }
    if (jobId) {
      query += ` AND r.job_id = $${queryParams.length + 1}`;
      queryParams.push(jobId);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const reviews = await sql.unsafe(query, queryParams);

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error("Get reviews API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}