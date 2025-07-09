// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/auth/request-sms-mfa/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// In-memory store for SMS codes (for demo purposes only!)
// In a production environment, this would be a secure, persistent store
// like a database table with expiry, or a dedicated cache service (e.g., Redis).
const smsMfaCodes = new Map<string, { code: string; expiry: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const [user] = await sql`
      SELECT id, phone, mfa_method FROM users WHERE email = ${email}
    `

    if (!user || user.mfa_method !== "sms") {
      return NextResponse.json({ error: "SMS MFA not configured for this user or user not found" }, { status: 404 })
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = Date.now() + 5 * 60 * 1000 // Code valid for 5 minutes

    // Store the code in our in-memory map
    smsMfaCodes.set(user.id, { code, expiry })

    console.log(`[DEMO] SMS MFA code generated for ${user.email} (Phone: ${user.phone}): ${code}`)
    console.log("In a real app, this code would be sent via an SMS gateway like Twilio to:", user.phone)

    return NextResponse.json({ message: "SMS MFA code requested successfully. Check your console for the code." }, { status: 200 })

  } catch (error) {
    console.error("Request SMS MFA code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// This function is exported so the login route can import and use it for verification
export function getSmsMfaCode(userId: string): string | null {
  const entry = smsMfaCodes.get(userId)
  if (entry && Date.now() < entry.expiry) {
    return entry.code
  }
  // If code is expired or not found, remove it from the map
  smsMfaCodes.delete(userId)
  return null
}

// Export the Map itself for potential clearing in tests or specific scenarios (optional, for advanced usage)
export { smsMfaCodes };