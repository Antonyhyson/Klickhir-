// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/messaging/conversations/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth" // Import verifyToken from lib/auth

// Remove the duplicated verifySimpleToken function from here

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the centralized verifyToken function
    const decoded = verifyToken(token) //
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get conversations for the current user
    const conversations = await sql`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = ${decoded.userId} THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        u.first_name,
        u.last_name,
        u.user_type,
        MAX(m.created_at) as last_message_time
      FROM messages m
      JOIN users u ON (
        CASE
          WHEN m.sender_id = ${decoded.userId} THEN m.recipient_id = u.id
          ELSE m.sender_id = u.id
        END
      )
      WHERE m.sender_id = ${decoded.userId} OR m.recipient_id = ${decoded.userId}
      GROUP BY other_user_id, u.first_name, u.last_name, u.user_type
      ORDER BY last_message_time DESC
    `

    // Format conversations for the frontend
    const formattedConversations = conversations.map((conv) => ({
      id: `${decoded.userId}-${conv.other_user_id}`,
      participants: [
        {
          id: decoded.userId,
          name: `${decoded.firstName} ${decoded.lastName}`, // Use decoded token's user info
          userType: decoded.userType,
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: conv.other_user_id,
          name: `${conv.first_name} ${conv.last_name}`,
          userType: conv.user_type,
          avatar: "/placeholder.svg?height=40&width=40",
        },
      ],
      encryptionKey: `key-${decoded.userId}-${conv.other_user_id}`, // In real app, this would be properly generated
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}