// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/photographer/dashboard-stats/route.ts
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
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can access dashboard stats" }, { status: 403 });
    }

    const photographerId = decoded.userId;

    // 1. Active Jobs (accepted applications)
    const [activeJobsResult] = await sql`
      SELECT COUNT(id) as count FROM job_applications
      WHERE photographer_id = ${photographerId} AND status = 'accepted';
    `;
    const activeJobs = parseInt(activeJobsResult.count || '0');

    // 2. Rating
    const [photographerProfile] = await sql`
      SELECT rating, total_reviews FROM photographer_profiles
      WHERE user_id = ${photographerId};
    `;
    const rating = photographerProfile?.rating?.toFixed(1) || 'N/A'; // Format to one decimal
    const totalReviews = photographerProfile?.total_reviews || 0;


    // 3. This Month Earnings (sum of proposed_rate from accepted jobs this month)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1); // Set to the 1st day of the month
    currentMonthStart.setHours(0, 0, 0, 0);

    const nextMonthStart = new Date(currentMonthStart);
    nextMonthStart.setMonth(currentMonthStart.getMonth() + 1);

    const [monthlyEarningsResult] = await sql`
      SELECT SUM(ja.proposed_rate) as total_earnings
      FROM job_applications ja
      WHERE ja.photographer_id = ${photographerId}
      AND ja.status = 'accepted'
      AND ja.applied_at >= ${currentMonthStart.toISOString()}::timestamp
      AND ja.applied_at < ${nextMonthStart.toISOString()}::timestamp;
    `;
    const thisMonthEarnings = parseFloat(monthlyEarningsResult.total_earnings || '0').toFixed(0); // Format to 0 decimal places


    // 4. Success Rate (percentage of accepted applications out of total applications)
    const [totalSubmittedApplicationsResult] = await sql`
      SELECT COUNT(id) as count FROM job_applications
      WHERE photographer_id = ${photographerId};
    `;
    const totalSubmittedApplications = parseInt(totalSubmittedApplicationsResult.count || '0');

    let successRate = 0;
    if (totalSubmittedApplications > 0) {
      successRate = (activeJobs / totalSubmittedApplications) * 100;
    }

    return NextResponse.json({
      activeJobs: activeJobs,
      rating: rating,
      thisMonthEarnings: thisMonthEarnings,
      successRate: successRate.toFixed(0), // Format as percentage string
    });

  } catch (error) {
    console.error("Get photographer dashboard stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}