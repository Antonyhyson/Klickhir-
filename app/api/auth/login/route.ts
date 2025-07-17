// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import speakeasy from "speakeasy"
import { getSmsMfaCode, smsMfaCodes } from "../request-sms-mfa/route" // Import getSmsMfaCode and the map itself

// Helper function from lib/auth.ts - ensure it's consistent or import directly
function generateSimpleToken(user: any): string {
  const tokenData = {
    userId: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    userType: user.user_type,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType, mfaCode } = body

    console.log("Login attempt:", { email, userType, hasMfaCode: !!mfaCode })

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    const [user] = await sql`
      SELECT id, email, password_hash, first_name, last_name, user_type, mfa_method, mfa_secret, phone
      FROM users
      WHERE email = ${email}
    `

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.user_type !== userType) {
      return NextResponse.json({ error: "Invalid user type for this account" }, { status: 401 })
    }

    // MFA handling
    if (user.mfa_method) {
      if (!mfaCode) {
        return NextResponse.json({
          message: "Credentials verified",
          requiresMFA: true,
          mfaMethod: user.mfa_method,
          userId: user.id, // Pass userId for SMS code request if needed
        })
      }

      let isMfaCodeValid = false
      if (user.mfa_method === "authenticator") {
        if (!user.mfa_secret) {
          console.error(`User ${user.id} has authenticator MFA but no secret!`)
          return NextResponse.json({ error: "Authenticator not set up correctly" }, { status: 500 })
        }
        isMfaCodeValid = speakeasy.totp.verify({
          secret: user.mfa_secret,
          encoding: "base32",
          token: mfaCode,
          window: 1,
        })
        console.log(`Authenticator MFA verification for ${user.email}: ${isMfaCodeValid}`)
      } else if (user.mfa_method === "sms") {
        const storedSmsCode = getSmsMfaCode(user.id)
        if (storedSmsCode && mfaCode === storedSmsCode) {
          isMfaCodeValid = true
          smsMfaCodes.delete(user.id) // Invalidate code after successful use
          console.log(`SMS MFA verification for ${user.email}: ${isMfaCodeValid}`)
        } else {
          console.log(`SMS MFA verification for ${user.email}: Invalid or expired code provided`)
        }
      }

      if (!isMfaCodeValid) {
        return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 })
      }
    }

    const token = generateSimpleToken(user)

    const cookieStore = cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
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