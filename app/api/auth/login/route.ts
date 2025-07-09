// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs" // Import bcryptjs for password comparison
import speakeasy from "speakeasy" // Import speakeasy for TOTP verification

// Helper function from lib/auth.ts - ensure it's consistent or import directly
function generateSimpleToken(user: any): string {
  const tokenData = {
    userId: user.id,
    email: user.email,
    firstName: user.first_name, // Use first_name from DB
    lastName: user.last_name,   // Use last_name from DB
    userType: user.user_type,   // Use user_type from DB
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType, mfaCode } = body

    console.log("Login attempt:", { email, userType, hasMfaCode: !!mfaCode })

    // Validation
    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    // Retrieve user from the database
    const [user] = await sql`
      SELECT id, email, password_hash, first_name, last_name, user_type, mfa_method, mfa_secret, phone
      FROM users
      WHERE email = ${email}
    `

    if (!user) {
      // Don't reveal whether email exists for security reasons
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user type matches
    if (user.user_type !== userType) {
      return NextResponse.json({ error: "Invalid user type for this account" }, { status: 401 })
    }

    // MFA handling
    if (user.mfa_method) { // Only proceed with MFA if a method is set
      if (!mfaCode) {
        // First step - credentials verified, now require MFA
        return NextResponse.json({
          message: "Credentials verified",
          requiresMFA: true,
          mfaMethod: user.mfa_method, // Inform client about the MFA method
        })
      }

      // Second step - verify MFA code
      let isMfaCodeValid = false
      if (user.mfa_method === "authenticator") {
        if (!user.mfa_secret) {
          console.error(`User ${user.id} has authenticator MFA but no secret!`)
          return NextResponse.json({ error: "Authenticator not set up correctly" }, { status: 500 })
        }
        isMfaCodeValid = speakeasy.totp.verify({
          secret: user.mfa_secret,
          encoding: "base32", // Assuming secret is stored in base32
          token: mfaCode,
          window: 1, // Allow 1 step grace period (30 seconds)
        })
        console.log(`Authenticator MFA verification for ${user.email}: ${isMfaCodeValid}`)
      } else if (user.mfa_method === "sms") {
        // In a real application, you would:
        // 1. Generate a temporary SMS code (e.g., 6-digit random number)
        // 2. Store this code with an expiry in a temporary table/cache tied to the user
        // 3. Send the code to user.phone using an SMS gateway (Twilio, Vonage, etc.)
        // 4. Here, you would compare the provided mfaCode with the stored temporary code.

        // For this demo, any 6-digit code is accepted, as a real SMS gateway is outside scope.
        if (mfaCode.length === 6 && /^\d{6}$/.test(mfaCode)) {
          isMfaCodeValid = true
          console.log(`SMS MFA (demo) verification for ${user.email}: ${isMfaCodeValid}`)
        } else {
          console.log(`SMS MFA (demo) verification for ${user.email}: Invalid format or code`)
        }
      }

      if (!isMfaCodeValid) {
        return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 })
      }
    }


    // Generate token
    const token = generateSimpleToken(user)

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
      },
      requiresMFA: false,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}