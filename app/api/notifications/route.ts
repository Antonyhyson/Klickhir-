// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/notifications/route.ts
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
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const readStatus = searchParams.get("read"); // 'true' for read, 'false' for unread, null for all

    let query = `
      SELECT
        id,
        user_id as "userId",
        type,
        entity_id as "entityId",
        message,
        is_read as "isRead",
        created_at as "createdAt"
      FROM notifications
      WHERE user_id = ${userId}
    `;

    const queryParams: any[] = [];
    if (readStatus === 'true') {
      query += ` AND is_read = TRUE`;
    } else if (readStatus === 'false') {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC`;

    const notifications = await sql.unsafe(query, queryParams);

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error("Get notifications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}