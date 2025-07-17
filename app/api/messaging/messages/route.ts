// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/messaging/messages/route.ts
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

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    // Fetch messages between the current user and the contactId
    // Messages can be sent by the current user to the contact, or by the contact to the current user
    const messages = await sql`
      SELECT
        id,
        sender_id as "senderId",
        recipient_id as "recipientId",
        message as "encryptedContent", -- Assuming 'message' column stores encrypted content
        is_read as "isRead",
        created_at as "timestamp"
      FROM messages
      WHERE
        (sender_id = ${decoded.userId} AND recipient_id = ${contactId})
        OR
        (sender_id = ${contactId} AND recipient_id = ${decoded.userId})
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ messages });

  } catch (error) {
    console.error("Get messages API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}