import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"

function verifySimpleToken(token: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - decoded.timestamp > sevenDaysInMs) {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifySimpleToken(token)
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
          name: `${decoded.firstName} ${decoded.lastName}`,
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
