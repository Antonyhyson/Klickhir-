// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/messaging/send/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

// Abuse detection system
class AbuseDetector {
  private static profanityList = [
    "damn",
    "hell",
    "shit",
    "fuck",
    "bitch",
    "ass",
    "bastard",
    "crap",
    "piss",
    "dick",
    "cock",
    "pussy",
    "whore",
    "slut",
    "fag",
    "nigger",
    "retard",
    "gay",
    "lesbian",
    "homo",
    "tranny",
    "dyke",
    "cunt",
  ]

  static detectProfanity(message: string): { hasProfanity: boolean; count: number; words: string[] } {
    const words = message.toLowerCase().split(/\s+/)
    const foundProfanity: string[] = []

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "")
      if (this.profanityList.includes(cleanWord)) {
        foundProfanity.push(cleanWord)
      }
    })

    return {
      hasProfanity: foundProfanity.length > 0,
      count: foundProfanity.length,
      words: foundProfanity,
    }
  }

  static calculateBanDuration(violationCount: number): number {
    return violationCount * 2 // 2, 4, 6, 8, 10, etc. days
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, encryptedContent, originalMessage } = body

    // Check if user is currently banned
    const [banCheck] = await sql`
      SELECT ban_until, violation_count
      FROM user_violations
      WHERE user_id = ${decoded.userId}
      AND ban_until > NOW()
    `

    if (banCheck) {
      return NextResponse.json(
        {
          error: "Account temporarily suspended for inappropriate content",
          banUntil: banCheck.ban_until,
        },
        { status: 403 },
      )
    }

    // Abuse detection (on originalMessage for moderation purposes)
    if (originalMessage) {
      const abuseCheck = AbuseDetector.detectProfanity(originalMessage)

      if (abuseCheck.hasProfanity) {
        // Record violation
        const [existingViolation] = await sql`
          SELECT violation_count FROM user_violations WHERE user_id = ${decoded.userId}
        `

        const newViolationCount = (existingViolation?.violation_count || 0) + abuseCheck.count
        const banDuration = AbuseDetector.calculateBanDuration(Math.ceil(newViolationCount / 2))
        const banUntil = new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000)

        if (newViolationCount >= 2) {
          // Apply ban
          await sql`
            INSERT INTO user_violations (user_id, violation_count, ban_until, last_violation)
            VALUES (${decoded.userId}, ${newViolationCount}, ${banUntil}, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
              violation_count = ${newViolationCount},
              ban_until = ${banUntil},
              last_violation = NOW()
          `

          return NextResponse.json(
            {
              error: `Account suspended for ${banDuration} days due to inappropriate language`,
              banUntil: banUntil,
              violationCount: newViolationCount,
            },
            { status: 403 },
          )
        } else {
          // Warning only
          await sql`
            INSERT INTO user_violations (user_id, violation_count, last_violation)
            VALUES (${decoded.userId}, ${newViolationCount}, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
              violation_count = ${newViolationCount},
              last_violation = NOW()
          `

          return NextResponse.json(
            {
              error: "Warning: Inappropriate language detected. Further violations will result in account suspension.",
              violationCount: newViolationCount,
            },
            { status: 400 },
          )
        }
      }
    }

    // Save encrypted message
    const [message] = await sql`
      INSERT INTO messages (sender_id, recipient_id, message, is_read)
      VALUES (${decoded.userId}, ${recipientId}, ${encryptedContent}, false)
      RETURNING id, sender_id, recipient_id, created_at;
    `

    // --- NEW: Create notification for the message recipient ---
    const [senderUser] = await sql`SELECT first_name, last_name FROM users WHERE id = ${decoded.userId}`;
    if (senderUser) {
      const notificationMessage = `You have a new message from ${senderUser.first_name} ${senderUser.last_name}.`;
      await sql`
        INSERT INTO notifications (user_id, type, entity_id, message, is_read)
        VALUES (${recipientId}, 'new_message', ${message.id}, ${notificationMessage}, FALSE);
      `;
    }
    // --- END NEW ---

    return NextResponse.json({
      message: "Message sent successfully",
      messageId: message.id,
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}