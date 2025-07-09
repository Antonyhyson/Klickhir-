// app/api/auth/register/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs" // Import bcryptjs

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
    const saltRounds = 12 // Cost factor for hashing. Higher is slower but more secure.
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Determine currency based on location (mocked for now, in real app would use a lookup table)
    let currency = "USD"
    if (location === "GB") currency = "GBP"
    if (location === "CA") currency = "CAD"
    // Add more currency mappings as needed based on your `countries` array in register/page.tsx

    // Handle MFA secret based on method (for authenticator, a secret would be generated here)
    let mfaSecret: string | null = null
    if (mfaMethod === "authenticator") {
      // In a real application, you would generate a TOTP secret here
      // For now, we'll store a placeholder or leave it null if not setting up immediately.
      // Example: mfaSecret = authenticator.generateSecret();
      // For this demo, let's just store a simple string or null if not used directly for authenticator setup yet.
      mfaSecret = "TEMP_MFA_SECRET_PLACEHOLDER" // This should be a properly generated secret
    }


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
      // Ensure cameraKit is an array of strings, even if empty
      const photographerCameraKit = Array.isArray(cameraKit) ? cameraKit : []
      await sql`
        INSERT INTO photographer_profiles (
          user_id, specialties, camera_equipment
        ) VALUES (
          ${newUser.id}, ARRAY[]::TEXT[], ${photographerCameraKit}
        )
      `
    } else {
      // Client profile
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