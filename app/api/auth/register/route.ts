// app/api/auth/register/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import speakeasy from "speakeasy"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, location, password, confirmPassword, mfaMethod, isOAuthUser, userType } =
      body

    console.log("Registration attempt:", { email, location, isOAuthUser })

    // Basic validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // OAuth users have different validation requirements
    if (!isOAuthUser) {
      // Regular registration validation
      if (!phone || !location || !password) {
        return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
      }

      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
      }
    } else {
      // OAuth user validation - set defaults
      if (!location) body.location = "US"  // Default location
      if (!phone) body.phone = ""          // Optional phone for OAuth
      if (!password) body.password = ""    // No password for OAuth
      if (!mfaMethod) body.mfaMethod = "none" // No MFA for OAuth initially
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password (only for non-OAuth users)
    let passwordHash = null
    if (!isOAuthUser && password) {
      const saltRounds = 12
      passwordHash = await bcrypt.hash(password, saltRounds)
    }

    // Determine currency based on location (mocked for now)
    let currency = "USD"
    if (body.location === "GB") currency = "GBP"
    if (body.location === "CA") currency = "CAD"

    // MFA Secret Generation (only for non-OAuth users with authenticator)
    let mfaSecret: string | null = null
    let otpauthUrl: string | null = null

    if (!isOAuthUser && body.mfaMethod === "authenticator") {
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `Klickhiré (${email})`,
      })
      mfaSecret = secret.base32
      otpauthUrl = secret.otpauth_url || null
      console.log(`Generated MFA Secret for ${email}: ${mfaSecret}`)
      console.log(`OTP Auth URL: ${otpauthUrl}`)
    }

    // Set user type - OAuth users will have it set, regular users get 'pending'
    const finalUserType = userType || 'pending'

    // Insert user into the database
    const [newUser] = await sql`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, location_country, currency, mfa_method, mfa_secret, is_verified, user_type
      ) VALUES (
        ${email}, ${passwordHash}, ${firstName}, ${lastName}, ${body.phone || ''},
        ${body.location}, ${currency}, ${body.mfaMethod || 'none'}, ${mfaSecret}, ${isOAuthUser ? true : false}, ${finalUserType}
      ) RETURNING id, email, first_name, last_name, user_type
    `
    
    // NOTE: Profile insertion logic is removed from here.
    // It will be handled by the /api/auth/select-role route.

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          userType: newUser.user_type,
        },
        mfa: (!isOAuthUser && body.mfaMethod === "authenticator") ? { secret: mfaSecret, otpauthUrl: otpauthUrl } : undefined,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Registration failed. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}