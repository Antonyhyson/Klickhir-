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

    const decoded = verifySimpleToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, encryptedMessage, originalMessage } = body

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

    // Decrypt and check for abuse (in real app, this would be done client-side before encryption)
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
      VALUES (${decoded.userId}, ${recipientId}, ${encryptedMessage}, false)
      RETURNING *
    `

    return NextResponse.json({
      message: "Message sent successfully",
      messageId: message.id,
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
