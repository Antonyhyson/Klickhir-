// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/notifications/[id]/read/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Extract notification ID from URL path (e.g., /api/notifications/some-id/read)
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const notificationId = segments[segments.length - 2]; // Get the ID, which is usually second to last segment before 'read'

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    // Verify that the notification belongs to the authenticated user
    const [notificationCheck] = await sql`
      SELECT user_id FROM notifications WHERE id = ${notificationId}
    `;

    if (!notificationCheck) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    if (notificationCheck.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized to update this notification" }, { status: 403 });
    }

    // Update the notification status to read
    const [updatedNotification] = await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ${notificationId}
      RETURNING id, is_read as "isRead";
    `;

    return NextResponse.json(
      {
        message: "Notification marked as read",
        notification: updatedNotification,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Mark notification as read API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}