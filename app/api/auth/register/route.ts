// app/api/auth/register/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import speakeasy from "speakeasy" // Import speakeasy

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, userType, location, password, confirmPassword, mfaMethod, cameraKit } =
      body

    console.log("Registration attempt:", { email, userType, location })

    // Validation
    if (!firstName || !lastName || !email || !phone || !userType || !location || !password) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!["client", "photographer"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Determine currency based on location (mocked for now, in real app would use a lookup table)
    let currency = "USD"
    // (Existing currency mapping logic)
    if (location === "GB") currency = "GBP"
    if (location === "CA") currency = "CAD"


    // --- MFA Secret Generation ---
    let mfaSecret: string | null = null
    let otpauthUrl: string | null = null

    if (mfaMethod === "authenticator") {
      const secret = speakeasy.generateSecret({
        length: 20, // Length of the secret key
        name: `Klickhiré (${email})`, // Issuer name
        // For production, you might want to specify an algorithm like 'sha512'
        // But most authenticator apps default to SHA1 for TOTP
      })
      mfaSecret = secret.base32 // Store the base32 encoded secret
      otpauthUrl = secret.otpauth_url || null // URL for QR code generation
      console.log(`Generated MFA Secret for ${email}: ${mfaSecret}`)
      console.log(`OTP Auth URL: ${otpauthUrl}`)
    }
    // ----------------------------


    // Insert user into the database
    const [newUser] = await sql`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, user_type,
        location_country, currency, mfa_method, mfa_secret, is_verified
      ) VALUES (
        ${email}, ${passwordHash}, ${firstName}, ${lastName}, ${phone}, ${userType},
        ${location}, ${currency}, ${mfaMethod}, ${mfaSecret}, false
      ) RETURNING id, email, first_name, last_name, user_type, location_country
    `

    // Insert into specific profile table
    if (userType === "photographer") {
      const photographerCameraKit = Array.isArray(cameraKit) ? cameraKit : []
      await sql`
        INSERT INTO photographer_profiles (
          user_id, specialties, camera_equipment
        ) VALUES (
          ${newUser.id}, ARRAY[]::TEXT[], ${photographerCameraKit}
        )
      `
    } else {
      await sql`
        INSERT INTO client_profiles (
          user_id
        ) VALUES (
          ${newUser.id}
        )
      `
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          userType: newUser.user_type,
          locationCountry: newUser.location_country,
        },
        // Include MFA setup details if applicable for frontend to display QR
        mfa: mfaMethod === "authenticator" ? { secret: mfaSecret, otpauthUrl: otpauthUrl } : undefined,
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