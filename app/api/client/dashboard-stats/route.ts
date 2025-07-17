// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/client/dashboard-stats/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "client") {
      return NextResponse.json({ error: "Only clients can access dashboard stats" }, { status: 403 });
    }

    const clientId = decoded.userId;

    // 1. Total Applications (received for client's jobs)
    const [totalApplicationsResult] = await sql`
      SELECT COUNT(ja.id) as count
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.client_id = ${clientId};
    `;
    const totalApplications = parseInt(totalApplicationsResult.count || '0');

    // 2. Interviews Scheduled (number of applications accepted)
    const [interviewsScheduledResult] = await sql`
      SELECT COUNT(ja.id) as count
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.client_id = ${clientId} AND ja.status = 'accepted';
    `;
    const interviewsScheduled = parseInt(interviewsScheduledResult.count || '0');

    // 3. Pending Reviews (accepted applications where no review has been submitted yet)
    // This assumes an 'accepted' application implies job completion for review purposes.
    const [pendingReviewsResult] = await sql`
      SELECT COUNT(ja.id) as count
      FROM job_applications ja
      LEFT JOIN reviews r ON ja.job_id = r.job_id AND ja.photographer_id = r.photographer_id AND ja.client_id = r.client_id
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.client_id = ${clientId} AND ja.status = 'accepted' AND r.id IS NULL;
    `;
    const pendingReviews = parseInt(pendingReviewsResult.count || '0');


    // 4. Response Rate (percentage of applications with 'accepted' or 'rejected' status)
    const [respondedApplicationsResult] = await sql`
      SELECT COUNT(ja.id) as count
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.client_id = ${clientId} AND (ja.status = 'accepted' OR ja.status = 'rejected');
    `;
    const respondedApplications = parseInt(respondedApplicationsResult.count || '0');

    let responseRate = 0;
    if (totalApplications > 0) {
      responseRate = (respondedApplications / totalApplications) * 100;
    }

    // Determine change values (mock for now, requires history tracking)
    const totalApplicationsChange = `${Math.floor(Math.random() * 20) - 10}%`; // Mock change
    const pendingReviewsChange = `${Math.floor(Math.random() * 5) - 2}`; // Mock change
    const interviewsScheduledChange = `${Math.floor(Math.random() * 3) - 1}`; // Mock change
    const responseRateChange = `${(Math.random() * 5 - 2.5).toFixed(1)}%`; // Mock change


    return NextResponse.json({
      totalApplications: {
        value: totalApplications,
        change: totalApplicationsChange,
        changeType: totalApplications > 0 ? "positive" : "neutral", // Basic logic
      },
      pendingReviews: {
        value: pendingReviews,
        change: pendingReviewsChange,
        changeType: pendingReviews > 0 ? "negative" : "neutral", // More pending is 'negative' for client
      },
      interviewsScheduled: {
        value: interviewsScheduled,
        change: interviewsScheduledChange,
        changeType: interviewsScheduled > 0 ? "positive" : "neutral",
      },
      responseRate: {
        value: responseRate.toFixed(0), // Format as percentage string
        change: responseRateChange,
        changeType: responseRate > 50 ? "positive" : "neutral", // Basic logic
      },
    });

  } catch (error) {
    console.error("Get client dashboard stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}